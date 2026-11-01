# AFİNA ZEYTİN v11 — Kökten sofraya

Kullanıcının $10K kalite hedefi ve tüm senaryoyu yeniden düşünme yetkisiyle
[Task163](tasks/163-10k-sinema-ve-aeo.md) aktiftir. Dört MD, dört PDF ve ZIP
[şart eşlemesinde](scrollcraft/builds/afina-v11/REQUIREMENTS.md) incelenir.
Önceki v10 [byte-identical arşivdedir](referans/DESIGN-v10-history-20261101.md).

## Tasarım fikri

“Kökü toprakta. Yeri sofrada.” kaydırılan bir yolculuğa dönüşür. Kabul edilmiş
A→B filmi ileri/geri hareket eder; özgün ön dal kendi düzleminde uzaklaşır,
son bölümde gerçek AFİNA tenekesi yerleşir. Kalite bütçesi tek imza sahnesinde;
alt bölüm düzenleri fotoğraf, metin, ürün rafı, işletme satırları ve form olarak
değişir. Fake sayaç/yorum/sertifika yok. Üç konsept ve seçimin gerekçesi
[DESIGN-PACKAGE](scrollcraft/builds/afina-v11/DESIGN-PACKAGE.md) içindedir.

Derin zeytin #243A29, taş #F0EBDD, kâğıt #F7F4ED, mürekkep #172B21,
yaprak #B4C58F, koyu altın #735519. Fraunces ve Inter; iki yerel font.
Mevcut logo, ambalaj, ürün adları/fiyatları/stoku/sırası ve ticari otorite korunur.
Ürün örnekleri gerçek satış onayı sayılmaz. Yeni üretim veya kredi harcaması0.

## Açılış sözleşmesi

İlk SSR ekranı tam slogan, kısa coğrafi açıklama, responsive poster ve gerçek
#urunler / #teklif bağlantılarıdır. Gövde/wheel/touch kontrolü ele geçirilmez.
Yalnız uygun masaüstü, fine-pointer/hover, ≥1024×760, normal hareket,
veri tasarrufu kapalı, yeterli donanım/görünür sekme: düşük öncelikli Blob
indirilir. İlk çözülmüş kare ve görünür sahne sonrası400svh pin etkinleşir.

Üç metnin tam okunur plateau'su84svh; geçişler12svh. Aralıklar0–.28,
.36–.64, .72–1. Metinler aynı anda üst üste gelmez; eylemler bunlardan
bağımsız ve odaklanabilir kalır. Son metin ve ambalaj yerinde kalır. Bunlar
hesaplanmış başlangıç değerleridir; gerçek flick/ara kare kabulü bekliyor.

Film4.042.962bayt,190kare/24fps/7,916667sn; H264/yuv420p/fast-start/GOP8,
sessiz. Hedef lineer; dt-normalize, overshoot yapmayan sonlu yaklaşım ve tek
native seek; yalnız en son bekleyen hedef, hata/zaman aşımı reset ve cleanup.
Film preload SSR'da none; izinli Blob sonrasıauto. Görünüm/sekme dışında RAF
durur. Geç yükleme sahneyi ziyaretçinin üstünde uzatmaz. Native moda geçiş
blob/decoder/RAF/seek/pending state'i temizler; geri dönüş yeniden ölçülür.

Telefon/touch/kısa/reduced/saveData/JS yokluğu/medya hatası: kısa doğal hero,
portrait poster, tam H1 ve aynı eylemler. Hiç MP4 talebi yok. Hareket tercihi
iki yönde canlı izlenir; uzun boş pin bırakılmaz.

## Tam sayfa ve müşteri kararı

1. #baslangic: üç bantlı zeytinlik→ambalaj sahnesi; tek ana ürün eylemi.
2. #uretim-yolculugu: üç kısa okuma adımı, fotoğraf/bölüm işareti senkronu;
   uygun masaüstünde64svh adımlar, diğerlerinde bütün fotoğraflar doğal akış.
3. #tesisimiz / #kurumsal: gerçek Ellek tesisi ve kaynaklı adres.
4. #urunler: altı SKU, gerçek detay/sepet; uzun masaüstünde lineer yatay raf,
   kısa/mobil/reduced/JS kapalı doğal yatay kaydırma ve klavye erişimi.
5. #toptan-iletisim: üç işletme segmenti, seçilen ambalajla ortak talep bağlamı.
6. #teklif: doğrulama/KVKK sonrası gerçek e-posta taslağı. Otomatik teslim yok.
7. #iletisim: aynı5SSS, adres/kurumsal kanal, “Sofrada görüşürüz.” ve ürüne dönüş.

21st gerçek kaynakları, proje yerel UIPro ve pinned React Bits BlurText devam
eder. Lisans/pin [v10 SOURCES](scrollcraft/builds/afina-v10/SOURCES.json) içinde.
framer-motion14.4.0 ve motion14.4.0 aynı runtime; ikinci GSAP/Lenis motoru yok.
Ticari provider, ödeme, hesap ve DB kapıları değişmez.

## AEO ve doğrulama

Görünür5FAQ ve FAQPage aynı modülden, kurum/yer/ana sayfa bilgisi ortak entity
verisinden gelir. llms.txt + llms-full.txt + tek gerçek ana sayfa güncellemesi
olan Atom feed aynı kamuya açık bilgiyi kullanır. Robots özel yolları kapalı
tutar; sitemap yalnız indekslenebilir ana sayfa, canonical/OG gerçek domaine
açılır. İndeks/AI görünürlük veya FAQ rich result garantisi verilmez.

Yerel unit/lint/typecheck/webpack build kanıtları ve açık kapılar
[VERIFICATION](scrollcraft/builds/afina-v11/VERIFICATION.md) içindedir.
Gerçek tarayıcı render/scroll/axe/Lighthouse, fiziksel cihaz ve canlı yayın
kabulü tamamlanmadan bu tasarım TAMAMLANDI sayılmaz. Önceki v9 canlı kalır.
