# AFİNA ZEYTİN v12 — Hasadın içinden

**Güncel ek çalışma: [Task172](tasks/172-mobil-scroll-animasyonlari.md).**
Dikey dokunmatik320–1023px ve en az640px yükseklikte ilk üç sahne480svh
üzerinden aynı scroll zaman çizgisini kullanır; tesis fotoğrafı/metni üst üste,
sofra ürünleri ve44px kontroller ekrana sığar. Galeri aynı doğrusal yatay
rayı telefon kartlarıyla kullanır. B2B/kapanış yalnız görsel katmanda hafif
hareket eder. Kısa/yatay/reduced/saveData/düşük CPU için native içerik sürer.

**Önceki çalışma: [Task171](tasks/171-fotografli-coklu-urun-ve-menu.md).**
Teklifte fotoğraflı çoklu ürün seçimi, ambalaj başına elle adet ve +/-;
kompakt kapalı alan, mobilde içi kaydırılan erişilebilir panel. Katalogdaki
özgün ürünler ve manuel e-posta taslağı korunur.21st109/20055 kaynakları
marka tokenlarına uyarlanır. Menü21st43059: scroll ile aktif bölüm, görünür
CSS fallback,13px masaüstü yazı ve1360px altında taşmayan mobil menü.
Aşağıdaki Task165 yayın durumu tarihçedir; güncel kabul Task171 kaydındadır.

**Aktif ek çalışma: [Task165](tasks/165-etkilesimli-bilesenler.md).** Kullanıcı
V12 hareketli önizlemesini “güzel beyendim” ile kabul etti; aşağıdaki sahne
kurgusu ve gerçek varlıklar korunur. Seçilen Footer, LiquidNavbar, glass logo
reveal, PendantLampRail, üyelik kartı, InteractiveCheckout ve TrackingTimeline
AFİNA tokenlarıyla eklendi. Bazgold kaynaklı telefon/ülke araması ile aranabilir
il/ilçe teklif formuna bağlıdır; il değişince ilçe temizlenir.

Footer teması yalnız kendi yüzeyini değiştirir; e-posta eylemi kullanıcıya
manuel taslak açar. Sepet ve sipariş yüzeyleri mevcut ticari veriyi kullanır;
örnek fiyat, sahte durum/tarih, sosyal bağlantı veya gönderim başarısı yok.
PayTR iFrame sınırı ve özgün altı SKU korunur. Son yerel unit/lint/typecheck/
webpack build kontrolleri PASS; önizlemenin statik kaynak taraması da yapıldı.
Tarayıcı çalıştırılmadı; önizleme onayı Task165'in son görsel kabulü veya
yayın kanıtı değildir. Yetkili main/API yayını henüz yapılmadı.

Task164: Kullanıcı V11'i beğenmedi. HTCOM, Villa Lara ve MLNEW referansları
incelendi. Bütün bölümler Framer Motion ile birbirine bağlı bir akış kurar.
[İnceleme](referans/sinematik-proje-incelemesi-164.md) ve
[görev/kabul](tasks/164-kesintisiz-sinematik-akis.md) aktif kayıttır.
V11 kaynak/medya/AEO rehberleri sürer; görsel yönü tarihçedir.

## Sanat yönetimi

Görüntü başroldedir. Aydınlık zeytinlik, yalnız başlığın arkasında lokal koyuluk,
ferah Fraunces ve gerçek italic, ince koyu cam menü. Yeşil #243A29, taş #F0EBDD,
kâğıt #F7F4ED, mürekkep #172B21 ve yaprak #B4C58F devam eder. Yeni ücretli
medya yok; kabul edilmiş A→B, gerçek tesis ve özgün ambalajlar kullanılır.

## Sahne kurgusu

1. Zeytinlik: tam fotoğraf/film, slogan; scroll ile görüntü yakınlaşır, başlık
   yükselip dalın kısa cümlesine yer verir. Video zamanı da scroll'a bağlıdır.
2. Üretim: gerçek tesis aynı viewport içine yükselir; bağımsız fotoğraf ve
   tipografi yerleşir. Adres ve kurumsal bilgi görünür.
3. Sofra: sıcak taş zeminde gerçek şişe ve kavanoz farklı hızlarda yerleşir;
   iki yandan gelen slogan ürün kompozisyonunu çerçeveler.
4. Ürünler: yatay scroll ile merkezdeki ambalaj aydınlanır ve büyür; altı SKU,
   detay, sepet ve teklife ekleme aynı ticari kaynakları kullanır.
5. İşletme: büyük ambalaj sabit kalırken otel/restoran, market/bayi ve toplu
   tüketim senaryoları yanından geçer. Her senaryo formu seçili segmentle açar.
6. Teklif: hareketli arka plan, sabit okunur form. Kullanıcı gerçek mailto
   taslağını kendi e-posta uygulamasından gönderir; otomatik teslim iddiası yok.
7. SSS/iletişim: aynı kaynaklı beş cevap; sofra görüntüsü ve gerçek logo ile
   kapanış. Footer bağlantıları ve yasal/ticari sınırlar korunur.

## Hareket ve erişim

İlk üç sahne masaüstünde600svh, uygun dikey dokunmatik ekranda480svh sticky
alanı paylaşır. Desktop ≥1024×760 fine pointer/hover; touch320–1023px genişlik
ve ≥640px yükseklik. Her ikisinde normal hareket, saveData kapalı ve yeterli
donanım gerekir. Pin videonun geç
hazır olmasına bağlı değildir; medya hatasında aynı sahne posterle devam eder.
Film 4 MB/GOP8; mevcut sonlu seek/cleanup sürücüsü değişmez.

Derin bağlantılar ve klavye odağı ilgili sahne konumuna eşlenir. Task172 ile
uygun dikey dokunmatik ekran da480svh sahne/film scrub ve yatay galeri alır.
Kısa/yatay, reduced-motion, saveData ve düşük CPU: aynı içerikler doğal
sırada; film talebi/uzun boş pin yok.
Alt bölüm metinleri/form kontrol geometrisi sabit, görsel katmanlar hareketli.
Wheel/touch/body kilidi veya ikinci GSAP/Lenis motoru yok.

## Sınırlar ve kabul

Framer Motion14.4.0, proje yerel UIPro, lisanslı React Bits ve mevcut 21st
uyarlamaları korunur. AEO/FAQ/schema/llms/feed ortak kaynakları değişmedi.
Test ve build sonucu görsel beğeni veya tarayıcı kabulü olarak sunulmaz.
Hareketli yerel önizleme, üretim dağıtımı ve fiziksel cihaz kabulü ayrıdır.
