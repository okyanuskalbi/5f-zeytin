# Neon temiz başlangıç — Task 187 çalışma planı

9 Kasım 2026 / Düzeltme 186-2: Kullanıcı eski verilerin taşınmasına gerek olmadığını
belirtti. Neon'da boş veritabanıyla başlanır. Eski kullanıcılar, şifreler, oturumlar,
adresler ve siparişler taşınmaz. Yeni üyelik Better Auth'un kendi şifre biçimini
kullanır. Tarihsel Supabase SQL kayıtları yeni hedefte çalıştırılmaz.

Bu belgenin hazırlık adımları Task 186'da yazıldı; o görev kapsamında gerçek
Neon/Supabase bağlantısı, Vercel ayarı ve yayın yapılmadı. Task 187 uygulaması
alttaki yürütme kaydında izlenir. Yerel testler yalnız TEST_DATABASE_URL kullanır.

## Ortam ve hedef

1. Ayrı Task 187 yetkisiyle Neon hedefinin sahibi, maliyet sınırı ve Frankfurt
   bölgesi (`fra1`) doğrulanır. Boş hedef ve geri dönebilecek önceki yayın belirlenir.
2. Çalışma bağlantısı için havuzlu DATABASE_URL; şema, başlangıç verisi ve yönetici
   komutları için doğrudan DATABASE_URL_UNPOOLED kullanılır. Bağlantılar yalnız
   sunucuda tutulur. Tarayıcı veritabanına bağlanmaz, yetki denetimleri sunucudadır.
3. BETTER_AUTH_SECRET en az 32 karakterlik rastgele bir değer olmalı.
   BETTER_AUTH_URL hem önizlemede hem yayında HTTPS adresi olmalı. Üretimde
   https://afinazeytin.com kullanılır; www yönlendirmesi ve güvenilir kökenler
   kontrol edilir. Önizlemede yalnız VERCEL=1 ve VERCEL_ENV=preview birlikteyken
   Vercel'in verdiği kesin VERCEL_URL kullanılır; istek Host başlığına veya
   joker alan adına güvenilmez. Bozuk/eksik önizleme adresi üyeliği kapalı tutar.
   Çerezler httpOnly/sameSite=lax; üretimde secure'dur.
4. **Vercel fonksiyon bölgesi Task 187'de `fra1` yapılır**; Neon `fra1` ile aynı
   yerde olmalıdır. Task 186'da bu ayar değiştirilmedi; Task 187'de ayrı yetkiyle
   güncellenir. Fonksiyon bölgesi ayarı bir production yayını değildir.
5. SMTP_HOST/PORT/USER/PASSWORD/FROM ile gönderim servisi hazırlanır.
   AUTH_REQUIRE_EMAIL_VERIFICATION varsayılan true'dur. Bu durumda yeni kayıt
   e-postayla doğrulanır; gönderim servisi eksikse açık hata gösterilir.
   SMTP hazır olana kadar açıkça false seçilirse yeni üye doğrulama beklemeden
   şifresiyle giriş yapabilir. E-posta bağlantısıyla giriş yine SMTP gerektirir.
   SMTP kabulünden sonra doğrulama true'ya alınır; önceden doğrulanmamış üyelerin
   yeniden girişte doğrulama gereksinimi ayrıca kontrol edilir.
6. GOOGLE_CLIENT_ID ve GOOGLE_CLIENT_SECRET birlikte varsa Google düğmesi görünür.
   Yayın dönüş adresi https://afinazeytin.com/api/auth/callback/google; HTTPS
   önizleme için onun kendi dönüş adresi de Google Console'da hazırlanmalıdır.

## Boş hedefi hazırlama

Bu bölümdeki komutlar yalnız Task 187 yetkisiyle doğrulanmış hedefte çalıştırılır.
Yerel doğrulamada TEST_DATABASE_URL yalnız localhost sunucusunu gösterebilir;
aynı sunucuda ayrı boş veritabanları kullanılabilir.

1. `npm run db:migrate` çalıştırın. Tekrar çalıştırıldığında bekleyen değişiklik
   olmamalı. Dosya özetleri schema_migrations içinde denetlenir; uygulanmış SQL
   dosyaları değiştirilmez. Şema çalıştırıcısı doğrudan bağlantıyı tercih eder.
2. `npm run db:seed` planı gösterir; varsayılan kuru denemedir, hedefe yazmaz.
   Kaynak lib/catalog/static-products.ts içindeki altı üründür; ad, kategori,
   boyut, fiyat, stok, gösterim ayarları ve sıra kaynakla eşleşir. Mevcut temsili
   fiyat/stok verileri aynen kullanılır; bunlar gerçek ticaret onayı değildir.
3. Planı inceleyip `npm run db:seed -- --apply` çalıştırın. İşlem kimlikle ekleme/
   güncelleme yapar; silmez. Aynı kaynakla ikinci çalıştırma değişiklik yapmamalı.
   Yönetim panelinde düzenlenmiş değerleri yeniden kaynak değerine getirebileceği
   için bu komut sürekli eşitleme veya zamanlayıcı olarak kullanılmaz.
4. İlk yönetici olacak kişi kendi e-postası ve kendi şifresiyle normal kayıt olur.
   SMTP hazır değilse bu kayıt için geçici doğrulama ayarı false kullanılabilir.
   Komut şifre oluşturmaz; kayıt olmamış adres için yetki oluşturulmaz.
5. DB erişimi olan yetkili operatör doğrudan bağlantıyla
   `npm run admin:grant -- --email <adres>` çalıştırır. Komut mevcut kullanıcıyı
   admin_users'a ekler ve e-postasını doğrulanmış işaretler; iki değişiklik tek
   işlemde gerçekleşir. Bu operatör işlemi e-posta sahipliği kontrolünün yerini
   alır; verilen adresin doğru kişiye ait olduğunu önceden doğrulayın.
   Kullanıcı yoksa açık hata verir. Şifre üretmez, okumaz, ekrana yazmaz.
6. İlk yönetici normal giriş yaparak ürünleri görüp düzenleyebilmelidir. Başka bir
   üyenin aynı işlemi yapamadığı ve yönetici kaydı kaldırıldığında erişimin hemen
   kesildiği doğrulanır. Kullanıcı tablolarından kendi kendine yetki verilemez.

## Yayından önce kabul

- `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build` geçmeli.
  TEST_DATABASE_URL verilmişse testlerin başlangıcında şema hazırlanır; boş
  veritabanıyla tüm testler geçmelidir. Verilmemişse yalnız gerçek veritabanı
  isteyen dosyalar açık mesajla atlanır; diğer testler yine çalışır. Atlanan
  dosyalar gerçek veritabanı kabulü yerine geçmez.
- HTTPS önizlemede `/api/products` yanıtı HTTP 200, source=database ve **altı
  ürün** içermeli. Boş yanıt veya source=static kabul edilmez; başlangıç verisinin
  uygulandığı doğrulanır. Altı ürün, sıra ve sıfır stoklu ürünün davranışı incelenir.
- Kayıt → giriş → oturum → çıkış, doğrulama true/false durumları, profil/şifre
  değişikliği, yanlış şifre, e-posta bağlantısının tek kullanımı kontrol edilir.
  IP sınırına ek olarak aynı e-posta/hesaba farklı IP'lerden gelen denemeler de
  ortak veritabanı sayacı ve artan beklemeyle sınırlandırılır. Hesabın bulunup
  bulunmadığı sayaç yanıtından anlaşılmamalıdır.
- Başka müşterinin adres/siparişine erişimin reddi, varsayılan adres ve silme
  davranışı, yönetici olmayanın ürün değişikliği reddi doğrulanır.
- .next/static dosyalarında bağlantı dizesi veya BETTER_AUTH_SECRET bulunmamalı.
  Gerçek posta teslimi, Google dönüşü, telefon/tarayıcı görünümü ayrı kabul edilir.
- Ayrı yayın yetkisi sonrası Vercel ortamı ve `fra1` fonksiyon bölgesi hazırlanır,
  doğrulanan kaynak yayınlanır. Yeni veritabanı alışveriş/ödeme akışlarının ayrıca
  kabulünü gerektirir; bu kod görevi gerçek ödeme veya sipariş denemesi değildir.

## Geri dönüş

1. Yetki veya veri sorunu varsa yeni yazımları durdurun. Yeni Neon verilerinin
   yedeğini alın; projeleri silmeyin ve schema_migrations geçmişini değiştirmeyin.
2. Önceki doğrulanmış uygulama ve ortam ayarlarına dönüş ayrı yetkili işlemdir.
   Yeni başlangıçta oluşan üyeler/siparişler önceki veritabanında bulunmaz.
   Bunlar korunup uzlaştırılmadan eski uygulamada alışveriş yazımlarını açmayın.
3. Yeni üyelik oturumlarının eski uygulamada çalışacağı varsayılmaz. Hesapların
   güvenli yeniden kayıt/doğrulama ve sipariş erişimi planı hazırlanmalıdır.
4. Alan adı, giriş, katalog ve hesap okumaları kontrol edilir. Veritabanı silme
   veya otomatik ters SQL ile geri dönüş yapılmaz.

## Resmî kaynaklar

- [Better Auth e-posta ve şifre](https://better-auth.com/docs/authentication/email-password)
- [Better Auth hız sınırı](https://better-auth.com/docs/concepts/rate-limit)
- [Neon Node.js bağlantısı](https://neon.com/docs/guides/node)
- [Neon ve Vercel](https://neon.com/docs/guides/vercel-overview)
- [Vercel önizleme oluşturma](https://vercel.com/docs/rest-api/deployments/create-a-new-deployment)
- [Vercel otomasyon erişimi](https://vercel.com/docs/rest-api/projects/update-protection-bypass-for-automation)

## Task 187 yürütme kaydı — 9 Kasım 2026

- Neon kodu ana çalışma ağacına alındı; C ana sayfa, menü, hesap simgesi, bayilik
  ve telefon/il bileşenleri korundu. Runtime Supabase başvurusu kalmadı.
- Ortam örneğindeki 17 değişkenin tüm değerleri boş. Gerçek gizli değerler
  dosyalara veya komut satırı argümanlarına yazılmadı; yalnız bellekte kullanıldı.
- Güçlü üyelik sırrı Vercel'de encrypted olarak production ve preview ortamlarına
  tanımlandı. Production üyelik adresi https://afinazeytin.com; önizleme kesin
  dağıtım adresini kullanır. AUTH_REQUIRE_EMAIL_VERIFICATION iki ortamda false.
  SMTP eklenmedi. Supabase değişkenleri geri dönüş için korundu.
- Fonksiyon bölgesi ve functionDefaultRegions Frankfurt/fra1 olarak geri okundu.
- Neon'da üç migration uygulandı ve altı ürün eklendi. İkinci migration koşusu
  bekleyen değişiklik bulmadı; ikinci seed ürün/öneri değişiklik sayıları 0/0.
- Preview ve production aynı Neon bağlantısını ve veritabanını kullanır; ayrı
  önizleme branch'i yoktur. Deneme hesabı ve bağlı kayıtların silinmesi zorunludur.
- Yerel PostgreSQL ile 1.363 test PASS. Bağlantısız 1.337 PASS/26 beklenen skip;
  lint/typecheck/Turbopack build/görsel dosya kontrolleri PASS. Kapsam: satır
  %87,98, dal %85,98, fonksiyon %82,50, ifade %85,52. Runtime paket denetimi 0 açık.
- Kaynak, görev çıktıları ve tarayıcıya gönderilen derleme dosyalarının gerçek
  sırlarla bellek içi karşılaştırmasında eşleşme bulunmadı. Ekran kayıtları,
  istek başlıkları, HAR ve oturum dosyaları kaydedilmez; yalnız sırsız görüntüler.
- Production geri dönüş dağıtımı dpl_HckKC2sMZ6CVuXEMED25fLufsR8w olarak korunur.
  Production yayını ve alan adı değişikliği bu görevin kapsamı dışındadır.

İlk önizlemede yeni oturum doğru oluştuğu halde giriş ekranında kalma bulundu.
Aynı oturumla doğrudan hesap sayfası ve adresler çalıştı; neden eski anonim
yönlendirmenin tarayıcıdaki sayfa kaydından kullanılmasıydı. Başarılı şifreli
giriş artık yalnız izinli hedefi yeni sayfa olarak açar. Görünüm değişmedi;
önce 11 başarısız test, sonra gömülü pencere dahil 40/40 hedefli test doğrulandı.

Son doğrulanmış önizleme: https://afina-zeytin-5324gem0v-afina1.vercel.app
Kaynak: `977dc9d872c5f99e668e05009ae067eaf475170a`; GitHub kontrolü
42692971572 SUCCESS; dağıtım `dpl_AS4i7wsp5zUw6VynPB3MjsY7ASfn` READY/fra1.
Son tarayıcı koşusunda 16/16 PASS ve dokuz görüntü alındı. Önizlemede oluşturulan
hesap aynı Neon bağlantısında bulunup silindi; bağlı oturum/kimlik/adres ve hesap
sayaçları 0 olarak doğrulandı. Böylece ortak veritabanı da fiilen doğrulandı.
Gerçek önizlemenin sayfası ve yüklenen 23 JavaScript dosyası bellekte sırlarla
karşılaştırıldı; eşleşme yok. Production alan adı ve dağıtımı değişmedi.
Task 187'nin A–D kabulü tamamdır; production yayını bu kaydın parçası değildir.
