# Task 128: Toptan formu — küçük telefon ekranında tek ekrana sığsın

## Tür
frontend

## Amaç
Claude 124'ü canlıda test etti (`~/PROJELER/AFINA-KAYNAK/araclar/log/z-124/form-hepsi.jpg`, `form-iphoneSE.png`):
1366×768, 1440×900, iPhone 14, Pixel 7'de form tek ekranda. **iPhone SE (375×667, görünür yükseklik 568px)**'de KVKK onay satırı alttaki yapışık "Talebi gönder" çubuğunun altına yarım giriyor; görmek için iç alanı kaydırmak gerekiyor. 124'ün "SE'de başlıktan Gönder'e kadar her şey tek ekranda" kabulü karşılanmamış.

## Kullanılacak araçlar
- **Kullanıcı isteği (22 Eki):** `ui-ux-pro-max` (§5), `better-layout`, `frontend-design` fiilen yüklenir; Coder Notu'na "Skill / nerede kullanıldı" tablosu. `responsiveness-check` Claude'da.
- `tdd-workflow`.

## İstenen
- Görünür yükseklik ≤ 700px olan telefonlarda (`@media (max-height: 700px) and (max-width: 767px)`):
  - açıklama satırı 1 satıra iner ya da gizlenir (başlık kalır);
  - alan aralığı 12px, etiket–alan aralığı 4px;
  - alan yüksekliği 44px (dokunma hedefi korunur);
  - mesaj alanı 2 satır (`min-height` ≈ 64px), yazdıkça en çok 4 satıra büyür;
  - E-posta ve Telefon alt alta kalır.
- KVKK satırı ve "KVKK aydınlatma metni" linki, yapışık Gönder çubuğunun **üstünde** tam görünür.
- Daha büyük telefonlarda ve masaüstünde görünüm değişmez.

## Kabul kriterleri
- [ ] Unit/CSS: kısa ekran media query'si ve değerleri var.
- [ ] E2E (yaz, çalıştırma) `tests/e2e/wholesale-form-128.spec.ts`: 375×667 (iPhone SE) ve 360×640'ta açılış sonrası iç alan kaydırılmadan ilk alan, KVKK onay kutusu ve "Talebi gönder" aynı anda viewport içinde ve birbirinin üstüne binmiyor.
- [ ] `npm test`, lint, typecheck, build yeşil; 124 testleri korunur.

## Yapılmaması gerekenler
- Gönderim/doğrulama mantığı; metin değiştirme.
- `docs/` değiştirme (yalnız Coder Notu/Durum).

## Durum: BEKLİYOR
