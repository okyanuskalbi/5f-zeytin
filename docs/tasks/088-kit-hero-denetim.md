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

## Durum: BEKLİYOR
