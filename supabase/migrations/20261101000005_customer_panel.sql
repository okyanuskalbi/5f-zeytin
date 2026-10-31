-- Task 154: prepared and tested locally. Apply to a reviewed target only.
-- Additive schema; rollback is a separate forward migration, never a DROP of orders.
create table public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 2 and 100),
  recipient text not null check (char_length(recipient) between 2 and 100),
  phone text not null check (char_length(phone) between 10 and 20),
  city text not null check (char_length(city) between 2 and 100),
  district text not null check (char_length(district) between 2 and 100),
  line text not null check (char_length(line) between 2 and 500),
  postal_code text not null check (postal_code ~ '^[0-9]{5}$'),
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);
create index customer_addresses_owner on public.customer_addresses(user_id, created_at);
create unique index customer_addresses_one_default on public.customer_addresses(user_id) where is_default;
alter table public.customer_addresses enable row level security;
revoke all on public.customer_addresses from public, anon, authenticated;
grant select, insert, update, delete on public.customer_addresses to service_role;

-- Payment provider secrets/events are deliberately outside this customer projection.
-- Only a future approved checkout/callback writer creates/updates actual orders.
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  order_no text not null unique check (order_no ~ '^[A-Za-z0-9][A-Za-z0-9-]{2,39}$'),
  status text not null default 'pending' check (status in ('pending','paid','preparing','shipped','delivered','cancelled','refunded')),
  total_kurus integer not null check (total_kurus >= 0),
  currency text not null default 'TRY' check (currency = 'TRY'),
  delivery_address jsonb not null default '{}'::jsonb check (jsonb_typeof(delivery_address) = 'object'),
  shipping_carrier text check (char_length(shipping_carrier) <= 100),
  tracking_no text check (char_length(tracking_no) <= 100),
  tracking_url text check (char_length(tracking_url) <= 2000),
  created_at timestamptz not null default now()
);
create index orders_customer_history on public.orders(user_id, created_at desc, id desc);
alter table public.orders enable row level security;
revoke all on public.orders from public, anon, authenticated;
grant select, insert, update, delete on public.orders to service_role;

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  product_name text not null check (char_length(product_name) between 1 and 200),
  weight text not null check (char_length(weight) between 1 and 100),
  quantity integer not null check (quantity between 1 and 10000),
  unit_price_kurus integer not null check (unit_price_kurus >= 0)
);
create index order_items_order on public.order_items(order_id);
alter table public.order_items enable row level security;
revoke all on public.order_items from public, anon, authenticated;
grant select, insert, update, delete on public.order_items to service_role;

create function public.customer_save_address(p_user_id uuid, p_id uuid, p_address jsonb)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare v public.customer_addresses; v_default boolean;
begin
  perform pg_advisory_xact_lock(hashtext(p_user_id::text));
  if p_id is not null and not exists(select 1 from public.customer_addresses where id = p_id and user_id = p_user_id) then
    raise exception 'Address not found' using errcode = 'P0002';
  end if;
  if p_id is null and (select count(*) from public.customer_addresses where user_id = p_user_id) >= 20 then
    raise exception 'Address limit' using errcode = '23514';
  end if;
  v_default := coalesce((p_address->>'isDefault')::boolean, false)
    or not exists(select 1 from public.customer_addresses where user_id = p_user_id and (p_id is null or id <> p_id));
  if v_default then update public.customer_addresses set is_default = false where user_id = p_user_id and is_default; end if;
  insert into public.customer_addresses(id,user_id,title,recipient,phone,city,district,line,postal_code,is_default)
    values(coalesce(p_id,gen_random_uuid()),p_user_id,p_address->>'title',p_address->>'recipient',p_address->>'phone',
      p_address->>'city',p_address->>'district',p_address->>'line',p_address->>'postalCode',v_default)
    on conflict(id) do update set title=excluded.title,recipient=excluded.recipient,phone=excluded.phone,city=excluded.city,
      district=excluded.district,line=excluded.line,postal_code=excluded.postal_code,is_default=excluded.is_default
    where public.customer_addresses.user_id = p_user_id
    returning * into v;
  -- If an existing default was unchecked, keep exactly one default available.
  if not exists(select 1 from public.customer_addresses where user_id = p_user_id and is_default) then
    update public.customer_addresses set is_default = true where id = v.id;
    v.is_default := true;
  end if;
  return to_jsonb(v) - 'user_id' - 'created_at';
end;
$$;
revoke all on function public.customer_save_address(uuid,uuid,jsonb) from public, anon, authenticated;
grant execute on function public.customer_save_address(uuid,uuid,jsonb) to service_role;

create function public.customer_delete_address(p_user_id uuid, p_id uuid)
returns boolean language plpgsql security invoker set search_path = '' as $$
begin
  perform pg_advisory_xact_lock(hashtext(p_user_id::text));
  delete from public.customer_addresses where id = p_id and user_id = p_user_id;
  if not found then raise exception 'Address not found' using errcode = 'P0002'; end if;
  if not exists(select 1 from public.customer_addresses where user_id = p_user_id and is_default) then
    update public.customer_addresses set is_default = true where id =
      (select id from public.customer_addresses where user_id = p_user_id order by created_at,id limit 1);
  end if;
  return true;
end;
$$;
revoke all on function public.customer_delete_address(uuid,uuid) from public, anon, authenticated;
grant execute on function public.customer_delete_address(uuid,uuid) to service_role;
