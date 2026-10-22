# Task 119: v4 — güven şeridi + ürün ızgarası (6 kart) + sepet bağlantısı

## Tür
frontend

## Amaç
Prova D'nin 2. ve 3. bölümü: hero altındaki güven şeridi ve koyu zeminde 6 ürün kartı. Mevcut `Pantry` / `PantryFamily` / `KraftTag` / raf-kiler kurgusu **kaldırılır**, yerine v4 ızgarası gelir. Sözleşme: `docs/DESIGN.md` (v4), prova `d.html` (`.strip`, `.urunler`, `.p`), kareler `mock-d-masa-02..03.png`, `mock-d-tel-02..03.png`.

Claude denetim notu (prova üstüne düzeltmeler, uygula):
- **Güven şeridi provada çok ince ve okunmuyordu:** metin 15–16px 500, renk `#D9DED3` üzerinde ≥ 4.5:1, satır yüksekliği 1.4, dikey iç boşluk 20px; telefonda 2×2 ızgara (alt alta tek kolon değil).
- **Kartlar birbirine benziyordu (4 teneke):** her kartın ambalajı gerçek boyut oranında görünsün (10 kg teneke > 5 L teneke > 5 kg teneke > kavanoz/şişe; görsel yüksekliği 280 / 240 / 230 / 200px gibi kademeli), kategori çipi (Sofralık · Salamura · Zeytinyağı) ve kategoriye göre kartın radyal parıltı rengi hafif farklı (zeytin yeşili / altın / zeytinyağı sarısı `#E6CB97`), böylece aynı kalıp hissi kırılır. Hover'da kartın arka planına o ürünün **sahne** görseli (`v3Image("0N-…-sahne")`) %18 opaklıkla belirir.

## Kullanılacak araçlar
- **Kullanıcı isteği (22 Eki), hepsini fiilen yükle:** `ui-ux-pro-max` (genel yön: "Trust & Authority" + dönüşüm kalıbı), `frontend-design` (renk, yazı tipi, düzen), `motion-framer` (Framer Motion animasyonları), `shadcn-ui` (bileşen gerekirse; resmi CLI, proje token'larına uyarlanmış), 21st MCP (bileşen arama/üretme, uyarla). Coder Notu'na "Skill / nerede kullanıldı" tablosu ekle.
- **Kullanıcı isteği (22 Eki), yerleşim:** `ui-ux-pro-max` §5 "Layout \& Responsive" (mobil-first kırılımlar, yatay kaydırma yok, dokunma hedefi ≥ 44px) ve `better-layout` (yerleşim düzeltmeleri) fiilen yüklenir. `responsiveness-check` (320/375/390/430/768/1024/1440 genişlik kontrolü) tarayıcı testidir; Claude çalıştırır, sen kodu bu genişliklere göre yaz.
- Skill: `frontend-patterns`, `tdd-workflow`, `motion-patterns`, `impeccable` (craft-floor, `layout`), `landing-page-design` (güven öğeleri).
- 21st MCP: "product grid dark" ara; düzeni projenin token'larına uyarla.

## Adımlar
1. **Güven şeridi** (`components/landing/TrustStrip.tsx`): zemin `--zeytin`, üst/alt çizgi `rgba(255,255,255,.06)`; 4 madde, her birinin önünde 6px altın nokta: "Kendi tesisimizde dolum", "Kargo 2–4 iş günü", "PayTR ile güvenli ödeme", "Toptan alım için teklif" (son madde `/#toptan-iletisim` linki). Lucide ikon yerine nokta (prova); ikon istersen tek ikon ailesi, 16px.
2. **Ürünler bölümü** (`components/landing/Products.tsx` yeni; `Pantry*`, `KraftTag`, `V3Foundation` kiler stilleri silinir): `id="urunler"`, padding 112/96px (telefon 72/64), zemin `radial-gradient(1200px 600px at 20% 0%, #1C2D21, var(--ink) 60%)`. Başlık `h2` "Sofranız için / altı ürün." (`clamp(40px,5vw,68px)`), sağda 17px gri açıklama ≤44ch: "Az ama gerçek. Hepsi Ellek'teki tesisimizde seçilir ve dolum yapılır. Kışlık stok için teneke, günlük sofra için kavanoz ve şişe."
3. **Kart** (`components/catalog/ProductCard.tsx` yeni): 3×2 (telefon 2 kolon, gap 12), radius 22, zemin `linear-gradient(180deg,#17231A,#101810)`, çizgi `rgba(255,255,255,.06)`, alt radyal parıltı; hover `translateY(-8px)` + çizgi altın `.35`; görsel alanı 300px (telefon 170), görsel contain + `drop-shadow(0 30px 30px rgba(0,0,0,.5))`, hover'da `translateY(-6px) scale(1.04)`; `h3` 24px (telefon 17); meta çipleri (boy; seçili = süt dolgu); fiyat 26px 800 altın-2 tabular; "Sepete ekle" altın hap (telefon: tam genişlik, satır alta). İlk kartta "EN ÇOK ALINAN" etiketi (11px .16em altın çerçeve). Sıra ve içerik: `static-products.ts`'deki 6 varyant; her kart **tek varyant** (Doğal Kırma 10 kg ve 1 kg ayrı kartlar, provadaki gibi). Stok 0 ise düğme "Mevcut değil" disabled (opacity kuralı 118'deki gibi).
4. **Sepet**: `cart.store.addItem(variantId,1)`; eklenince düğme 2,4 s "Eklendi ✓" ve mevcut `MiniCart` sayacı güncellenir; drawer **açılmaz** (mevcut davranış). Hata → kart altında `role=alert`.
5. **Reveal**: `whileInView` y 26px, opacity, 0.8 s, stagger 80 ms (6 kart d1..d5), `once`, reduced-motion'da yok.
6. **QuickView** (`components/catalog/QuickView.tsx`) ve `RollingPrice`, `VariantChips` kullanılmıyorsa kaldır; kullanılıyorsa koyu tokenlarla okunur yap. `AddToCart.tsx` yeniden kullanılabilir.
7. **Testler**: `tests/unit/pantry-family.test.tsx` → `products-grid.test.tsx` (6 kart, etiket yalnız ilkinde, fiyatlar, stok-0 disabled, sepete ekleme sayacı, kategori çipi), `v3-foundation.test.tsx` güven şeridi 4 madde. E2E `pantry-v3.spec.ts` → `products-v4.spec.ts` (Claude çalıştırır).

## Kabul kriterleri
- [ ] 6 kart, 3×2 masaüstü / 2 kolon telefon; "En çok alınan" yalnız ilk kartta (unit).
- [ ] Her kart gerçek varyantı sepete ekler; sayaç artar (unit + e2e).
- [ ] Güven şeridi 4 madde, 15–16px, kontrast ≥ 4.5:1 (unit metin; Claude ölçer).
- [ ] Kart görselleri kademeli yükseklik; kategori çipi 3 farklı; hover sahne görseli (Claude görsel kontrol).
- [ ] 390px'te kart içinde yatay taşma yok; düğmeler ≥ 44px (Claude).
- [ ] `Pantry*`, `KraftTag`, kiler duvarı/raf görselleri runtime'dan çıkmış; `check-v3-assets` kullanılmayan varlık için **kırmızı vermiyor** (gerekirse script'in listesi güncellenir, manifest dosyaları silinmez).
- [ ] `npm test`, lint, typecheck, build yeşil.

## Yapılmaması gerekenler
- Fiyat/stok uydurma; yeni görsel üretme.
- Çekmeceyi otomatik açma; upsell/kupon mantığına dokunma.
- `docs/` değiştirme (yalnız Coder Notu/Durum).

## Coder Notu

- `Products` + `ProductCard` ile altı bağımsız varyant eklendi. Onaylı D provası sırası, mevcut `imageKey` slotlarının 01–06 sıralamasıyla korunur: 10 kg kırma, 1 kg kırma, siyah zeytin, 1 L yağ, 5 L yağ, 5 kg salamura. Fiyat/stok/SKU kaynağı aynen `static-products.ts`; provadaki farklı 5 L fiyatı kopyalanmadı.
- Kategori çipleri, kategoriye göre parıltı, onaylı sahnenin hover'da %18 görünmesi, 280/240/230/200px ambalaj yükseklikleri ve telefondaki orantılı karşılıkları uygulandı. Izgara telefonda iki, 768px ve üzerinde üç kolon; mobil CTA tam genişlik ve en az 44px yüksekliğinde. Satırdaki fiyat ve düğme, orta genişliklerde taşmayı önlemek için alt alta kalır.
- `Pantry`, `PantryFamily`, `KraftTag`, `QuickView`, `RollingPrice`, `VariantChips` ve raf/kiler CSS'i kaldırıldı. Onay manifestleri ve arşiv görselleri korundu; `check-v3-assets` değişmeden geçti. Footer bu görevin kapsamında olmadığından mevcut `/#kiler` bağlantısı yeni bölümün iç sarmalayıcısında uyumluluk hedefi olarak korunur.
- `AddToCart`, gerçek `cart.store.addItem(variantId, 1)` çağrısıyla mevcut `MiniCart` sayacını günceller; drawer açmaz. Senkron yerel işlem doğrudan sonuç verir; başarı 2400ms sürer, stok hatası kart altında `role=alert` ile gösterilir. Stoksuz/SSR düğmeleri solmaz (`opacity: 1`).
- Güven şeridi dört madde, 15–16px/500, 1.4 satır yüksekliği, 20px dikey boşluk ve telefonda 2×2 düzen kullanır. Kaynak renkleri `#D9DED3` / `#1F3324` için komutla hesaplanan kontrast **9.85:1**; tarayıcıdaki ölçümü Claude doğrulayacak.
- 21st MCP'de `product grid dark` araması üç kez ve ayrıca `get_inspiration` ile denendi; bileşen kaynağı alınamadı. AGENTS.md'deki erişim yoksa Coder Notu'na yazma kuralı uygulandı; onaylı D HTML'i, mevcut proje bileşenleri ve token'ları esas alındı. Yeni shadcn bileşeni/bağımlılığı gerekmedi; mevcut MiniCart/Button/Dialog akışı kullanıldı.

| Skill / araç | Nerede kullanıldı |
| --- | --- |
| `ui-ux-pro-max` | Skill ve §5 Layout & Responsive okundu; `trust-authority-conversion` landing verisi arandı. Güven şeridi → açık fiyat → sepete ekleme sırası, mobil-first kırılımlar, sarılan çipler ve 44px CTA. |
| `frontend-design` | Onaylı D düzeni, Fraunces/Figtree, koyu zeytin/süt/altın token'ları ve gerçek ambalaj oranları. |
| `motion-framer` | `motion/react` ile yalnız görünüm alanına girişte çalışan kart reveal'i. |
| `shadcn-ui` | Bileşen seçimi/token uyarlama rehberi yüklendi; mevcut sepet UI primitive'leri korundu, yeni CLI kurulumu gerekmedi. |
| `better-layout` | `minmax(0, 1fr)`, `min-width: 0`, mantıksal boşluklar, sarılan meta ve fiyat/CTA düzeni. |
| `frontend-patterns` | Sunucu `Products` / istemci `ProductCard` sınırı; görsel verileri sunucudan prop olarak geçer. |
| `tdd-workflow` | Önce eksik ızgara ve dördüncü güven maddesi için RED, ardından GREEN; ara commit yayımlanmadı ve sonuç commit'ine birleştirildi. |
| `motion-foundations`, `motion-patterns`, `motion-advanced` | Ortak motion token'ları; 26px/0.8s/80ms/once; SSR görünür varsayılan; reduced-motion ve timer temizliği. |
| `impeccable` | `context`, `craft-floor`, `layout` okundu; kaynak üzerinden hiyerarşi/boşluk değerlendirmesi ve `detect --json --scope layout` sonucu `[]`. Context'in kök DESIGN.md beklentisi yerine görevin verdiği `docs/DESIGN.md` okundu; proje dokümanları/konfigürasyonu değiştirilmedi. |
| `landing-page-design` | Satın alma öncesi güven bilgileri, varyantın yanında gerçek katalog fiyatı ve tek kart eylemi. |
| 21st MCP | Yukarıdaki aramalar yapıldı; kaynak alınamadığı için onaylı prova ve proje token'ları kullanıldı. |

Doğrulama:

- RED: yeni `Products` henüz yokken ızgara testleri ve dördüncü güven maddesi başarısız oldu (`.task-119-red.log`, yerel/ignore).
- GREEN: görevle doğrudan ilgili üç dosyada **24 test geçti**; `products-grid.test.tsx` altı kartı, ilk kart rozetini, fiyat/kategori/boyları, stok-0 engelini, beş satın alınabilir SKU'yu, gerçek MiniCart sayacını, hatayı, 2400ms süresini, SSR ve reduced-motion içeriğini doğrular.
- `npm test`: **27 dosya / 314 test geçti**.
- `npm test -- --coverage`: mevcut `app/**` kapsam ayarında tüm %80 eşikleri geçti; statements %82.85, branches %86.11, functions %88.88, lines %88.13.
- `npm run lint`, `npm run typecheck`, `npm run build`: **geçti**. Build öncesi asset kontrolleri: **18 görsel + 98 v3 çıktı geçti**; runtime'da eski Pantry/KraftTag/QuickView/raf/kiler görsel referansı kalmadığı kaynak taramasıyla doğrulandı. `git diff --check`: temiz.
- `pantry-v3.spec.ts` yerine `products-v4.spec.ts` yazıldı; etkilenen sepet/sahne e2e seçicileri ve fixture import'u güncellendi. **Çalıştırılmadı.** 320/375/390/430/768/1024/1440px taşma, 3×2/2 kolon yerleşim, 44px hedefler, hover sahnesi, kademeli ambalaj görünümü, gerçek kontrast ve e2e sayaç kabulünü **Claude doğrulayacak**. Playwright, Lighthouse, inspect veya ekran görüntüsü çalıştırılmadı.
- 120–122 görev dosyalarındaki önceden mevcut kullanıcı değişiklikleri korunur ve bu commit'e alınmaz. Canlı tarayıcı kabulü bu görevin komut doğrulaması kapsamında değildir.

## Durum: TAMAMLANDI
