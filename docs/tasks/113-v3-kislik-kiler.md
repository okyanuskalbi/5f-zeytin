# Task 113: Kışlık kiler vitrini (raf + kraft fiyat etiketi + hızlı görünüm)

## Tür
frontend

## Amaç
Taslak B'nin orta bölümü: yeşil kiler duvarında ceviz raflar.
- Ürünler HTML ile rafa oturur.
- Her ürünün sicimli kraft etiketi çalışan bir fiyat etiketidir: ad, boy, fiyat, Ekle.
- Ürüne dokununca hızlı görünüm açılır.

Sayfanın ana satış bölümü budur.

## Bağlam
- Bağımlılık: 111, 112 TAMAMLANDI.
- Oku: `docs/DESIGN.md` v3 bölüm 2 ve "Hareket"; `mix-b.webp` orta bölüm ("Kışlık kiler" başlığı + 2 raf).
- Katalog aile + varyant modeli 111'de kuruldu. En fazla 6 SKU. Admin'den gelecek ürün sayısı 4–6 olabilir; yerleşim otomatik olmalı.
- Comp-led: build-phase `sections` aşaması, aynı spec içinde.

## Kullanılacak araçlar
- Skill:
  - `impeccable` (craft-floor, `animate`, `polish`);
  - `emil-design-eng`, `animate`, `apple-design` (sicim sallanması, bottom sheet fiziği);
  - `break-ui` (uzun ürün adı, tükendi, tek varyant, 6 ürün, 4 ürün);
  - `better-ui`, `better-accessibility`, `motion-framer`.
- ECC: frontend-patterns, motion-patterns, motion-advanced, accessibility, e2e-testing.
- 21st MCP:
  - Hızlı görünüm için Drawer 23558 (sağ panel, odak tuzağı) ve 31360 (mobil alt sayfa, snap);
  - galeri için Thumbnail image viewer 37501;
  - "animated number / digit roll" ara.

  Hepsi token'lara uyarlanır.

## Adımlar
1. **Bölüm `#kiler`:**
   - Zemin `kiler-duvar` (cover, yavaş parallax yok; sabit).
   - Başlık "Kışlık kiler" iki yanında ince altın çizgiyle. Alt satır "Yıllık zeytin ve yağınızı tek seferde alın."
2. **Raflar:**
   - Raf görseli tam genişlik.
   - **Masaüstü (≥ 1024):** üst rafta 4 ürün, alt rafta kalanlar ve kargo kolisi.
   - **Tablet:** 3'lü.
   - **Telefon:** rafta 2 ürün.
   - Ürünlerin tabanı raf üst yüzeyine oturur; gölge yok, yalnız hafif temas gölgesi.
   - Ürün görselleri `loading=lazy` + sabit en-boy oranı (CLS 0).
3. **Kraft etiket bileşeni** (`components/catalog/KraftTag.tsx`):
   - Kraft doku + sicim (SVG çizgi + delik).
   - İçerik: ad (Fraunces), varyant çipleri (radiogroup, ok tuşları), fiyat (tabular; boy değişince rakam rakam döner), "Ekle" butonu.
   - Ekle davranışı: bas → yükleniyor → "Eklendi ✓" → sıfırla.
   - Tükendi durumu: buton pasif, "Tükendi".
   - Dokunma hedefleri ≥ 44px.
   - **Telefon:** etiket ürünün altında tam genişlik. **Masaüstü:** ürünün sağ üstüne asılı (taslaktaki gibi).
4. **Hızlı görünüm:**
   - Ürün görseline ya da etiketteki ada tıklayınca açılır. Masaüstünde sağ panel, telefonda alt sayfa (sürükle-kapat).
   - İçerik: galeri (stüdyo 4:5 + sahne 16:9), varyant, adet, Sepete ekle, kısa açıklama (resmi metinden), "Toptan teklif iste" (→ `#toptan`).
   - URL `?urun=<slug>` olur; geri tuşu paneli kapatır. ESC ve odak tuzağı çalışır.
5. **Sepet:**
   - Ekleme sonrası çekmece kendiliğinden açılmaz; mini bildirim + rozet zıplaması.
   - Çekmece ve sepet satırlarında ürün küçük görseli görünür.
   - Mobil çekmecede satır alt çubuk tarafından kesilmez (v2 hatası).
6. **İmza hareket:**
   - Bölüm görününce raflar sırayla dolar: ürün 12px yukarıdan "konur", spring, stagger 70ms.
   - Sonra etiket sicimden sallanıp durur (döndürme ≤ 4°, en fazla 2 salınım).
   - Reduced-motion'da hepsi yerinde, hareketsiz.

## Kabul kriterleri
- [ ] e2e (Chromium + WebKit + mobil):
  - Her varyant için fiyat değişir.
  - Ekle sepete doğru varyantı ekler.
  - Tükendi ürün eklenemez.
  - Hızlı görünüm aç/kapa çalışır: tıklama, ESC, geri tuşu, mobilde sürükle.
  - Klavye ile tüm etiket kontrolleri erişilir.
- [ ] `break-ui` durumları ekran görüntüsüyle `test-results/113/break/`: 4 ürün, 6 ürün, uzun ad, tek varyant, tükendi.
- [ ] Kaydırma kare şeridi (masaüstü/iPhone/Pixel, %40 adım) `test-results/113/filmstrip-*.jpg`:
  - kesik etiket yok;
  - raf ile ürün arasında boşluk ya da taşma yok;
  - boş ekran yok.
- [ ] Dokunma hedefleri ≥ 44px (Playwright ölçümü). Kontrast: kraft üstünde metin ≥ 4.5:1.
- [ ] Lighthouse mobil 3 ölçüm medyanı ≥ 85, CLS < 0.1. inspect.mjs FAIL 0.

## Yapılmaması gerekenler
- Ödeme ve DB'ye dokunma.
- Yeni görsel üretme.
- Fiyatları gerçek sanma; katalog örnek kalır.

## Durum: BEKLİYOR
