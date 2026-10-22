-- Plain SQL TAP: runs on PGlite and, later, `supabase test db` without pgTAP.
-- Test fixtures live only in this rolled-back transaction.
begin;

create temporary sequence catalog_assertions;
grant usage, select on sequence catalog_assertions to anon, authenticated, service_role;

create function pg_temp.catalog_check(condition boolean, description text)
returns text language plpgsql as $$
begin
  if condition is distinct from true then
    raise exception 'Catalog assertion failed: %', description;
  end if;
  return format('ok %s - %s', nextval('pg_temp.catalog_assertions'), description);
end;
$$;

create function pg_temp.catalog_throws(statement text, expected_state text, description text)
returns text language plpgsql as $$
begin
  begin
    execute statement;
  exception when others then
    if sqlstate <> expected_state then
      raise exception 'Catalog assertion failed: % (expected %, received %)',
        description, expected_state, sqlstate;
    end if;
    return pg_temp.catalog_check(true, description);
  end;
  raise exception 'Catalog assertion failed: % (expected SQLSTATE %)', description, expected_state;
end;
$$;

select pg_temp.catalog_check(to_regclass('public.products') is not null,
  'catalog table exists') as result;
select pg_temp.catalog_check(
  (select data_type = 'text' from information_schema.columns
   where table_schema = 'public' and table_name = 'products' and column_name = 'id') and
  exists (select 1 from pg_constraint where conrelid = 'public.products'::regclass
   and contype = 'p' and conkey = array[(select attnum from pg_attribute
     where attrelid = 'public.products'::regclass and attname = 'id')]),
  'catalog IDs preserve the text contract with a primary key') as result;
select pg_temp.catalog_check(
  (select relrowsecurity and relforcerowsecurity from pg_class where oid = 'public.products'::regclass),
  'RLS is enabled and forced') as result;
select pg_temp.catalog_check((select count(*) = 0 from public.products),
  'migration contains no catalog seeds') as result;
select pg_temp.catalog_check(not exists (
  select 1 from pg_class c, lateral aclexplode(c.relacl) a
  where c.oid = 'public.products'::regclass and a.grantee = 0),
  'PUBLIC has no inherited catalog privileges') as result;

select pg_temp.catalog_check(
  has_table_privilege('anon', 'public.products', 'SELECT') and
  not has_table_privilege('anon', 'public.products', 'INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER'),
  'anon has SELECT only') as result;
select pg_temp.catalog_check(
  has_table_privilege(role_name, 'public.products', 'SELECT') and
  has_table_privilege(role_name, 'public.products', 'INSERT') and
  has_table_privilege(role_name, 'public.products', 'UPDATE') and
  has_table_privilege(role_name, 'public.products', 'DELETE') and
  not has_table_privilege(role_name, 'public.products', 'TRUNCATE, REFERENCES, TRIGGER'),
  role_name || ' has explicit CRUD grants without administrative privileges') as result
from unnest(array['authenticated', 'service_role']) role_name;
select pg_temp.catalog_check(
  not has_function_privilege('anon', 'public.assign_product_active_slot()', 'EXECUTE') and
  not has_function_privilege('authenticated', 'public.assign_product_active_slot()', 'EXECUTE') and
  (select not prosecdef and proconfig = array['search_path=""']
   from pg_proc where oid = 'public.assign_product_active_slot()'::regprocedure),
  'slot trigger is invoker-only with a fixed search path and no client EXECUTE') as result;

set local role service_role;
insert into public.products (id, name, category, weight, price_kurus, stock, is_active) values
  ('test-published', 'Test published product', 'sofralik-zeytin', '1 kg', 12345, 0, true),
  ('test-draft', 'Test hidden product', 'zeytinyagi', '1 L', 45000, 8, false);
select pg_temp.catalog_check((select count(*) = 2 from public.products),
  'service_role sees published and hidden products without a user identity') as result;
select pg_temp.catalog_check(
  (select currency = 'TRY' and price_kurus = 12345 and stock = 0 and active_slot between 1 and 6
   from public.products where id = 'test-published'),
  'TRY integer kurus and sold-out published products are preserved') as result;
update public.products set price_kurus = 46000, stock = 9 where id = 'test-draft';
select pg_temp.catalog_check(
  (select price_kurus = 46000 and stock = 9 from public.products where id = 'test-draft'),
  'service_role can update hidden catalog rows') as result;

set local role anon;
select pg_temp.catalog_check(
  (select array_agg(id) = array['test-published'] from public.products),
  'anon sees only published products, including sold-out products') as result;
select pg_temp.catalog_check(not exists (select 1 from public.products where id = 'test-draft'),
  'anon cannot retrieve a hidden product by its known ID') as result;
select pg_temp.catalog_throws($q$insert into public.products (name, category, weight, price_kurus)
  values ('Unauthorized', 'zeytinyagi', '1 L', 1)$q$, '42501', 'anon cannot insert') as result;
select pg_temp.catalog_throws('update public.products set stock = 999', '42501',
  'anon cannot update') as result;
select pg_temp.catalog_throws('delete from public.products', '42501',
  'anon cannot delete') as result;
select pg_temp.catalog_throws('truncate public.products', '42501',
  'anon cannot truncate') as result;

set local role authenticated;
select pg_temp.catalog_check((select auth.uid()) is null,
  'authenticated role without JWT has no user identity') as result;
select pg_temp.catalog_check(
  (select array_agg(id) = array['test-published'] from public.products),
  'authenticated without identity cannot see hidden products') as result;

-- There is no ownership column: this is a shared public catalog. Both identities
-- must see exactly the same published rows, never hidden admin data or writes.
set local request.jwt.claim.sub = '00000000-0000-4000-8000-000000000001';
select pg_temp.catalog_check(
  (select array_agg(id) = array['test-published'] from public.products),
  'first user sees only the public catalog') as result;
select pg_temp.catalog_throws($q$insert into public.products (name, category, weight, price_kurus)
  values ('Unauthorized', 'zeytinyagi', '1 L', 1)$q$, '42501',
  'first user INSERT is rejected by RLS despite its explicit grant') as result;
with changed as (update public.products set stock = 999 returning id)
select pg_temp.catalog_check((select count(*) = 0 from changed),
  'first user cannot update any catalog row') as result;
with removed as (delete from public.products returning id)
select pg_temp.catalog_check((select count(*) = 0 from removed),
  'first user cannot delete any catalog row') as result;

set local request.jwt.claim.sub = '00000000-0000-4000-8000-000000000002';
select pg_temp.catalog_check(
  (select array_agg(id) = array['test-published'] from public.products),
  'second user cannot gain access to hidden catalog rows') as result;
select pg_temp.catalog_throws($q$insert into public.products (name, category, weight, price_kurus, is_active)
  values ('Unauthorized active', 'zeytinyagi', '1 L', 1, true)$q$, '42501',
  'second user cannot publish a product') as result;
select pg_temp.catalog_throws($q$insert into public.products (id, name, category, weight, price_kurus)
  values ('test-draft', 'Unauthorized', 'zeytinyagi', '1 L', 1)
  on conflict (id) do update set is_active = true$q$, '42501',
  'upsert cannot bypass authenticated RLS') as result;
with changed as (update public.products set is_active = true where id = 'test-draft' returning id)
select pg_temp.catalog_check((select count(*) = 0 from changed),
  'second user cannot publish a known hidden row') as result;
with removed as (delete from public.products where id = 'test-published' returning id)
select pg_temp.catalog_check((select count(*) = 0 from removed),
  'second user cannot delete a public row') as result;
select pg_temp.catalog_throws('truncate public.products', '42501',
  'authenticated cannot bypass row policies with TRUNCATE') as result;

set local role service_role;
select pg_temp.catalog_check(
  (select stock = 0 and price_kurus = 12345 from public.products where id = 'test-published') and
  (select not is_active and stock = 9 from public.products where id = 'test-draft'),
  'failed client writes leave public and hidden rows unchanged') as result;
with removed as (delete from public.products where id = 'test-draft' returning id)
select pg_temp.catalog_check((select count(*) = 1 from removed),
  'service_role can delete a hidden product') as result;

-- Schema constraints apply even to the trusted service role.
select pg_temp.catalog_throws($q$insert into public.products (name, category, weight, price_kurus)
  values ('Test', 'zeytinyagi', '1 L', -1)$q$, '23514', 'negative prices are rejected') as result;
select pg_temp.catalog_throws($q$insert into public.products (name, category, weight, price_kurus, stock)
  values ('Test', 'zeytinyagi', '1 L', 1, -1)$q$, '23514', 'negative stock is rejected') as result;
select pg_temp.catalog_throws($q$insert into public.products (name, category, weight, price_kurus, currency)
  values ('Test', 'zeytinyagi', '1 L', 1, 'USD')$q$, '23514', 'non-TRY currency is rejected') as result;
select pg_temp.catalog_throws($q$insert into public.products (name, category, weight, price_kurus)
  values ('Test', 'unsupported', '1 L', 1)$q$, '23514', 'unknown categories are rejected') as result;
select pg_temp.catalog_throws($q$insert into public.products (name, category, weight, price_kurus)
  values ('   ', 'zeytinyagi', '1 L', 1)$q$, '23514', 'blank names are rejected') as result;
select pg_temp.catalog_throws($q$insert into public.products (name, category, weight, price_kurus)
  values ('Test', 'zeytinyagi', '   ', 1)$q$, '23514', 'blank package sizes are rejected') as result;
select pg_temp.catalog_throws($q$insert into public.products (id, name, category, weight, price_kurus)
  values ('', 'Test', 'zeytinyagi', '1 L', 1)$q$, '23514', 'blank IDs are rejected') as result;
select pg_temp.catalog_throws($q$insert into public.products (id, name, category, weight, price_kurus)
  values ('test-published', 'Test', 'zeytinyagi', '1 L', 1)$q$, '23505', 'duplicate IDs are rejected') as result;
select pg_temp.catalog_throws($q$update public.products set price_kurus = null$q$, '23502',
  'prices cannot be null') as result;
select pg_temp.catalog_throws($q$update public.products set stock = null$q$, '23502',
  'stock cannot be null') as result;
select pg_temp.catalog_throws($q$update public.products set is_active = null$q$, '23502',
  'visibility cannot be null') as result;
select pg_temp.catalog_throws($q$update public.products set currency = null$q$, '23502',
  'currency cannot be null') as result;
select pg_temp.catalog_check(
  (select data_type = 'integer' from information_schema.columns
   where table_schema = 'public' and table_name = 'products' and column_name = 'price_kurus') and
  (select data_type = 'integer' from information_schema.columns
   where table_schema = 'public' and table_name = 'products' and column_name = 'stock'),
  'prices and stock use integer storage instead of floating point') as result;

delete from public.products;
insert into public.products (name, category, weight, price_kurus) values ('Test default', 'zeytinyagi', '1 L', 0);
select pg_temp.catalog_check(
  (select id is not null and not is_active and active_slot is null and stock = 0 and currency = 'TRY'
   and created_at is not null from public.products),
  'new products default to hidden, zero stock and TRY with a generated ID') as result;
delete from public.products;

insert into public.products (id, name, category, weight, price_kurus, is_active)
select 'test-active-' || n, 'Test active ' || n, 'salamura-zeytin', '1 kg', 100, true
from generate_series(1, 6) n;
select pg_temp.catalog_check(
  (select count(*) = 6 and count(distinct active_slot) = 6 from public.products where is_active),
  'one bulk statement can publish exactly six products into distinct slots') as result;
select pg_temp.catalog_throws($q$insert into public.products (name, category, weight, price_kurus, is_active)
  values ('Test seventh', 'zeytinyagi', '1 L', 1, true)$q$, '23514',
  'a seventh active INSERT is rejected') as result;
insert into public.products (id, name, category, weight, price_kurus)
select 'test-hidden-' || n, 'Test hidden ' || n, 'zeytinyagi', '1 L', 100
from generate_series(1, 10) n;
select pg_temp.catalog_check((select count(*) = 16 from public.products),
  'hidden drafts do not consume the six active slots') as result;
select pg_temp.catalog_throws($q$update public.products set is_active = true where id = 'test-hidden-1'$q$,
  '23514', 'activating a seventh product is rejected') as result;
update public.products set stock = 4, price_kurus = 200 where id = 'test-active-1';
select pg_temp.catalog_check(
  (select stock = 4 and price_kurus = 200 from public.products where id = 'test-active-1'),
  'price and stock edits remain possible at the active limit') as result;
update public.products set is_active = false where id = 'test-active-1';
select pg_temp.catalog_check(
  (select active_slot is null from public.products where id = 'test-active-1'),
  'unpublishing releases the active slot') as result;
update public.products set is_active = true where id = 'test-hidden-1';
select pg_temp.catalog_check((select count(*) = 6 from public.products where is_active),
  'a released slot can be reused by another product') as result;
delete from public.products where id = 'test-active-2';
select pg_temp.catalog_throws($q$update public.products set is_active = true
  where id in ('test-hidden-2', 'test-hidden-3')$q$, '23514',
  'bulk activation cannot overfill the final available slot') as result;
select pg_temp.catalog_check(
  (select count(*) = 5 from public.products where is_active) and
  (select count(*) = 2 from public.products where id in ('test-hidden-2', 'test-hidden-3') and not is_active),
  'failed bulk activation rolls back the entire statement') as result;
update public.products set is_active = true where id = 'test-hidden-2';
delete from public.products;

select pg_temp.catalog_throws($q$insert into public.products (name, category, weight, price_kurus, is_active)
  select 'Test bulk ' || n, 'zeytinyagi', '1 L', 1, true from generate_series(1, 7) n$q$, '23514',
  'bulk insertion of seven active rows is rejected atomically') as result;
select pg_temp.catalog_check((select count(*) = 0 from public.products),
  'failed bulk insertion leaves no partial catalog') as result;

-- The trigger allocates slots; the CHECK and immediate UNIQUE constraints are
-- the actual concurrency invariant. Even a stale allocator cannot commit seven
-- distinct active rows: each needs a non-null unique slot in the finite set 1..6.
-- PGlite has one session; it cannot simulate two real PostgreSQL transactions.
reset role;
alter table public.products disable trigger products_assign_active_slot;
select pg_temp.catalog_throws($q$insert into public.products (name, category, weight, price_kurus, is_active)
  values ('Test bypass', 'zeytinyagi', '1 L', 1, true)$q$, '23514',
  'active products require a slot even when the allocator is bypassed') as result;
select pg_temp.catalog_throws($q$insert into public.products (name, category, weight, price_kurus, is_active, active_slot)
  values ('Test bypass', 'zeytinyagi', '1 L', 1, true, 7)$q$, '23514',
  'slot seven is forbidden independently of the allocator') as result;
select pg_temp.catalog_throws($q$insert into public.products (name, category, weight, price_kurus, is_active, active_slot)
  values ('Test bypass', 'zeytinyagi', '1 L', 1, true, 0)$q$, '23514',
  'slot zero is forbidden independently of the allocator') as result;
select pg_temp.catalog_throws($q$insert into public.products (name, category, weight, price_kurus, active_slot)
  values ('Test bypass', 'zeytinyagi', '1 L', 1, 1)$q$, '23514',
  'hidden products cannot reserve a slot') as result;
insert into public.products (name, category, weight, price_kurus, is_active, active_slot)
values ('Test first contender', 'zeytinyagi', '1 L', 1, true, 1);
select pg_temp.catalog_throws($q$insert into public.products (name, category, weight, price_kurus, is_active, active_slot)
  values ('Test second contender', 'zeytinyagi', '1 L', 1, true, 1)$q$, '23505',
  'two contenders cannot occupy the same slot even with a stale allocation') as result;
select pg_temp.catalog_check(exists (
  select 1 from pg_constraint where conrelid = 'public.products'::regclass
  and conname = 'products_active_slot_unique' and contype = 'u' and not condeferrable),
  'slot uniqueness is immediate and enforced by PostgreSQL across transactions') as result;
alter table public.products enable trigger products_assign_active_slot;

select '1..' || currval('pg_temp.catalog_assertions') as result;
rollback;
