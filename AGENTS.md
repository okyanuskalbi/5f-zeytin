## AKTİF TASARIM SÖZLEŞMESİ (12 Kasım 2026) — bu bölüm aşağıdaki eski tasarım paragraflarının üstündedir

- Ön yüz tasarım dili **v3 "Altın Dal"**: `docs/DESIGN.md` (bağlayıcı) + `docs/MASTER-PROMPT.md` v2.0. Görevler `docs/tasks/204`–`207`.
- Yazı: Cormorant (başlık) + Montserrat (gövde, arayüz, düğme). Fraunces, Figtree, Inter kullanılmaz.
- Bütün düğmeler `components/storefront/ui/PillButton` (hap + altın madalyon); yeni düğme sınıfı yazma. Köşe ölçüleri yalnız DESIGN.md köşe tablosundaki 6 token.
- Bu dosyanın aşağısındaki v9/v11/"Hasat Rotası"/"Ellek sofrası" tasarım, token ve font paragrafları **tarihçedir**; çelişkide bu bölüm ve DESIGN.md geçerlidir. Güvenlik, yayın ve iş kuralları aynen geçerli.
- Önizleme PDF/video hazırlama (kullanıcı istemiyor).
- **Tek sayfa landing (12 Kas kararı):** `/` Ürünler, Hikâyemiz, Toptan & Bayilik, Blog özeti, SSS, İletişim bölümlerini taşır; menü `/#id`; eski sayfa adresleri 308. Kaydırmaya bağlı efekt yok. Ayrıntı `docs/tasks/208-tek-sayfa-landing.md`, `docs/DESIGN.md` "Sayfa yapısı".

## Aktif iş: Task177 / ilk açılış ve panel akıcılığı (3 Kasım 2026)

Kullanıcı Task176 salt okunur denetimindeki üç bulgunun düzeltilmesini istedi:
masaüstü ilk açılış sıçraması, canlı ana sayfa menü tonu ve CPU4 koşulunda
menü/sepet ilk açılış maliyeti. Kapsam docs/tasks/177-akicilik-ve-ilk-acilis-duzeltmeleri.md.
Onaylı tasarım, scroll/film, native/reduced/saveData/no-JS, altı SKU ve
ticari yetki sınırları korunur. Önce neden/RED, sonra dar düzeltme ve ölçüm.
Main push ve Vercel REST API yayını yetkilidir; Actions yalnız doğrulama.
Son doğrulanmış kaynak566aa63, CI41522131570 ve API
dpl_rddJwkhx837n2uiXZJsq6k5Ccsx2 READY; Task175 makbuzu tarihsel başlangıçtır.
Task177 nihai kabul kaynağı .cache/task-177/final-receipt.json olacaktır.

Task177 yerel kabul: 1.431unit/lint/typecheck/Turbopack PASS; üç cold desktop
CLS0,12profil64motion,9navbar/4scroll ve7galeri profili PASS. CPU4 ilkmodal
60–75ms sınırı sürer; kazançsız sepet preload deneyi geri alındı.

Task177 yayımlandı: kaynakc9640b4, CI41587703416 SUCCESS ve REST
 dpl_EMZxCvEJ4d93L1R7tMtWh38mcRTd READY; afinazeytin.com bağlı.
Canlı3coldCLS0,12profil64motion,9navbar/4scroll,7galeri PASS. CPU4panellerde
24aç-kapat/odak PASS, enuzunkare87.2ms; bazı sıcakmenü/seçici50msüstü.
Nihai makbuz .cache/task-177/final-receipt.json. Fiziksel cihaz kabulü yok.

## Önceki iş: Task175 / mobil galeri kontrol şeridini kaldırma (2 Kasım 2026)

Kullanıcının ekran görüntüsüyle istediği açıklama/sayaç/önceki-sonraki ok şeridi,
kompakt galeride (1023px ve altı) kaldırılır. CSS, hydration öncesinde de şeridi
gizler; yer ayırmaz. Ürün içi numara, dokunma/kaydırma/klavye, altı gerçek SKU,
CTA ve masaüstü galeri korunur. Task174 final6c0e151 API READY ve102canlı
kontrol PASS; makbuz .cache/task-174/final-receipt.json.
Task175 kabul/yayın makbuzu .cache/task-175/final-receipt.json hedefindedir.

## Aktif iş: Task174 / mobil öncelikli deneyim (2 Kasım 2026)

Kullanıcı daha kapsamlı mobil uyarlama, 21st.dev ve frontend skill incelemesi
istedi. Kapsam docs/tasks/174-mobil-oncelikli-deneyim.md: kompakt alt menü,
kısa ekranda görünür CTA, galeri kontrolleri, telefon form/picker/sepet düzeni.
Masaüstü ve mevcut animasyon/gerçek katalog/PayTR/manual mailto sözleşmeleri
korunur. 21st8343/31360/8297 incelendi; kaynak docs/referans/mobile-174-source.json.
Task173 3be79e5 yayımlandı; CI41505621413 SUCCESS ve REST
 dpl_4THkJ7HbKowJTtrqTyzRxcm74a4T READY. Canlı9viewport ikon/drawer PASS;
Device Hub Safari simülatörü açılış/menü/ürün/sepet ve yeniikon görüldü,
gesture kabulü kısmi. Makbuz .cache/task-173/final-receipt.json.

Task174 yerel kapıları PASS: 119dosya/1424unit; lint/typecheck/webpack build;
9profil/48mobil + 5viewport/45teklif + 12profil/63motion; navbar9viewport.
Dolu sepet 390/320/844yatay dönüşü, ilk gerçek tap, adet/silme ve odak PASS.
21st8343/31360/8297 ve frontend skill eşlemesi docs/referans/mobile-174-*.
İlk yerel kaynak makbuzu .cache/task-174/local-verification.json;
Task174 Device Hub ve canlı kabul henüz bu makbuzun parçası değildir.

Task174 ilk218843c API READY sonrası canlı kontrolde picker çeviri kayması bulundu.
Turbopack, CSS module `translate:none` sıfırlamasını optimize ederek kaldırıyor;
mobil selector'da Tailwind --tw-translate-x/y değişkenleri0px de sıfırlanır.
Son CSS düzeltmesi Turbopack build, 6 picker profili ve45/45 form kontrolü PASS;
ayrıca main/API yayını ve canlı QA gerektirir. UI kabulünde
webpack sonucu tek başına production Turbopack doğrulaması sayılmaz.
Nihai durumun kaynağı .cache/task-174/final-receipt.json olacaktır.

## Önceki iş: Task173 / sepet ikonu ve Device Hub (2 Kasım 2026)

Kullanıcı navbar sepet ikonunu ve canlı mobil sitenin Device Hub üzerinden
kontrolünü istedi. Kapsam `docs/tasks/173-sepet-ikonu-ve-device-hub.md`:
44×44 px sepet düğmesi, 22 px ShoppingCart ikonu, boş sepette gizli rozet,
pozitif adette sayaç ve 99+ sınırı; mevcut sepet/menü/üyelik akışı korunur.
Mevcut ikon değişimi yeni 21st bileşeni gerektirmez; frontend-patterns ve
tdd-workflow uygulanır. Yerel navbar kanıtı `.cache/task-173/nav-local/report.json`:
9 viewport, sepet aç/kapat/odak dönüşü, 4 scroll durumu ve fallback PASS.
117 dosya/1411 unit, lint, typecheck ve webpack build PASS; kod kapıları
`.cache/task-173/local-verification.json` ile kayıtlıdır. Main/API yayını sıradadır.

Device Hub (`com.apple.dt.Devices`) içindeki iPhone 17 Pro / iOS 26.5 Safari
SIMULATOR üzerinde canlı site, açılan menü, Ürünlerimiz hedefi ve ilk ürünün
fotoğraf/fiyat/CTA görünümü gözlendi. Bu Task172 yayınına ait kısmi kontroldür;
Task173 canlı ikon kabulü veya fiziksel telefon testi değildir. Diğer hareket,
rotation/klavye/reduced testleri bekliyor. Gerçek hesap/ödeme/e-posta işlemi yok.
Son yayın makbuzu hedefi `.cache/task-173/final-receipt.json`; hazır varsayılmaz.

## Önceki iş: Task172 / mobil scroll animasyonları (2 Kasım 2026)

Kullanıcı beğenilen masaüstü scroll ve animasyonlarını mümkün olduğunca
mobile istedi. Kapsam `docs/tasks/172-mobil-scroll-animasyonlari.md`:
portrait touch sahne/galeri, kısa/yatay/reduced/saveData native fallback,
aynı varlıklar ve ticari işlemler. Mevcut desktop görseli korunur.
Task172 yerel1410unit/lint/typecheck/build ve12profil63kontrol PASS;
menü9viewport/4scroll/içsayfa geçişi PASS. Kanıt docs/referans/qa-172-20261102.json.
Task172 main `a6640f2d864aee6e268152514d0f0697a4cbc227` yayımlandı;
CI41499058867 SUCCESS, REST `dpl_A4dNzMdgntjEwCz9TTkyNjvS7e3g` READY ve
afinazeytin.com alias bağlı. Canlı Chromium 12 profil/63 kontrol, 9 navbar
viewport ve 4 scroll durumu PASS; makbuz `.cache/task-172/final-receipt.json`.
Bu kabul fiziksel iOS/Android testi değildir. Task171 b517ba7 yayında; CI41403186829 ve REST
`dpl_F5s6yihRrPXNCq9WeChH2pDv3cPL` READY; canlı44form kontrolü ve9menü
viewport PASS. Makbuz `.cache/task-171/final-receipt.json`.

## Önceki iş: Task171 / fotoğraflı çoklu ürün ve menü (2 Kasım 2026)

Kullanıcı çoklu ürün seçimini fotoğraf ve elle düzenlenen adetlerle istedi;
21stMCP kullanılacak. Menü görünümü ayrıca kontrol edilip düzeltilecek.
Kapsam `docs/tasks/171-fotografli-coklu-urun-ve-menu.md`.
Yerel1351unit/lint/typecheck/build,45form kontrolü ve9navbar viewport PASS;
kanıt `docs/referans/qa-171-20261102.json`, main/API yayın makbuzu `.cache/task-171/final-receipt.json`. Gerçek katalog,
kompakt form, manuel mailto ve mevcut API yayın tercihi korunur.

Task170 b23713e yayında: CI41379351499 SUCCESS,
REST dpl_9biBmvXXrD6uc9RyLW2sEiiA7bgk READY.5viewport/39canlıkontrol PASS;
makbuz `.cache/task-170/final-receipt.json`.

## Önceki iş: Task170 / kompakt teklif ve footer (2 Kasım 2026)

Kullanıcı teklif bölümünü masaüstünde tek ekrana sığdırmayı,21st.dev kaynaklı
footer'ı küçültmeyi ve günceli canlıya almayı istedi.21st27904 ortalı form ve
26006 Footer04, mevcut marka tokenları ve gerçek akışlara uyarlanır. Telefon/
ülke, il/ilçe ve KVKK korunur; mobil doğal akışta kalır. Kapsam
`docs/tasks/170-kompakt-teklif-ve-footer.md`. Main push ve doğrudan Vercel REST
yayını yetkilidir; Actions yalnız doğrulama yapar.

Task169 f746c2a artık canlı: CI41349447805 SUCCESS,
REST dpl_7DwL3JEKtGBqG8zPdNqoXE41Nioy READY, afinazeytin.com bağlı.

## Önceki iş: Task169 / ürün galerisi scroll (1 Kasım 2026)

Kullanıcı ürünlerin dikey scroll ile yatay ilerlemesini yeniden istedi.
Kapsam docs/tasks/169-urun-galerisi-scroll.md: 860px eski yükseklik eşiğini
masaüstü 680px'e indirmek ve sabit görsel yüksekliği yerine kalan alanı
kullanmak. Telefon/kısa pencere/reduced native ray, altı SKU ve eylemler korunur.

Task168 artık canlı: f4be7eb, REST dpl_5WuqjSSTMZo1SrAt1MekJPjdZUfT READY.
Taze /giris ve ana sayfa modal kontrolü yeni düzeni doğruladı; Google yok,
KVKK form sonunda ve Kapat kaydırma gövdesi dışında. Kanıt
docs/referans/yayin-uyelik-168-20261101.json; tam responsive kabulü değildir.

## Önceki iş: Task168 / üyelik penceresi (1 Kasım 2026)

Kullanıcı canlı giriş penceresi ekran görüntüsünün düzenlenmesini istedi.
Aktif kapsam docs/tasks/168-uyelik-penceresi-duzenleme.md: kompakt giriş/kayıt,
görünür kapatma kontrolü ve ayrı kaydırma gövdesi, mobil logo, KVKK notu altta,
kullanılamayan Google seçeneği gizli; mevcut auth/provider sözleşmesi korunur.

Önceki v12 yayını tamamlandı: 782af321, CI41346485610 SUCCESS,
REST dpl_J9muAjiHNwqwSJauFjJEXoAJcAy8 READY ve afinazeytin.com bağlı.
Taze HTTP/içerik kontrolü yapıldı; etkileşimli tarayıcı kabulü değildir.
Kanıt docs/referans/yayin-v12-20261101.json. Aşağıdaki eski DNS/erişim
engelleri geçmişteki çalıştırma oturumuna aittir.

## Tarihçe: Task165 / kabul edilen v12 üzerine bileşenler (1 Kasım 2026)

Kullanıcı Task164 hareketli önizlemesini “güzel beyendim” ile kabul etti.
Bu kurgu korunur. Aktif görev `docs/tasks/165-etkilesimli-bilesenler.md`:
Footer, LiquidNavbar, gerçek logo reveal, ürün rayı, üyelik kartı, sepet ve
sipariş zaman çizelgesi yerel entegrasyonları; Bazgold kaynaklı telefon/ülke
ve aranabilir il/ilçe alanları (il değişince ilçe sıfırlanır). Gerçek altı SKU,
auth, fiyat/stok otoritesi ve PayTR iFrame sınırı değişmez. Yeni kart formu
yerel demo bileşenidir; gerçek kart alanı checkout'a açılmaz.

Yerel birleşik kabul: 108 dosya/1284 unit, lint, typecheck ve webpack build
PASS. Önizleme statik taraması 104 yerel varlık/0 eksik/0 dış ağ kaynağı;
tarayıcı çalıştırılmadı. Son tarayıcı/görsel ve yayın kabulü bekliyor.
Önizleme onayı yeni Task165 veya canlı kabulü değildir.
Main push ve Vercel API yayını açıkça yetkili fakat yapılmadı: Git DNS
çözümlemesi başarısız; GitHub `create_blob` onay istiyor, `approval_policy=never`
bu onayı sağlamıyor. Uzak ref mutasyonu/deploy yok; onay sınırını dolanma.

Doğrulanmış global skill paketi `.cache/task-164/emre-web-skill.zip` hazırdır.
Global yazım otomatik onay incelemesinde “writing outside of the project;
rejected by user approval settings” gerekçesiyle reddedildi; global kurulum
tamamlanmış değildir. Ayrıntı/son kanıt aktif Task165 ve devir belgesindedir.

## Kabul edilen tasarım temeli: Task164 / v12 (1 Kasım 2026)

V11 kullanıcı tarafından görsel olarak reddedildi. HTCOM, Villa Lara ve MLNEW
salt okunur referans alındı. Aktif docs/DESIGN.md ve
docs/tasks/164-kesintisiz-sinematik-akis.md. İlk üç sahne ortak HarvestJourney,
sonrasında ürün spotlight, B2B, teklif, SSS/iletişim ve footer scroll akışı.
Framer Motion, UIPro, React Bits sürer; ticari/medya yetki sınırları korunur.
V11 test başarısı tasarım kabulü değildir.

## Tarihçe: Task163 / v11 (1 Kasım 2026)

$10K kalite hedefi ve tüm senaryoyu yeniden düşünme yetkisi: docs/DESIGN.md,
docs/tasks/163-10k-sinema-ve-aeo.md ve docs/scrollcraft/builds/afina-v11 aktif.
Dört MD/dört PDF/10k ZIP kaynakları REQUIREMENTS.md ve SOURCES.json içinde.
Kabul edilmiş A→B artık gerçek forward/back scrub; Framer/UIPro/React Bits sürer.
Task162/v10 ve aşağıdaki v9 görsel kuralları tarihçedir. Headless≤2, ticari
veri/servis yetki kapıları, özgün medya onayları korunur. $10K kalite hedefi
yeni harcama yetkisi değildir. Kendi sonlu scrub RAF/seek sürücüsü bu açık
isteğin gereğidir; eski no-currentTime/no-RAF uygulama kuralı aktif değildir.
Task163 kod hazır; görsel/piksel/gerçek telefon ve yayın kabulü bekliyor.

## Tarihçe: Task162 / v10 (1 Kasım 2026)

“Zeytin sitesini baştan scrolling sectionla yapalım”; kullanıcının açık
Framer Motion, `uipro init --ai codex` ve React Bits tercihi uygulanır.
Aktif sözleşme docs/DESIGN.md ve docs/tasks/162-scrolling-sections.md.
Aşağıdaki v9 görsel talimatları bu iş için tarihçedir; marka, onaylı medya,
ticari veri/sunucu sınırları ve headless güvenlik kuralları sürer. Kullanıcının
framer-motion isteği eski import yasağının önündedir; aynı14.4.0 çalışma zamanı
motion ile dedupe edilir. UIPro .codex/skills altında; mevcut .agents özel
uyarlaması korunur. React Bits lisanslı kaynak/pin dosyası SOURCES.json.
1216 unit/lint/typecheck/webpack build PASS; yeni tarayıcı kabulü/yayın YOK.
Önceki v9 ölçümlerini v10 sonucu olarak sunma. Task162 henüz TAMAMLANDI değil.

## Proje bağlamı

- **ZEYTİN** = AFİNA ZEYTİN, afinazeytin.com, `okyanuskalbi/5f-zeytin`, `~/PROJELER/5F-ZEYTIN`.
- **KURUMSAL** = AFİNA Şirketler Topluluğu, afina.com.tr, `okyanuskalbi/afina-kurumsal`, `~/PROJELER/5F-ZEYTIN/AFINA-KURUMSAL`.
- Tek landing içinde premium vitrin ve satın alma; admin’den girilecek en fazla 5–6 ürün. Üyelik, hesabım, sipariş geçmişi, sepet drawer ve sayfası, upsell/çapraz satış, kademeli indirim, ödeme callback’i, kupon, terk edilen sepet e-postası, admin ve kargo takibi kapsamda.
- Next.js App Router + TypeScript + Tailwind 4 + shadcn/ui + Framer Motion (`motion`) + Supabase + Vercel. AI Studio kodu `_legacy/` içinde yalnız referans; yeni runtime’a doğrudan bağlanmaz.
- Ana slogan “Kökü toprakta. Yeri sofrada.”; aktif v9 Hasat Rotası sözleşmesi `docs/DESIGN.md`, brief-first kayıtları `docs/scrollcraft/builds/afina-v9/` içinde. Pro plan #84CC16/taş/mürekkep/altın, Fraunces/Inter, doğal tam-film hero+özgün ön dal+cam nav ve yalnız galeride tek pin; telefon/kısa ekran/reduced native akış. Orijinal logo, gerçek ambalaj ve eylemler korunur. Task161 TAMAMLANDI; API READY ve canlı UI kabulü doğrulandı. V8 byte-identical arşiv ve yayın kanıtları tarihçedir.
- Yeni üretim yalnız Google Flow; eski P01–P12/Atlas görevleri tarihsel kayıttır. Görseller temsili ve adaydır; kullanıcı onayı olmadan sitede kullanılmaz, ücretli videoya geçilmez.
- Supabase proje/org, ödeme, e-posta, kargo, indirim/süreler, gerçek ürün/fiyat/logo ve Vercel/domain kararları açıktır; kendin seçme. Ayrıntı ve bağımlılıklar `docs/PLAN.md` içinde.
- 1 Kasım 2026 kullanıcı devri: Codex planlama, görev oluşturma, uygulama ve denetimi birlikte yürütür. Claude dosyaları ve eski kabul kanıtları tarihsel kaynak olarak korunur. Son yayımlanmış v8 kaynak 179df851 kanıtı tarihçedir; Task157–160 sonuçları yeni Task161/v9 kabulü yerine geçmez.

# Rol: Codex / proje yürütücüsü

Çalışma dizini: bu repo'nun kökü (`~/projeler/<proje-adı>`). Repo dışına dosya yazma.

Kullanıcının 1 Kasım 2026 devriyle planlama, görev dokümanları, uygulama ve kod denetimi Codex kapsamındadır. Onaylı Next.js/Supabase/PayTR mimarisini koru.

## Araçların

- ECC skill'leri: task dosyasında hangisi yazıyorsa onu kullan. Yazmıyorsa varsayılan:
  - frontend task → `frontend-patterns` + `tdd-workflow`
  - backend task → `backend-patterns` + `api-design` + `tdd-workflow`
  - veritabanı dokunuyorsa → `database-migrations` + `postgres-patterns`
- 21st MCP: UI component gerekiyorsa önce 21st MCP ile ara/üret, sıfırdan yazma. Üretilen component'i projenin stil sistemine uyarla.
- find-skills: task'ta "ek skill: ..." varsa `npx skills add <paket>` ile kur. Yoksa ve bilmediğin bir konuyla karşılaşırsan `npx skills find <konu>` ile bak; kurduğun skill'i `## Coder Notu`'na yaz.

## Her görevde sırayla

1. `docs/PLAN.md` dosyasını oku.
2. Sana verilen `docs/tasks/NNN-*.md` dosyasını oku.
3. "Kullanılacak araçlar" bölümündeki skill'leri yükle, gerekiyorsa find-skills ile ek skill kur.
4. TDD: önce başarısız test yaz (RED), sonra kodu yaz (GREEN), sonra düzenle.
5. Adımları ve kabul kriterlerini birebir uygula.
6. Kabul kriterlerindeki her maddeyi çalıştırıp doğrula (test, build, lint).
7. Commit:
   Yalnız bu görevin dosyalarını açıkça stage et; yeşil görev commit’i oluştur. Başkasının dosyalarını stage etme.
8. Task dosyasının sonundaki `## Durum:` satırını `## Durum: TAMAMLANDI` yap.

## Kurallar

- Planı güncel kullanıcı isteğine göre güncelle; geçmiş karar tablosunu koru. Onaylı ürün mimarisini değiştirme.
- Task dışına çıkma; "bunu da iyileştireyim" yapma.
- `docs/PLAN.md`, tasarım, task ve devir belgelerini gerçek duruma göre güncelleyebilirsin; tarihsel onayları silme.
- Erişim/medya engelinde bağımsız işleri tamamla, eksik kabulü tekil olarak kaydet. Çalıştırılmamış test, üretilmemiş medya ve yapılmamış yayın için başarı yazma.
- Frontend task'ında backend'e, backend task'ında frontend'e dokunma (fullstack değilse).
- Mevcut kod stiline ve klasör yapısına uy. ECC rule'ları geçerli.
- Gizli bilgileri (API key, şifre) koda gömme; `.env` kullan.

## Projeye özel ek kurallar

- **Yayın tercihi (1 Kasım, Task 153 tamam):** test/lint/typecheck/build yeşil değişiklikler normal main push; dağıtım doğrudan Vercel REST API ile. GitHub Actions yalnız lint/typecheck/unit/build yapar; Vercel Git auto-deploy kapalıdır. Doğru AFINA ekip/proje erişimi doğrulandı; kanıt `docs/referans/yayin-20261101.json`. Gelecek yayında hedef kimliklerini ve Git/Actions durumunu tekrar doğrula; tokenları gösterme. Branch protection bypass/force push/reset yok.

- **Güncel tarayıcı yetkisi (1 Kasım, Task 157):** Kullanıcı açıkça canlı siteyi tarayıcıda ve mobilde kontrol edip eksikleri düzeltmeyi istedi; 21 Ekim'deki çalıştırmama sınırı bu kapsam için kalktı. Yalnız paketli headless Playwright Chromium, en fazla 2 worker; kullanıcı Chrome'u test/Lighthouse için açılmaz. Masaüstü/mobil viewport, klavye, taşma, menü, ürün/sepet/üyelik yüzeyi ve reduced-motion kabulü yapılır. Üretimde gerçek müşteri/sipariş/ödeme veya talep gönderimi yapılmaz; yerel sepet etkileşimi ve salt-okunur canlı yollar kontrol edilir. Her koşuda browser.close() ve başlatılan sunucuya SIGTERM ile düzgün kapanış zorunlu; fiziksel telefon kabulü viewport testinden ayrı bildirilir.

- UI işlerinde önce 21st MCP ile ara/üret, sonra projenin token’larına uyarla; varsayılan halde bırakma. Erişim yoksa bunu Coder Notu’na yaz.
- Animasyon: Framer Motion (`motion`) + ECC `motion-foundations`, `motion-patterns`, `motion-advanced`; `prefers-reduced-motion` zorunlu, sade modda içerik ve CTA erişilir kalır.
- shadcn/ui için MCP YOK. Resmi CLI ile `npx shadcn@latest search/view/docs <bileşen>` kullan; `add <bileşen>` ile ekle, gerekiyorsa `init --preset <kod>` / `apply <preset>` ile ui.shadcn.com/create temasını uygula. Bileşenleri proje token’larına göre özelleştir.
- Supabase public şemada yeni tablo oluşturan her migration’a açık GRANT ekle: sunucu-only tablo için anon/authenticated REVOKE ve service_role SELECT/INSERT/UPDATE/DELETE; istemci tablosu için anon SELECT, authenticated + service_role SELECT/INSERT/UPDATE/DELETE. anon/authenticated grant alan her tabloda RLS zorunlu; politika yalnız ilgili kullanıcı/veri kapsamını açar. Bu kural ilk migration’dan itibaren uygulanır.
- `.env*`, şifre ve API anahtarı ASLA commit edilmez. `.env.example` yalnız boş/temsili değerli şablon olarak izinlidir; Task 000’da oluşturulmaz. `.mcp.json` yazma; global 21st yapılandırmasını kullan.
- DB/ödeme/auth task’larındaki `ONAY GEREKLİ` kapısı karşılanmadan ilgili işleme başlama; Task 000 bu onayı vermez.
- Başka repolara yazma. MLNEW yalnız okunabilir referanstır. `_legacy/` ve özgün görsel promptlarını koru.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Yeniden kurgu ara görevleri (Claude, 20 Eki)
Yeniden kurgu sırasında (KURUMSAL 050–063, ZEYTİN 090–096 ve 100–106) bir görevin kabulü **yalnız o görevin kendi bölümü/bileşeni** için geçerlidir: kendi testleri, kendi bölümünün inspect sonuçları, lint/typecheck/build. Henüz yeniden kurulmamış diğer bölümlere ait eski e2e hataları, genel inspect FAIL'leri ve global coverage eşiği **Coder Notu'na yazılır, gizlenmez, ama TAMAMLANDI'yı engellemez**. Hepsinin sıfırlanması global kapı görevinin (KURUMSAL 057, ZEYTİN 097 ve 107) kabulüdür. Kendi bölümüne ait bir FAIL varsa görev BEKLİYOR kalır.

## Tarihçe: ilk medya ve müşteri yönü kayıtları (1 Kasım 2026)
- Müşteri PDF’si: üretim/kurumsal güven yaklaşık %65, ürün/alışveriş %35; yeni açılış ve kurumsal/toptan akış Task 151. Resmî slogan “Kökü toprakta. Yeri sofrada.” korunur; PDF’deki alternatif yalnız öneridir.
- Yeni video üretimi yalnız Google Flow. AtlasCloud çağrısı/fallback/kredi kullanma. Ücretli kapsam ve kredi sınırı kullanıcıdan alınır; mevcut 250 kredi bakiyesi harcama yetkisi değildir. Kullanıcı son yönü: her sahne için ilk/son kare. Beş referans Flow’a yüklendi; açık onayla yalnız A→B ilk klip 20 krediye üretildi, bakiye 230. İlk klip kullanıcı tarafından kabul edildi. Kullanıcı kalan üç aynı yöntemli geçişi istedi; doğrulanan 20 kredi/kliple ek sınır 60 (toplam 80) kredidir. Üç normal deneme Google doğrulamasında reddedildi; bakiye 230, ek harcama 0. Engel çözülmeden yeni ücretli deneme yapma; CAPTCHA atlama veya güvenlik ayarı değiştirme.
- Onaysız medya public/runtime’a bağlanmaz. Hazır SDR’ye ikinci ACES/tone mapping uygulanmaz. Özel canvas Task 083 yeniden kullanılır; body/wheel/touch scroll kilidi veya autoplay loop eklenmez.
- Kullanıcının seçilen PDF'yi uygulama isteğiyle Task 156'da kabul edilen ilk A→B klibinin türevleri açılışa bağlandı ve API ile yayınlandı. 1280/960, 12 fps, 95'er kare; aynı başlangıçtan AVIF/WebP poster. Kaynak/çıktı kapısı scripts/check-cinematic-hero.mjs ve lib/media/cinematic-hero.json. Diğer üç klip bu yayında yok, ek kredi harcaması 0; son makbuz docs/referans/yayin-sinematik-20261101.json.
- Test tarayıcısı yalnız paketli headless Chromium, worker ≤2. /Applications/Google Chrome.app test/Lighthouse için açılmaz; düzgün kapanış zorunlu. Google Flow üretim oturumu bu test kısıtından ayrıdır.
- Task 157 tarihsel yayın: v6 Üretici Atlası, API kaynağı `9b7b505`, 1171 unit + 28 canlı headless etkileşim kontrolü; 1440/768/390/320 px kabulü geçti. Son kanıt docs/referans/yayin-v6-20261101.json. Google Flow/Omni B→C taslağı 12 kredi/8 sn./720p/x1 ile hazır; doğrulama engeli sürüyor, ek harcama 0, mevcut kalan 60 sınırı değişmedi.

## Yeni nesil MD uyarlaması (Task 158)

Bu projede [Profesyonel web](.agents/skills/profesyonel-web-sitesi-yeni-nesil/SKILL.md), [Scroll hero](.agents/skills/scroll-hero-video-yeni-nesil/SKILL.md), [Sinematik siteler](.agents/skills/sinematik-siteler-yeni-nesil/SKILL.md) ve [UI/UX Pro Max](.agents/skills/ui-ux-pro-max/SKILL.md) birlikte kullanılır. Kaynak SHA'ları ve v6 istisnaları [uyarlama kaydındadır](docs/referans/yeni-nesil-md-uyarlamalari-20261101.md); global skill/MCP/anahtar kurulumu yapılmaz.

Task 158 ortak `lib/ui-motion.ts` action/editorial spring'leriyle kısa, bir kez açılış ve küçük hover/tap tepkilerini; ana bölüm aralıklarında 8 px tabanlı 32/48/64/96 tokenlarını uygular. SSR içerik/CTA görünür, reduced-motion posteri ve lineer scrub korunur. [Görev kaydı](docs/tasks/158-yeni-nesil-md-kitleri.md) tamamlandı: kaynak `862c1be`, 1176 unit, 28 yerel + 28 canlı etkileşim kontrolü, dört genişlikte görsel/axe kabulü ve API READY. Son makbuz [yayin-kitler-20261101.json](docs/referans/yayin-kitler-20261101.json); yeni medya/kredi 0.

MD'lerdeki **Omni Chrome Use**, mevcut CUA/browser araçlarıyla oturumlu arayüz otomasyonu yaklaşımıdır; ayrı eklenti kurulu varsayılmaz ve **Omni 1.1 Flash** model adıyla karıştırılmaz. Örnek komutlar yeni model, sağlayıcı, hesap veya kredi yetkisi vermez; her üretim öncesi güncel provenans/kalan sınır okunur.

## Tarihçe: gerçek Flow filmiyle v7 açılışı (Task 159)

Son kullanıcı düzeltmesi v6 split/kare-penceresi ve genel no-autoplay uygulama tercihini değiştirir. Normal modda kabul edilmiş A→B kaynağının sessiz H264/faststart türevi bir kez oynar, son karede kalır; görünür duraklat/oynat/yeniden oynat kontrolü vardır. Yeni animasyon importları `motion/react` üzerinden, yeni dependency yok. Kaydırma yalnız küçük film-kabuğu transformudur; video zamanını seek etmez, body kilidi veya 300vh pin eklenmez. Reduced-motion/saveData poster, gizli sekme/görünüm dışında durma ve kullanıcı pause kararı korunur. Yeni medya/kredi 0. Kaynak/output `lib/media/cinematic-film.json` ve yeni build kapısında; güncel kabul [Task 159](docs/tasks/159-flow-sinematik-hero.md) içinde kaydedilir.

Task 159 yayındaki kaynak `5a3b1f6`, CI 41297597853 SUCCESS; REST API `dpl_CpxqnTKPasKQNCQ8zjWnaNu5NpsF` READY. 1197 unit, 44 yerel + 44 canlı etkileşim kontrolü, dört genişlikte görsel/axe kabulü; normal oynatım 190 kare/7,916667 sn./sessiz doğrulandı. Son makbuz [yayin-film-v7-20261101.json](docs/referans/yayin-film-v7-20261101.json), QA `qa-159-20261101.json`. Fiziksel cihaz veya gerçek hesap/ödeme/talep mutasyonu değildir; yeni Flow kredisi 0.

## Tarihçe: v8 Object journey (Task 160)

Bu bölüm Task160 sırasında geçerli olan kompozisyon/QA/yayın kaydıdır; v9 aktif sözleşmesi değildir.

Kullanıcı Scroll Craft, frontend-design/frontend-ui-engineering ve Taste ile tasarım düzeltmesini, verdiği doğru Flow projesini kullanmayı istedi. [Task 160](docs/tasks/160-scroll-craft-taste-ve-flow.md), [BRIEF/PLAN/COPY/VERIFICATION](docs/scrollcraft/builds/afina-v8/BRIEF.md) ve [arşivlenmiş v8 DESIGN](docs/referans/DESIGN-v8-history-20261101.md) o görevde aktiftir. Yaratıcı kararlar açık devre dayanır; yeniden görüşme yapılmış gibi sunulmaz. V7 tek film+overlay ve v6 organik pencere/küçük kart aktif yön değildir.

Taste seed 1601101/page-is-the-object, palet/font korunur. Desktop yalnız 170svh kısa sticky: film geri, gerçek ambalaj ileri, kendi zeminiyle kâğıt metin bağımsız hareket eder. Telefon/kısa ekran/reduced doğal akış; başlık/CTA önce,280px film/260px ürün sahnesi, ayrıntı sonra. Üç mevcut SKU aynı görsel/ad/fiyat/detail/cart hedefini günceller; AddToCart/CatalogProvider/sunucu otoritesi ve altı SKU sırası değişmez. Gerçek tesis→native galeri→kapalı B2B/native details→gerçek adres/mağazaya dönüş. İndeks/eyebrow/scroll oku/tam kare scrim/italic renk vurgusu yok.

Scroll Craft 0.3.1 SHA75d81f74e83692add18cd7a8a8e078b8a887a579 ve Taste2.1.5 SHA12af471f627f866411b4bd785b19646d3672784c proje yereldir. Upstream kaynak/engine değiştirilmez veya runtime'a import edilmez. Yeni hareket motion/react transform/opacity; kendi rAF/GSAP/Lenis/scroll currentTime yok. MD örnekleri yeni sağlayıcı/anahtar/ücret yetkisi değildir.

Doğru Flow projesi 62040049-3473-446b-9d93-8e6cbc45f8bc taze bağlantıda önceki reCAPTCHA uyarısı olmadan çalıştı; güvenlik engeli atlanmadı. Aynı ilk/son kare yöntemiyle Omni 1.1 Flash/720p/8 sn./16:9/x1,12 kredi/çıktı: B→C/C→D/D→F üçü de COMPLETE ve indirildi. Üç yetkili istek 36 kredi, bakiye 230→194; ilk 20 ile toplam 56, eski 80 tavanında 24 kredi kullanılmadı (ek deneme yetkisi değil). Yeni klipler yalnız aday; teknik/görsel inceleme ve kullanıcı onayı olmadan public/runtime yok. Sitede kabul edilmiş A→B kalır. Önceki blocked denemeler/0 harcama tarihçesi ve exact prompts docs/referans/flow-keyframes.json içinde korunur; bakiye kanıtı .cache/task-160/flow-194-credit-balance.png.

V8 [afinazeytin.com](https://afinazeytin.com) üzerinde Vercel API **READY**: kaynak `179df851686a34d09a1e965315dc5e902a30c362`, CI 41304790349 SUCCESS, dağıtım `dpl_7EUijPZwcnzr9ML3nHMFRwUErZ89`. READY yayını ve ayrı canlı etkileşim/görsel kabulü doğrulandı.

Yerel kabul: 89 dosya/1200 unit, tam ESLint/typecheck/build PASS; 74 e2e PASS + 6 responsive skip (80 toplam); 1440/1024/768/390/360×640/320 görsel/axe/taşma/pageerror/kaynak hatası0. Motion/JavaScript kapalı/reduced kontrolleri PASS. Native Scenes exit0; inspector 1 FAIL/5 WARN ham sonuçları ve semantik gerekçeleri korunur; inspector0 iddiası yok. 21st/Taste kaynak review tamam.

Canlı kabul: **TAMAMLANDI** — 74 e2e PASS + 6 responsive skip; 1440/1024/768/390/360×640/320 görsel/axe/taşma/pageerror/başarısız kaynak 0; motion/JavaScript kapalı/reduced PASS. Doğal film 190 decoded kare,7,916667 sn., ended/muted; 12,04 sn. gerçek UI oynatım kaydı alındı. Fiziksel cihaz veya gerçek hesap/ödeme/teklif mutasyonu değildir.

Final [yayın makbuzu](docs/referans/yayin-object-v8-20261101.json) ve [QA kaydı](docs/referans/qa-160-20261101.json) nihai Task 160 kanıt kayıtlarıdır; yeni Flow medya kabulü ayrı tutulur. Fiziksel cihaz/gerçek hesap/ödeme/form mutasyonu bu kabul değildir.


## Tarihçe: v9 Hasat Rotası (Task 161)

Kullanıcının [pro planı](docs/referans/afina-zeytin-pro-plan-20261101.md) ve tüm bölümlere 21st/Scroll Craft isteği: [Task161](docs/tasks/161-pro-plan-tum-bolumler-21st-scroll-craft.md), [BRIEF/PLAN/COPY](docs/scrollcraft/builds/afina-v9/BRIEF.md), [DESIGN](docs/DESIGN.md) aktiftir. V8 DESIGN byte-identical [arşivdedir](docs/referans/DESIGN-v8-history-20261101.md); önceki 170svh ambalaj/kâğıt-plane, opak nav ve tek geçiş/no-loop uygulama tercihi yeni planla değişir. Task161 TAMAMLANDI; final QA/CI/API/live kabulü doğrulandı.

Aktif tokenlar #84CC16/#EDE8DD/#1C1F1A/#C89B3C, koyu altın metin #735519; Fraunces/Inter, özgün logo/slogan/ambalaj. Yedi sahne: hero32829 → galeri24623 → tesis20023 → hikâye1197 → B2B7262 → teklif35258 → SSS/iletişim31986; nav26786/footer21474 ile9seçili ana kaynak. 1635 yalnız incelenmiş referans, ProductCard mevcut kullanım;15025/7091 reddedildi. [Exact kaynak SHA/uyarlama kaydı](docs/scrollcraft/builds/afina-v9/21ST-SOURCES.json) esastır.

Hero doğal film+orijinal ön dal+cam nav; H1/gerçek #urunler/#teklif anchor'ları SSR görünür. Tek pin uygun≥1024×860 galeride; x=−travel×progress lineer, kısa/mobil/reduced/JSkapalı native rail; son ürün/odak erişilir. Tesis görüntüsü izole parallax, diğer sahneler doğal akış/SSR görünür once reveal; motion/react dışında ikinci engine/GSAP/Lenis/rAF/currentTime seek yok.

Kabul edilmiş A→B ücretsiz yerel ileri/geri kurgu: kaynak6..65,120kare/24fps/5sn/1280×720,2.742.609bayt. HeroAVIF76.119bayt ve onaylı şişeOG1200×630; yeni ücretli medya değil. Normal muted loop, pause/play/offscreen durma; reduced/saveData poster/MP4 isteksiz, hata/blocked fallback. V8'in no-loop tercihi bu açık planla değişir; yeni kredi yetkisi doğmaz. Diğer Flow adayları kullanıcı/runtime onayı almamıştır.

Altı SKU sırası/adı/fiyatı/stoku ve mevcut detay/sepet/üyelik/checkout otoritesi değişmez. SKU ve üç segment seçimi aynı form bağlamına gider; hydration öncesi JS kontrolleri disabled. #teklif validasyon/KVKK sonrası gerçek mailto özeti hazırlar; kullanıcı e-posta uygulamasında gönderir. info@afina.com.tr ve+903288827708 resmî çatı şirket kanalıdır; zeytin destek hattı/WhatsApp veya sunucu e-posta teslimi doğrulanmış değildir. Yeni provider/env/DB açma ve sahte gönderildi başarısı yok.

Dört proje yerel MD kaynağı/source_sha256 korunur; yeni v9 görsel bölümleri aktif, Task158/v8 kanıtları tarihçedir. Omni Chrome Use otomasyon yaklaşımı, Omni1.1Flash model adı; örnekler hesap/model/ücret yetkisi vermez. Test/publish/gerçek hizmet ve fiziksel cihaz kapıları ayrı; mevcut headless≤2/düzgün kapanış politikası sürer.


## Task161 nihai kabul kaydı

Kaynak `31f251cee2e8b83601fbc2cb3a376c979011f39f`, CI41317227401 SUCCESS; Vercel REST `dpl_46Scpv4MqVnjKxb1pYt1bjwSD4Hq` READY. Yerel ve canlı87e2e PASS+8responsive skip;1208unit,lint/typecheck/build PASS. Altı canlı boyutta axe/taşma/JS/HTTPkaynak hatası0. Canlı Lighthouse mobil100/masaüstü99, erişilebilirlik100; ayrı mobil DevTools98. Fiziksel telefon ve gerçek işlem/SMTP/WhatsApp kabulü yapılmadı. Kanıt: `docs/referans/qa-161-20261101.json`, `docs/referans/yayin-pro-v9-20261101.json` ve `docs/scrollcraft/builds/afina-v9/VERIFICATION.md`. Önceki v8/ilk v9 ölçümleri tarihçedir.
