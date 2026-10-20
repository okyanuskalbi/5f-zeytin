# Task 105: Topraktan sofraya şeridi, SSS, footer

## Tür
frontend

## Amaç
Sürüklenen süreç şeridi (görsel tekrarı yok), teyitli SSS, toprak zeminli footer.

## Bağlam
ZEYTİN v2 — **önce `docs/DESIGN.md` (tamamı; v2 "Topraktan sofraya") okunur**; v1 (`DESIGN-v1-etiket.md`) bileşenleri (etiket kartı, koçan, fişler, fırfırlı footer) kaldırılır/dönüştürülür. Korunanlar DEĞİŞMEZ. Kullanıcı (20 Eki): "ZEYTİN SİTESİNİ HİÇ BEĞENMEDİM BAŞTAN YAP" + "21.DEV VE FRAMER MOTION UX/UI SKİLLERİ İLE EN İYİ SEÇENEKLERİ YAP".

## Kullanılacak araçlar
- ECC skill: frontend-patterns, motion-patterns, motion-advanced, accessibility, design-system, verification-loop; skill `motion-framer`, `profesyonel-web-sitesi`, `ui-ux-pro-max` (e-ticaret UX)
- 21st MCP: evet — ilham: drag carousel + progress

## Adımlar
1. Süreç: 6 adım, Framer Motion `drag='x'` + kaydırma + klavye, ilerleme çubuğu (düz dolgu); adım adı büyük Fraunces; metin yalnız resmi tek cümle; görseller onaylı süreç görselleri gelince (yoksa görselsiz, aynı görsel iki kez YOK).
2. SSS: teyitli sorular (087), iki kolon okuma metni.
3. Footer toprak zemin: logo (dark), slogan, linkler, satıcı satırı (unvan · Düziçi VD · VKN 0091520061), yasal linkler, küçük Topluluk logosu → https://afina.com.tr.

## Kabul kriterleri
- [ ] e2e: sürükleme/klavye/ilerleme; SSS teyitsiz soru yok; footer linkleri
- [ ] `lint.mjs app components` 0 FAIL; production (`next build && next start -p 3104`) `inspect.mjs` bu bölüm için FAIL 0; 1440/768/390 + iPhone 14 (WebKit) + Pixel 7 ekran görüntüleri `test-results/105/`
- [ ] lint/typecheck/build; ilgili e2e (reduced-motion + mobil); sepet/PayTR önizleme/toptan form testleri bozulmaz

## Coder Notu

### Uygulama

- PLAN, DESIGN v2'nin tamamı, AGENTS, resmi 04 içerik, `docs/teyit/surec.md` ve 087'nin teyitli/teyitsiz soru listeleri okundu. Başlangıçta `main` ve çalışma ağacı temizdi. Yalnız bu görevin süreç, SSS, footer kaynakları ve ilgili testleri değiştirildi.
- Marka yönü: zeytin mürekkep, krem okuma zemini, toprak footer ve altın etkileşimler; Fraunces/Figtree, mevcut beş boyut ve 8 px boşluk ölçeği korundu. Süreçte büyük adım adları; SSS'de masaüstü/tablette iki, telefonda tek okuma kolonu; footer'da geniş marka alanı ve daha dar adres/link alanı var.
- `Moments`: altı adım Hasat → Seçim → Kırma → Salamura → Dolum → Sofrada. `motion.ul drag="x"` ve `useDragControls` fare sürüklemesini gerçek native kaydırmaya bağlar; dokunma/kalem yatay ve dikey native pan davranışını korur. Oklar, Home/End, tekerlek, mobilde de görünen 48×48 düğmeler ve resize aynı konumu/ARIA ilerlemesini kullanır. Dolgu `scaleX` ile düz renktir. Tüm adımlar geniş ekrana sığdığında iki düğme de kapanır; daralınca yeniden açılır.
- Adım altı ek metinler kaldırıldı. Tek açıklama resmi “Zeytinin hikâyesi toprakta başlar, sofrada tamamlanır.” cümlesidir. Süreç görselleri kullanıcı onayı bekliyor; görevde açıkça izin verilen görselsiz şerit uygulandı. Yinelenen/onaysız görsel veya teyitsiz süreç iddiası yok.
- `Faq`: 087'nin Z01/Z05/Z06/Z07 seçimi ve resmi cevap parçaları aynen korundu. Z13–Z24 soruları/cevapları eklenmedi; accordion veya ikinci schema üreticisi yok. Soru/cevaplar aralık ve ağırlıkla ayrılıyor; tamamı SSR'de açık okunuyor.
- `Footer`: toprak zemin, ana sayfaya bağlı dark zeytin logosu, kısa slogan ve ikincil marka cümlesi, mevcut adres/keşif/yasal linkler, unvan · Düziçi VD · VKN 0091520061 korunuyor. Küçük Topluluk logosu masaüstünde 112, mobilde 88 px ve `https://afina.com.tr` bağlantılı. Safe-area alt boşluğu ve hover/focus/active durumları var. V1 süsleri yok.
- Skill'ler: frontend-patterns, motion-foundations/patterns/advanced, accessibility, design-system, verification-loop, tdd-workflow, motion-framer, profesyonel-web-sitesi, ui-ux-pro-max; tasarım kapısı için tasteskill kullanıldı. UI Pro Max `dragging movements --domain ux` araması sürüklemeye tek tıklamalı alternatif gereğini doğruladı. Yerel Next.js CSS/client sınırı rehberleri okundu. Ek skill/paket kurulmadı; mevcut özelleştirilmiş shadcn Button kullanıldı.
- 21st MCP araması ve **Progressive Carousel 6274**, **Framer Normal Carousel 19084** kaynakları alınıp incelendi. Kontrol/ilerleme örüntüleri proje tokenlarına ve native scroll erişimine uyarlandı; örnek görseller, autoplay ve varsayılan görsel stil taşınmadı.
- Mevcut bir kez giriş hareketi 24 px / 0,08 sn stagger; reduced-motion ve canlı tercih değişiminde giriş dönüşümü yok, kaydırma anlık. SSR, JS kapalı ve görsel hatasında metin/bağlantılar erişilir. Ürün, sepet, PayTR, toptan gönderim, DB/auth ve diğer dokümanlar değiştirilmedi.

### Komutla doğrulama

Kanıtlar `test-results/105/` altında yereldir; mevcut gitignore gereği commit dışında tutulur. Cihazlar tarayıcı emülasyonudur.

| Kontrol | Sonuç / kanıt |
| --- | --- |
| TDD RED → GREEN | `npm test -- tests/unit/moments.test.tsx tests/unit/faq-contact-footer.test.tsx`: önce **2 FAIL / 6 PASS**, eksik yalnız adım adları ve footer ana sayfa bağlantısı; uygulamadan sonra **8/8 PASS**. `red.log`, `green.log`; aktif main checkpoint'leri `9180026` → `e3352eb`. |
| Unit / coverage | `npm test -- --coverage`: **19 dosya, 260/260 PASS, exit 0**. Yapılandırılmış app kapsamı statement **%87,50**, branch **%95,83**, function **%92,85**, line **%91,83**. Bu oranlar bileşenlere veya e2e'ye atfedilmedi. `unit.log`. |
| ESLint / tip / build | `npm run lint`, `npm run typecheck`, `npm run build`: **exit 0**; uyarısız ESLint, üretim build'i, **18/18** varlık denetimi. Son test düzenlemelerinden sonra lint/typecheck tekrar **exit 0**. `eslint-final.log`, `typecheck-final.log`, `build.log`. |
| Tasteskill kaynak kapısı | `node ~/.claude/skills/design-taste-frontend/scripts/lint.mjs app components`: **0 FAIL / 2 WARN, exit 0**. Önceden var olan demo `h-screen` ve genel metinlerin uzun tireleri. `taste-lint.log`. |
| Production inspect | `next start -H 127.0.0.1 -p 3104` üzerinde aşağıdaki inspect komutu: **Task 105 bölümlerinde 0 FAIL**, 1440/768/390 konsol hatası 0; genel **1 FAIL / 4 WARN** aşağıda açıklandı. `inspect/report.json`, `inspect-scope.json`, `inspect.log`. |
| Bölüm e2e | Süreç + SSS/footer + v2 erişim/ekran testi: **64/64 PASS, 22,8 sn**, 1440/768/390 Chromium ve iPhone 14 WebKit. Sürükleme, klavye, düğmeler, gerçek ilerleme dolgusu, resize/taşmasız geniş ekran, reduced-motion/canlı tercih, native pan, JS kapalı, teyitsiz içerik yokluğu ve yasal sayfalara gerçek gezinme. `section-final.log`, `section-final.json`. |
| Pixel 7 | Chromium CDP'nin gerçek `touchStart/touchMove/touchEnd` olaylarıyla yatay swipe, dikey pan, düğmeye tap, klavye ve reduced-motion: **1/1 PASS, 2,2 sn**. `pixel-final.log`, `pixel-final.json`. Bu CDP testi Chromium'da çalıştırıldı; iPhone WebKit ayrı dört proje koşumunda doğrulandı. |
| Ticaret regresyonu | Sepet bağlantısı/drawer/sayfa/upsell, credential-free ve mock PayTR, toptan form/KVKK ve shell: **192/192 PASS, 46,1 sn**. Aynı dört proje; normal/reduced-motion/mobil kapsamı. `regression-final.log`, `regression-final.json`. |
| Toplam e2e / güvenlik | Seçili son koşumlar **257 PASS, 0 FAIL / 0 skipped / 0 flaky**; `acceptance.json` komutla doğrulandı. Değişen uygulama kaynaklarında anahtar/özel anahtar/debug log taraması 0 eşleşme; `security.json`. `git diff --check`: **exit 0**. |

```sh
node ~/.claude/skills/design-taste-frontend/scripts/inspect.mjs \
  http://127.0.0.1:3104 --out test-results/105/inspect

PLAYWRIGHT_BASE_URL=http://127.0.0.1:3104 npm run test:e2e -- \
  tests/e2e/moments.spec.ts tests/e2e/process-faq-footer.spec.ts \
  tests/e2e/faq-contact-footer.spec.ts --grep-invert 'Pixel 7' \
  --project=chromium-1440 --project=chromium-768 --project=chromium-390 \
  --project=webkit-iphone14 --output=test-results/105/section-final

PLAYWRIGHT_BASE_URL=http://127.0.0.1:3104 npm run test:e2e -- \
  tests/e2e/process-faq-footer.spec.ts --grep 'Pixel 7' \
  --project=chromium-1440 --output=test-results/105/pixel-final

FRAME_SEQUENCE_DEV_URL=http://localhost:3004 PLAYWRIGHT_PORT=3114 npm run test:e2e -- \
  tests/e2e/cart-wire.spec.ts tests/e2e/cart-drawer.spec.ts tests/e2e/cart-page.spec.ts \
  tests/e2e/upsell.spec.ts tests/e2e/payment-preview.spec.ts \
  tests/e2e/wholesale-form.spec.ts tests/e2e/shell.spec.ts \
  --project=chromium-1440 --project=chromium-768 --project=chromium-390 \
  --project=webkit-iphone14 --output=test-results/105/regression-final
```

İlk regresyon komutunda `PLAYWRIGHT_BASE_URL` kullanılması fixture güvenlik kapısını tetikledi: **32 FAIL / 68 çalışmadı / 92 PASS**. Koruma kaldırılmadı; değişken kaldırılıp Playwright'ın aynı checkout'un son production build'ini 3114'te başlatmasıyla son koşumun tamamı geçti. 3004 geliştirme sunucusunun cwd'si bu repo olarak doğrulandı; PayTR geliştirme testleri burada çalıştı. İlk Pixel test yapılandırmasındaki describe/device `defaultBrowserType` çakışması düzeltilip test yeniden çalıştırıldı. İlk Chrome inspector sandbox başlatma hatası izinli süreç erişimiyle giderildi; başarısız başlatmalar kabul kanıtı sayılmadı.

### Ekran ve tasarım kanıtı

`chromium-{1440,768,390}-{process,faq,footer}.png`, `webkit-iphone14-*.png`, `pixel7-reduced-*.png`, viewport/son satır görüntüleri ve üç footer bileşeninin focus/hover/active görüntüleri üretildi ve açılarak incelendi. Uzun mobil bölümlerin alt satırı/Topluluk logosu ayrıca tam görünürlük assertion'ı ve `*-end.png` ile doğrulandı.

| Kontrol | Nerede / gerçek ölçüm | Sonuç |
| --- | --- | --- |
| Ana / nötr / vurgu | `*-audit.json`, süreç/SSS krem-zeytin; footer `rgb(13,17,13)`, fildişi, altın etkileşim | PASS |
| Başlık + gövde | Computed Fraunces + Figtree | PASS |
| 8 px boşluk ölçeği | Bölümler 96/64, footer 64/48; iç boşluklar 8/16/24/32/48/64/96 px | PASS |
| Hiyerarşi / satır | h2/adım Fraunces; SSS soru Figtree 600; tüm bölüm başlıkları en fazla 2 satır | PASS |
| Kırık simetri | `chromium-1440-faq.png`: solda başlık, sağda iki okuma kolonu; footer geniş marka/dar bağlantı alanı | PASS |
| Hover/focus/active | Zeytin ana sayfa logosu, KVKK, Topluluk; `*-link-{0,1,2}-{focus,hover,active}.png`, outline ≥2 px, hedef ≥44 px | PASS |
| Marka sınırı / gölge | Altın/marka mürekkebi focus/hover; durağan gölge ve süs çizgisi yok | PASS |
| Tek ikon ailesi | Süreç okları mevcut Lucide outline; gerçek marka logoları korundu | PASS |
| Kontrast / taşma | Beş ekran denetiminde metin kontrastı en az **10,89:1**, metin ≥14 px; yatay taşma **0 px** | PASS |
| Yasak liste | Mor degrade, emoji, blur/kart yığını, stok 3D, numaralı etiket/fiş/fırfır yok | PASS |

Görsel değerlendirme: süreçte asıl odak büyük adım adları, SSS'de okunur iki kolon, footer'da marka ve satıcı satırıdır. İlk ekran görüntülerindeki odak çerçevesi ve mobil uzun bölüm yakalama kesilmesi, odak durumlarını ayrı kaydedip hareketin bitmesini bekleyen CSS piksel yakalamalarıyla giderildi. Onaylı süreç fotoğrafı yokluğu görsel zenginliği sınırlar; onaysız fotoğrafla kapatılmadı. Bölüm kompozisyonu 7/10, kullanım 8/10, özgünlük 7/10, içerik 8/10: bölüm değerlendirmesi 7,4/10; genel sayfanın açık FAIL'i nedeniyle tüm sayfaya 6/10 üzeri kalite kabulü verilmedi.

### Kapsam dışı genel kapı bulguları

- **1 FAIL `few-pictures`:** sayfa genelinde iki ayrı raster konu var. Görev süreç fotoğrafı onayı gelmediğinde görselsiz şeride açıkça izin verir; fotoğraf/varlık onayı değiştirilmedi.
- **4 WARN:** `palette-cream` onaylı marka paleti; `no-footage` korunan kare dizisi ve video sınırı; `side-scroll` bu görevde açıkça istenen yatay süreç şeridi (düğme/klavye/ilerleme alternatifleri doğrulandı); `pinned-over-picture` korunan hero düzeni.
- AGENTS.md yeniden kurgu ara görevleri kuralına göre genel FAIL ve kapsam dışı bulgular Task 107 global kapısına aittir. Task 105'in kendi bölümünde FAIL veya eksik kabul maddesi kalmadı. Canlı yayın, gerçek cihaz veya gerçek tahsilat/gönderim kabulü iddia edilmedi.

## Durum: TAMAMLANDI
