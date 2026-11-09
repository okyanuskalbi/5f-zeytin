-- Task 186: new plain PostgreSQL target, no source database mutation or seeds.
-- This initial schema is not automatically reversible: Task 187 rollback switches
-- traffic back to the preserved source after reconciling any new target writes.
-- Browser clients never connect to this database; authorization is server-side.
create table public."user" (
  id text primary key,
  name text not null,
  email text not null unique,
  "emailVerified" boolean not null default false,
  image text,
  phone text,
  metadata jsonb,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);
create table public.session (
  id text primary key,
  "expiresAt" timestamptz not null,
  token text not null unique,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  "ipAddress" text,
  "userAgent" text,
  "userId" text not null references public."user"(id) on delete cascade
);
create index session_owner on public.session("userId");
create index session_expiry on public.session("expiresAt");
create table public.account (
  id text primary key,
  "accountId" text not null,
  "providerId" text not null,
  "userId" text not null references public."user"(id) on delete cascade,
  "accessToken" text,
  "refreshToken" text,
  "idToken" text,
  "accessTokenExpiresAt" timestamptz,
  "refreshTokenExpiresAt" timestamptz,
  scope text,
  password text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  unique ("providerId", "accountId")
);
create index account_user on public.account("userId");
create table public.verification (
  id text primary key,
  identifier text not null,
  value text not null,
  "expiresAt" timestamptz not null,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);
create index verification_identifier on public.verification(identifier);
create index verification_expiry on public.verification("expiresAt");
create table public."rateLimit" (
  id text primary key,
  key text not null unique,
  count integer not null,
  "lastRequest" bigint not null
);

create table public.products (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  category text not null,
  weight text not null,
  price_kurus integer not null,
  currency text not null default 'TRY',
  stock integer not null default 0,
  is_active boolean not null default false,
  active_slot smallint,
  category_label text,
  show_category_label boolean not null default true,
  created_at timestamptz not null default now(),
  constraint products_id_not_blank check (btrim(id) <> ''),
  constraint products_name_not_blank check (btrim(name) <> ''),
  constraint products_category_valid check (category in ('sofralik-zeytin', 'salamura-zeytin', 'zeytinyagi')),
  constraint products_weight_not_blank check (btrim(weight) <> ''),
  constraint products_price_nonnegative check (price_kurus >= 0),
  constraint products_currency_try check (currency = 'TRY'),
  constraint products_stock_nonnegative check (stock >= 0),
  constraint products_active_slot_required check (is_active = (active_slot is not null)),
  constraint products_active_slot_range check (active_slot between 1 and 6),
  constraint products_active_slot_unique unique (active_slot),
  constraint products_category_label_valid check (
    char_length(category_label) <= 40 and category_label !~ '[<>]'
  )
);
create function public.assign_product_active_slot()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if new.is_active = false then
    new.active_slot := null;
  elsif new.active_slot is null then
    select slot into new.active_slot from pg_catalog.generate_series(1, 6) as slot
    where not exists (select 1 from public.products p where p.active_slot = slot)
    order by slot limit 1;
    if new.active_slot is null then
      raise exception 'At most six products can be active'
        using errcode = '23514', constraint = 'products_active_slot_required';
    end if;
  end if;
  return new;
end;
$$;
create trigger products_assign_active_slot before insert or update of is_active, active_slot
on public.products for each row execute function public.assign_product_active_slot();

create table public.admin_users (
  user_id text primary key references public."user"(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table public.product_upsells (
  product_id text not null references public.products(id) on delete cascade,
  upsell_id text not null references public.products(id) on delete cascade,
  primary key (product_id, upsell_id),
  constraint product_upsells_not_self check (product_id <> upsell_id)
);
create index product_upsells_target on public.product_upsells(upsell_id);
create table public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public."user"(id) on delete cascade,
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
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public."user"(id) on delete restrict,
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
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  product_name text not null check (char_length(product_name) between 1 and 200),
  weight text not null check (char_length(weight) between 1 and 100),
  quantity integer not null check (quantity between 1 and 10000),
  unit_price_kurus integer not null check (unit_price_kurus >= 0)
);
create index order_items_order on public.order_items(order_id);

-- Explicit baseline: no implicit PUBLIC table access or callable helper function.
revoke all on all tables in schema public from public;
revoke all on function public.assign_product_active_slot() from public;

create or replace function public.admin_save_product(p_id text, p_product jsonb, p_create boolean)
returns text language plpgsql security invoker set search_path = '' as $$
declare
  targets text[];
  label text;
  show_label boolean;
begin
  perform pg_catalog.pg_advisory_xact_lock(640064);
  if p_create is null or p_id is null or p_id !~ '^[a-zA-Z0-9][a-zA-Z0-9_-]{0,127}$'
    or jsonb_typeof(p_product) is distinct from 'object'
    or jsonb_typeof(p_product->'upsellIds') is distinct from 'array' then
    raise exception 'Invalid product' using errcode = '23514';
  end if;
  if (p_product ? 'categoryLabel' and jsonb_typeof(p_product->'categoryLabel') not in ('string', 'null'))
    or (p_product ? 'showCategoryLabel' and jsonb_typeof(p_product->'showCategoryLabel') is distinct from 'boolean') then
    raise exception 'Invalid category label' using errcode = '23514';
  end if;
  label := nullif(btrim(p_product->>'categoryLabel'), '');
  show_label := coalesce((p_product->>'showCategoryLabel')::boolean, true);
  if char_length(label) > 40 or label ~ '[<>]' then
    raise exception 'Invalid category label' using errcode = '23514';
  end if;
  select coalesce(array_agg(value), '{}'::text[]) into targets
    from pg_catalog.jsonb_array_elements_text(p_product->'upsellIds');
  if cardinality(targets) > 5 or p_id = any(targets)
    or cardinality(targets) <> (select count(distinct t) from unnest(targets) t)
    or exists (select 1 from unnest(targets) t where not exists (
      select 1 from public.products p where p.id = t and p.is_active
    )) then
    raise exception 'Invalid upsell' using errcode = '23503';
  end if;
  if p_create then
    insert into public.products(id, name, category, weight, price_kurus, stock, is_active, category_label, show_category_label)
    values (p_id, p_product->>'name', p_product->>'category', p_product->>'weight',
      (p_product->>'priceKurus')::integer, (p_product->>'stock')::integer, (p_product->>'isActive')::boolean, label, show_label);
  else
    update public.products set name = p_product->>'name', category = p_product->>'category',
      weight = p_product->>'weight', price_kurus = (p_product->>'priceKurus')::integer,
      stock = (p_product->>'stock')::integer, is_active = (p_product->>'isActive')::boolean,
      category_label = label, show_category_label = show_label
    where id = p_id;
    if not found then raise exception 'Product not found' using errcode = 'P0002'; end if;
  end if;
  delete from public.product_upsells where product_id = p_id
    or (upsell_id = p_id and not (p_product->>'isActive')::boolean);
  insert into public.product_upsells(product_id, upsell_id) select p_id, t from unnest(targets) t;
  return p_id;
end;
$$;


revoke all on function public.admin_save_product(text, jsonb, boolean) from public;
create function public.admin_unpublish_product(p_id text)
returns text language plpgsql security invoker set search_path = '' as $$
begin
  perform pg_catalog.pg_advisory_xact_lock(640064);
  update public.products set is_active = false where id = p_id;
  if not found then raise exception 'Product not found' using errcode = 'P0002'; end if;
  delete from public.product_upsells where product_id = p_id or upsell_id = p_id;
  return p_id;
end;
$$;

revoke all on function public.admin_unpublish_product(text) from public;
