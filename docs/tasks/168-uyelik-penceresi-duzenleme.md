# Task 168: Üyelik penceresinin düzenlenmesi

## Kullanıcı isteği
Canlı giriş penceresi ekran görüntüsünün düzenlenmesi. Onaylı v12 sayfa kurgusu korunur.

## Kapsam
- Giriş/kayıt formu kompakt bir hiyerarşiyle; kısa ekranda içerik kayar, kapatma kontrolü görünür kalır.
- Henüz bağlı olmayan Google OAuth seçeneği arayüzden kaldırılır; sağlayıcı ayarı değiştirilmez.
- KVKK bilgilendirmesi formun altındadır; kayıt onayları korunur.
- Üyelik penceresindeki giriş/kayıt geçişi pencere içinde kalır. Ayrı sayfalardaki bağlantılar korunur.
- Gerçek parola, e-posta bağlantısı, kayıt, yönlendirme, hata, Escape ve odak davranışları korunur.
- Mobilde marka logosu, 16px giriş alanları ve en az44px dokunma hedefleri.

## Araçlar ve kabul
Mevcut 21st kaynaklı üyelik bileşenleri ve Radix dialog yeniden kullanılır. ECC frontend-patterns; mevcut Vitest davranış kontrolleri, lint/typecheck/build. Başlatılabilirse yalnız paketli headless Chromium, en fazla2 worker; canlı işlem yapılmaz.

## Önceki yayın
v12 kaynak782af321, CI41346485610 SUCCESS, REST dağıtımıdpl_J9muAjiHNwqwSJauFjJEXoAJcAy8 READY; afinazeytin.com bağlı. Taze HTTP200, yedi sahne/altı ürün/footer/cam menü/telefon alanı, giriş sayfası ve ülke/ilçe API okumaları doğrulandı. Etkileşimli tarayıcı kabulü yapılmadı.

## Doğrulama
- 108 dosyada 1291 unit PASS; lint/typecheck ve webpack production build PASS.
- Google seçeneğinin yokluğu, KVKK sırası, gerçek form/session akışları,
  modal içinde giriş/kayıt geçişi, değiştirilmiş tıklamalar, Escape/odak ve
  kapatmanın kaydırma gövdesi dışında kalması davranış testleriyle doğrulandı.
- İzole gerçek React önizlemesi `.cache/task-168/preview-auth.html` hazırdır;
  auth POST işlemleri kapalıdır. Ekran görüntüsü veya canlı işlem kabulü değildir.
- Paketli headless Chromium üç denemede başlatılamadı; etkileşimli/görsel
  tarayıcı kabulü yapılmadı. Kullanıcının Chrome uygulaması test için açılmadı.

## Canlı doğrulama
Kullanıcının çalıştırdığı REST yayını f4be7eb kaynağını
dpl_5WuqjSSTMZo1SrAt1MekJPjdZUfT ile READY durumuna getirdi; ana domain bağlı.
Taze uzak tarayıcıda hem /giris hem ana sayfadaki Hesabım modalinde yeni
metin/toolbar, Google seçeneğinin yokluğu ve KVKK'nın formdan sonra geldiği
doğrulandı. Modal kaydırma gövdesi auto, Kapat bu gövdenin dışında.
Kanıt: docs/referans/yayin-uyelik-168-20261101.json.
Kullanıcının eski açık sekmesi incelenmedi; tam responsive/klavye ve fiziksel
cihaz kabulü bu dar canlı DOM kontrolüyle eşitlenmez.

## Durum: YAYINLANDI; CANLI FORM/MODAL DOĞRULANDI, TAM RESPONSIVE KABUL BEKLİYOR
