# Task 112: Sofra hero (taslak B, ölçülerek)

## Tür
frontend

## Amaç
İlk ekran onaylı taslak B'nin üst bölümü olacak: tam ekran sofra fotoğrafı, beyaz ince menü, "Düziçi'nden sofranıza." başlığı ve gerçekten çalışan altın "Sepete ekle — 10 kg · fiyat" butonu.

## Bağlam
- Bağımlılık: 111 TAMAMLANDI.
- Önce oku: `docs/DESIGN.md` v3 bölüm 1 ve `.impeccable/mocks/decision/mix-b.webp` (üst ~%32'si hero).
- **Comp-led:** Impeccable `build-phase` ile çalış.
  - `impeccable build-phase start --comp .impeccable/mocks/decision/mix-b.webp --artifact app/page.tsx`
  - Sonra `comp-spec --grid` ile hero bölgelerini ölç.
  - Görsel "plate" olarak 111'in hero dosyaları kullanılır; yeni görsel üretilmez.
- Taslaktaki metinler ve fiyat örnektir; fiyat katalogdan gelir.

## Kullanılacak araçlar
- Skill:
  - `impeccable` (context → build-phase comp-led → craft-floor);
  - `emil-design-eng`, `animate` (başlık girişi, buton geri bildirimi);
  - `motion-framer`, `better-typography`, `web-perf`.
- ECC: frontend-patterns, motion-foundations, motion-patterns, accessibility, e2e-testing.
- 21st MCP: menü/header için ara ("transparent navbar over hero", "sticky header shrink"). Token'lara uyarla.

## Adımlar
1. **Hero:**
   - `<picture>`: mobil dikey, masaüstü yatay; AVIF/WebP `srcset`, `fetchpriority=high`, preload.
   - Metin okunurluğu için sol tarafta düz bir perde: metin arkası ≥ 4.5:1 kontrast. Gradyan yerine yarı saydam düz katman tercih edilir; gerekiyorsa tek yönlü yumuşak perde.
2. **Metin ve düğmeler:**
   - Başlık "Düziçi'nden sofranıza." Fraunces, ≤ 2 satır. Alt satır "Doğal Kırma Yeşil Zeytin, kendi tesisimizde."
   - Altın "Sepete ekle — 10 kg · {fiyat}": sepete Doğal Kırma 10 kg ekler, rozet artar, mini bildirim çıkar. Çekmece kendiliğinden açılmaz.
   - İkincil buton "Ürünleri gör": `#kiler`'e yumuşak kaydırır.
3. **Menü:**
   - Hero üstünde beyaz ve şeffaf. Hero'dan çıkınca kiler yeşili zemine geçer (renk geçişi, tek eşik).
   - Yükseklik masaüstünde ≤ 72px, telefonda ≤ 60px.
   - Logo okunur olmalı; "ZEYTİN" alt yazısı 6px gibi okunmaz boyutta kalmasın.
4. **Hareket:**
   - Başlık kelime kelime belirir (stagger 60ms).
   - Fotoğraf scroll'a bağlı olarak 1.00 → 1.04 büyür.
   - Reduced-motion'da hareket yok.
   - LCP öğesi (hero görseli) animasyonsuz görünür.

## Kabul kriterleri
- [ ] `impeccable build-phase` hero kapısı geçer: comp ile ölçülen bölgeler ve ekran görüntüsü karşılaştırması `test-results/112/` altında.
- [ ] e2e:
  - Hero "Sepete ekle" sepete 10 kg varyantı ekler.
  - "Ürünleri gör" `#kiler`'e kaydırır.
  - Klavye ile her iki düğme erişilir.
  - Reduced-motion'da içerik tam görünür.
- [ ] 1440×900, 390×844 (iPhone 14 WebKit) ve Pixel 7'de ilk ekranda başlık + birincil düğme görünür; başlık ≤ 2 satır.
- [ ] Lighthouse mobil (production, 3 ölçüm medyanı): Performance ≥ 85, LCP < 2.5 s, CLS < 0.1.
- [ ] inspect.mjs hero için FAIL 0. `impeccable detect --json http://localhost:<port>` hero kaynaklı uyarıları Coder Notu'nda açıklanır.

## Yapılmaması gerekenler
- Kiler/vitrin bölümünü bu görevde yapma (113).
- Yeni görsel üretme.

## Durum: BEKLİYOR
