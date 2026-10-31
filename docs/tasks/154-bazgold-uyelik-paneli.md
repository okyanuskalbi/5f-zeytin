# Task 154: Bazgold referanslı AFİNA üyelik ve müşteri paneli

## Tür
fullstack, yerel uygulama ve migration hazırlığı

## Kullanıcı isteği
1 Kasım 2026: “üyelik sipariş vs tüm paneli bazgold projesindeki gibi yapabilirsin”. Paylaşılan görsel, çift sütunlu giriş/kayıt penceresi, Google seçeneği, şifre görünürlüğü ve misafir devamını gösterir. Kapsam müşteri üyeliği, hesap özeti, sipariş listesi/detayı, adres defteri, profil ve güvenliktir; admin/ödeme mimarisi değiştirilmez. Bazgold müşteri/veri/kimlik bilgisi kopyalanmaz; görseldeki saat markaları AFİNA'ya taşınmaz.

## Araçlar
21st ui-build (gerçek 20038 Auth Modal ve 39096 Split Sign In Form kaynakları alındı); mevcut shadcn Dialog/Input/Button; frontend-patterns, tdd-workflow, accessibility, backend-patterns, api-design, security-review, database-migrations, postgres-patterns.

## Uygulama
- AFİNA sol marka alanı + kırık beyaz sağ form, giriş/kayıt sekmeleri, modal ve doğrudan sayfa yolları.
- Var olan e-posta şifre/magic-link/kayıt doğrulaması, httpOnly çerez ve CSRF sınırı korunur. Google yapılandırılmadan sahte Google girişi sunulmaz.
- Hesabım, siparişlerim, adreslerim, hesap bilgilerim, güvenlik ve çıkış içeren müşteri kabuğu. 404 sipariş bağlantısı tamamlanır.
- Doğrulanmış kullanıcıya özel sunucu API; ID kullanıcı isteğinden alınmaz. Profil yalnız ad/telefon alanlarını günceller.
- Adres CRUD ve sipariş/satır okuması için yerel migration; açık REVOKE/GRANT, RLS, server-only tablolar; canlı DB'ye uygulanmaz. Ödeme oluşturma/tahsilat/callback/iş kuralı değişmez.
- Migration bulunmayan hedefte boş liste veya başarılı işlem uydurulmaz; güvenli hata/yeniden deneme gösterilir.

## Kabul
- RED/GREEN davranış testleri; sahiplik, CSRF, gövde sınırı, hatalar, form ve modal klavye/kapanış.
- Yerel bellek içi PostgreSQL migration/GRANT/RLS/kısıt/izolasyon testleri.
- npm test (en fazla 2 worker), lint, typecheck, build.
- Mevcut ayrı yetki kuralı nedeniyle tarayıcı/e2e/Lighthouse çalıştırılmaz. Live auth/Google/DB/push/deploy kabulü ayrı kanıttır.

## Coder Notu
- RED checkpoint: `672a939`; görsel üyelik kabuğu ve beş müşteri bölümü önce eksik olarak doğrulandı. Gerçek 21st 20038/39096 kaynakları mevcut Radix/shadcn ve AFİNA paletine uyarlandı. Yeni bağımlılık eklenmedi.
- Giriş/kayıt penceresi Navbar'dan tembel yüklenir; doğrudan /giris ve /kayit yolları korunur. Gerçek giriş başarılı olunca pencere kapanır; Escape ve tetikleyiciye odak dönüşü unit testinde doğrulandı. Google OAuth yapılandırılmadığı için seçenek kapalı ve açıklamalıdır.
- Yeni sunucu API'leri doğrulanmış oturumun kimliğini kullanır; adres işlemleri atomik RPC, sipariş listesi/detayı sahip filtresi ve sınırlı sayfalama kullanır. Profil rol/e-posta yazamaz; şifre değişimi önce mevcut şifreyi doğrular. CSRF, 8 KiB gerçek gövde sınırı, no-store ve güvenli hata mesajları test edildi.
- `20261101000005_customer_panel.sql` yalnız yerel PGlite üzerinde uygulandı. Üç server-only tabloda RLS + anon/authenticated REVOKE + service_role dört DML yetkisi; RPC EXECUTE yalnız service_role. Başkasının adresini değiştirme/silme, tek varsayılan ve 20 adres sınırı test edildi.
- Sipariş okuma sözleşmesi hazırdır; gerçek sipariş oluşturma/PayTR callback yazıcısı bu görev değildir. Task 044–050 ve canlı ticaret kabulü açık kalır. Hedef migration eksikliğini boş sipariş geçmişi gibi göstermez.
- Son tam kontrol: 82 dosya / 1143 test PASS; lint PASS; typecheck PASS; production build PASS. Yerel migration testleri ayrıca PASS. 21st kaynak incelemesi: 0 error, 0 warning, 39 info (belgelenmiş panel renk token'ları).
- Tarayıcı doğrulaması yapılmadı; e2e/Lighthouse/yerel site ekran görüntüsü çalıştırılmadı. Canlı migration, Google OAuth, gerçek ödeme/cihaz kabulü ve yayın yapılmadı. Üyelik yerel kod teslimi tamamlandı.

## Durum: TAMAMLANDI
