-- Task 137. No seeds or live application. Local rollback: reset the memory DB.
-- After deployment, roll back with a forward migration restoring the previous
-- admin_save_product body before dropping these two columns.
alter table public.products
  add column category_label text null,
  add column show_category_label boolean not null default true,
  add constraint products_category_label_valid check (
    char_length(category_label) <= 40 and category_label !~ '[<>]'
  );

-- Preserve SECURITY INVOKER, the lock, slot/upsell validation, grants and RLS.
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

-- No new tables or client policies. Keep the RPC callable only by service_role.
revoke all on function public.admin_save_product(text, jsonb, boolean) from public, anon, authenticated, service_role;
grant execute on function public.admin_save_product(text, jsonb, boolean) to service_role;
