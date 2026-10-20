# Task 088: Kit checklist'i ile ZEYTİN hero denetimi

## Tür
frontend — mevcut 086 üzerinde denetim ve gerektiğinde sınırlı düzeltme.

## Amaç ve bağımlılıklar
`DESIGN.md` ve 086'nın onaylı zeytinlik kompozisyonunu koruyarak loop/scrub kitlerindeki teknik kabul maddelerini doğrula. addBlockedBy: 083 (ScrollFrameSequence), 085 (Z-A), 086 (onaylı hero). 025/026 davranışları geriye dönük korunur. Bu belge plan görevidir; aşağıdaki runtime kabulü henüz yapılmadı.

## Kullanılacak araçlar
Uygulamada ECC frontend-patterns, motion-advanced, accessibility, verification-loop; mevcut asset kontrolü, Playwright ve Network/Performance; ffprobe/ffmpeg yalnız gerektiğinde onaylı kaynaktan türev. Yeni UI/paket/skill/video üretimi gerekmez.

## Mevcut kaydın sınırı
086 Coder Notu, onaylı videodan 1920+960 genişlikte 24fps/121'er kare, yaklaşık 10,80 MiB paket ve MP4'ün runtime'a kopyalanmadığını bildiriyor. Bu önceki görev kaydıdır; 088 başlangıcında manifest, byte, hash, poster ve tarayıcı davranışı yeniden ölçülür. O eski test sayıları bu görevin sonucu diye kullanılamaz.

## Birleşik denetim tablosu

| Kontrol | Kabul / kanıt |
|---|---|
| Kaynak onayı | 086 kaynak görsel/video ONAY.md ve SHA-256 ilişkisi; mevcut manifest/approval, tüm kare/poster boyutları ve eksik/fazla dosya kontrolü. Yeni görsel/video üretme, kaynak dosyayı değiştirme. |
| Döngü dikişi | Kaynak video ilk/son kare ve ileri/geri incelemesi kayda alınır. Mevcut hero **scrub**'dır, autoplay loop'a çevrilmez; loop dikişi N/A ise gerekçe açık. %0/%100 uçlarında boş/flaş kare yok; sırf loop kusuru için onaylı sahne yeniden üretilmez. |
| Poster/ilk yükleme | 2400/1200 WebP poster SSR HTML'de, doğru oran; yüklenme/JS kapalı/yavaş ağ/manifest-kare 404/canvas hatasında poster ve iki CTA kalır. Beyaz flaş/yerleşim kayması yok. |
| Sıkıştırma <5MB | MP4 teslimi varsa H.264/uygun web türevi **<5.000.000 bayt**; dosya/süre/codec/byte kaydı. Mevcut MP4 yalnız kaynak olduğundan “runtime MP4 yok” ayrı yazılır; gereksiz MP4 eklenmez. Kare paketi ayrı bütçedir: 086'nın **≤12 MiB** tavanı korunur; dosya toplamı ve seçilen varyantın gerçek ağ transferi raporlanır. İki farklı bütçe birbirinin yerine geçirilmez. |
| Scrub akıcılığı | %0/25/50/75/100, yavaş/hızlı/ters scroll ve üst üste yön değiştirme; mevcut kare indeksi 0..son aralığında, boş canvas ve eski kareye sıçrama yok. Tek raf/scroll mekanizması; yeni video.currentTime/Lenis altyapısı ekleme. Trace'te takılma/uzun görevler ve cihaz koşulları kaydedilir. |
| Reduced-motion | İlk yükleme ve tercih değişiminde statik poster; scrub/parallax/dekoratif hareket ve gereksiz kare istekleri yok. Metin/CTA görünür/klavye erişilir. Kitteki normal hızda oynatma önerisi alınmaz. |
| Mobil kaynak | 960 set veya poster; masaüstü seti ile gereksiz çift yükleme yok, Network kanıtı. Ekran dışında gereksiz yükleme/çizim durur; düşük güç/veri tasarrufu ve hata halinde poster. Mobil görsel üstte, metin fildişi altta, ürün odağı kesilmez. |
| Okunurluk scrim'i | Onaylı 086 fildişi katmanı `%92 → %75 @32% → 0 @58%` korunur; dekoratif gradyan/glass eklenmez. %0/65/100 kare örneklerinde normal metin ≥4,5:1, büyük metin ≥3:1, kontroller/focus ≥3:1; menü ve iki CTA da ölçülür. |
| Responsive/erişim | 320/360/390/430/768/1440 ve 844×390 yatay; svh/dvh/adres çubuğu/safe-area zıplaması, yatay taşma ve klavye odak kırpılması yok. Başlık ≤2 satır; 44px dokunma alanı. |

## Gelecekte dokunulabilecek yerler

Önce mevcut hero/ScrollFrameSequence bileşenleri, medya manifestleri ve `tests/e2e/hero-zeytinlik.spec.ts` okunur. Yalnız bulunan kusura bağlı hero stili/bileşeni, onaylı web türevi ve davranış testi değişebilir; kesin yollar uygulama başlangıcında Coder Notu'na yazılır. Kabul çıktısı `docs/kabul/088-kit-hero.md`; gorsel-onay/manifest yalnız gerçek varlık türevi değişirse güncellenir. Katalog, backend/DB/ödeme ve KURUMSAL kapsam dışıdır.

## Kabul kriterleri

- [ ] Her kontrol için PASS/FAIL/UYGULANMAZ ve somut gerekçe; hash/byte/codec, ağ/trace ve ekran bağlantıları `docs/kabul/088-kit-hero.md` içinde.
- [ ] Chromium/Firefox/WebKit, mobil/masaüstü; gerçek iOS/Android ayrıca. Gerçek cihaz yoksa emülasyon ayrı raporlanır, cihaz kabulü açık kalır.
- [ ] Normal, bozuk medya, yavaş ağ, reduced-motion ve JS yokluğu; poster/CTA ve ters scroll kanıtları var.
- [ ] `npm run check:assets`, `npm run test:e2e -- tests/e2e/hero.spec.ts tests/e2e/hero-motion.spec.ts tests/e2e/hero-zeytinlik.spec.ts`, lint/typecheck/build başarılı; değişiklik varsa ilgili unit test. Genel eski coverage hatası bağımsız kaydedilir, eşik düşürülmez.
- [ ] 076 kalite kabulü bu rapora bağımlı; plan görevinin yazılması runtime denetimi veya kullanıcı görsel kabulü sayılmaz.

## Coder Notu

- Başlangıç `09142c0`, temiz `main`. Kesin uygulama yolları: `components/landing/Hero.tsx`, `Hero.module.css`, `components/media/ScrollFrameSequence.tsx`, `lib/media/frames.ts`, `tests/unit/frame-sequence.test.ts`, `tests/e2e/hero-zeytinlik.spec.ts`. Görevde açıkça istenen kabul çıktısı: `docs/kabul/088-kit-hero.md`. PLAN/DESIGN, diğer task'lar, `_legacy/`, katalog/backend/DB/ödeme ve bütün görsel/onay dosyaları korunmuştur.
- ECC frontend-patterns, motion-advanced, accessibility, verification-loop ve hareket temeli/örüntüleri okundu. Kurulu Next.js'in client/server ve görsel rehberleri okundu. Yeni UI, paket, skill, video veya shadcn bileşeni gerekmedi; mevcut 21st kökenli hero korundu.
- TDD RED: veri tasarrufu ve ekran dışı kuyruk kusurları unit testte; başlangıç production build'inde yatay odak/canvas throw/veri tasarrufu E2E testleri **3/3 FAIL**. Düzeltmeler: ekran dışı/gizli sekmede kuyruk ve çizim durur; saveData/düşük donanım poster kullanır; canvas hatası/context loss postere döner; kısa ekran doğal kayar, yükseklik değişiminde odak görünür tutulur. Mobil poster/canvas aynı sağ hizayı kullanır. Masaüstü onaylı scrim yüzdeleri aynen korunmuştur.
- Kaynak PNG/MP4 hash'leri iki dış ONAY.md ile yeniden eşleşti. 243 WebP ve 245 fiziksel dosya yeniden doğrulandı; paket **11.323.604 bayt / 10,799 MiB**. Runtime MP4 yok; kaynak H.264 MP4 **5.379.141 bayt / 5,041667 sn** olduğundan kaynak dosya <5 MB teslimi gibi raporlanmadı. Kaynak ilk/son ve ileri/geri şeritler incelendi; loop dikişi scrub için UYGULANMAZ.
- `npm run check:assets`, `npm run lint`, `npm run typecheck`, `npm run build`, `git diff --check` PASS; ilgili unit **38/38**, genel `npm run test` **202/202** PASS. Mevcut 3004 süreci yerine bu checkout'ın production sunucusu 3104'te kullanıldı. `PLAYWRIGHT_BASE_URL=http://localhost:3104 npm run test:e2e -- tests/e2e/hero.spec.ts tests/e2e/hero-motion.spec.ts tests/e2e/hero-zeytinlik.spec.ts --output=test-results/088-e2e` → **300/300 PASS**, Chromium/Firefox/WebKit, 0 skip/retry/flaky. 320/390/768/1440'a ek 360/430, 844×390 ve yükseklik değişimi sınandı.
- Metin kontrastı minimum **6,947:1**, focus **5,422:1**, menü metni **5,945:1**. Tam geçişte 960 set gövde/transfer **3.268.902/3.305.202 bayt**, 1920 set **7.945.520/7.981.820 bayt**; iki set birlikte istenmedi. Chromium CLS=0 ve ayrı Performance trace'inde >50 ms görev yok; WebKit 1440 rAF örneğinde **iki gecikme, maksimum 57 ms** kaydedildi. Firefox/WebKit'te desteklenmeyen Long Tasks/CLS sayaçları kabul kanıtı sayılmadı. Kanıt/ekran/trace bağlantıları rapordadır; `test-results/088/` ve büyük çıktılar gitignore gereği yereldir.
- `npm run test -- --coverage` → testler PASS, genel eşik FAIL: satır %72,34, statement %70,37, function %66,66, branch %96,15. Başlangıç commit'i repo içindeki geçici `git archive` kopyasında **196/196 test ve aynı coverage/eşik hatası** verdi; eşikler değiştirilmedi.
- **Yapılamayanlar / BEKLİYOR nedeni:** gerçek iOS/Android cihaz, native düşük güç modu, gerçek adres çubuğu/safe-area kabulü yok; iPhone/Pixel yalnız emülasyondur. Ayrıca onaylı videonun son kare push-in'i şişe/kasenin bir bölümünü kaynakta keser; sağ hizalama eksik kaynak piksellerini geri getiremez. Kaynak değiştirme/yeni üretim yasağı nedeniyle “ürün odağı kesilmez” maddesi bütünüyle karşılanamadı. 076 ve kullanıcı nihai görsel kabulü açık bırakıldı. Görev tamamlandı olarak işaretlenmedi.

## Durum: BEKLİYOR
