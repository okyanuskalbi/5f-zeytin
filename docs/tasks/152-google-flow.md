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

## Mevcut durum
Kullanıcı “Flow’a her sahnenin ilk ve son görselini verelim” diyerek yöntemi netleştirdi. Beş referansın tamamı Flow proje kitaplığına yüklendi. A ve B, Başlat/Bitir alanlarında ayrı ayrı seçilip görüntüde doğrulandı.

Ardından kullanıcı açıkça “Evet, yalnız ilk klip için 20 kredi” onayı verdi. Yalnız **A→B** tek çıktı üretildi: Veo 3.1 Fast, 16:9, 1280×720, 24 fps, H.264, gerçek dosya süresi 7,93 sn (UI 8 sn). Bakiye **250→230** olarak hesap panelinde doğrulandı. Kullanım **20/20 kredi**, kalan onaylı bütçe **0**; başka klip/yeniden üretim yapılmadı.

Klip Flow'da “01 · Ağaç → Dal · İlk deneme” adıyla hazır. Özgün dosya `output/flow-keyframes/A-B-ilk-deneme.mp4` (7.390.220 bayt; SHA kayıtlı), ses eklenmeden/renk dönüşümü olmadan video akışı kopyalanan inceleme sürümü `A-B-onizleme.mp4`. Sekiz örnek karede kademeli dolly-in incelendi; bu kontrol kullanıcı medya onayı değildir. Yeni klip public/runtime'a bağlanmadı. Açılış hâlâ önceki onaylı zeytinlik dizisini kullanır.

Diğer üç geçişin aynı dosyaları paylaşan ilk/son referansları hazır; ücretli üretimleri yetkili değildir. Kullanıcı away iken soru sorulmaması isteği doğrultusunda yeni harcama yapılmadan bağımsız site/panel/AEO işleri tamamlandı.

## Durum: İLK KLİP HAZIR (20/20 KREDİ); DİĞER KLİPLER VE SİTE MEDYA KABULÜ AÇIK
