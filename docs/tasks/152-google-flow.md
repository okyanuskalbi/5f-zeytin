# Task 152: Google Flow ilk/son kare ve scroll filmi

## Tür
medya + mevcut frontend entegrasyonu

## İstek
Kullanıcı: yalnız Google Flow; ağaç → dal/zeytin → hasat → yağ akışı → onaylı AFİNA ambalajı. 1 Kasım son yön: kredi harcamadan önce before/after başlangıç-bitiş referansı. AtlasCloud kullanılmaz.

## Doğrulanan erişim
- Kullanıcının paylaştığı Chrome oturumunda Flow PLUS ve 250 kredi görüldü.
- Ayrı AFİNA çalışma projesi: https://flow.google.com/project/62040049-3473-446b-9d93-8e6cbc45f8bc
- Google Veo 3.1 Fast seçildi; 16:9, 720p, 8 saniye, tek çıktı. Ekran bu ayarda 20 kredi gösterdi.
- İlk hazırlıkta ücretli üretim başlatılmadı; 5 klip/100 kredi önerisi yerine referans önizlemesi istendi. Son plan beş anahtar kare/dört geçiştir. Sonradan yalnız A→B tek denemesi için açık 20 kredi onayı verildi ve tamamlandı; dört geçiş için 80 kredi önerisi yetki sayılmaz.
- In-app browser farklı Google hesabındaydı; harcama yapılmadı. Üretim için kullanıcının belirttiği Chrome hesabı esas alınır.

## İş akışı
1. Beş anahtar kadraj: A ağaç, B dal, C hasat, D yağ akışı, F onaylı AFİNA ürün kadrajı. Dört klip: A→B, B→C, C→D, D→F; bir klibin bitişi sonraki başlangıç karesiyle aynı dosya olmalı. F harfi önceden hazırlanan son ürün dosyasıyla eşleşmeyi korur; E için ek üretim gerekmedi.
2. Mevcut onaylı ürün fotoğrafı/etiketini aynen koru. Temsili sahneler gerçek tesis/hasat belgesi değildir. Yeni fotoğraf/anahtar kare de ücretli ise önce kapsam+kredi sınırı al.
3. Her klip Flow'un Başlat/Bitir kare girişleriyle hazırlanır. Her ikisi görüntüde doğrulanmadan üretme. Tek çıktı; deneme/tekrar da kredi sınırına dahil.
4. Ortak ışık: açık orta ton, detaylı gölge, doğal yeşil/şampanya, okunur etiket, SDR. Mevcut SDR'ye ikinci ACES uygulanmaz. Statik ürün karesinde logo/etiket/gövde uydurma ve değiştirme yok.
5. Kullanıcı kareleri ve ardından üretilen videoyu onaylar. Yeni adaylar public dışında kalır. SHA/onay/sağlayıcı/istem/harcanan kredi kaydedilir.
6. Onaylı video → mevcut extract-frames.mjs → 1920/960 WebP + mevcut manifest şeması → ScrollFrameSequence. Scroll ileri/geri; autoplay veya body kilidi yok. Ürün/sepete ekle gerçek DOM kontrolleri.

## Ücretsiz referans üretimi ve before/after
- Flow resim modunda Nano Banana 2.1, 16:9, x1 için **0 kredi** ekranda doğrulandı. Aynı ücretsiz modelle A üretildi; B, C ve D önceki kareyi referans alan düzenlemelerle oluşturuldu. İşlem sonrasında hesap panelinde **250 kredi** bakiyesi tekrar görüldü.
- Dört yeni görsel aday: A ağaç, B dal/zeytin, C hasat, D yağ akışı. Görseller görüntülenip indirildi, SHA kayıtları alındı. Hasat elleri ve devamlılık görsel olarak incelendi; kullanıcı kabulü değildir.
- F, daha önce onaylı `04-naturel-sizma-zeytinyagi-1l-sahne.webp` dosyasının birebir kopyasıdır. Ürün/etiket yeniden üretilmedi. F arka planı/ışığı önceki karelerden farklı olduğundan D→F son geçişi için görsel karar beklenir.
- Önizleme: `output/flow-keyframes/ilk-son-kareler.html`. Adaylar bu ignore edilen yerel dizindedir; public/runtime/commit içine alınmadı. Hash/provenans özeti `docs/referans/flow-keyframes.json`. Tam üretim istemleri Flow proje öğesinin sürüm geçmişindedir.

## Tarihçe: ilk klip üretimi
Kullanıcı “Flow’a her sahnenin ilk ve son görselini verelim” diyerek yöntemi netleştirdi. Beş referansın tamamı Flow proje kitaplığına yüklendi. A ve B, Başlat/Bitir alanlarında ayrı ayrı seçilip görüntüde doğrulandı.

Ardından kullanıcı açıkça “Evet, yalnız ilk klip için 20 kredi” onayı verdi. Yalnız **A→B** tek çıktı üretildi: Veo 3.1 Fast, 16:9, 1280×720, 24 fps, H.264, gerçek dosya süresi 7,93 sn (UI 8 sn). Bakiye **250→230** olarak hesap panelinde doğrulandı. Kullanım **20/20 kredi**, kalan onaylı bütçe **0**; başka klip/yeniden üretim yapılmadı.

Klip Flow'da “01 · Ağaç → Dal · İlk deneme” adıyla hazır. Özgün dosya `output/flow-keyframes/A-B-ilk-deneme.mp4` (7.390.220 bayt; SHA kayıtlı), ses eklenmeden/renk dönüşümü olmadan video akışı kopyalanan inceleme sürümü `A-B-onizleme.mp4`. Sekiz örnek karede kademeli dolly-in incelendi; bu kontrol kullanıcı medya onayı değildir. Yeni klip public/runtime'a bağlanmadı. Açılış hâlâ önceki onaylı zeytinlik dizisini kullanır.

Diğer üç geçişin aynı dosyaları paylaşan ilk/son referansları hazır; ücretli üretimleri yetkili değildir. Kullanıcı away iken soru sorulmaması isteği doğrultusunda yeni harcama yapılmadan bağımsız site/panel/AEO işleri tamamlandı.

## Tarihçe: kullanıcı devam isteği ve önceki üretim engeli
Kullanıcı ilk klibi kabul edip kalan üç geçişi aynı ilk/son kare yöntemiyle istedi. Ekrandaki ücret yeniden 20 kredi/klip, Veo 3.1 Fast / 8 sn / 720p / 16:9 / x1 olarak doğrulandı; bu üç çıktı için ek sınır 60 kredi, toplam kapsam 80 kredidir. Bu yetki önceden ayrı kalan üç geçişi açar; sınırsız tekrar yetkisi değildir.

B→C kareleri kitaplıktan seçildi ve gerçek görsel içeriği/hash ile doğrulandı. Üç normal üretim denemesi (yenileme, yeni kare seçimi, Flow'un Yeniden dene işlemi) Google'ın olağan dışı etkinlik/reCAPTCHA bağlantı engeliyle başarısız oldu. CAPTCHA çözülmedi veya atlanmadı; tarayıcı güvenlik/uzantı ayarları değiştirilmedi. Son bakiye **230**, bu aşamadaki ek kredi kullanımı **0**, yeni çıktı **0**. C→D ve D→F istemleri/kare eşleşmeleri kaydedildi, engel sürerken ücretli istek gönderilmedi.

Tam üç istem `docs/referans/flow-keyframes.json` içinde; adaylar ve Flow hazırlık ekranı yerelde korunur. Çalışma Google doğrulaması düzeldikten sonra aynı projeden sürdürülür. Diğer site/üyelik kodu değiştirilmedi.

## Task160: yetkili üç üretim tamamlandı

Doğru proje 62040049-3473-446b-9d93-8e6cbc45f8bc yeniden bağlandı; taze bağlantıda önceki Google uyarısı yoktu. CAPTCHA atlama veya güvenlik ayarı değişikliği yapılmadı. Önceki kalan 60 kredi yetkisiyle aynı ilk/son kare yöntemi: Omni 1.1 Flash, 720p, 8 sn., 16:9, x1, **12 kredi/çıktı**. Üç yetkili istek birer kez gönderildi; ek deneme/yeniden soru yok.

- **B→C COMPLETE:** Yeni ad **02 · Dal → Hasat · İlk ve Son Kare**, edit14b58a33-3456-4079-bbc3-e333c3778abc; eski başlık Worker picking olive from branch.
- **C→D COMPLETE:** Yeni ad **03 · Hasat → Yağ · İlk ve Son Kare**, editf9e32461-7e8c-4888-89fa-eed523279578; eski başlık Worker lowers olive basket.
- **D→F COMPLETE:** Flow başlığı **04 · Yağ → AFİNA · İlk ve Son Kare**, edit426cfaef-2cc2-4bd1-8f94-9a556b57345a.

Yeni harcama **36 kredi**; hesap **230→194** doğrulandı, kanıt `.cache/task-160/flow-194-credit-balance.png`. İlk kabul edilmiş20ile toplam 56kredi; özgün 80 toplam tavanın 24 kredisi kullanılmadı. Bu fark yeni deneme/tekrar yetkisi değildir. Eski üç blocked deneme/0 harcama tarihçesi JSON history içinde korunur.

Tam gönderim metinleri `docs/referans/flow-keyframes.json` içindeki değişmeden korunmuş `remainingTransitionPrompts` ve yeni `continuationCandidates[].exactPrompt` alanlarındadır; ilk/son kare hash'leri de aday kaydında. Üç dosya output/flow-keyframes/{B-C,C-D,D-F}-omni-first-last.mp4 olarak indirildi. Teknik hash/görsel inceleme kaydı tamamlanır; kullanıcı medya kabulü henüz yok. **Üç yeni klip adaydır; public/runtime'a bağlanmaz.** Sitede yalnız önceki kabul edilmiş A→B türevi vardır.

## Yeni dosyaların teknik doğrulaması

Üçü de H264/1280×720/24fps/192 görüntü karesi; video8,000sn., container8,042667sn. AAC kuyruğu içeriyor. Bunlar muted runtime türevi diye sunulmaz. Dosya byte/hash değerleri yerelde tekrar eşleşti; tam kayıt JSON ledger'dadır.

| Dosya | Bayt | SHA256 |
|---|---:|---|
| B-C-omni-first-last.mp4 |4042969|7bbc5e04f459932422b2ae505bf713c41bbbbbee58aec6c6d785937a434045a0|
| C-D-omni-first-last.mp4 |4520710|9ebfae531e048b1ff60c386a0b494c768701b9d9ce4f10db8fbfa684781312a6|
| D-F-omni-first-last.mp4 |4522406|750a57b22184c04e64ea48043d1f2b1b09a695eaf71255a128316c9a0bfb3887|

Tamamlanmış dört Flow kartı kanıtı `.cache/task-160/flow-all-four-complete.png`; yeni üçlü için özel görsel inceleme ve kullanıcı onayı ayrıdır. İlk A→B runtime onayı yeni kliplere otomatik taşınmaz.

## Yeni Flow adaylarının görsel sonucu

Altı zaman örneği/klip ile18kare, üç contact sheet ve özgün F ambalaj referansı incelendi. **B→C ve C→D kullanıcı incelemesine hazır aday**; tüm karelerde kusursuzluk veya kullanıcı kabulü iddiası yok. **D→F yayın için reddedildi:**4,79sn etiketsiz şişe,6,38sn sonradan oluşan etiket ve final küçük yazı bozulması. Üçü de public/runtime'a alınmadı; ilave ücretli tekrar yok. Ayrıntı `docs/scrollcraft/builds/afina-v8/FLOW-CANDIDATE-REVIEW.md`; kaynak SHA ve inceleme durumları Flow ledger/QA içinde. Canlı film kullanıcı onaylı A→B olarak kalır.

## Durum: ÜÇ ÜRETİM COMPLETE/İNDİRİLDİ; ÖRNEKLEM İNCELEMESİ TAMAM; İKİ ADAY KULLANICI ONAYI BEKLİYOR, D→F YAYINA UYGUN DEĞİL
