# Task 130: Ürün detay penceresi — açıklama, bilgiler, görseller, sepete ekle

## Tür
frontend

## Amaç
Kullanıcı (22 Eki): "Ürün iç sayfasını açalım. En azından açıklama falan görecek kadar. (Popupta olabilir.)"
Ürün kartına (görsel ya da ad) tıklanınca ürün detayı açılır: masaüstünde ortada pencere, telefonda alttan tam ekran sayfa (124'teki Dialog/Sheet kalıbı).

## Kullanılacak araçlar
- **Kullanıcı isteği (22 Eki), hepsini fiilen yükle:** `ui-ux-pro-max` (§5 Layout & Responsive dahil), `frontend-design`, `better-layout`, `motion-framer`, `shadcn-ui` (resmi CLI, token'lara uyarla), 21st MCP (ilgili bileşeni ara/uyarla, seçilen bileşenin adı/ID'si Coder Notu'na). `responsiveness-check` Claude'da. Coder Notu'na "Skill / nerede kullanıldı" tablosu ekle.
- `tdd-workflow`, `frontend-patterns`.
- 21st MCP: "product quick view modal", "product detail drawer" ara.

## İstenen
1. **Veri:** `lib/catalog/product-details.ts` — varyant id'sine göre açıklama ve bilgi satırları. Metinler Claude'dan (aşağıda), **birebir**; dosyanın başına "Müşteri onayı bekler" yorumu.
   - `sample-green-olive-10kg` — Doğal Kırma Yeşil Zeytin, 10 kg teneke: "Ellek, Düziçi'nde toplanan yeşil zeytinler geleneksel usulle kırılarak hazırlanır ve kendi tesisimizde tenekeye doldurulur. 10 kg teneke, kışlık kiler ve kalabalık sofralar için."
   - `sample-green-olive-1kg` — Doğal Kırma Yeşil Zeytin, 1 kg kavanoz: "Aynı doğal kırma yeşil zeytin, günlük sofra için cam kavanozda. Kendi tesisimizde doldurulur."
   - `sample-black-olive-1kg` — Salamura Siyah Zeytin, 1 kg kavanoz: "Salamurada bekletilerek hazırlanan siyah zeytin, kahvaltı sofraları için 1 kg cam kavanozda. Kendi tesisimizde doldurulur."
   - `sample-olive-oil-1l` — Natürel Sızma Zeytinyağı, 1 L cam şişe: "Natürel sızma zeytinyağı, sofra ve salata kullanımı için 1 litrelik cam şişede. Kendi tesisimizde doldurulur."
   - `sample-olive-oil-5l` — Natürel Sızma Zeytinyağı, 5 L teneke: "Natürel sızma zeytinyağı, mutfakta düzenli kullanım için 5 litrelik tenekede. Kendi tesisimizde doldurulur."
   - `sample-brined-green-olive-5kg` — Salamura Yeşil Zeytin, 5 kg teneke: "Salamurada hazırlanan yeşil zeytin, kiler stoğu için 5 kg tenekede. Kendi tesisimizde doldurulur."
   - Bilgi satırları (hepsi için, değerler varyanttan): **Net miktar** (10 kg / 1 kg / 1 L / 5 L / 5 kg), **Ambalaj** (teneke / cam kavanoz / cam şişe), **Kategori** (Sofralık zeytin / Salamura zeytin / Zeytinyağı), **Üretim yeri** (Ellek, Düziçi / Osmaniye), **Dolum** (Afina Zeytin tesisi), **Kargo** (2–4 iş günü).
2. **Pencere içeriği:**
   - Sol (telefonda üst): büyük stüdyo görseli (`0N-…-studyo`), altında 2 küçük görsel (stüdyo + sahne) tıklayınca büyük görsel değişir. Görseller onaylı v3 çıktıları, `next/image`/mevcut `V3Picture`, lazy (pencere açılınca).
   - Sağ: kategori çipi, ürün adı (Fraunces 28–32px), aile içinde boy anahtarı (Doğal Kırma: 1 kg | 10 kg; Zeytinyağı: 1 L | 5 L; yan yana hap, açılır liste yok), fiyat (altın, tabular), adet seçici (− 1 +, stok sınırı), "Sepete ekle" (altın, tam genişlik telefonda yapışık alt), açıklama paragrafı, bilgi satırları tablosu (iki kolon, ince ayraç), "Güvenli Ödeme" + kart logoları küçük satır.
   - Stok 0 → "Mevcut değil" disabled (opacity kuralı), adet seçici gizli.
3. **Açılış:** kart görseli ve ürün adı `button`/link olur (kart "Sepete ekle" düğmesi ayrı kalır ve pencereyi açmaz). Hero satın alma kartındaki ürün adı da pencereyi açar.
4. **Paylaşılabilir adres:** açıkken URL `?urun=<variantId>` (`history.replaceState`, sayfa yenilenmez); bu adresle gelinirse pencere açık başlar; kapanınca parametre silinir. Hash yazılmaz.
5. Erişilebilirlik: odak başlığa, Esc/arka plan kapatır, odak tetikleyiciye döner, telefonda sabit "Sepete ekle" çubuğu (121) pencere açıkken gizli.
6. Sepete ekleme mevcut `cart.store.addItem(id, qty)`; eklenince düğmede "Eklendi ✓" ve sepet sayacı artar; pencere açık kalır.

## Kabul kriterleri
- [ ] Unit: kart adı/görseli pencereyi açar; "Sepete ekle" açmaz.
- [ ] Unit: altı varyantın açıklaması birebir; bilgi satırları doğru.
- [ ] Unit: boy anahtarı aile içinde varyant değiştirir, fiyat güncellenir; adet × ekleme.
- [ ] Unit: `?urun=` ile açık başlar; kapanınca parametre silinir.
- [ ] Unit: < 768 Sheet, ≥ 768 Dialog.
- [ ] E2E (yaz, çalıştırma) `tests/e2e/product-detail-130.spec.ts`: 1440, 390, 375×667'de pencere içeriği ve "Sepete ekle" görünür, yatay taşma yok.
- [ ] `npm test`, lint, typecheck, build yeşil; LCP (125) korunur (pencere kodu ilk yükte değil, dinamik import).
- [ ] Tarayıcı doğrulaması Claude'da.

## Yapılmaması gerekenler
- Açıklamaya sağlık/organik/%100/sertifika iddiası ekleme; metni değiştirme.
- Yeni görsel üretme; fiyat/stok uydurma.
- `docs/` değiştirme (yalnız Coder Notu/Durum).

## Durum: BEKLİYOR
