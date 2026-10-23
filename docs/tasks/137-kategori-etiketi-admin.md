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

### Kullanılan skill'ler

| Skill | Uygulama |
|---|---|
| `ui-ux-pro-max` (§5) | Mevcut panel düzeni, mobilde yatay taşmayı önleyen esnek alanlar ve ≥44 px kontrol hedefleri. |
| `frontend-design` | Admin'in mevcut renk, tipografi ve form düzeni korundu. |
| `shadcn-ui` | Resmi CLI ile `view toggle-group`, `docs toggle-group`, `add toggle-group --yes`; bileşenler proje token'larına ve 44 px hedeflere uyarlandı. |
| `better-layout` | Mobil tek sütun, masaüstünde `minmax(0, 1fr)` sütunlar; göster/gizle grubu gerektiğinde satıra yayılır. |
| `tdd-workflow` | Önce RED, ardından GREEN, kapsam testleri ve son kalite kapıları. |
| `backend-patterns` | Strict alan doğrulaması, public/admin veri projeksiyonları ve mevcut sunucu yetki kapıları korundu. |
| `database-migrations` | Eski migration'lara dokunmadan yeni migration; yalnız bellek içi PGlite doğrulaması ve SQL içinde geri alma notu. |
| `postgres-patterns` | Mevcut RLS/GRANT, altı aktif ürün sınırı ve service_role-only SECURITY INVOKER RPC korundu. |

- 21st MCP aracı bu oturumda sunulmuyordu. Mevcut panel stili ve resmi shadcn CLI kullanıldı. `ui-ux-pro-max` ve `shadcn-ui` mevcut global kurulumdan okundu; ek skill kurulmadı.

### Uygulama ve sınırlar

- `category_label` nullable düz metin (≤40 karakter), `show_category_label` NOT NULL DEFAULT true eklendi. RPC oluşturma/düzenlemede iki alanı atomik kaydeder; boş metin NULL olur. Uzun/HTML etiketler ve boolean olmayan görünürlük reddedilir.
- Admin formuna etiket alanı ve tek seçimin daima korunduğu Göster/Gizle toggle-group eklendi; kayıt sırasında kontroller devre dışıdır.
- Kart ve detay tek `getCategoryLabel` yardımcısını kullanır. Mevcut kart kısaltmaları **Sofralık / Salamura**, detay adları **Sofralık zeytin / Salamura zeytin** aynen korundu. Gizlide boş rozet veya kategori satırı oluşmaz.
- Ana sayfa önceden statik katalog kullanıyordu. Yalnız aynı ürün kimliğiyle eşleşen yayımlanmış DB kayıtlarının etiket/görünürlük ayarları onaylı statik varyantlara aktarılır. Eşleşme yoksa, DB boşsa veya erişilemiyorsa mevcut varsayılan görünüm korunur. Ürün adı/fiyat/açıklama ve görseller değiştirilmedi.
- Ana sayfa `force-dynamic`: etiket ayarı build çıktısında donmaz, sonraki istekte okunur. Build manifestinde `/` statik prerender kaydı olmadığı ayrıca komutla doğrulandı.
- Canlı Supabase'e bağlanılmadı, migration canlıya uygulanmadı. `.env*` içerikleri incelenmedi/değiştirilmedi. Doğrulama komutlarında üç Supabase ortam değişkeni boş geçirildi; testler yalnız sentetik mock/PGlite yapılandırması kullandı.

### TDD ve komut kanıtı

- RED: `npm test -- tests/unit/admin-products-api.test.ts tests/unit/admin-products-ui.test.tsx tests/unit/category-label-db-137.test.ts tests/unit/product-detail-130.test.tsx tests/unit/catalog-api.test.ts --maxWorkers=2` → **13 beklenen başarısız, 136 başarılı**. Özel/gizli etiket, eksik form/kolonlar ve API aktarımı eksikliği doğrulandı.
- GREEN: aynı hedefler → **149/149 başarılı**. Sonradan eklenen sınır/varsayılan/disabled testleriyle coverage koşusu **156/156 başarılı**.
- Yerel RED/GREEN checkpoint'leri `fe1e5f8` / `9e21712`; kanıt burada korunarak nihai görev commit'inde birleştirildi. RED/ara commit'ler push geçmişine dahil edilmedi.

| Garanti / kabul | Komut veya test | Sonuç |
|---|---|---|
| Varsayılan, özel ve gizli etiket kart + gerçek detay bileşeninde doğru; gizlide boş span/satır yok | `product-detail-130.test.tsx`, `category-label-137.test.ts` | PASS |
| Trim, boş etiket, 40/41 karakter sınırı, HTML reddi, görünürlük ve form kaydı | `admin-products-api.test.ts`, `admin-products-ui.test.tsx` | PASS |
| PGlite RPC iki alanı yazar/temizler; SQL varsayılanı ve sınırı; anon/authenticated yalnız yayımlanmış kolonları okur, yazamaz/RPC çağıramaz | `category-label-db-137.test.ts`, mevcut DB testleri | PASS |
| Public/admin API projeksiyonu ve aynı kimlikli vitrin ürününe yalnız etiket ayarının aktarılması | `catalog-api.test.ts`, `security-admin-origin.test.ts` | PASS |
| Tüm unit testleri | `npm test -- --maxWorkers=2` | **61 dosya, 988 test PASS** |
| Lint | `npm run lint` | PASS |
| TypeScript | `npm run typecheck` | PASS |
| Üretim derlemesi ve varlık kontrolü | `npm run build` (`prebuild` dahil) | PASS |
| Görev kapsamındaki coverage | Yukarıdaki beş hedef + `category-label-137.test.ts`, `--coverage`; include: `lib/catalog/{category-label,product-details,read}.ts`, `lib/contracts/{admin-products,catalog}.ts`, `components/admin/ProductForm.tsx` | Satır **%100**, dal **%92,9**, ifade **%96,29**, fonksiyon **%96,66**; %80 eşiği PASS |
| 390 px/masaüstü taşma, ≥44 px ölçümü ve klavye | `tests/e2e/admin-products.spec.ts` güncellendi; 320/390/768/1024/1440 px ve reduced-motion varyantları | **Claude doğrulayacak — çalıştırılmadı** |

- AGENTS.md uyarınca Playwright, Lighthouse, inspect ve ekran görüntüsü çalıştırılmadı; tarayıcı kabulü Claude'da. Uygulama kapsamında eksik madde yoktur.

## Durum: TAMAMLANDI
