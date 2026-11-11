# Task 200: Yönetim paneli görünümü

> `docs/MASTER-PROMPT.md` **A4** aşaması (§11.3). Çelişkide MASTER-PROMPT geçerli.

## Tür
frontend

## Bağımlılık
199 TAMAMLANDI (`607d5ec`).

## Notlar (Claude, 11 Kasım)
- 199 sırasında `tests/e2e/admin-shell*` dosyasının 6 telefon beklentisi geçmedi (`docs/tasks/199-onyuz-tum-sayfalar.md` Coder Notu). Önce 199 öncesi kayıtta (`77406e5`) aynı testi çalıştırıp eski mi yeni mi olduğunu belirle; bu görevde yeşile çevir.
- Yerel test DB: çalıştıran `TEST_DATABASE_URL` verir (yerel Postgres `afina_kontrol189`). Yerel admin hesabını yalnız bu DB'de `npm run admin:grant` ile aç; canlı Neon'a bağlanma.
- Yeni yönetim görünümü 199'daki ön yüz tokenlarını ve `docs/DESIGN.md` köşe tablosunu kullanır; §14.1 kalite listesi panel için de PASS/FAIL (`output/task200/KANIT.md`).

## Amaç
`/admin` ve `/admin/urunler` görünümünü yenilemek. Referans: `~/Desktop/WB AI PROJELER ICIN/Admin paneli .JPG` (açık zemin, solda gruplu ikonlu menü, üstte arama, sade özet kartları, düzgün tablo). Referansın marka/metinlerini alma; AFİNA tokenları (`docs/DESIGN.md`) ile uyarla.

## Kullanılacak araçlar
`shadcn-ui` (resmî CLI: sidebar, table, card, dialog, input; varsayılan halde bırakma), 21st MCP, `ui-ux-pro-max`. İki seçenekli ayarlar açılır liste değil yan yana anahtar (toggle-group).

## Adımlar
1. Yerleşim: sol menü (Panel, Ürünler; ileride Siparişler/Müşteriler için yer, çalışmayan sayfa bağlantısı koyma), üst çubuk, içerik alanı. Telefonda menü çekmece.
2. Ürün listesi tablo + düzenleme penceresi aynı API ile; yalnız görünüm değişir.
3. Panel metinleri kısa (uzun açıklama yok).

## Kabul kriterleri
- [x] lint, typecheck, test, build PASS; yerel test DB'si ile admin girişli ekran görüntüleri 390/1440 `output/task200/`.
- [x] Girişsiz `/admin` hâlâ 401; API ve yetki mantığı değişmedi (diff'te `lib/auth`, `app/api/admin` yok).

## Yapılmaması gerekenler
Auth/yetki/DB değişikliği, push/yayın, `.env*`, `node_modules`/`.next` silme.

## Coder Notu (Codex)

11 Kasım2026. Başlangıç b139161; yalnız yönetim görünümü uygulandı.
Panel/Ürünler gerçek bağlantıları, Planlanan Siparişler/Müşteriler alanı,
üst arama, AFİNA logosu, Fraunces/Figtree ve --sf renk/köşe sistemi,
sade veri-yok özetleri, okunur ürün tablosu ve telefonda tek sütunlu
Radix düzenleme penceresi tamamlandı. Göster/Gizle yan yana anahtar;
mevcut kaydetme/doğrulama/sıralama/sayfalama sözleşmeleri korunur.

199öncesi77406e5te aynı admin-shell testi çalıştı:10kontrolün5'inde
telefon arama/odak sorunu vardı.199notundaki6ile sayı eşitliği iddiası yok;
sorun önceki sürümde de doğrulandı. Arama sonucu kaldırıldıktan sonra
odak aktarılır;çekmece kapanış odağı ayrı tutulur. Son tekrar20/20PASS. Kayıt sonrası modal kapanışındaki ayrı odak
sorunu ek tarayıcı testiyleRED doğrulandı; kapanış hedefi ref ile tutulur,
başarıda bildirim ve iptalde açan düğme odaklanır.

Yeni davranış için önce2RED,sonraGREEN. Yerel Postgres etkin147dosya /
1284test,lint,typecheck,Turbopack build ve diff--check PASS.26yönetim
tarayıcı testi PASS. Gerçek yerel kayıt→admin:grant→giriş, yeni taslak
POST201 ve stokPATCH200/readback doğrulandı. Girişsiz/admin ve ürünAPI401.
Girişli22profil:320/390/768/1024/1440/2560,menü,düzenleme ve390×500
reduced/darkOS;axe0,taşma0,kesişim0,kırık görsel0,küçük hedef0,CLS0.
390/1440görüntüler ve §14.1oniki maddePASS: `output/task200/KANIT.md`.
Fiziksel cihaz/WebKit/tüm siteA7kabulü değildir.

Kullanılan rehberler: güncel ui-ux-pro-max,frontend-design,better-layout,
better-typography,better-colors,motion-framer,shadcn-ui,
responsiveness-check,audit-ai-design-slop,web-design-guidelines.
21st search/get_component28770 gerçek kaynak; sol menü/içerik/özet
kuruluşu marka tokenlarına uyarlandı. CLIview sidebar/table/card/dialog/
input/toggle-group incelendi; mevcut kurulu parçalar kullanıldı,ekpaket yok.
UIPro6/3/4admin çıktısındaki aykırıglass/font/GSAP önerileri reddedildi.
Yeni süs/giriş/scroll animasyonu yok;ortak düğme basış tepkisi korunur,
azaltılmış harekette kapalı. Kaynaklar ve denetim output/task200/sources,
PLAN.md ve DENETIM.md içinde.

`lib/auth`, `app/api/admin`, `app/api`, `lib/db`, `app/admin` diff'i yok.
Yalnız verilen TEST_DATABASE_URL/afina_kontrol189kullanıldı;geçici yönetici
ve ürün temizlendi. .env*okuma/yazma,push,yayın,canlıDB yok.
Proje node_modules/.next korundu. AFINA-KAYNAK/output kayda eklenmedi.
Açılan başsız Chromium,Next ve HTTPS test sunucuları kapatıldı.
Tek yerel kayıt: `feat: 200 yönetim paneli görünümü`.

## Durum: TAMAMLANDI
