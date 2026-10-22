# Task 119: v4 — güven şeridi + ürün ızgarası (6 kart) + sepet bağlantısı

## Tür
frontend

## Amaç
Prova D'nin 2. ve 3. bölümü: hero altındaki güven şeridi ve koyu zeminde 6 ürün kartı. Mevcut `Pantry` / `PantryFamily` / `KraftTag` / raf-kiler kurgusu **kaldırılır**, yerine v4 ızgarası gelir. Sözleşme: `docs/DESIGN.md` (v4), prova `d.html` (`.strip`, `.urunler`, `.p`), kareler `mock-d-masa-02..03.png`, `mock-d-tel-02..03.png`.

Claude denetim notu (prova üstüne düzeltmeler, uygula):
- **Güven şeridi provada çok ince ve okunmuyordu:** metin 15–16px 500, renk `#D9DED3` üzerinde ≥ 4.5:1, satır yüksekliği 1.4, dikey iç boşluk 20px; telefonda 2×2 ızgara (alt alta tek kolon değil).
- **Kartlar birbirine benziyordu (4 teneke):** her kartın ambalajı gerçek boyut oranında görünsün (10 kg teneke > 5 L teneke > 5 kg teneke > kavanoz/şişe; görsel yüksekliği 280 / 240 / 230 / 200px gibi kademeli), kategori çipi (Sofralık · Salamura · Zeytinyağı) ve kategoriye göre kartın radyal parıltı rengi hafif farklı (zeytin yeşili / altın / zeytinyağı sarısı `#E6CB97`), böylece aynı kalıp hissi kırılır. Hover'da kartın arka planına o ürünün **sahne** görseli (`v3Image("0N-…-sahne")`) %18 opaklıkla belirir.

## Kullanılacak araçlar
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

## Durum: BEKLİYOR
