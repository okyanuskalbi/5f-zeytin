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

## Durum: BEKLİYOR
