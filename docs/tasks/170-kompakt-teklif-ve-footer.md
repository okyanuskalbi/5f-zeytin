# Task170 — Tek ekrana sığan teklif ve kompakt footer

## İstek ve kapsam
Kullanıcı teklif bölümünün tek ekranda görünmesini, 21st.dev kaynaklı olmasını;
footer'ın da 21st.dev'den değiştirilip biraz daha küçültülmesini ve sonucun
canlıya alınmasını istedi.

- 21st27904 Centered Contact Form: küçük başlık, iki sütunlu etiketli alanlar,
  ince çerçeve ve belirgin eylem; AFİNA'ya uyarlanan mevcut gerçek talep akışı.
- Masaüstünde üç alan satırı; telefon/ülke ve şehir/ilçe mevcut kontrollerdir.
  Küçük ekranda alanlar doğal akışta, 16px metin ve44px hedeflerle erişilir.
- Form özeti/KVKK, il değişiminde ilçe sıfırlama, telefon doğrulaması ve gerçek
  manuel mailto sözleşmesi korunur. Demo gönderildi mesajı/24saat vaadi yok.
- Kompakt footer gerçek marka/iletişim/yasal/üyelik/sepet/e-posta akışlarını korur.
- Katalog, fiyat, stok, ödeme, auth, DB ve sağlayıcı ayarları değişmez.

## Araçlar / kabul
21st-ui-build, frontend-patterns, mevcut davranış testleri; headless paketli
Chromium≤2worker, responsive görünürlük/taşma, ilçe sıfırlama, form doğrulama,
footer hedefleri. Tam lint/typecheck/unit/build sonrası main push ve doğrudan
Vercel REST API yayını; GitHub Actions yalnız doğrulama yapar.

## Doğrulama ve uygulama notu
- 21st gerçek kaynakları alındı, SHA/provenans kayıtları quote-170-source.json ve
  footer-170-source.json içinde. Yeni bağımlılık, görsel veya ücretli üretim yok.
- Masaüstü1366×768 teklif yüksekliği1184,3→610,7px;1280×720 ekranda bütün bölüm
  alt sınırı714,3px. Footer520,4px.390/320px ekranda yatay taşma yok, doğal kaydırma.
- Üretim derlemesinde5 viewport/40 headless kontrol PASS: form validasyonu,
  il değişince ilçe temizlenmesi, ülke seçimi ve yalnız yerel mailto taslağı;
  footer hedefleri/44px, galeri scroll+End ve üyelik modal ESC/odak geri dönüşü.
- Gerçek tarayıcıda bulunan ülke ad/sıra ICU hydration uyumsuzluğu dar kapsamda
  giderildi. tr/en/ru gerçek hydrateRoot regresyonları önce RED, sonra GREEN.
- 109dosya/1300 mevcut unit ve yeni3 hydration testi PASS; tam ESLint/typecheck,
  Turbopack production build/varlık kontrolleri PASS; odaklı telefon8test PASS.
- Bağımsız kod incelemesinde regresyon yok. Yerel21st CLI mevcut olmadığından
  `21st review` çalışmadı; gerçek kaynak, diff, test ve tarayıcı incelemesi yapıldı.
- Test tarayıcıları browser.close(), iki yerel sunucu SIGTERM ile kapatıldı.
  Fiziksel cihaz, gerçek hesap/ödeme veya e-posta teslimi kabulü değildir.

## Yayın işlemi
Main push ve Vercel REST API yayını bu değişiklik için yetkilidir. Exact-commit
Actions lint/typecheck/unit/build başarılı olmadan deployment oluşturulmaz.
Yürütme makbuzları `.cache/task-170/{ci-result,deployment-status}.json`, son canlı
UI kanıtı `.cache/task-170/qa-live-*/report.json` yoluna yazılır. Bu kaynak
commit'i yalnız yukarıdaki tamamlanmış yerel kabulü kaydeder; READY ve canlı
kontrol sonucu ayrı yayın makbuzuyla doğrulanır.

## Durum: UYGULAMA VE YEREL KABUL TAMAMLANDI
