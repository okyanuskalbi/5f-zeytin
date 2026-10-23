> ONAY VERİLDİ (kullanıcı, 23 Eki 2026): "şimdilik kalsın, admin yönetiminden ayarlanabilsin"

# Task 137: Kategori etiketi admin panelinden ayarlanabilsin

## Tür
fullstack (UI + DB şeması, yerel)

## Amaç
Ürün kartında (`components/catalog/ProductCard.tsx:40`) ve ürün detayındaki "Kategori" satırında (`lib/catalog/product-details.ts:43`) "Sofralık zeytin / Salamura zeytin / Zeytinyağı" yazıyor. Kullanıcı yazının şimdilik kalmasını, ama ürün başına admin panelinden ayarlanabilmesini istiyor.

## Kullanılacak araçlar
- UI: `ui-ux-pro-max` (§5), `frontend-design`, `shadcn-ui`, `better-layout`. Panel mevcut admin stilini korur.
- `tdd-workflow`, `backend-patterns`. Coder Notu'na skill tablosu ekle.

## İstenen
1. **Yeni migration** `supabase/migrations/20261023000004_category_label.sql`:
   - `public.products` tablosuna `category_label text null` (en çok 40 karakter, check) ve `show_category_label boolean not null default true`.
   - `admin_save_product` bu iki alanı kaydeder (mevcut doğrulama ve yetki aynı kalır, yalnız service_role).
   - Mevcut GRANT/RLS düzeni bozulmaz; yeni tablo yok.
2. **Admin ürün formu** (`components/admin/ProductForm.tsx`):
   - "Kategori etiketi" metin alanı. Boş bırakılırsa kategorinin varsayılan adı görünür ("Sofralık zeytin" vb.).
   - "Etiketi göster" anahtarı (iki seçenek: Göster | Gizle, açılır liste değil; toggle-group).
   - `parseProductInput` iki alanı doğrular (trim, ≤ 40 karakter, HTML yok).
3. **Vitrin:**
   - Kart ve detay aynı tek yardımcıdan okur (`getCategoryLabel(product)` gibi): gizliyse hiç render edilmez (boş span kalmaz), özel metin varsa o, yoksa varsayılan.
   - `ProductCard.tsx` ve `product-details.ts` içindeki iki ayrı `categories` haritası tek yerde birleşir.
   - Veritabanı boşken kullanılan statik ürünlerde davranış bugünküyle aynı (varsayılan ad, görünür).
4. Testler: varsayılan / özel metin / gizli için kart + detay; form doğrulaması (41 karakter reddedilir); PGlite'ta `admin_save_product` iki alanı yazar, anon okuma yeni kolonları görür ama yazamaz.

## Kabul kriterleri
- [ ] Gizli ürünlerde kart ve detayda "Kategori" metni/satırı yok.
- [ ] Varsayılan davranış ekranda bugünküyle birebir aynı.
- [ ] Telefon 390 px ve masaüstünde form taşmıyor, dokunma hedefi ≥ 44 px.
- [ ] `npm test`, lint, typecheck, build yeşil.

## Yapılmaması gerekenler
- Canlı Supabase'e bağlanma veya migration uygulama (Claude kullanıcıyla yapar).
- `.env*` okuma/yazma.
- Ürün adı, fiyat, açıklama metinlerini değiştirme.
- `docs/tasks` içinde yalnız Coder Notu/Durum.

## Coder Notu
