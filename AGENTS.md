## Proje bağlamı

- **ZEYTİN** = AFİNA ZEYTİN, afinazeytin.com, `okyanuskalbi/5f-zeytin`, `~/PROJELER/5F-ZEYTIN`.
- **KURUMSAL** = AFİNA Şirketler Topluluğu, afina.com.tr, `okyanuskalbi/afina-kurumsal`, `~/PROJELER/AFINA-KURUMSAL`.
- Tek landing içinde premium vitrin ve satın alma; admin’den girilecek en fazla 5–6 ürün. Üyelik, hesabım, sipariş geçmişi, sepet drawer ve sayfası, upsell/çapraz satış, kademeli indirim, ödeme callback’i, kupon, terk edilen sepet e-postası, admin ve kargo takibi kapsamda.
- Next.js App Router + TypeScript + Tailwind 4 + shadcn/ui + Framer Motion (`motion`) + Supabase + Vercel. AI Studio kodu `_legacy/` içinde yalnız referans; yeni runtime’a doğrudan bağlanmaz.
- Ana slogan “Kökü toprakta. Yeri sofrada.”; güncel v7 Zeytinin İçinden sözleşmesi `docs/DESIGN.md` içinde. Kullanıcı hero'nun aynı göründüğünü belirterek gerçek Flow filmiyle sinematik açılış istedi: tam geniş film, sol-alt metin, gerçek CTA ve filmin dışında opak menü. V6 split/frame-only tercihi bu son istekle değişti. Altın zeytin dalı + el logosu ve `docs/visual-prompts.md` korunur.
- Yeni üretim yalnız Google Flow; eski P01–P12/Atlas görevleri tarihsel kayıttır. Görseller temsili ve adaydır; kullanıcı onayı olmadan sitede kullanılmaz, ücretli videoya geçilmez.
- Supabase proje/org, ödeme, e-posta, kargo, indirim/süreler, gerçek ürün/fiyat/logo ve Vercel/domain kararları açıktır; kendin seçme. Ayrıntı ve bağımlılıklar `docs/PLAN.md` içinde.
- 1 Kasım 2026 kullanıcı devri: Codex planlama, görev oluşturma, uygulama ve denetimi birlikte yürütür. Claude dosyaları ve eski kabul kanıtları tarihsel kaynak olarak korunur. Güncel çalışma Task 159 gerçek Flow filmiyle v7 açılıştır; kabul/yayın sürüyor. Task 157/158 önceki v6 uygulama ve yayın tarihçesidir.

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

## Güncel medya ve müşteri yönü (1 Kasım 2026)
- Müşteri PDF’si: üretim/kurumsal güven yaklaşık %65, ürün/alışveriş %35; yeni açılış ve kurumsal/toptan akış Task 151. Resmî slogan “Kökü toprakta. Yeri sofrada.” korunur; PDF’deki alternatif yalnız öneridir.
- Yeni video üretimi yalnız Google Flow. AtlasCloud çağrısı/fallback/kredi kullanma. Ücretli kapsam ve kredi sınırı kullanıcıdan alınır; mevcut 250 kredi bakiyesi harcama yetkisi değildir. Kullanıcı son yönü: her sahne için ilk/son kare. Beş referans Flow’a yüklendi; açık onayla yalnız A→B ilk klip 20 krediye üretildi, bakiye 230. İlk klip kullanıcı tarafından kabul edildi. Kullanıcı kalan üç aynı yöntemli geçişi istedi; doğrulanan 20 kredi/kliple ek sınır 60 (toplam 80) kredidir. Üç normal deneme Google doğrulamasında reddedildi; bakiye 230, ek harcama 0. Engel çözülmeden yeni ücretli deneme yapma; CAPTCHA atlama veya güvenlik ayarı değiştirme.
- Onaysız medya public/runtime’a bağlanmaz. Hazır SDR’ye ikinci ACES/tone mapping uygulanmaz. Özel canvas Task 083 yeniden kullanılır; body/wheel/touch scroll kilidi veya autoplay loop eklenmez.
- Kullanıcının seçilen PDF'yi uygulama isteğiyle Task 156'da kabul edilen ilk A→B klibinin türevleri açılışa bağlandı ve API ile yayınlandı. 1280/960, 12 fps, 95'er kare; aynı başlangıçtan AVIF/WebP poster. Kaynak/çıktı kapısı scripts/check-cinematic-hero.mjs ve lib/media/cinematic-hero.json. Diğer üç klip bu yayında yok, ek kredi harcaması 0; son makbuz docs/referans/yayin-sinematik-20261101.json.
- Test tarayıcısı yalnız paketli headless Chromium, worker ≤2. /Applications/Google Chrome.app test/Lighthouse için açılmaz; düzgün kapanış zorunlu. Google Flow üretim oturumu bu test kısıtından ayrıdır.
- Task 157 son yayın: v6 Üretici Atlası, API kaynağı `9b7b505`, 1171 unit + 28 canlı headless etkileşim kontrolü; 1440/768/390/320 px kabulü geçti. Son kanıt docs/referans/yayin-v6-20261101.json. Google Flow/Omni B→C taslağı 12 kredi/8 sn./720p/x1 ile hazır; doğrulama engeli sürüyor, ek harcama 0, mevcut kalan 60 sınırı değişmedi.

## Yeni nesil MD uyarlaması (Task 158)

Bu projede [Profesyonel web](.agents/skills/profesyonel-web-sitesi-yeni-nesil/SKILL.md), [Scroll hero](.agents/skills/scroll-hero-video-yeni-nesil/SKILL.md), [Sinematik siteler](.agents/skills/sinematik-siteler-yeni-nesil/SKILL.md) ve [UI/UX Pro Max](.agents/skills/ui-ux-pro-max/SKILL.md) birlikte kullanılır. Kaynak SHA'ları ve v6 istisnaları [uyarlama kaydındadır](docs/referans/yeni-nesil-md-uyarlamalari-20261101.md); global skill/MCP/anahtar kurulumu yapılmaz.

Task 158 ortak `lib/ui-motion.ts` action/editorial spring'leriyle kısa, bir kez açılış ve küçük hover/tap tepkilerini; ana bölüm aralıklarında 8 px tabanlı 32/48/64/96 tokenlarını uygular. SSR içerik/CTA görünür, reduced-motion posteri ve lineer scrub korunur. [Görev kaydı](docs/tasks/158-yeni-nesil-md-kitleri.md) tamamlandı: kaynak `862c1be`, 1176 unit, 28 yerel + 28 canlı etkileşim kontrolü, dört genişlikte görsel/axe kabulü ve API READY. Son makbuz [yayin-kitler-20261101.json](docs/referans/yayin-kitler-20261101.json); yeni medya/kredi 0.

MD'lerdeki **Omni Chrome Use**, mevcut CUA/browser araçlarıyla oturumlu arayüz otomasyonu yaklaşımıdır; ayrı eklenti kurulu varsayılmaz ve **Omni 1.1 Flash** model adıyla karıştırılmaz. Örnek komutlar yeni model, sağlayıcı, hesap veya kredi yetkisi vermez; her üretim öncesi güncel provenans/kalan sınır okunur.

## Gerçek Flow filmiyle sinematik açılış (Task 159)

Son kullanıcı düzeltmesi v6 split/kare-penceresi ve genel no-autoplay uygulama tercihini değiştirir. Normal modda kabul edilmiş A→B kaynağının sessiz H264/faststart türevi bir kez oynar, son karede kalır; görünür duraklat/oynat/yeniden oynat kontrolü vardır. Yeni animasyon importları `motion/react` üzerinden, yeni dependency yok. Kaydırma yalnız küçük film-kabuğu transformudur; video zamanını seek etmez, body kilidi veya 300vh pin eklenmez. Reduced-motion/saveData poster, gizli sekme/görünüm dışında durma ve kullanıcı pause kararı korunur. Yeni medya/kredi 0. Kaynak/output `lib/media/cinematic-film.json` ve yeni build kapısında; güncel kabul [Task 159](docs/tasks/159-flow-sinematik-hero.md) içinde kaydedilir.
