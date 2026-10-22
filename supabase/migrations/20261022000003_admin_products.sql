-- Task 064. No seeds. Local rollback: reset the memory DB. After deployment use
-- a forward migration removing these functions/table after checking consumers.
create table public.product_upsells (
  product_id text not null references public.products(id) on delete cascade,
  upsell_id text not null references public.products(id) on delete cascade,
  primary key (product_id, upsell_id),
  constraint product_upsells_not_self check (product_id <> upsell_id)
);
create index product_upsells_target on public.product_upsells(upsell_id);
alter table public.product_upsells enable row level security;
alter table public.product_upsells force row level security;
revoke all on table public.product_upsells from public, anon, authenticated, service_role;
grant select, insert, update, delete on table public.product_upsells to service_role;

-- Only the authorized server may call these functions. SECURITY INVOKER keeps
-- their privileges no greater than the caller; the six-slot constraints remain.
create function public.admin_save_product(p_id text, p_product jsonb, p_create boolean)
returns text language plpgsql security invoker set search_path = '' as $$
declare
  targets text[];
begin
  perform pg_catalog.pg_advisory_xact_lock(640064);
  if p_create is null or p_id is null or p_id !~ '^[a-zA-Z0-9][a-zA-Z0-9_-]{0,127}$'
    or jsonb_typeof(p_product) is distinct from 'object'
    or jsonb_typeof(p_product->'upsellIds') is distinct from 'array' then
    raise exception 'Invalid product' using errcode = '23514';
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
    insert into public.products(id, name, category, weight, price_kurus, stock, is_active)
    values (p_id, p_product->>'name', p_product->>'category', p_product->>'weight',
      (p_product->>'priceKurus')::integer, (p_product->>'stock')::integer, (p_product->>'isActive')::boolean);
  else
    update public.products set name = p_product->>'name', category = p_product->>'category',
      weight = p_product->>'weight', price_kurus = (p_product->>'priceKurus')::integer,
      stock = (p_product->>'stock')::integer, is_active = (p_product->>'isActive')::boolean
    where id = p_id;
    if not found then raise exception 'Product not found' using errcode = 'P0002'; end if;
  end if;
  delete from public.product_upsells where product_id = p_id
    or (upsell_id = p_id and not (p_product->>'isActive')::boolean);
  insert into public.product_upsells(product_id, upsell_id) select p_id, t from unnest(targets) t;
  return p_id;
end;
$$;

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
revoke all on function public.admin_save_product(text, jsonb, boolean) from public, anon, authenticated, service_role;
revoke all on function public.admin_unpublish_product(text) from public, anon, authenticated, service_role;
grant execute on function public.admin_save_product(text, jsonb, boolean) to service_role;
grant execute on function public.admin_unpublish_product(text) to service_role;
