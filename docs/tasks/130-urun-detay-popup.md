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

## Coder Notu

22 Ekim 2026 — uygulama ve tarayıcı dışı kabul kontrolleri tamamlandı.

- Altı varyantın açıklamaları birebir `lib/catalog/product-details.ts` dosyasında; dosyanın başında "Müşteri onayı bekler" yorumu var. Net miktar/kategori katalog varyantından, ambalaj varyant kimliğinden geliyor; istenen altı bilgi satırı gösteriliyor. Katalog fiyatları, stoklar ve görseller değiştirilmedi.
- Kartın görseli ve adı, hero satın alma kartının seçili ürün adı detay açıyor. Kartın mevcut Sepete ekle düğmesi ayrı; detay ya da sepet drawer'ını açmıyor.
- 768px altında tam yükseklik Sheet ve kayan iç alanın dışında safe-area içeren yapışık satın alma alanı; 768px ve üzerinde iki kolonlu, ortalanmış Dialog kullanılıyor. Büyük stüdyo görseli ve iki küçük stüdyo/sahne görseli mevcut onaylı manifestten `V3Picture` ile lazy yükleniyor. Fraunces başlık, altın fiyat/CTA, bilgi tablosu ve mevcut kart logoları kullanıldı.
- Boy anahtarı yalnız ürün ailesindeki varyantları gösteriyor; fiyat, açıklama, bilgiler ve görseller seçilen varyanta geçiyor. Boy değişince adet/görsel sıfırlanırken klavye odağı boy kontrolünde kalıyor. Adet, sepette bulunan miktar da düşülerek stokla sınırlandırılıyor. Stok sıfırsa adet gizli ve Mevcut değil düğmesi disabled; projenin mevcut opacity: 1 kuralı korunuyor.
- Ekleme `cart.store.addItem(id, quantity)` ile mevcut sepete bağlandı; Eklendi ✓ geri bildirimi ve sayaç güncelleniyor, detay açık kalıyor. `?urun=<variantId>` ilk girişte ve popstate'te okunuyor; açma/boy değiştirme/kapatma `history.replaceState` kullanıyor. Diğer parametreler ve history state korunuyor, hash eklenmiyor.
- Radix odak kapanı/scroll lock, başlığa ilk odak, Esc/arka plan/kapat düğmesi ve tetikleyiciye odak dönüşü korunuyor. Çıkış animasyonu bitene kadar modal açık tutuluyor. Reduced-motion'da animasyon çalışmıyor; mevcut mobil satın alma çubuğu detay açıkken gizleniyor.

### Skill / nerede kullanıldı

| Skill / araç | Nerede kullanıldı |
| --- | --- |
| `ui-ux-pro-max` | Yüklü yerel skill ve §5 Layout & Responsive okundu; `mobile modal responsive overflow --domain ux` araması mobil önce düzen, iki kolonlu tablonun sığması ve viewport kurallarına uygulandı. |
| `frontend-design` | Mevcut Fraunces/Figtree ve ink/zeytin/süt/altın tokenları; ürün görseli, ad, fiyat ve tek satın alma eylemi hiyerarşisi. |
| `better-layout` | Mobil iç kaydırma, 100dvh, safe-area, minmax(0, 1fr), uzun bilgi satırlarının kırılması ve SE için kompakt görsel alanı. |
| `motion-framer` | Panelin açılış/kapanış hareketi ve kullanıcının reduced-motion tercihi. |
| `motion-foundations`, `motion-patterns`, `motion-advanced` | Mevcut motionTokens ve motion/react-mini useAnimate; transform/opacity, temizlenen kontroller ve çıkış boyunca korunan modal kapanı. |
| `shadcn-ui` | Yerel skill yüklendi; resmi CLI `npx shadcn@latest view dialog sheet` ile güncel kaynaklar incelendi. Projedeki token uygulanmış Dialog/Sheet temeli yeniden kullanıldı; varsayılan stil eklenmedi. |
| 21st MCP / `21st-cli-use` | Global 21st MCP yapılandırmasıyla `product quick view modal` ve `product detail drawer` aramaları çalıştırıldı. `shadcn` yazar kataloğundan **Calendar picker in a drawer**, demo ID **2808**, component ID **2679**, `get_component` ile alındı. Kontrollü drawer, erişilebilir başlık/açıklama ve seçim kalıbı mevcut ortak Dialog/Sheet'e uyarlandı; tarih seçici bağımlılıkları eklenmedi. |
| `frontend-patterns` | Küçük URL/context sahibi, koşullu next/dynamic yükleme ve mevcut cart store aboneliği. |
| `tdd-workflow` | Önce test, RED, uygulama, GREEN; ek boy değişimi odak regresyonu önce başarısız testle doğrulandı. |
| `responsiveness-check` | Tarayıcı kabulü kapsamında Claude doğrulayacak. |

### Komut kanıtı ve TDD

- İlk RED: `npm test -- tests/unit/product-detail-130.test.tsx` — henüz bulunmayan detay bileşeni/veri modülü nedeniyle başarısız. Uygulamadan sonra GREEN.
- Ek RED: boy değişiminde odak kontrolü — yeniden mount edilen radio odağı kaybediyordu. Detay gövdesi korunup yalnız varyanta bağlı seçimler/ekleme geri bildirimi sıfırlanarak düzeltildi.
- Task 130 için 27 unit test: altı birebir açıklama ve bilgi satırları, kart/hero açılışı, ayrı kart satın alması, aile/boy/fiyat/adet, stok, lazy galeri, URL, breakpoint, odak dönüşü, arka plan, çıkış animasyonu, reduced-motion ve mobil çubuk.

| Komut | Sonuç |
| --- | --- |
| `npm test -- --maxWorkers=2` | PASS — 38 dosya, 434 test; atlanan test yok. |
| `npm run lint` | PASS — sıfır uyarı. |
| `npm run typecheck` | PASS — E2E dosyası dahil. |
| `npm run build` | PASS — production build, 16 sayfa; prebuild varlık kontrolleri PASS. |
| `node scripts/report-bundle.mjs --verify` | PASS — ilk yük JavaScript 190237 bayt gzip (sınır 200000); ilk aktarım + inline script 261414 bayt (sınır 450000). |
| Node ile build HTML/ilk script kontrolü | PASS — detay içeriği/galeri kontrolleri ilk HTML ve ilk JavaScript paketlerinde yok; detay koşullu dinamik import ile yükleniyor. |
| `git diff --check` | PASS. |

### Claude doğrulayacak

`tests/e2e/product-detail-130.spec.ts` yazıldı, çalıştırılmadı. 1440×900, 390×844 ve 375×667 için normal/reduced-motion altı senaryo ile ek paylaşım adresi senaryosu var: içerik/CTA görünürlüğü, yatay taşma, galeri/boy/fiyat/adet/sepet, Sheet/Dialog, mobil çubuk, odak dönüşü, URL ve arka planla kapatma.

AGENTS.md gereği Playwright, Lighthouse, inspect ve ekran görüntüsü çalıştırılmadı. Gerçek responsive/görsel kabulü, cihazlarda sabit CTA ve Task 125 LCP ölçümünü **Claude doğrulayacak**. Dinamik yükleme ve mevcut ilk yük bütçeleri komutla doğrulandı. Tarayıcı kriterleri dışında açık uygulama veya komut engeli yok. Yeni skill kurulmadı; istenen skill'ler mevcut yerel kurulumlardan okundu.

## Durum: TAMAMLANDI
