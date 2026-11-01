# AFİNA v11: Kökten sofraya

Kullanıcı tüm senaryo/görseller için yaratıcı yetkiyi açıkça verdi. Bu paket
yetki kapsamında tasarımcı tarafından yazıldı; yeni marka görüşmesi uydurulmadı.

## Marka fikri
“Kökü toprakta. Yeri sofrada.” bir slogan satırı olarak kalmaz. Kaydırma önce
zeytinliğin içine yaklaştırır, ardından geldiği yeri anlatır, en sonda AFİNA
ambalajı kadraja yerleşir. Gerçek tesis, ürün seçimi ve işletme talebi bu fikrin
devamıdır. Marka süsü yerine ürüne ve üreticisine yaklaştıran hareket.

## Değerlendirilen üç konsept
1. Zeytinliğin içinden, seçildi. Kabul edilmiş gerçek proje klibiyle ileri/geri
   yolculuk; sonunda mevcut AFİNA tenekesi. Yeni üretim/kredi 0.
2. Bir damlanın yolculuğu. Makro yağ sahnesi için yeni onaylı üretim gerekir;
   bu görevin hazır görseli veya izinli harcaması değildir.
3. Tesisin içinden. Yeni iç tesis çekimi/üretim hattı olmadan gerçek süreç gibi
   sunulamaz. Fabrika kanıtı mevcut dış fotoğrafta kalır.

## Renk ve tipografi
Zeytinlik yaprakları ve gerçek ambalajdan: derin zeytin #243A29, taş #F0EBDD,
kâğıt #F7F4ED, mürekkep #172B21, yaprak #B4C58F, koyu altın #735519.
Fraunces display, Inter gövde. Kullanıcı MD'lerindeki iki font kuralı nedeniyle
üçüncü dekoratif font eklenmez. Siyah-beyaz/neon geçiş ve blur kart yığını yok.

## Film bandı, başlangıç aralıkları
400svh dış sahne, yaklaşık300svh yol. Rakamlar flick/piksel kabulünde doğrulanır.

| Band | Aralık | Görüntü ve kopya | Hareket |
|---|---|---|---|
| Açılış | plateau0–.28, çıkış.28–.32 | “Kökü toprakta. Yeri sofrada.” / “Osmaniye’den zeytin ve zeytinyağı.” | Tam ilk ekran, film ilerler, ön dal ayrı |
| Köken | giriş.32–.36, plateau.36–.64, çıkış.64–.68 | “Ellek’te başlar.” / “Zeytinin seçimi, hazırlanması ve dolumu. Kendi üretim tesisimizde.” | Sakin metin geçişi, coğrafya belirgin |
| Varış | giriş.68–.72, plateau.72–1 | “Sofranızda devam eder.” / “Eviniz ve işletmeniz için AFİNA.” | Gerçek teneke kadraja yerleşir; son metin kalır |

İmza: zeytinlikten hazır ambalaja görsel ilişki. Kutu etiketi değiştirilmez,
nesne başka nesneye dönüşmez. Son durum boş kalmaz. Ana CTA Ürünleri Keşfet;
kurumsal kitleye ikinci yol tek metin bağlantısıdır. Kontroller görünmez banda
hapsolmaz. Kaydırma gövde/wheel/touch kontrolünü ele geçirmez.

## Telefon ve sade mod
Kısa doğal hero, tam resmî slogan, portrait poster, gerçek CTA. Video yüklenmez;
gizli sekmede frame sürücüsü durur. Media/bağlantı hatası aynı bütün kompozisyonu
korur. Hareket tercihi değiştiğinde sahne yeniden kurulur; kör uzun pin kalmaz.

## Devam eden gerçek site
Üç kısa üretici bölümü → gerçek tesis ve adres → altı SKU seçimi/detail/sepet →
işletme segmenti → aynı SKU'yla gerçek e-posta taslağı → kaynaklı SSS/adres.
Tekdüze kart dizisi yerine fotoğraf sahnesi, sakin metin, ürün rafı ve satır
seçimi sırayla gelir. Her bölüm tek fikri taşır. Tesis/ambalaj/ödemeye ilişkin
kanıtsız rakam veya başarı mesajı eklenmez.

## AEO/GEO
Görünür beş gerçek cevabı schema ve llms ile tek veri kaynağından sun. Marka,
üretim yeri ve alım niyeti ilk paragraflarda doğrudan açıklanır. Sitemap/robots/
OG/canonical kontrol edilir. Genişletilmiş llms-full ve içerik güncelleme feed'i
gerçek yayımlanabilir içerikten üretilir. Blog/Person/Review veya sahte ürün
Offer'ı uydurulmaz. Google AI için özel dosya/garantili sonuç iddiası yoktur.

## Teknik uyarlama
Next/React ve doğrudan framer-motion kullanıcı tercihidir. MP4 scroll hedefi
lineer; kısa GOP, tek uçuşta seek, en son hedef, hata reset ve offscreen/hidden
dinlenme. Hafif sonlu kareler arası yakınsama overshoot/spring değildir. İlk
poster/text her zaman tamdır. Yeni motor/GSAP/Lenis yok. Mevcut ticaret korunur.

## Kopya kapısı
Yukarıdaki görünür satırlar birebir uygulanır. Uydurma güven iddiası, stok
rakamı, yorum, pazarlama dolgu cümlesi ve dekoratif sayaç yok. Metin/SSR/gerçek
HTTP kabulü ayrı; test/derleme başarısı tasarımın piksel kabulü sayılmaz.
