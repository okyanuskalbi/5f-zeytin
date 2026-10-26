-- Task 143: operational snippet, NOT a migration or automatic seed.
-- Generated from lib/catalog/static-products.ts; regenerate with:
-- UPDATE_STATIC_PRODUCT_SEED=1 npm test -- tests/unit/static-product-seed.test.ts --maxWorkers=2
-- Existing IDs (including admin edits and unpublished rows) remain unchanged.
-- An occupied active_slot for a missing ID raises products_active_slot_unique;
-- the transaction prevents partial inserts. Resolve the conflict before retrying.
begin;

insert into public.products (
  id, name, category, weight, price_kurus, stock, is_active, active_slot, category_label
)
values
  ('sample-green-olive-1kg', 'Doğal Kırma Yeşil Zeytin', 'sofralik-zeytin', '1 kg', 22000, 12, true, 1, 'Doğal Kırma Yeşil Zeytin'),
  ('sample-green-olive-10kg', 'Doğal Kırma Yeşil Zeytin', 'sofralik-zeytin', '10 kg', 220000, 6, true, 2, 'Doğal Kırma Yeşil Zeytin'),
  ('sample-black-olive-1kg', 'Salamura Siyah Zeytin', 'salamura-zeytin', '1 kg', 22000, 0, true, 3, 'Salamura Siyah Zeytin'),
  ('sample-olive-oil-1l', 'Natürel Sızma Zeytinyağı', 'zeytinyagi', '1 L', 35000, 8, true, 4, 'Natürel Sızma Zeytinyağı'),
  ('sample-olive-oil-5l', 'Natürel Sızma Zeytinyağı', 'zeytinyagi', '5 L', 175000, 6, true, 5, 'Natürel Sızma Zeytinyağı'),
  ('sample-brined-green-olive-5kg', 'Salamura Yeşil Zeytin', 'salamura-zeytin', '5 kg', 110000, 8, true, 6, 'Salamura Yeşil Zeytin')
on conflict (id) do nothing;

commit;
