> ONAY VERİLDİ (kullanıcı, 26 Eki 2026): "senin girdiklerin kalsın" (statik 6 ürün, mevcut temsili fiyat/stokla DB'ye girsin). Canlı DB'ye uygulamayı Codex YAPMAZ; Claude betik hazırlar, kullanıcı çalıştırır.

# Task 143: Statik 6 ürün için idempotent seed SQL

## Tür
backend (yalnız SQL snippet + test)

## Amaç
`lib/catalog/static-products.ts` içindeki 6 varyantı aynı id, ad, kategori, ağırlık, fiyat (kuruş) ve stokla `public.products` tablosuna yazan, tekrar çalıştırılabilir bir SQL dosyası üretmek.

## Bağlam
- Şema: `supabase/migrations/20261022000001_catalog.sql` (`products`, en fazla 6 aktif, `active_slot` 1–6) + `20261023000004_category_label.sql`.
- Sepet/ödeme varyant id'lerini kullanır: id'ler statik dosyadakiyle birebir aynı olmalı (`sample-green-olive-1kg` …).
- Migration DEĞİL: `supabase/snippets/seed-static-products.sql`.

## Kullanılacak araçlar
- ECC skill: `database-migrations`, `postgres-patterns`, `tdd-workflow`.

## Adımlar
1. `supabase/snippets/seed-static-products.sql`: tek transaction; 6 satır `insert ... on conflict (id) do nothing` (var olan/admin'den düzenlenmiş satırı ezme). `is_active = true`, `active_slot` statik sıradaki 1–6. Kategori etiketi kolonu varsa statik aile adıyla uyumlu değer.
2. Değerler elle kopyalanmasın: statik dosyadan SQL üreten küçük bir test/üretici (`scripts/` veya test içinde) yaz ve test, SQL dosyasının statik veriyle birebir eşleştiğini doğrulasın (fiyat değişirse test kırılsın).
3. PGlite ile: migration'lar → seed iki kez çalıştırılır → 6 satır, hata yok; ikinci çalıştırma satır sayısını değiştirmez; önceden 6 aktif farklı ürün varsa seed çakışmayı açık hata ile bildirir (sessiz yarım yazma yok).

## Kabul kriterleri
- [ ] PGlite seed testi yeşil (iki kez çalıştırma, 6 satır, id eşleşmesi).
- [ ] `npm test`, lint, typecheck, build yeşil.

## Yapılmaması gerekenler
- Canlı Supabase'e bağlanma, migration ekleme, RLS/GRANT değiştirme.
- Fiyat/stok değerlerini değiştirme.

## Durum: BEKLİYOR
