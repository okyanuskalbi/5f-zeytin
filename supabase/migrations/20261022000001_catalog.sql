-- Task 028: catalog schema only; no real or representative product seeds.
-- Local rollback: reset the approved test database. Once deployed, reverse with
-- a new forward migration after checking dependent catalog/order consumers.
create table public.products (
  -- Text IDs preserve the existing catalog/cart product identifier contract.
  id text primary key default gen_random_uuid()::text,
  name text not null,
  category text not null,
  weight text not null,
  price_kurus integer not null,
  currency text not null default 'TRY',
  stock integer not null default 0,
  is_active boolean not null default false,
  active_slot smallint,
  created_at timestamptz not null default now(),

  constraint products_id_not_blank check (btrim(id) <> ''),
  constraint products_name_not_blank check (btrim(name) <> ''),
  constraint products_category_valid check (category in ('sofralik-zeytin', 'salamura-zeytin', 'zeytinyagi')),
  constraint products_weight_not_blank check (btrim(weight) <> ''),
  constraint products_price_nonnegative check (price_kurus >= 0),
  constraint products_currency_try check (currency = 'TRY'),
  constraint products_stock_nonnegative check (stock >= 0),

  -- Each active row needs one of six unique slots. Unlike COUNT(*) in a trigger,
  -- PostgreSQL UNIQUE checks also arbitrate uncommitted concurrent writes.
  -- NULL slots remain unrestricted for hidden drafts.
  constraint products_active_slot_required check (is_active = (active_slot is not null)),
  constraint products_active_slot_range check (active_slot between 1 and 6),
  constraint products_active_slot_unique unique (active_slot)
);

create function public.assign_product_active_slot()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.is_active = false then
    new.active_slot := null;
  elsif new.is_active and new.active_slot is null then
    select slot into new.active_slot
    from pg_catalog.generate_series(1, 6) as slot
    where not exists (select 1 from public.products p where p.active_slot = slot)
    order by slot
    limit 1;

    if new.active_slot is null then
      raise exception 'At most six products can be active'
        using errcode = '23514', constraint = 'products_active_slot_required';
    end if;
  end if;
  -- Concurrent allocators may choose the same slot: the immediate UNIQUE
  -- constraint rejects the conflicting write (23505). The server can retry;
  -- the active-product limit is never exceeded, including at REPEATABLE READ.
  return new;
end;
$$;

revoke all on function public.assign_product_active_slot() from public, anon, authenticated;
grant execute on function public.assign_product_active_slot() to service_role;

create trigger products_assign_active_slot
before insert or update of is_active, active_slot on public.products
for each row execute function public.assign_product_active_slot();

alter table public.products enable row level security;
alter table public.products force row level security;

-- Explicit grants are required even if the target has Supabase default grants.
revoke all on table public.products from public, anon, authenticated, service_role;
grant select on table public.products to anon;
grant select, insert, update, delete on table public.products to authenticated, service_role;

-- authenticated CRUD grants do not authorize writes: no client INSERT, UPDATE
-- or DELETE policies exist. Management goes through the authorized server only.
create policy products_published_read on public.products
for select to anon, authenticated
using (is_active);
