# Task 152: Google Flow ilk/son kare ve scroll filmi

## Tür
medya + mevcut frontend entegrasyonu

## İstek
Kullanıcı: yalnız Google Flow; ağaç → dal/zeytin → hasat → yağ akışı → onaylı AFİNA ambalajı. 1 Kasım son yön: kredi harcamadan önce before/after başlangıç-bitiş referansı. AtlasCloud kullanılmaz.

## Doğrulanan erişim
- Kullanıcının paylaştığı Chrome oturumunda Flow PLUS ve 250 kredi görüldü.
- Ayrı AFİNA çalışma projesi: https://flow.google.com/project/62040049-3473-446b-9d93-8e6cbc45f8bc
- Google Veo 3.1 Fast seçildi; 16:9, 720p, 8 saniye, tek çıktı. Ekran bu ayarda 20 kredi gösterdi.
- İlk sahne istemi yazıldı; Oluşturmaya başla düğmesine BASILMADI. 5 klip/100 kredi önerisi kullanıcı tarafından onaylanmadı; önce referans önizlemesi istendi.
- In-app browser farklı Google hesabındaydı; harcama yapılmadı. Üretim için kullanıcının belirttiği Chrome hesabı esas alınır.

## İş akışı
1. Altı anahtar kadraj belirle: A ağaç, B dal, C hasat, D yağ akışı, E ambalajla buluşma, F son AFİNA ürün kadrajı. Beş klipte A→B, B→C, C→D, D→E, E→F; bir klibin bitişi sonraki başlangıç karesiyle aynı dosya olmalı.
2. Mevcut onaylı ürün fotoğrafı/etiketini aynen koru. Temsili sahneler gerçek tesis/hasat belgesi değildir. Yeni fotoğraf/anahtar kare de ücretli ise önce kapsam+kredi sınırı al.
3. Her klip Flow'un Başlat/Bitir kare girişleriyle hazırlanır. Her ikisi görüntüde doğrulanmadan üretme. Tek çıktı; deneme/tekrar da kredi sınırına dahil.
4. Ortak ışık: açık orta ton, detaylı gölge, doğal yeşil/şampanya, okunur etiket, SDR. Mevcut SDR'ye ikinci ACES uygulanmaz. Statik ürün karesinde logo/etiket/gövde uydurma ve değiştirme yok.
5. Kullanıcı kareleri ve ardından üretilen videoyu onaylar. Yeni adaylar public dışında kalır. SHA/onay/sağlayıcı/istem/harcanan kredi kaydedilir.
6. Onaylı video → mevcut extract-frames.mjs → 1920/960 WebP + mevcut manifest şeması → ScrollFrameSequence. Scroll ileri/geri; autoplay veya body kilidi yok. Ürün/sepete ekle gerçek DOM kontrolleri.

## Mevcut durum
Kredi kullanımı: **0**. Yeni Flow video çıktısı: **0**. Onaylı yeni ilk/son kare seti: **0**. Başlangıç/bitiş referansları ve kredi onayı bekleniyor. Açılışta yalnız önceden onaylı zeytinlik kare dizisi kullanılır; bu dizi yeni Flow filmi diye sunulmaz.

## Durum: REFERANS ÖNİZLEMESİ HAZIRLANIYOR
