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

## Coder Notu

- `database-migrations`, `postgres-patterns`, `tdd-workflow` skill'leri uygulandı. Migration, RLS/GRANT, statik fiyat/stok veya runtime kodu değiştirilmedi; canlı Supabase'e bağlanılmadı.
- `supabase/snippets/seed-static-products.sql`, test içindeki üreticiyle doğrudan `getProductFamilies()` verisinden üretildi. Tek transaction ve `ON CONFLICT (id) DO NOTHING` mevcut/admin'den düzenlenen satırları korur; kategori etiketleri aile adlarıdır, aktif slotlar statik sırayla 1–6'dır.
- Yeniden üretim: `UPDATE_STATIC_PRODUCT_SEED=1 npm test -- tests/unit/static-product-seed.test.ts --maxWorkers=2`. Normal test, SQL dosyasını güncellemeden statik veriyle birebir eşleşmesini denetler; fiyat/stok veya diğer kaynak değerler değişirse eski snippet testi geçmez.
- TDD kanıtı: snippet yokken hedef komut çalıştırıldı, 5 test beklenen `ENOENT` ile RED oldu. Üretim sonrasında aynı komut güncelleme bayrağı olmadan 5/5 GREEN: iki kez seed, altı satırın tüm alanları/id/sırası, admin düzenlemeleri ve yayından kaldırmanın korunması, altı farklı aktif ürünle açık `23505 / products_active_slot_unique` hatası ve son slotta geç çakışma sonrası sıfır kısmi ekleme doğrulandı. Hatalı transaction için çağıran tarafta `ROLLBACK` gerektiği de test edildi.
- Kabul komutları: `npm test -- --maxWorkers=2` → **67 dosya / 1065 test başarılı**; `npm run lint`, `npm run typecheck`, `npm run build` → **başarılı**. Yeni testin PGlite sonuç tipi typecheck doğrultusunda açıkça belirtildi; ardından hedef 5 test ve lint yeniden yeşil doğrulandı.
- Bu görevde tarayıcı kabul kriteri yok; AGENTS.md gereği tarayıcı testleri çalıştırılmadı. Canlı DB uygulaması görev başındaki yetki sınırı gereği kullanıcıya aittir. RED checkpoint'i son yeşil görev commit'inde birleştirildi; ara commit push edilmez.

## Durum: TAMAMLANDI
