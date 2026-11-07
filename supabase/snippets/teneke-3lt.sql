-- Task 182: kullanıcı tarafından çalıştırılacak; otomatik migration değildir.
-- products.weight şemada text; açıklama DB'de değil product-details.ts içindedir.
begin;

select id, weight, price_kurus, stock from public.products
where id in ('sample-green-olive-10kg', 'sample-brined-green-olive-5kg')
order by id;

update public.products set weight = '3 L'
where id in ('sample-green-olive-10kg', 'sample-brined-green-olive-5kg');

select id, weight, price_kurus, stock from public.products
where id in ('sample-green-olive-10kg', 'sample-brined-green-olive-5kg')
order by id;

commit;
