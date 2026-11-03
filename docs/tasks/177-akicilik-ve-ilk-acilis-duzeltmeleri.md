# Task177 — İlk açılış ve panel akıcılığı

## İstek ve kapsam

Task176 denetiminin ardından kullanıcı “başla” dedi. Denetimdeki üç bulgu:
masaüstü ilk açılışta CLS1.0 (üç bağımsız yükleme), canlı ana sayfada yanlış
koyu menü ve CPU4 koşulunda menü/sepet/ürün seçici birleşik etkileşiminde
57–83ms uzun animasyon kareleri. Son bulgunun hangi panelden geldiği ayrıştırılır.

Yeni tasarım veya komponent eklenmez. Altı gerçek ürün, görseller, fiyat/stok,
film/sahne geçişleri, mobil kaydırma, klavye ve erişilebilir modal davranışları
korunur. Native, reduced-motion, saveData ve JavaScript kapalı durumlar sürer.
Gerçek hesap, ödeme, sipariş veya e-posta mutasyonu yapılmaz.

## Kullanılacak araçlar

- Proje yerel frontend-patterns ve tdd-workflow; animation-performance ve browser-qa.
- Next paketinin ilgili yerel usePathname/hydration ve CSS belgeleri.
- Paketli headless Chromium, aynı anda en fazla iki browser; düzgün kapanış.
- Mevcut Vitest, lint, typecheck ve Turbopack production build.
- Main commit/push; exact-SHA Actions doğrulaması ve doğrudan Vercel REST API.

## Kabul kriterleri

1. Açılış sıçramasının ve menü tonu hatasının nedeni kanıtlanır, hedefli
   davranış testleri düzeltme öncesinde başarısız, sonrasında başarılı olur.
2. Üç bağımsız masaüstü ilk açılışında CLS tekrar ölçülür; telefon, fallback
   ve doğrudan bölüm bağlantıları korunur. Tüm sayfa gizlenerek sonuç iyileştirilmez.
3. Menü, sepet ve seçici ilk/sıcak açılışları CPU4 ile ayrı ölçülür; yalnız
   kanıtlanan maliyet düzeltilir. Ölçüm fiziksel cihaz/FPS garantisi sayılmaz.
4. Menü ilk yüklemede, içsayfada ve ana sayfaya geri dönüşte doğru tona sahiptir.
5. İlgili unit, lint, typecheck, build; hareket/galeri/menü/sepet kabulü geçer.
6. Aynı doğrulanmış commit main'e gider, CI geçer, REST dağıtımı READY ve
   afinazeytin.com alias bağlı olur. Canlı kabul ayrıca tekrarlanır.

## Kanıt

- Başlangıç: `.cache/task-176/RAPOR.md`, `performance.json`, `diagnosis/`.
- Ayrı çalışma alanları: `.cache/task-177/hero/`, `navbar/`, `panels/`.
- Nihai yayın/kabul: `.cache/task-177/final-receipt.json` (henüz oluşturulmadı).

## Coder Notu

Bu görev mevcut bileşenlerde hata ve performans düzeltmesidir; yeni 21st.dev
bileşeni veya dependency gerektirmez. Önceki kabul edilen 21st uyarlamaları sürer.
RED/GREEN kanıtı dosyalarda tutulur; ortak çalışma dalında yalnız tüm kapıları
geçen birleşik görev commit'i oluşturulur. Fiziksel cihaz kabulü ayrı kalır.

## Neden ve uygulama

- Canlı Vercel HTML ana sayfayı `/index` yolu ile oluşturuyor; tarayıcı `/`
  üzerinden hydrate ediyor. React ilk attribute uyuşmazlığını onarmadığı için
  menü koyu kalıyordu. Navbar yalnız bilinen kök takma adını normalize eder;
  içsayfaların koyu menüsü ve gerçek URL takibi korunur.
- Native → cinematic geçişinde bölüm yerleşimi, lazy Motion'ın ilk inline
  karesinden önce uygulanıyordu. Tesis/sofra bir kareliğine görünür şekilde
  üste çıkıyordu. Yalnız cinematic bölümlere `p=0` CSS başlangıcı verildi;
  inline Motion devamında devralır. Alt bilginin 44px yüksekliği korunur.
- Aynı host CPU4 başlangıç ölçümünde ilk sepet açılışları70.9/62.4ms, ilk
  menü65.6/65.6ms uzun animasyon karesi üretti. Sıcak açılışlar daha ucuzdu.
  Modül ön yükleme deneyi70.9/62.4→64/64.8ms sonucuyla anlamlı kazanç
  sağlamadı ve kaynak/test değişiklikleri geri alındı. Erişilebilir modal
  odak/body-lock davranışını bozmadan kanıtlanmış ek bir iyileştirme bulunmadı.
  CPU4 altında ilk açılışta yaklaşık60–75ms sınırı korunuyor; fiziksel cihaz
  performansı veya her karede60fps garantisi verilmez.

## Test kanıtı

- Navbar gerçek `renderToString(/index) → hydrateRoot(/)` regresyonu
  eski kodda RED, normalize edilmiş kodda GREEN. Dört SSR/hydration yolu;
  ilgili altı dosyada31 test PASS.
- İlk cinematic panel stili / footer kapsamı2RED→3GREEN; mevcut hareket
  testleriyle21/21 PASS. Native görünürlük ve inline timeline önceliği korunur.
- Sepet ön yükleme deneyinde7 yeni garanti testi ve gerçek Turbopack chunk
  hatası sonrası yeniden açılış geçti. Performans kazancı yetersiz olduğundan
  deney kodu ve ona ait7 test nihai kaynakta yok; ölçüm cache içinde saklandı.
- İlk birleşik adayda1438unit ve12profil64hareket kontrolü geçti. Deney geri
  alındıktan sonra nihai kaynak yeniden derlenip kabul edilir; bu aday sonucu
  nihai dağıtım kabulü yerine geçmez. Son kanıt görev cache'ine yazılır.

## Yerel kabul

Nihai kaynak: 121 dosyada1.431 test, lint, typecheck ve Turbopack build PASS.
Üç cold masaüstü yüklemede CLS0; doğru menü tonu ve içsayfadan dönüş PASS.
12 profil64 hareket/film/klavye/fallback kontrolü,9 navbar viewport ve4scroll
hedefi,7 galeri profili ve6 dolu sepet kontrolü PASS. Browser/write hatası0.
Telefon/masaüstü başlangıç ve tesis ekranları ayrıca görsel incelendi.
[Ölçüm kaydı](../referans/qa-177-20261103.json).

Main/API yayın ve canlı kabul bu commit sonrasında yürütülür; nihai durumu
`.cache/task-177/final-receipt.json` kaydeder. CPU4 ilk modal gecikmesi yukarıda
belirtilen sınır olarak korunur; fiziksel telefon kabulü yapılmadı.

## Durum: UYGULAMA VE YEREL KABUL TAMAM — YAYIN MAKBUZU AYRI
