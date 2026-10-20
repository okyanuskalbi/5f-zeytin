# Task 081: Toptan satış talep formu

## Tür
frontend

## Amaç
Perakende satışın yanında resmi toptan CTA’sını ve erişilebilir talep formunu landing içine ekle.

## Bağlam
`docs/PLAN.md` ve resmi `docs/referans/icerik.md` içerik sözleşmesi. Bağımlı task’lar / addBlockedBy: 024 (shell); 073 (legal). Bağımlılıklar tamamlanmadan uygulanmaz.


## Kullanılacak araçlar
- ECC skill: frontend-patterns, accessibility, tdd-workflow
- 21st MCP: evet — proje tokenlarına uyarlanan form/sayfa düzeni
- find-skills ile bulunup kurulacak ek skill: yok; mevcut araçlar yeterli, yeni kurulum gerekirse Coder Notu’na yaz.

## Dokunulacak dosyalar
- `components/landing/WholesaleForm.tsx` (oluştur / düzenle)
- `lib/contracts/wholesale.ts` (oluştur / düzenle)
- `app/page.tsx` (oluştur / düzenle)
- `tests/e2e/wholesale-form.spec.ts` (oluştur / düzenle)

## Adımlar
1. PLAN, AGENTS, resmi docs/referans/icerik.md bölüm 04 ve KVKK görevini oku. Toptan satış için gerçek fiyat/katalog veya yeni DB oluşturma.
2. Önce form davranışı E2E testini yaz. “Toptan Satış İçin İletişime Geçin” CTA → #toptan-iletisim; kaynaktaki sofralık zeytin/salamura zeytin/zeytinyağı kapsamı korunur, ≤6 aktif perakende ürünü sınırı değişmez.
3. İsim/firma, iletişim e-postası/telefonu ve talep mesajı; asgari gerekli alanlarla istemci sözleşmesini kur, alan/uzunluk ve hataları erişilebilir göster. KVKK aydınlatma bağlantısı; pazarlama iznini otomatik işaretleme veya taleple birleştirme. Alıcı/iletişim bilgisi kullanıcıdan gelir.
4. Form submit bağımlılığı enjekte edilebilir olsun; bu task testte mock başarı/hata/pending kullanır. 082 gerçek servis bağlantısı yokken runtime gönderildi başarısı gösterme; form durumu bunu açık yansıtır. Ürün/sepet/ödeme akışını değiştirme.
5. Klavye/odak, mobil ve reduced-motion testlerini geçir; resmi CTA eşitliği ve sonuçları Coder Notu’na yaz.

## Kabul kriterleri
- [ ] `npm run test:e2e -- tests/e2e/wholesale-form.spec.ts` CTA hash/odak hedefini, geçersiz alanları, KVKK bağlantısını ve mock pending/başarı/hata durumlarını doğrular.
- [ ] `npm run lint && npm run typecheck && npm run build` başarılı; backend hazır değilken sahte gönderim başarısı yok.

## Yapılmaması gerekenler
- Task dışına çıkma; diğer repolara ve salt okunur AFINA-KAYNAK klasörüne yazma.
- Resmi metinleri yeniden yazma, belgesiz iddia/ürün/fiyat/iletişim bilgisi üretme.
- Servis/hesap/kanal kararlarını kullanıcı yerine verme; gizli bilgi commit etme.

## Coder Notu

### Bağımlılık kontrolü ve kabul komutları — 20 Ekim 2026

- Başlangıç: repo kökü `/Users/emre/PROJELER/5F-ZEYTIN`, dal `main`, çalışma ağacı temiz. PLAN, AGENTS, resmi içerik bölüm 04 ve 024/073 görevleri okundu. `frontend-patterns`, `accessibility`, `tdd-workflow` skill'leri incelendi; ek skill/paket kurulmadı. 21st MCP `search` ile form adayları bulundu; uygulamaya alınmadı.
- **Engel:** 024 `TAMAMLANDI`, ancak zorunlu bağımlılık `docs/tasks/073-legal.md` hâlâ `BEKLİYOR`. `app/kvkk/page.tsx` de “Taslak — onay bekleniyor” ve “Onaylı metin henüz eklenmedi.” durumunda. Bu görevin “Bağımlılıklar tamamlanmadan uygulanmaz.” kuralı nedeniyle form/sözleşme/E2E uygulamasına başlanmadı; bağımlılık ve hukuk onayı kendiliğinden tamamlanmış sayılmadı.

| Komut | Sonuç |
| --- | --- |
| `npm run lint && npm run typecheck && npm run build` | **exit 0**; mevcut uygulamanın lint, tip kontrolü ve production build'i başarılı. Prebuild varlık denetimi **18/18 PASS**. Formun uygulandığına veya kabul edildiğine kanıt değildir. |
| `PLAYWRIGHT_PORT=3081 npm run test:e2e -- tests/e2e/wholesale-form.spec.ts` | **exit 1 — No tests found.** Görev uygulanmadığından istenen test dosyası mevcut değil. Testler atlanmış/başarılı sayılmadı; bu sonuç TDD RED davranış kanıtı değildir. |
| `git diff --check` | **exit 0**; görev notunda boşluk/patch hatası yok. |

- Resmi CTA metni kaynakta **“Toptan Satış İçin İletişime Geçin”** olarak doğrulandı; CTA hash/odak, geçersiz alanlar, formdaki KVKK bağlantısı, mock pending/başarı/hata, klavye/mobil/reduced-motion kabulü henüz doğrulanamadı. Form ve gönderim başarısı eklenmedi; backend/DB/e-posta, ürün/sepet/ödeme akışları ve diğer dokümanlar değiştirilmedi.
- Devam koşulu: 073 görevinin kullanıcı onaylı hukuk içerikleriyle tamamlanması; ardından 081 için önce davranış E2E testi, uygulama ve kabul komutları. Mevcut task'ın kabul kriterleri karşılanmadığından durum **BEKLİYOR** bırakıldı.

### Yeniden uygulama / TDD RED — 20 Ekim 2026

- Güncel bağımlılıklar tekrar okundu: 024 `TAMAMLANDI`; 073 sonundaki **Claude kararı (20 Eki)** taslak hukuk sayfalarını kabul ediyor, 081'in taslak KVKK bağlantısıyla ilerlemesine açıkça izin veriyor ve 073 `TAMAMLANDI`. Yukarıdaki eski bağımlılık engeli bu kararla kalktı. Kullanıcı onaylı nihai hukuk metinleri ve iletişim/gönderim kararları verilmiş sayılmadı.
- Araçlar: proje `frontend-patterns`, `accessibility`, `tdd-workflow` skill'leri ve yerel Next.js server/client + forms kılavuzları okundu. 21st `search` + `get_component` ile [Contact Form](https://21st.dev/@kevingirelli/components/contact-form) (35258) alındı. Resmi CLI `docs button input textarea label` ve `view @shadcn/input @shadcn/textarea` başarılı; yeni skill kurulmadı.
- Başlangıç `npm run build` **exit 1**: varlık denetleyicisi `docs/referans/tesis/afina-zeytin-tesis-osmaniye.png` dosyasını bulamıyor. Manifest bu yolu kullanırken `docs/gorsel-onay.md` orijinal fotoğrafın repoda tutulmayacağını, yalnız bulanık kopyanın tutulacağını belirtiyor. Bu görev kapsamındaki form değişikliklerinden önce de mevcut. Manifest/kaynak görsel değiştirilmedi. `npx next build` **exit 0** ile ayrı yerel tarayıcı doğrulaması için başlangıç çıktısı alındı; bu, standart build kabulünün geçtiği iddiası değildir.
- Önce form davranışı E2E testi, yalnız testte yaşayan enjekte edilebilir mock fixture ve istemci sözleşmesi sınır testleri yazıldı. `PLAYWRIGHT_PORT=3081 npm run test:e2e -- tests/e2e/wholesale-form.spec.ts --project=chromium-320 --grep 'landing CTA' --output=.cache/task-081/red-results` **exit 1**: gerçek landing'de beklenen `#toptan-iletisim` bağlantısı bulunamadı (mevcut CTA disabled button). Geçerli RED eksik özellik davranışıdır. İlk `^landing CTA` filtresi test bulmadı; ilk tarayıcı koşumundaki macOS MachPort sandbox hatası süreç izniyle çözüldü; bu iki sonuç RED sayılmadı.

### Uygulama / hedefli GREEN — 20 Ekim 2026

- 21st Contact Form (35258) düzeni, enjekte edilen submit ve kalıcı status/alert bölgeleri AFİNA yeşil/fildişi tokenlarına uyarlandı. Resmi CLI `add input textarea --yes` ile iki shadcn bileşeni eklendi; kare köşe, 44 px kontrol yüksekliği, gölgesiz görünüm, marka renkleri ve görünür focus ile özelleştirildi. Yeni paket/skill yok.
- `WholesaleForm` ve `lib/contracts/wholesale.ts`: isim/firma (2–120), e-posta (≤254) veya telefon (7–15 rakam, ≤30), talep (10–2000); trim, alan hata açıklaması ve ilk hataya odak. Pazarlama izni/onay kutusu eklenmedi. `/kvkk` bağlantısı açıkça taslak olduğunu belirtir. Submit yalnız açık `{ok:true}` sonucunda başarı gösterir; olumsuz sonuç/exception'da değerler korunur, yeniden deneme mümkündür. Pending alanları/düğmeyi kilitler ve ref ile aynı tick çift gönderimi de engeller.
- Landing'deki mevcut kartın disabled CTA'sı resmi metni birebir koruyan `#toptan-iletisim` bağlantısına çevrildi; odaklanabilir bölüm kimliği ve adres korundu, form `app/page.tsx` üzerinden çocuk olarak eklendi. Bu nedenle `WholesaleContact.tsx`/CSS ve form yokluğu bekleyen eski 095 unit/E2E assertion'ları yalnız yeni form davranışı için güncellendi. Ürünler, ≤6 sınırı, sepet/ödeme, backend/DB/e-posta ve diğer dokümanlar değişmedi.
- Runtime'da `submitRequest` yok: gönderim kullanıma açık değil bilgisi görünür, submit kapalı, başarı yok. SSR/JavaScript kapalıyken fieldset kapalı; bilgi URL'ye veya native submit'e gitmez. Mock kontrol düğmeleri yalnız `tests/e2e/fixtures/` içinde, uygulamada test modu/route yok. İlk ara koşumda boş canlı bölgenin `display:none` olması erişilebilirlik sorgusunu engelledi; canlı bölgeler sürekli erişilebilir bırakılarak düzeltildi.
- `PLAYWRIGHT_PORT=3081 npm run test:e2e -- tests/e2e/wholesale-form.spec.ts --output=.cache/task-081/final-results` → **exit 0; 78/78, 26,5 sn**. Chromium/Firefox/WebKit × 320/390/768/1440 + iPhone 14; resmi CTA hash/odak, geçersiz alanlar, gerçek taslak KVKK sayfası, mock pending/başarı/hata/rejection/tekrar, çift gönderim, 480 px kısa ekran/klavye/reduced-motion ve JS kapalı davranışı. JSON assertion: **13 proje, 0 başarısız / 0 atlanan / 0 flaky**; yerel rapor `.cache/task-081/wholesale-results.json`.
- `npm run test -- tests/unit/wholesale-form.test.ts tests/unit/wholesale-form-ui.test.tsx tests/unit/faq-contact-footer.test.tsx --coverage --coverage.include=lib/contracts/wholesale.ts --coverage.include=components/landing/WholesaleForm.tsx` → **exit 0; 22/22**, hedefli statement/function/line **%100**, branch **%98,46**. İlk kapsam denemesi yalnız SSR yaptığı için eşik altındaydı; gerçek etkileşim, payload normalizasyonu, aynı tick çift submit ve tekrar deneme testleriyle kapandı. Bu, global uygulama kapsamı iddiası değildir.
- `npm run lint && npm run typecheck && npm run build` → lint/typecheck **exit 0**; prebuild **exit 1**, aynı eksik tesis kaynak dosyası. `npx next build` ayrıca **exit 0**; tarayıcı testleri bu güncel yerel production çıktısı üzerindedir. Standart kabul zinciri geçmediğinden durum şimdilik **BEKLİYOR**; mevcut kaynak/manifest uyuşmazlığı task dışında kendiliğinden düzeltilmedi.

### Son durum bildirimi düzeltmesi — 20 Ekim 2026

- Son incelemede başarıdan sonra sıfırlanan boş formun yeniden submit edilmesinde eski başarı mesajının kaldığı bulundu. Önce `npm run test -- tests/unit/wholesale-form-ui.test.tsx` **exit 1; 1 başarısız / 5 başarılı** ile yeniden üretildi; RED checkpoint `4fea4a1`. Geçersiz yeni denemede durum `idle` yapılınca aynı test GREEN; E2E başarı senaryosuna da boş tekrar/ilk hataya odak/çağrı sayısının artmaması eklendi.
- Aynı hedefli coverage komutu **exit 0; 23/23**, statement/function/line **%100**, branch **%98,46**; lint ve typecheck **exit 0**.
- İlk iletişim/footer regresyon koşumu **74/78**: dört Firefox hukuk sayfasından geri dönüş testinde eski yardımcı `200` beklerken geçerli cache revalidation `304` aldı. Yardımcı yalnız `200`/`304` kabul edecek şekilde düzeltildi; asıl sayfa/içerik/link assertion'ları korunur. Test sonucu son koşumda tekrar doğrulanacak; bu ara hata gizlenmedi.
- İzole formun Chromium 1440 ve WebKit 390 ekranları açılarak incelendi; alan, etiket, KVKK ve focus görünür, yatay taşma/kırpılma yok. Runtime bölüm ekranı da son E2E koşumuna eklendi.

### Nihai doğrulama ve kalan engel — 20 Ekim 2026

- Görsel kontrolün ek testi, sabit ürün kısayolunun mobil form paneline girdiğini doğruladı: Chromium 320 `--grep 'floating product shortcut'` **exit 1**, overlap `true`; RED checkpoint `76e02b5`. Yeni forma mevcut `data-reading-safe` sözleşmesi eklenerek panelin tamamı korundu; hero/sepet kodu veya animasyonu değiştirilmedi. Son test viewport ekranları (Chromium 1440 / WebKit 390, form başı ve sonu) açılarak incelendi: başlıklar, alanlar, KVKK ve düğme görünür, kısayol formu örtmüyor. Uzun bölümün element ekranı yerine gerçek viewport ekranları kullanıldı.

| Nihai komut / kontrol | Sonuç |
| --- | --- |
| `PLAYWRIGHT_PORT=3081 npm run test:e2e -- tests/e2e/wholesale-form.spec.ts --output=.cache/task-081/final-results` | **exit 0; 91/91, 32,1 sn**. 13 profil; önceki 78 senaryoya form boyunca kısayol örtüşme kontrolü eklendi. CTA metni kaynakla birebir; hash/odak, KVKK taslak bağlantısı, alan doğrulama, mock pending/başarı/hata/tekrar ve başarı sonrası boş deneme, klavye/kısa ekran/mobil/reduced-motion/JS kapalı kabulü geçti. |
| `PLAYWRIGHT_PORT=3081 npm run test:e2e -- tests/e2e/faq-contact-footer.spec.ts --output=.cache/task-081/regression-results` | **exit 0; 78/78, 31,2 sn**. Önbellek assertion düzeltmesinden sonra bütün SSS/iletişim/footer, yasal navigasyon ve kısayol regresyonları geçti. |
| `npm run test -- tests/unit/wholesale-form.test.ts tests/unit/wholesale-form-ui.test.tsx tests/unit/faq-contact-footer.test.tsx --coverage --coverage.include=lib/contracts/wholesale.ts --coverage.include=components/landing/WholesaleForm.tsx` | **exit 0; 23/23**. Hedefli statement/function/line **%100**, branch **%98,46**. |
| `npm run lint && npm run typecheck && npm run build` | Lint ve typecheck başarılı; zincir **exit 1**. Prebuild `check:assets`: **Eksik dosya: docs/referans/tesis/afina-zeytin-tesis-osmaniye.png**. Başlangıçtaki kaynak/manifest uyuşmazlığı sürüyor. |
| `npx next build` | **exit 0**; son form koduyla production derlemesi başarılı. Standart npm build varlık kapısının yerine geçmez; E2E yalnız bu güncel yerel çıktı üzerinde çalıştırıldı. |
| Playwright JSON assertion'ları | Her iki raporda **13 proje; 0 başarısız, 0 atlanan, 0 flaky**. `.cache/task-081/wholesale-results.json` ve `.cache/task-081/regression-results.json`, log/ekranlar yerel ve commit dışında. |
| `git diff --check` | **exit 0**. TDD RED/GREEN checkpoint'leri aktif `main` geçmişinde korunur. |

Form uygulaması ve kendi davranış kontrolleri tamamlandı. **Zorunlu standart build kabulü geçmediği için görev TAMAMLANDI sayılmadı; BEKLİYOR bırakıldı.** Eksik orijinal tesis fotoğrafı repoya taşınmadı; kaynak gizlilik/onay kaydı, manifest ve görev dışı dosyalar kendiliğinden değiştirilmedi. Bu kaynak/manifest uyuşmazlığı kendi kapsamında giderildikten sonra standart kabul zinciri tekrar çalıştırılmalıdır. Gerçek gönderim 082'ye aittir; runtime submit kapalı, sahte başarı veya gerçek e-posta/DB işlemi yoktur.

## Claude kararı (20 Eki)
Form kabul (91 e2e + 78 regresyon + 23 unit). Build hatası Claude'un plakalı kaynağı kaldırmasından kaynaklıydı; `11e0d8e` ile onarıldı (check:assets PASS, build PASS). Gerçek gönderim 082 (e-posta servisi kararı).

## Durum: TAMAMLANDI
