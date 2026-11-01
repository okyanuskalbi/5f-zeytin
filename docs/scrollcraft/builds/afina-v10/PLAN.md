# v10 uygulama planı ve kararlar

## Uygulanan sıra
Kullanıcı brief'i → 21st kaynak incelemesi/UIPro design-system → RED davranış
testi (1c3b129) → yeni sahneler → React Bits kaynak/lisans uyarlaması → GREEN.

| Sahne | Duygu | Mekanik | Native alternatif |
|---|---|---|---|
| Açılış | Merak | Kısa sticky, ayrı film/ön dal | Başlık ve film alt alta |
| Üretim hikâyesi (zirve) | Yakınlık/güven | Üç bölümde sabit fotoğraf değişimi, hafif ölçek | Üç normal metin/fotoğraf |
| Gerçek tesis | Somut güven | İzole fotoğraf parallax | Normal fotoğraf |
| Ürünler | Seçim | Lineer yatay raf, gerçek kontrol | Native yatay rail |
| İşletme | Uygunluk | Gerçek segment seçimi, bir kez kelime hareketi | Aynı metin/eylemler |
| Teklif | Kararlılık | Kullanıcı gönderimli gerçek e-posta taslağı | Doğrudan kurumsal iletişim |
| Kapanış | Sıcaklık | SSS/adres ve sakin kapanış | Aynı açık içerik |

Yeni gramer görsel olarak incelenmediği için fingerprint 4/6 PASS veya feel-check
başarısı henüz iddia edilmez; FINGERPRINTS.md yayın satırı eklenmedi. Piksel,
ara durum, kısa telefon ve klavye kabulünden sonra yeniden değerlendirilir.

## Teknik sınırlar
Yalnız frontend ve projeye yerel araç kurulumu. Default Turbopack bu oturumun
localhost sınırında ilerlemedi; webpack ile aynı uygulama production derlendi.
Webpack'in CSS Modules pure selector kontrolü nedeniyle mevcut üç document
kuralı aynı koşul/değerlerle globals.css'ye taşındı. /giris props'undaki
varsayılan {} Next'in üretilen PageProps tipini optional yaptığı için kaldırıldı;
ikisi de davranış değişikliği değildir. Default build scripti değiştirilmedi.
