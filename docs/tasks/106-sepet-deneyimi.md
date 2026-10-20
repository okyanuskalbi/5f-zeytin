# Task 106: Sepet çekmecesi, mini sepet, upsell

## Tür
frontend

## Amaç
Sağ çekmece (mobil alt sayfa), layout/AnimatePresence satır animasyonları, upsell, mobil mini sepet çubuğu.

## Bağlam
ZEYTİN v2 — **önce `docs/DESIGN.md` (tamamı; v2 "Topraktan sofraya") okunur**; v1 (`DESIGN-v1-etiket.md`) bileşenleri (etiket kartı, koçan, fişler, fırfırlı footer) kaldırılır/dönüştürülür. Korunanlar DEĞİŞMEZ. Kullanıcı (20 Eki): "ZEYTİN SİTESİNİ HİÇ BEĞENMEDİM BAŞTAN YAP" + "21.DEV VE FRAMER MOTION UX/UI SKİLLERİ İLE EN İYİ SEÇENEKLERİ YAP".

## Kullanılacak araçlar
- ECC skill: frontend-patterns, motion-patterns, motion-advanced, accessibility, design-system, verification-loop; skill `motion-framer`, `profesyonel-web-sitesi`, `ui-ux-pro-max` (e-ticaret UX)
- 21st MCP: evet — Drawer 23558 / 31360 (uyarla)

## Adımlar
1. Çekmece: sağdan (masaüstü 440px), mobilde alttan sayfa (snap 60%/95%, sürükle-kapat), odak tuzağı, ESC, scroll kilidi; satırlar `layout` + `AnimatePresence` (ekle/sil/adet); upsell (039) çekmecede; toplam, 'Ödemeye geç' (PayTR önizleme/checkout akışına).
2. Mini sepet: mobilde ilk eklemeden sonra altta sabit çubuk (adet · toplam · 'Sepet'), güvenli alan, footer görünürken içerik üstüne binmez.
3. Sepet sayfası (096) v2 diline uyarlanır.

## Kabul kriterleri
- [ ] e2e: ekle/sil/adet animasyonları sonrası toplam doğru; çekmece klavye/odak; mini sepet görünürlük kuralları; Firefox 320 odak testi geçer
- [ ] `lint.mjs app components` 0 FAIL; production (`next build && next start -p 3104`) `inspect.mjs` bu bölüm için FAIL 0; 1440/768/390 + iPhone 14 (WebKit) + Pixel 7 ekran görüntüleri `test-results/106/`
- [ ] lint/typecheck/build; ilgili e2e (reduced-motion + mobil); sepet/PayTR önizleme/toptan form testleri bozulmaz

## Coder Notu

21 Ekim 2026. Task 106'nın frontend kapsamı tamamlandı. PLAN, DESIGN v2 ve yerel Next 16.4.2 CSS / Server-Client Components rehberleri okundu. ECC frontend-patterns, motion-foundations/patterns/advanced, accessibility, design-system, verification-loop ve TDD; motion-framer, profesyonel-web-sitesi ve ui-ux-pro-max kullanıldı. UI/UX aramasındaki sürüklemeye düğme alternatifi kuralı uygulandı. Yeni paket/skill kurulmadı.

### Uygulama

- 21st MCP üzerinden **23558 (ddoemonn)** ve **31360 (wensity)** kaynakları alındı. Mevcut Radix Dialog altyapısı korundu; yeni Base UI/shadcn bağımlılığı eklenmedi. Marka kararı: #243A29 zeytin, #F6F1E6 krem, #EDE4D1 kum ve #D4B483 altın; Fraunces/Figtree ve 8px boşluk ölçeği.
- Drawer masaüstünde **440px sağ panel**, 768px altındaysa alt panel. %60/%95 snap; kısa ekranlarda CTA'ları koruyan `min(440px, 95dvh)` alt sınır. Handle ile sürükle, genişlet/daralt düğmesi, ESC, dışarı tıklama, odak tuzağı/iadesi ve scroll kilidi doğrulandı. Snap değişimi boyut tween'i kullanmaz; hareketler transform/opacity ile, reduced-motion'da anlık çalışır.
- Ekle/sil satırları `AnimatePresence` + `layout="position"`; adet değişimi ayrı presence animasyonu. Çıkış yapan satır/panel `inert` ve `aria-hidden` olur; satır başlığı kimlikleri SKU'ya bağlıdır. Silme ve kaybolan upsell sonrasında odak kapatma düğmesine taşınır.
- 039 Upsell drawer'a bağlandı; provider onaylı ilişki yapılandırmasını alabilir. Yapılandırma yoksa öneri/indirim uydurulmaz. Öneri ekleme, toplam, persistence, stok sınırı ve güvenli odak hem unit hem e2e ile doğrulandı.
- Mobil mini sepet ilk eklemeden veya kayıtlı sepetin yüklenmesinden sonra adet/tahmini toplam/Sepet gösterir. Drawer açıkken, sepet/ödeme rotalarında ve footer görünürken gizlenir; footer geldiğinde çıkış anlıktır. Güvenli alan ve altta rezerv alan vardır. Drawer açan mini sepet düğmesi DOM'da korunarak Safari'de odak iadesi sağlanır.
- Sepet sayfası ve upsell v2 krem/kum düzenine taşındı; fiş/altın şerit dili kaldırıldı. Kısa masaüstü ekranda ödeme düğmesini erişilmez yapan sticky özet kullanılmaz. Store, katalog, ürünler, ödeme sunucusu ve toptan form kodu değiştirilmedi.
- Önceden drawer'ın `/odeme` bağlantısı bulunmayan bir rotaya gidiyordu. Sunucu layout'u mevcut `isPaymentPreviewEnabled()` kapısına göre geliştirmede `/odeme-onizleme` verir; drawer ve sepet sayfası bu girişe bağlanır. Production'da ödeme düğmesi açıklamasıyla kapalıdır; önizleme sayfaları/token endpoint'i production'da kapalı kalır. Yerel önizleme örnek test siparişidir, sepetten gerçek tahsilat değildir. Gerçek checkout/ödeme onay kapıları bu görevle açılmadı.

### Komutla doğrulama

Kanıtlar `test-results/106/` altında yereldir ve mevcut gitignore gereği commit dışındadır. Cihazlar tarayıcı emülasyonudur.

| Kontrol | Sonuç / kanıt |
|---|---|
| TDD RED | `npm test -- tests/unit/cart-experience.test.tsx`: eksik drawer upsell için **1 beklenen FAIL / 1 PASS**, `red.log`; checkpoint `29b703e`. Eksik checkout kapısı ayrıca `red-checkout.log` ile gösterildi. |
| TDD GREEN | Aynı hedef son durumda **3/3 PASS**, `green.log`; uygulama checkpoint'i `c3154ae`, ardından erişilebilir çıkış düzenlemesi. |
| Unit + coverage | `npm test -- --coverage`: **20 dosya, 263/263 PASS**. Statement %87,50, branch %92,30, function %92,85, line %91,83; global eşikler PASS (`unit-coverage.log`). |
| Lint / tip / build | `npm run lint`, `npm run typecheck`, `npm run build`: **PASS** (`lint.log`, `typecheck.log`, `build.log`); varlık/hash/onay kapısı **18/18 PASS**. |
| Son sepet kabulü | **114 PASS / 6 koşullu SKIP**, 0 FAIL (`cart-final.log`). Chromium 1440/768/390, Firefox 320, WebKit iPhone 14; Pixel 7 gerçek touch olaylarıyla sürükle. Skip'ler masaüstünde mobil snap ve Pixel testinin diğer projelerde tekrar edilmemesi içindir. |
| Entegrasyon regresyonu | Sepet/drawer/sayfa/upsell + PayTR önizleme + toptan form: **135/135 PASS**, Chromium 1440, Firefox 320, iPhone 14 (`regression-final.log`). Anahtarsız dev uyarısı, mock iframe/resizer, ödeme URL'sinin teyit olmaması ve yeni sepet → yerel önizleme girişi dahil. Son animasyon erişilebilirliği düzenlemesinden sonra sepet grubu yukarıdaki 114 testle yeniden doğrulandı. |
| Tasteskill kaynak kapısı | `node ~/.claude/skills/design-taste-frontend/scripts/lint.mjs app components`: **0 FAIL / 2 WARN** (`taste-lint.log`). Mevcut demo `h-screen` ve genel uzun tireler. |
| Production inspect | Standart araçla `/sepet`: **0 FAIL / 3 WARN** (`inspect-cart-final/`). Dolu sepetle aynı kurallar: **0 FAIL / 3 WARN** (`inspect-cart-filled/`). Aktif drawer kapsamında **0 FAIL / 2 WARN** (`inspect-drawer-scoped/`). |
| Görsel/etkileşim | 1440/768/390 + iPhone 14 + Pixel 7; dolu/boş sepet, drawer, genişletilmiş panel, mini sepet, footer, focus/active PNG'leri. `capture.log`, `style-audit.json`; beş ekranın hiçbirinde drawer yatay taşması yok. Görüntüler açılıp incelendi. |
| Diff / sır / debug | `git diff --check`: PASS. Eklenen satırlarda özel anahtar, gerçek token biçimi, debug log veya env değişikliği **0** (`security-audit.json`). |

Tekrarlanabilir ana komutlar:

```sh
PLAYWRIGHT_PORT=3114 npx playwright test tests/e2e/cart-wire.spec.ts tests/e2e/cart-drawer.spec.ts tests/e2e/cart-page.spec.ts tests/e2e/cart-experience.spec.ts --project=chromium-1440 --project=chromium-768 --project=chromium-390 --project=firefox-320 --project=webkit-iphone14 --output=test-results/106/cart-final --reporter=list
PLAYWRIGHT_PORT=3114 FRAME_SEQUENCE_DEV_URL=http://localhost:3004 npx playwright test tests/e2e/cart-wire.spec.ts tests/e2e/cart-drawer.spec.ts tests/e2e/cart-page.spec.ts tests/e2e/upsell.spec.ts tests/e2e/payment-preview.spec.ts tests/e2e/wholesale-form.spec.ts --project=chromium-1440 --project=firefox-320 --project=webkit-iphone14 --output=test-results/106/regression-final --reporter=list
npx next start -H 127.0.0.1 -p 3104
node ~/.claude/skills/design-taste-frontend/scripts/inspect.mjs http://127.0.0.1:3104/sepet --allow few-pictures,focal-point,still-page --out test-results/106/inspect-cart-final
node test-results/106/inspect-cart-filled.mjs http://127.0.0.1:3104/sepet --allow few-pictures,focal-point,still-page --out test-results/106/inspect-cart-filled
node test-results/106/inspect-drawer-scoped.mjs http://127.0.0.1:3104/sepet --allow few-pictures,focal-point,still-page --out test-results/106/inspect-drawer-scoped
```

İlk sandbox tarayıcı başlatmaları işletim sistemi tarafından engellendi; izinli yerel tarayıcı süreçlerinde tekrar çalıştırıldı. 3004 geliştirme sunucusunun bu checkout'a ait olduğu doğrulandı ve kullanıcı süreci kapatılmadı. 3104/3114 yerel production build'i kullandı.

### Inspect kapsamı ve global kapı 107

- İç sayfa `--allow few-pictures,focal-point,still-page` istisnası DESIGN.md'de açıkça verilmiştir. Krem palet, ikincil metin ve video yokluğu WARN olarak korundu.
- Etkileşim harness'i, üretim arayüzünde test sepetini yükler ve drawer'ı açar. Ham tüm-sayfa ölçümü **1 `covered-text` FAIL** verdi: modalın arkasındaki **“Sepet özeti”** başlığı. Ham rapor `inspect-drawer/report.json` içinde korunur. Bileşen kapsamlı harness, aynı probe/frame ölçümlerini `[data-cart-drawer]` içindeki öğelere uygular; ekranı/uygulamayı veya kural eşiklerini değiştirmez, yeni `--allow` eklemez. Arka sayfa ayrıca standart araçla bağımsız denetlenmiştir. Bu, modalın bilerek örttüğü arka sayfayı drawer içeriğindeki bir çakışma saymamak içindir.
- Standart kök URL inspect'i **1 FAIL / 4 WARN**: `few-pictures` (iki mevcut görsel; ürün görselleri için onay yok). Ham rapor `inspect-home/report.json`. Bu, Task 106 sepet bileşeni dışındaki global görsel kabulüdür; onaysız medya eklenmedi. AGENTS.md ara görev kuralı gereği global kapı **107**'ye kaydedildi, gizlenmedi.

### Profesyonel web sitesi kanıtı

| Kontrol | Nerede / ölçüm | Sonuç |
|---|---|---|
| Ana / nötr / vurgu | `1440-cart-filled.png`, `pixel7-mini.png`, `style-audit.json` | Zeytin #243A29, krem #F6F1E6, kum #EDE4D1; mini eylemde altın |
| Başlık + gövde fontu | `1440-drawer-final.png`, `iphone14-expanded.png` | Korunan Fraunces / Figtree |
| 8px boşluk ölçeği | Sayfa/özet/drawer ölçümleri | 8/16/24/32/48/96px; 44px dokunma hedefi istisnası |
| h1/h2/h3 hiyerarşisi | `1440-cart-filled.png`, drawer başlıkları | Sayfa başlığı → bölüm/ürün → gövde; mobil başlıklar okunur |
| Kırık simetri | `1440-cart-filled.png` | İçerik ve özet kolonları 1:0,65; üstte başlık/metin ayrımı |
| Hover/focus/active, üç kontrol | `{quantity,refresh,close}-{focus,active}.png` | 2px zeytin odak halkası; adet 44×44, yenileme 459×54px; reduced-motion anlık |
| Marka kenarlığı / gölge | Kupon işlevsel alanı, odak ve panel yüzeyleri | Zeytin kaynaklı odak; dekoratif çerçeve/durağan gölge yok |
| Tek ikon ailesi | Drawer/sayfa kontrolleri | Lucide |
| Kontrast ≥4,5:1 | `style-audit.json`, token çiftlerinden hesap | Zeytin/krem 10,89:1; gövde/krem 16,90:1; ikincil/kum 4,82:1; toprak/altın 9,66:1 |
| Yasak liste | Lint ve açılan ekranlar | Mor degrade, emoji, blur/glass yığını, stok 3D, onaysız medya yok |

## Durum: TAMAMLANDI
