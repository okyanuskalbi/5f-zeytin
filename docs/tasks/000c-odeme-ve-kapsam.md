# Task 000c: Ödeme kararı — yalnız PayTR (ZEYTİN) + KURUMSAL tek sayfa kapsamı — PLAN ve task güncellemesi

## Tür
doküman (uygulama kodu YOK)

## Kullanıcı kararları (19 Eki 2026)
1. **Ödeme yalnız ZEYTİN'de ve YALNIZ PayTR** (kullanıcı: "SADECE PAYTR OLARAK DEVAM ET"). **Başka ödeme sağlayıcısı YOK** — eski sağlayıcı seçeneklerini plan/task'lardan tamamen çıkar.
   - PayTR → **iFrame API**, site içine gömülü: token sunucuda (`get-token`), `https://www.paytr.com/odeme/guvenli/<token>` iframe ödeme sayfamızın içinde; `iframeResizer` ile yükseklik. Bildirim/callback sunucu-sunucu, hash doğrulama, idempotent sipariş güncellemesi, yanıt `OK`.
   - 3D Secure iframe içinde; sonuç `merchant_ok_url` / `merchant_fail_url` (bizim sonuç sayfamız, ama sipariş durumu YALNIZ callback ile değişir).
   - Kart alanlarını kendimiz ÇİZMEYİZ (PCI-DSS yükü) — iframe gömülür; çevresi (özet, upsell, kupon, kargo, güven bilgisi) marka tasarımıyla.
   - Referans (SADECE OKU): `~/PROJELER/MLNEW/components/cart/CartView.tsx` (PayTR iframe ekranı: sol kart görseli + güven, sağ iframe), `app/api/checkout/route.ts` (PayTR oturumu), `app/api/payments/paytr/callback/route.ts`.
2. **Yerelde ödemeyi görme:** kullanıcı localhost'ta PayTR iFrame'i test modunda görmek istiyor.
3. **KURUMSAL = SADECE tek sayfalık landing page.** Ayrı marka detay sayfaları (`/insaat`, `/zeytin` …) YOK. Resmi belgedeki "detay sayfası" metinleri landing içinde: her marka sahnesinde "Devamını oku" ile açılan panel/çekmece (veya sahne içi genişleyen bölüm). Ödeme/üyelik/DB yok. KVKK/aydınlatma metni modal veya tek yasal sayfa olabilir (form için zorunlu).

## Adımlar
### ZEYTİN (`~/PROJELER/5F-ZEYTIN`)
1. `docs/PLAN.md`: "Açık kararlar"dan ödeme sağlayıcıyı kapat → "Mimari kararlar" tablosuna ekle (yalnız PayTR iFrame API, site içine gömülü; gerekçe: kullanıcı kararı, müşteri siteden ayrılmasın, PCI yükü yok). Önceki sağlayıcıya ait tüm metin ve dosya yollarını kaldır. Hesap/anahtar bilgisi hâlâ açık karar.
2. 047–050 ödeme task'larını bu karara göre güncelle: adapter yalnız PayTR (`createPaytrSession(order) → {iframeUrl, token}`; ileride sağlayıcı eklenebilir ama şimdi soyutlama yok), embed task'ı tek ödeme ekranı (MLNEW düzeni), callback task'ı PayTR hash doğrulamasını ve idempotent sipariş güncellemesini kapsasın. Test modu bayrakları env'den.
3. **Yeni task `001b-odeme-onizleme.md`** (001'den hemen sonra; DB YOK):
   - `/odeme-onizleme` sayfası (`NODE_ENV !== 'production'` yerel kullanım ve `PAYMENT_PREVIEW=1` önizleme bayrağı; production build'de bayraktan bağımsız 404).
   - Sabit örnek ürünle sahte sipariş (bellekte), PayTR iframe (`test_mode=1`) gömülü.
   - Sunucu route'ları: `/api/odeme-onizleme/paytr-token` + ok/fail sonuç sayfası.
   - PayTR bildirim (callback) sunucu-sunucu olduğu için localhost'a gelmez: önizlemede sonuç `merchant_ok_url/merchant_fail_url` ile gösterilir; tam callback testi için `cloudflared tunnel` notu README'ye.
   - Anahtarlar YALNIZ `.env.local` (git'te değil); `.env.example`'a boş anahtar adları: `PAYTR_MERCHANT_ID, PAYTR_MERCHANT_KEY, PAYTR_MERCHANT_SALT, PAYTR_TEST_MODE, PAYMENT_PREVIEW`.
   - Anahtar yoksa sayfa çökmez: ödeme alanında "Test anahtarı eksik — .env.local'e ekleyin" uyarısı.
   - Kabul: `npm run test -- tests/unit/payment-preview.test.ts` (PayTR token isteği + paytr_token/callback hash birim testleri, mock'lu), `npm run build`, prod modda `/odeme-onizleme` 404; anahtarsız modda e2e uyarıyı görür.
   - Başına `> ONAY GEREKLİ (ödeme)` yaz; ECC: backend-patterns, api-design, security-review, tdd-workflow; 21st MCP: ödeme ekranı çevresi (özet/güven kartı).
4. PLAN task tablosuna 001b'yi ekle (bağımlı: 001).

### KURUMSAL (`~/PROJELER/AFINA-KURUMSAL`)
5. `docs/PLAN.md`: "tek sayfalık landing page" kararı; route listesinden marka detay sayfalarını çıkar; detay metinleri sahne içi panel.
6. `021-brand-detail.md` (ve detay sayfası varsayan diğer task'lar) → "Marka detay paneli (landing içi)" olarak yeniden yaz; SEO task'ında marka başına ayrı sayfa yerine tek sayfa + bölüm anchor'ları (`#insaat` …) + Organization/Brand schema.

### Her iki repo
7. Commit `docs: ödeme kararı + kurumsal tek sayfa` → push main.

## Kabul kriterleri
- [x] `ls ~/PROJELER/5F-ZEYTIN/docs/tasks/001b-odeme-onizleme.md` var, `## Coder Notu

- 19 Ekim 2026: 000c’nin ZEYTİN + KURUMSAL doküman kapsamı tamamlandı. Kullanıcının bu görev için verdiği açık yetkiyle iki reponun PLAN/task dosyaları düzenlendi; ek skill kurulmadı, `documentation-and-adrs` kullanıldı.
- ZEYTİN: yalnız PayTR iFrame kararı kesinleştirildi; mağaza/anahtar teslimi açık kaldı. Eski sağlayıcı seçenekleri 000/000c dahil bütün plan/task dosyalarından kaldırıldı. 046 aynı ödeme ekranını, 047–050 PayTR oturumu/iframe/hash/idempotent callback ve sunucudan sonuç akışını tanımlar. Yeni 001b yalnız 001’e bağımlı, BEKLİYOR ve DB’sizdir.
- KURUMSAL: tek landing + “Devamını oku” marka paneli; 002, beş sahne, 021, 030–034, iletişim/KVKK, SEO, varlık, kalite, ziyaretçi, preview ve canlı kabul taslakları bu karara uyarlandı. Marka başına metadata/canonical ve başarı bekleyen route curl kontrolleri kaldırıldı; anchor/panel davranışı E2E’ye, kaldırılan path’lerin 404 kontrolü curl’e yazıldı. Tek yasal sayfa `/kvkk` istisnası korundu.
- Önizleme erişim cümlesindeki production 404 kabulü öncelikli yorumlandı: `PAYMENT_PREVIEW=1` production’da ekran/API/sonuç sayfalarını açamaz; hem 0 hem 1 için 404 kontrolü 001b’ye yazıldı. Localhost yönlendirme sonucu ödeme teyidi sayılmaz; tam callback testi 049 + erişilebilir tunnel gerektirir.

Komutla doğrulanan sonuçlar:

- `ls docs/tasks/001b-odeme-onizleme.md` dosyayı buldu; `grep -n '^## Durum:' docs/tasks/001b-odeme-onizleme.md` → `## Durum: BEKLİYOR`.
- `grep -c 'iFrame' docs/PLAN.md` → `4`. Eski sağlayıcı için özgün recursive grep kontrolü ve kabuldeki Python taraması boş sonuç verdi; 87 plan/task dosyası kontrol edildi (eşleşme yokken grep çıkış kodu 1 beklenir).
- KURUMSAL PLAN’da beş marka path’i için regex/grep eşleşmesi yok; beş `#…` anchor’ı mevcut. `git show HEAD:docs/PLAN.md` ile karşılaştırılan beş marka detay bloğunun resmi hikâye/slogan/hizmet/CTA/SEO metinleri birebir korundu.
- Python doğrulaması: ZEYTİN 83, KURUMSAL 34 task bağlantısı ve bağımlılık sırası geçerli; 001 → 001b → 002 sırası doğrulandı. Değişiklikler yalnız 10 ZEYTİN + 21 KURUMSAL Markdown plan/task dosyasında. İki repoda `git diff --check` başarılı.
- Bu doküman görevinde uygulanamayan adım yok. 001b/047–050 uygulaması, npm test/build, production HTTP 404 ve gerçek test iframe/callback kabulü sonraki BEKLİYOR görevlerin işidir; burada çalıştırılmış veya tamamlanmış sayılmadı. Uygulama kodu, npm install, hesap/anahtar oluşturma veya deploy yapılmadı. MLNEW ve AFINA-KAYNAK’a yazılmadı.

## Durum: TAMAMLANDI`
- [x] `grep -c "iFrame" ~/PROJELER/5F-ZEYTIN/docs/PLAN.md` ≥ 1
- [x] ZEYTİN kökünde `python3 -c "from pathlib import Path; files=[Path('docs/PLAN.md'), *Path('docs/tasks').rglob('*.md')]; print('\n'.join(str(f) for f in files if ('iy'+'zico') in f.read_text().lower()), end='')"` → boş (eski sağlayıcı adı hiçbir plan/task dosyasında yok)
- [x] `grep -rn "/insaat\|/motors\|/borek\|/coffee" ~/PROJELER/AFINA-KURUMSAL/docs/PLAN.md` → route olarak geçmiyor (yalnız anchor `#…`)
- [x] İki repo push'lu, `git status` temiz

## Yapılmaması gerekenler
- Uygulama kodu, npm install, anahtar/hesap oluşturma
- `~/PROJELER/MLNEW` veya `AFINA-KAYNAK`'a yazma

## Coder Notu

- 19 Ekim 2026: 000c’nin ZEYTİN + KURUMSAL doküman kapsamı tamamlandı. Kullanıcının bu görev için verdiği açık yetkiyle iki reponun PLAN/task dosyaları düzenlendi; ek skill kurulmadı, `documentation-and-adrs` kullanıldı.
- ZEYTİN: yalnız PayTR iFrame kararı kesinleştirildi; mağaza/anahtar teslimi açık kaldı. Eski sağlayıcı seçenekleri 000/000c dahil bütün plan/task dosyalarından kaldırıldı. 046 aynı ödeme ekranını, 047–050 PayTR oturumu/iframe/hash/idempotent callback ve sunucudan sonuç akışını tanımlar. Yeni 001b yalnız 001’e bağımlı, BEKLİYOR ve DB’sizdir.
- KURUMSAL: tek landing + “Devamını oku” marka paneli; 002, beş sahne, 021, 030–034, iletişim/KVKK, SEO, varlık, kalite, ziyaretçi, preview ve canlı kabul taslakları bu karara uyarlandı. Marka başına metadata/canonical ve başarı bekleyen route curl kontrolleri kaldırıldı; anchor/panel davranışı E2E’ye, kaldırılan path’lerin 404 kontrolü curl’e yazıldı. Tek yasal sayfa `/kvkk` istisnası korundu.
- Önizleme erişim cümlesindeki production 404 kabulü öncelikli yorumlandı: `PAYMENT_PREVIEW=1` production’da ekran/API/sonuç sayfalarını açamaz; hem 0 hem 1 için 404 kontrolü 001b’ye yazıldı. Localhost yönlendirme sonucu ödeme teyidi sayılmaz; tam callback testi 049 + erişilebilir tunnel gerektirir.

Komutla doğrulanan sonuçlar:

- `ls docs/tasks/001b-odeme-onizleme.md` dosyayı buldu; `grep -n '^## Durum:' docs/tasks/001b-odeme-onizleme.md` → `## Durum: BEKLİYOR`.
- `grep -c 'iFrame' docs/PLAN.md` → `4`. Eski sağlayıcı için özgün recursive grep kontrolü ve kabuldeki Python taraması boş sonuç verdi; 87 plan/task dosyası kontrol edildi (eşleşme yokken grep çıkış kodu 1 beklenir).
- KURUMSAL PLAN’da beş marka path’i için regex/grep eşleşmesi yok; beş `#…` anchor’ı mevcut. `git show HEAD:docs/PLAN.md` ile karşılaştırılan beş marka detay bloğunun resmi hikâye/slogan/hizmet/CTA/SEO metinleri birebir korundu.
- Python doğrulaması: ZEYTİN 83, KURUMSAL 34 task bağlantısı ve bağımlılık sırası geçerli; 001 → 001b → 002 sırası doğrulandı. Değişiklikler yalnız 10 ZEYTİN + 21 KURUMSAL Markdown plan/task dosyasında. İki repoda `git diff --check` başarılı.
- Bu doküman görevinde uygulanamayan adım yok. 001b/047–050 uygulaması, npm test/build, production HTTP 404 ve gerçek test iframe/callback kabulü sonraki BEKLİYOR görevlerin işidir; burada çalıştırılmış veya tamamlanmış sayılmadı. Uygulama kodu, npm install, hesap/anahtar oluşturma veya deploy yapılmadı. MLNEW ve AFINA-KAYNAK’a yazılmadı.

## Durum: TAMAMLANDI
