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

## Coder Notu

22 Ekim 2026 — uygulama ve tarayıcı dışındaki kabul kontrolleri tamamlandı.

- Yalnız `@media (max-height: 700px) and (max-width: 767px)` içinde sıkı düzen uygulanır: açıklama gizlenir, başlık/kapat alanı en az 44px kalır; alan ve iletişim kanalı aralıkları 12px, etiket aralığı 4px, giriş alanları 44px olur. E-posta ve Telefon tek kolonda kalır.
- Mesaj kutusu 24px satır yüksekliği, 16px toplam padding ve 2px kenarlıkla iki satırda 66px, en çok dört satırda 114px olur. Mevcut otomatik büyüme kodu bu CSS sınırlarını kullanır; viewport değiştiğinde ve metin kısaldığında yeniden ölçülür.
- Kısa ekranda etiket satır yüksekliği ve başlık/eylem alanı boşlukları azaltıldı. Gönder düğmesinin mevcut padding'i de küçültülerek gerçek 44px dokunma hedefi korundu; alt safe-area korunur. KVKK kutusu ve bağlantısının 44px hedefleri, kayan alanın dışında kalan yapışık gönderim çubuğu ve DOM sırası korunur.
- Büyük telefon ve masaüstü kuralları değişmedi. Gönderim/doğrulama kodu ve metinler değiştirilmedi. Task 124 unit testleri aynen korundu; 124 E2E dosyasında yalnız kısa telefonun alan yüksekliği beklentisi yeni 44px şartına uyarlandı, diğer ekranlarda 48px kontrolü sürer.

### Skill / nerede kullanıldı

| Skill / araç | Nerede kullanıldı |
| --- | --- |
| `ui-ux-pro-max` | Yerel SKILL.md ve §5 Layout & Responsive yüklendi; `compact form mobile viewport --domain ux` araması, görünür viewport, içerik önceliği ve alt sabit alana yer ayırma kuralları uygulandı. Next.js stack araması da yapıldı; görev dışındaki sunucu işlem önerileri uygulanmadı. |
| `better-layout` | Başlık/alan/eylem alanı boşlukları, aynı hizada tek kolon, 568px görünür yükseklik ve KVKK'nın alt çubuk üstünde kalması için kısa ekran yerleşimi. |
| `frontend-design` | Onaylı sinematik sofra tasarımındaki Fraunces/Figtree, ink/süt/altın tokenları ve başlık hiyerarşisi korundu. |
| `tdd-workflow` | CSS ve otomatik büyüme için önce RED, sonra GREEN; kanıtlar aşağıda. |
| 21st MCP | `responsive compact contact form dialog`, `contact form`, `lead form` aramaları yapıldı; yeni bileşen alınmadı. Task 124'ün mevcut 35258 Contact Form uyarlaması üzerinde CSS düzeltmesi yapıldı. |
| Next.js yerel belgeleri | `node_modules/next/dist/docs/` içindeki CSS Modules ve Server/Client Components kılavuzları okundu; mevcut istemci bileşeni sınırı korundu. |
| `responsiveness-check` | Tarayıcı kabulü kapsamında Claude doğrulayacak. |

### TDD ve komut kanıtı

- İlk RED: `npm test -- tests/unit/wholesale-form-128.test.tsx` → 4 FAIL / 1 PASS; kısa ekran aralıkları, mesaj üst sınırı ve sıkı başlık/eylem alanı kuralları eksikti.
- Ek RED: aynı komut → 1 FAIL / 4 PASS; Gönder düğmesinin varsayılan padding'ini azaltan kural eksikti.
- GREEN: `npm test -- tests/unit/wholesale-form-128.test.tsx tests/unit/wholesale-form-124.test.tsx tests/unit/wholesale-form-ui.test.tsx tests/unit/wholesale-form.test.ts` → 4 dosya, 48 test PASS. CSS sınırları, iki/dört satır yüksekliği, uzun metnin korunması, viewport değişiminde büyüme/küçülme ve mevcut form davranışları doğrulandı.
- RED/GREEN checkpoint'leri yalnız yerelde tutuldu; push için tek final commit'te birleştirildi. Kırmızı/ara commit push edilmedi.

| Komut | Sonuç |
| --- | --- |
| `npm test` | PASS — 36 dosya, 399 test; atlanan test yok. |
| `npm run lint` | PASS — sıfır uyarı. |
| `npm run typecheck` | PASS — E2E dosyaları dahil. |
| `npm run build` | PASS — production build, 16 sayfa; ön build kontrollerinde 18 görsel + 112 v3 çıktı PASS. |
| `git diff --check` | PASS. |

### Claude doğrulayacak

`tests/e2e/wholesale-form-128.spec.ts` yazıldı, çalıştırılmadı. 375×667, 360×640 ve SE'nin raporlanan 568px kullanılabilir yüksekliği için 375×568; normal/reduced-motion toplam altı senaryo içerir. Açılışta ilk alan, KVKK etiketinin tamamı, kutu, KVKK bağlantısı ve Gönder viewport içinde; KVKK bağlantısı eylem çubuğunun üstünde; iç kaydırma sıfır; dokunma hedefleri en az 44px; E-posta/Telefon alt alta; mesaj kutusu iki/dört satır sınırında kontrol edilir.

AGENTS.md gereği Playwright, Lighthouse, inspect veya ekran görüntüsü çalıştırılmadı. Gerçek telefon/klavye davranışı, tarayıcıda kaydırmasız sığma, örtüşmeme ve büyük ekran görsel regresyon kabulünü **Claude doğrulayacak**. Unit/CSS kontrolleri gerçek tarayıcı geometrisi kanıtı değildir. Tarayıcı kabulü dışında açık uygulama/komut engeli yok.

## Durum: TAMAMLANDI
