# AFİNA v8 — kabul kaydı

**Durum: TAMAMLANDI — V8 CI/API YAYIN VE CANLI KABUL PASS.** Aşağıdaki plan uygulama öncesinde yazıldı; bu üst kayıt çalıştırılmış son kaynak sonuçlarını ayırır. V6/v7 PASS v8 sonucu değildir.


## İlk canlı kabulde bulunan ve giderilen yarış

İlk v8 deployment `9778c95`/`dpl_ETLYSKu1PA3jCs8JbExX4KCQTNH1` READY oldu. Canlı ilk tur69PASS/5FAIL/6responsive skip: sunucu HTML'sindeki etkin ürün seçim düğmesine React hazır olmadan basılınca seçim kayboluyordu. Bu tarayıcı/araç kesintisi değil gerçek readiness kusurudur. İlk log `.cache/task-160/e2e-live-first-failed.log` korunur; ilk dağıtım tam canlı kabul diye sayılmaz.

Hero'nun üç JavaScript denetimi useSyncExternalStore server=false/client=true kapısıyla, olay işleyicileri hazır olana kadar native disabled kalır. SSR slogan/poster/ürün/gerçek anchor görünür ve kullanılabilir. Unit SSR disabled sözleşmesini doğrular; mevcut5genişlikli gerçek seçim testi JS chunk'larını bilerek bekletir, disabled durumunu doğrular, chunk'ları serbest bırakır ve gerçek enable/selection/detail/cart akışını çalıştırır. Sabit uyku/yanlış başarılı retry yok. Son kaynakta1200unit,lint/type/build ve74yerel e2e+6responsive skip yeniden PASS. Yeni CI/API dağıtımı ve canlı tekrar bu düzeltmeyle yürütülür.

## Son kaynak yerel sonuç — 1 Kasım 2026

- Build ID `aU9kRVEDWxduQepWaIxk_`; yeni `motion/react` SectionReveal dahil son production build, tüm medya kapıları PASS. `npm run lint`, `npm run typecheck` PASS; **89 dosya / 1200 unit PASS**. Config testindeki dört→beş viewport sözleşmesi güncellendi. İlk kırmızı CSS/başlık beklentileri yeni somut tasarım sözleşmesine taşındı; bunlar anlamlı yeni davranış RED'i diye sayılmaz. Üç yeni hero testi gerçek veri/variant/detail/cart/stock0 sınırını doğrular.
- Üç e2e spec / beş Chromium genişliği / 80 durum: **74 PASS, 6 kapsam dışı responsive skip, hata0**. 320/390/768/1024/1440; iki küçük telefonda ayrıca 360×640 ilk ekran testi; masaüstü pin yalnız >900px, telefon testi yalnız <768px. Gerçek1kg detail/radio/odak ve isolated local-cart SKU, SKU değişiminde eski “eklendi” durumunun temizlenmesi, B2B native details/Space/kapalı servis, menü/üyelik/yasal bilgi, film ilerleme/pause/replay, reduced/saveData/hata-poster, bağımsız düzlemler/normal akışa çıkış kapsanır. Gerçek müşteri mutasyonu yok. `.cache/task-160/e2e-local.log`.
- Son production derlemede **1440/1024/768/390/360×640/320** altı görsel boyut: her birinde axe WCAG2/2.1/2.2 AA ihlal0, console error0, 4xx kaynak0, bölüm ve footer taşma0; film readyState4 ve currentTime artışı, painted son kare screenshot'ı. Desktop6progress örneği film/ambalajın farklı transform'larını kaydeder. `.cache/task-160/local/results.json`, `*-hero.png`, `*-story-{0,.2,.4,.6,.8,1}.png`, `*-film-end.png`, `*-full.png`.
- Hover/tap gerçek ölçüm, tercih değişirken y0/scale1 sıfırlama, JS kapalı görünür H1 + gerçek ürün anchor'ı PASS. Reduced film/kare isteği0 ve src yok. `.cache/task-160/local-motion.json`.
- Değişmemiş upstream Taste source lint: **10 dosya, 0 FAIL/0 WARN**. 21st CLI1.18.0 deterministik source review: **0 error/0 warning/19 information suggestion**; onaylı renk token tanımları, otomatik değişiklik yok. `.cache/task-160/{source-taste-lint,21st-review}.json`.
- Native Taste son kaynak `after2`: **scenes PASS/exit0**; altı frame, desktop1.8screen gerçek Motion sahnesi, telefon bitmiş kompozisyon/reduced statik; 62frame median16.7ms, >34ms0 (headless örnek, cihaz FPS iddiası değil). **inspect ham1FAIL/5WARN/exit1**; hiçbir rule/allow/app-mode değişmedi. Tek FAIL geometric eyebrow algısı: SKU ağırlıkları/fiyatları, gerçek form etiketi ve önceki bölüm marka bağı bir sonraki başlığa bağlanıyor. Gerçek dekoratif eyebrow yok; satın alma metadata/form etiketi silinmedi veya saklanmadı. Görsel/adım karşılığı ve beş WARN gerekçesi `NATIVE-REVIEW.md` içinde; native0FAIL diye sunulmaz. İlk pass arşivi `after-pass1`, safe-CDP helper farkı `adapter-provenance.json`/`cdp-safety.patch`, kaynak denetim dosyaları byte-identical.
- Görsel değerlendirmede ilk gerçek hata: mobil foreground packshot üst-sağ film kontrolünü engelliyordu; kontrol üst-sola taşındı ve son altı boyut/film testleri PASS. Sepet başarı durumunun SKU değişiminde taşınması key ile giderildi; regresyon gerçek tarayıcıda doğrulandı. Son reviewer yeni işlevsel/görsel blocker görmedi. Stil uyarısı yerine gerçek davranış düzeltildi.
- Tüm sahip olunan Next/test browser süreçleri finally `browser.close` / CDP Browser.close / SIGTERM ile kapandı; test worker≤2, kullanıcı Chrome'u açılmadı. Proje/skill global ayarları değişmedi.

**Yayın kabulü PASS:** runtime `179df851686a34d09a1e965315dc5e902a30c362`, CI41304790349 SUCCESS, REST API `dpl_7EUijPZwcnzr9ML3nHMFRwUErZ89` READY; afinazeytin.com ve www aynı alias. Canlı74PASS/6responsive skip, altı görsel boyutta axe/console/network/taşma0; motion/noJS/reduced ve10HTTP/hash kabulü PASS. Sessiz doğal oynatım190decodedframe/7,916667sn./ended doğrulandı;12,04sn canlı UI kaydı .cache/task-160/live/hero-preview.mp4. [Yayın makbuzu](../../../referans/yayin-object-v8-20261101.json), [QA](../../../referans/qa-160-20261101.json).

**Flow ayrı üretim sonucu:** doğru proje yeniden normal açıldığında Google uyarısı yoktu; B→C/C→D/D→F ilk/son referanslarla Omni1.1Flash720p8sn16:9/x1 üretildi.3×12=36 kredi, önceki230→194 bakiye panelde doğrulandı; toplam harcama56/80, yeni ek36/60. Güvenlik ayarı/CAPTCHA müdahalesi veya tekrar harcaması yok. Üç dosya indirildi; kullanıcı medya kabulü ve runtime izni henüz yok, yeni public medya yok. Canlı film hâlâ kullanıcı onaylı A→B'dir. Yeni adayların gözden geçirmesi FLOW-CANDIDATE-REVIEW.md ve Flow ledger'da; fiziksel cihaz/gerçek ödeme/hesap/teklif kabulü değildir.

## Başlangıç ve preflight

Baseline Task159 production 5a3b1f6840057febccca9f926ce1b231a052297e; .cache/task-159/live/{1440,390}-hero.png, -film-end.png, fulls ve hero-preview.mp4 mevcut v7 kanıtıdır.
Skill v0.3.1 / SHA 75d81f74e83692add18cd7a8a8e078b8a887a579: upstream 24 dosya / 389.541 bayt; lisans + manifestle toplam 26 dosya / 394.961 bayt; byte/hash fark 0, symlink 0.
**Doctor PASS / exit0:** node24.11.1, ffmpeg490 filter, playwright-core cwd, explicit paketli Playwright Testing binary, docs/scrollcraft workspace/registry. .cache/task-160/preflight.log. --probe yok; API/tarayıcı başlatılmadı. Opsiyonel libwebp encoder/KIE key eksik; mevcut Sharp poster/onaylı medya kullanımı için blok değil. Foreign shoot/serve/kie/engine çalıştırılmadı.

## İşlev ve kalite kapıları

| Kontrol | Gerekli kanıt | Sonuç |
|---|---|---|
| Aynı nesne | Üç id: görsel/ad/miktar/fiyat/stok/detail/cart eşleşir; klavye/selection durumu/odak doğru | YEREL + CANLI PASS |
| Veri kapısı | Stok0/hydration/eksik ürün/güncel stok değişimi yanlış ekleme yapmaz; provider verisi kullanılır | YEREL + CANLI PASS |
| Kurumsal dal | Native aç-kapa/KVKK/odak; kapalı servis açılmadan görünür; sahte gönderim yok | YEREL + CANLI PASS |
| Gerçek film | Decoded/painted frame + zamanda ilerleme; sessiz tek geçiş/son kare/pause/replay | YEREL + CANLI PASS |
| Kontrol/fallback | Kontrol ayrı 44px+; reduced/saveData MP4 isteği0; blocked/hata/poster/retry/gesture; offscreen pause/kullanıcı pause | YEREL + CANLI PASS |
| SSR/medya | H1/poster/gerçek anchor JS'siz; mevcut kaynak/hash/bütçe/faststart kapıları; onaysız C/D/F yok | YEREL + CANLI PASS |
| Kalite | Anlamlı RED→GREEN; scoped + full unit/lint/type/build; low-impact CSS ayna testi yok | YEREL + CANLI PASS |

## Görsel/mekanik kabul

Yalnız paketli headless Chromium, worker≤2; kullanıcı Chrome'u açılmaz. Her koşuda browser.close() ve başlatılan sunucuya SIGTERM/düzgün kapanış; gerçek müşteri/sipariş/ödeme/teklif mutasyonu yok.
1440/768/390/320 genişlik + **360×640 kompakt**, normal/reduced/saveData. Açılış giriş/orta/çıkış dahil yaklaşık6 örnek; beş vuruş ve final ayrıca. .cache/task-160/{local,live}/ report.json + PNG + full + okunmuş contact sheet; kesin kaynak/served build kimliği kaydı. Hatalar saklanır, çözen tekrar belirtilir.
Görsel kapılar **YEREL + CANLI PASS:** bağımsız film/nesne hareketi ve temas; oran/etiket; temiz H1/iki CTA; 360×640 üstte başlık/ana eylem, yaklaşık260px sahne, pin yok; gerçek4/6 fingerprint farkı; tek zirve/ölü scroll yok; altı SKU veri/sıra/erişim; statik adres/mağazaya dönüş/SSS/legal final.
Kontrast **YEREL + CANLI axe PASS ve piksel değerlendirme:** gerçek kompozit karelerde satır altı ilgili açık/koyu zemin; gövde/kontrol≥4.5:1, büyük type≥3:1; soluk ara kareler gözle. Taşma/header çakışması/pageerror/404/axe/klavye odağı; rail varsa gerçek overflow ve reduced erişimi ölçülür. Ham progress değil gerçek görünür transform/paint örneklenir; native single-play scrub sayılmaz.

## Soğuk his kontrolü

BRIEF'e tekrar bakmadan normal hızda kaydır; her vuruşta bir his kelimesi + somut neden yaz, sonra hedefle karşılaştır. Uymuyorsa sayfayı düzelt, BRIEF'i geçmişe dönük PASS için değiştirme.
| Vuruş | Hedef | Gerçek gözlem/düzeltme/son kanıt |
|---|---|---|
| Yer/nesne | Yakınlık → sahip olabilme | Aynı sahnede ağaç geriye çekiliyor, ambalaj öne geliyor; seçilen varyant gerçek detail/cart hedefini değiştiriyor. |
| Tesis | Güven | Tek gerçek Ellek fotoğrafı ve kısa yer bilgisi; tekrarlanan olgu şeritleri yok. |
| Ürün | Açıklık | İlk nesne büyük; devam eden kart ve native kaydırma/klavye erişimiyle altı gerçek SKU okunuyor. |
| Kurumsal | Kontrol | Kapalı servis açılmadan görünür; form kullanıcıyla açılıp Space ile kapanıyor. |
| Çözüm | Yönünü bilme | Gerçek adres/harita, ürünlere dönüş ve destek/legal yolları erişilir. |

## Yayın ve sınır

Yerel kapılar → normal yetkili push/CI → doğrulanmış Vercel REST API → production alias read-only HTTP/hash/desktop/mobile/klavye/film tekrarı. Kesin commit/dağıtım/makbuz eklenir; v8 registry ancak başarılı yayın kabulünden sonra.
Headless viewport fiziksel iPhone/Android/iOS Low Power Mode/ağ decoder kabulü değildir. Yeni Flow filmi, servis etkinleştirme, gerçek hesap/sipariş/ödeme/teklif ve ticari fiyat onayı ayrı kapılardır.
