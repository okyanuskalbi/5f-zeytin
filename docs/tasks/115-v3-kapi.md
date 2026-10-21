# Task 115: v3 kapı (Impeccable critique/audit, performans, mobil)

## Tür
frontend

## Amaç
v3'ü kullanıcıya göstermeden önce bağımsız kalite kapısından geçirmek.

## Bağlam
- Bağımlılık: 111–114 TAMAMLANDI.
- Kullanıcı iki sürümü reddetti. Bu kapı, kullanıcının "berbat" diyebileceği her şeyi önceden yakalamak içindir.

## Kullanılacak araçlar
- Skill:
  - `impeccable` (`critique`, `audit`, `polish`; finish reviewer ve documenter);
  - `audit-ai-design-slop`, `web-design-guidelines`, `review-animations`, `interface-review`, `design-taste-frontend` (inspect + critique);
  - `web-perf`.
- ECC: verification-loop, e2e-testing, accessibility.

## Adımlar
1. **Impeccable critique** (`.claude/skills/impeccable/reference/critique.md`, iki bağımsız değerlendirme):
   - Hedef: Nielsen ≥ 28/36 (7 ve 10 n/a). P0 ve P1 sorun kalmayacak.
   - Rapor: `docs/kabul/115-critique.md`.
2. **Impeccable audit:** a11y, performans, responsive. `audit-ai-design-slop` ile slop taraması.
3. **Düzeltme:** Bulunan P0/P1 sorunları düzelt, en fazla 2 tur. Sonra Impeccable documenter ile `docs/DESIGN.md`'yi kurulan dünyadan güncelle; karar geçmişini koru.
4. **Ölçümler:**
   - **Performans:** Lighthouse mobil ve masaüstü, production, 3'er ölçüm.
   - **Kaydırma ve cihaz:**
     - Kare şeridi: 1440×900, 1280×800, iPhone 14, iPhone SE, Pixel 7, yatay mod.
     - Tekerlek ile alt-üst gidiş.
     - Reduced-motion.
   - **Sepet akışı:** hero ekle → kiler ekle → çekmece → sepet → ödeme önizleme.

## Kabul kriterleri
- [ ] Kapı eşikleri:
  - Critique toplamı ≥ 28/36, P0/P1 = 0.
  - Mobil Lighthouse medyanı ≥ 85, LCP < 2.5 s, CLS < 0.1, A11y ≥ 95.
  - inspect.mjs FAIL 0.
- [ ] Kare şeritlerinin hepsinde boş ekran ve kesik başlık yok. Claude'un denetimi için şeritler `test-results/115/` altında.
- [ ] Tüm e2e ve birim testler, build ve lint yeşil.
- [ ] `docs/kabul/115-ozet.md`: kullanıcıya gösterilecek 6 ekran görüntüsü (masaüstü 3, iPhone 3) ve kalan açık kararlar (fiyat, kargo, iletişim, gerçek ürün fotoğrafı).

## Yapılmaması gerekenler
- Yeni bölüm ya da özellik ekleme.
- Onaysız görsel kullanma.

## Durum: BEKLİYOR
