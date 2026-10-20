# Task 024: Landing navigasyon ve footer

## Tür
frontend

## Amaç
Tek landing navigasyonunu ve footer bağlantılarını kur.

## Bağlam
`docs/PLAN.md`: Hedef, Teknoloji, Mimari kararlar ve ilgili kapsam bölümü. Bağımlı task’lar / addBlockedBy: 002 (tokens); 080 (brand-assets). Komutlar 001 görevinde kurulacak araçlara dayanır; bağımlılıklar tamamlanmadan bu task çalıştırılmaz.

## Kullanılacak araçlar
- ECC skill: frontend-patterns, accessibility
- 21st MCP: evet — navbar/footer
- find-skills ile bulunup kurulacak ek skill: yok; yeni ihtiyaç varsa önce `npx skills find <konu>`, kurulan skill Coder Notu’na yazılır.

## Dokunulacak dosyalar
- `components/site/Navbar.tsx` (oluştur / düzenle)
- `components/site/Footer.tsx` (oluştur / düzenle)
- `app/layout.tsx` (oluştur / düzenle)
- `tests/e2e/shell.spec.ts` (oluştur / düzenle)

## Adımlar
1. PLAN, AGENTS ve bağımlı task’ları oku; gereken kullanıcı kararları/onayları yoksa başlamadan Coder Notu’na engeli kaydet.
2. Klavye, mobil menü, sepet ve hesap bağlantıları; public/brand/ optimize zeytin/topluluk logoları. Ana slogan “Kökü toprakta. Yeri sofrada.”; Tesisimiz, ürünler, toptan talep ve hukuk hash/link hedefleri. Nihai ürün/fiyat uydurma; resmi metin kaynağı docs/referans/icerik.md bölüm 01 + 04.
3. Uygulama görevinde ilgili davranış testini önce başarısız çalıştır, uygula ve geçir. Görsel görevinde model/kaynak/çıktı doğrulaması yap; key ve kişisel veri kaydetme.
4. Kabul komutlarını çalıştır, çıktıyı ve varsa kullanıcı onay kaydını Coder Notu’na ekle; yalnız bu task kapsamını commit et.

## Kabul kriterleri
- [ ] `npm run test:e2e -- tests/e2e/shell.spec.ts` başarılı; aşağıdaki davranışın normal, hata ve reduced-motion/klavye senaryoları doğrulanır.
- [ ] `npm run lint && npm run typecheck && npm run build` başarılı.

## Yapılmaması gerekenler
- Task dışına çıkma, ek iyileştirme yapma; diğer repolara yazma.
- Kullanıcı yerine açık karar verme; gizli bilgi commit etme; onaysız görseli yayınlama.
- Gerçek ödeme, üretim DB değişikliği, canlı e-posta veya domain mutasyonu için bu taslağı tek başına yetki sayma.

## Coder Notu

- Başlangıç kontrolü: 002 ve 080 `TAMAMLANDI`, çalışma ağacı temiz ve dal `main`. Ancak 080 çıktıları manifestte `candidate`, `approval: null`; kullanıcı görsel onayı bulunmuyor. AGENTS/PLAN uyarınca zeytin/topluluk logoları onay gelmeden runtime'a bağlanamaz. Bu engel uygulama öncesinde kaydedildi; görsel onay kayıtları değiştirilmedi. Metin tabanlı kabuk uygulandı, logo yerleşimi eksik kaldığı için durum `BEKLİYOR` bırakıldı.
- TDD / RED (20 Ekim 2026): `PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/ms-playwright" npm run test:e2e -- tests/e2e/shell.spec.ts --project=chromium-320 --grep 'shell exposes'` → **exit 1**, uygulama henüz header içermediği için `getByRole('banner')` bulunamadı. İlk denemedeki Chromium `MachPortRendezvousServer: Permission denied` ortam hatası süreç izniyle çözüldü; geçerli RED doğrudan eksik uygulama davranışıdır.

### Uygulama ve kapsam

- `frontend-patterns`, `accessibility` ve `tdd-workflow` skill'leri kullanıldı; ek skill veya bağımlılık kurulmadı. 21st MCP `search` / `get_component` ile [Mega Menu Navbar](https://21st.dev/@anelkabag/components/navbar2) (31723) ve [Footer Two](https://21st.dev/@meschacirung/components/footer-2) (27521) alındı; masaüstü/mobil navigasyon ve gruplu footer yapısı AFİNA tokenlarına, Türkçe resmi içeriğe ve tek landing kapsamına uyarlandı.
- Mevcut shadcn Button/Dialog kullanıldı. `npm_config_cache="$PWD/.cache/npm" npx shadcn@latest docs button dialog` → **exit 0**, resmi belgeler doğrulandı; bileşen veya tema yeniden kurulmadı. Yeni animasyon eklenmedi; mevcut reduced-motion desteği korundu.
- Navbar: masaüstü navigasyon, mobil modal, hesap/sepet bağlantıları. Menü ilk bağlantıya odaklanır; Tab/Shift-Tab odak tuzağı, Escape, kapatma düğmesi, dış alan ve bağlantı seçimiyle kapanır. Masaüstüne geçildiğinde modal/scroll kilidi kalkar ve görünür ana sayfa bağlantısı odaklanır. Layout'ta klavyeyle görünür olan içerik atlama bağlantısı eklendi.
- Footer: resmi alt slogan ve tesis konumu, keşif/hukuk bağlantı grupları ve `https://afina.com.tr` topluluk bağlantısı. Marka adı düz metindir; yeni logo, ürün, fiyat, iletişim veya hukuki metin üretilmedi.
- Hedef sözleşmesi: `/#urunler`, `/#tesisimiz`, `/#toptan`, `/hesabim`, `/sepet`, `/kvkk`, `/mesafeli-satis`, `/iade`. Landing bölümleri 025–033/081; hesap, sepet ve hukuk sayfaları 043/037/073 görevlerinin kapsamındadır ve mevcut checkout'ta henüz yoktur. Testler bu bağlantıların href değerlerini, menü davranışını ve bulunamayan sayfadan landing'e dönüşü doğrular; gelecekteki bölüm/form/hesap/sepet/hukuk işlevlerinin hazır olduğu iddia edilmez.
- Ara koşumlarda modalın arka planı erişilebilirlik ağacından gizlemesine uygun sorgu düzeltildi. Klavye testi ilk bağlantı odağındaki eksikliği buldu; `onOpenAutoFocus` ile düzeltildi. Dış alan tıklaması Playwright'ın görünürlük/kararlılık kontrolünü kullanan locator ile doğrulandı; sabit bekleme eklenmedi.

### Nihai komutla doğrulama — 20 Ekim 2026

| Komut / kontrol | Sonuç |
| --- | --- |
| `npm run lint && npm run typecheck && npm run build` | **exit 0**; production build ve prebuild varlık denetimi başarılı. Son test düzenlemesinden sonra lint/typecheck ayrıca başarılı. |
| `PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/ms-playwright" npm run test:e2e -- tests/e2e/shell.spec.ts` | **exit 0; 48/48 başarılı, 19,0 sn**. Chromium/Firefox/WebKit × 320/390/768/1440; normal, 404, klavye, reduced-motion, mobil menü ve resize. Kısa ekran 320×480 ayrıca doğrulandı. |
| `PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/ms-playwright" npm run test:e2e -- tests/e2e/bootstrap.spec.ts tests/e2e/tokens.spec.ts` | **exit 0; 24/24 başarılı, 21,7 sn**. Ortak layout, marka tokenları, kontrast ve mevcut Dialog/Button regresyonu yok. |
| `npm run test -- --coverage` | **exit 0; 53/53 başarılı**. Mevcut iki dosyanın kapsamı %100; bu rapor yeni kabuğun satır kapsamını ölçmez, kabuk tarayıcı testleriyle doğrulandı. |
| Playwright JSON raporlarının Node assertion'ları | **PASS**: yerel `localhost:3004`, 12 proje, shell 48 / regresyon 24 başarılı; **0 başarısız, 0 atlanan, 0 flaky**. |
| Manifest kontrolü | **PASS**: 14 varlığın tamamı hâlâ `candidate`, `approval: null`; runtime'da aday görsel yok. |
| `git diff --check` | **exit 0**. |

Shell raporu/ekran görüntüleri `.cache/task-024/shell-results/`, regresyon JSON'u `.cache/task-024/regression-results.json` altında yerel ve commit dışındadır. Chromium 320/1440 tam sayfa ve WebKit 390 mobil menü görüntüleri görsel olarak açılıp incelendi; taşma/kesilme yok. Safari/macOS klavyede Option-Tab, diğer tarayıcılarda Tab kullanıldı. RED kanıtı `5a2a239` commit'inde, uygulama/GREEN kanıtı bu notu taşıyan sonraki task commit'indedir.

**Kalan engel:** Adım 2'de istenen optimize zeytin/topluluk normal/dark logolarının runtime yerleşimi, kullanıcı görsel onayı olmadığı için yapılmadı. Kabul komutları başarılı olsa da bu gereksinim tamamlanmadığından `TAMAMLANDI` yazılmadı. PLAN, diğer task dosyaları, görsel onay/manifest kayıtları, kaynaklar, `_legacy/`, servis/DB/auth/ödeme ve yayın ayarları değiştirilmedi.

## Düzeltme 024-a (Claude, 20 Eki)
**Kullanıcı görsel onayı alındı.** Kullanıcı 2026-10-20: "sana vermiştim logoları bir kontrol et pdflerde vardı" — logolar kullanıcının kendi resmi Illustrator PDF'inden (AFİNA Logolar2.pdf) çıkarıldı; Claude karşılaştırma şeridini (docs/referans/logolar/karsilastirma.png) kullanıcıya açtı ve orijinal PNG ↔ optimize SVG ↔ dark SVG uyumunu doğruladı. Kullanıcı kararı: logo seti (6 normal + 6 dark SVG, favicon, OG) ONAYLI.
Bu onayı `docs/gorsel-onay.md` makine kayıt bloğuna (`asset-approvals`) her logo/favicon/OG çıktısı için dosya SHA-256 ve kaynak hash'lerine bağlı `approvedBy: "user"`, `approvedAt: "2026-10-20"`, `evidence` alanıyla işle; manifestte ilgili varlıkları `approved`/`runtime=true` yap, `public/brand/` yerleşimini tamamla, `check-assets` dahil tüm kabul kriterlerini yeniden çalıştır.

## Coder Notu

### Düzeltme 024-a — 20 Ekim 2026

- Başlangıç: `main`, temiz çalışma ağacı; 002/080 task dosyaları `TAMAMLANDI`. Yukarıdaki Claude onay kaydı 14 marka çıktısı için kullanıcı kararını açıkça kaydediyor. Bu düzeltme, `docs/gorsel-onay.md` ve manifestteki onay alanlarının güncellenmesine de yetki veriyor; PLAN ve diğer task dosyaları korunur.
- `frontend-patterns`, `accessibility`, `tdd-workflow` yüklendi; yeni skill/paket kurulmadı. 21st MCP navbar/footer araması yapıldı; mevcut uygulamanın dayandığı Mega Menu Navbar (31723) ve Footer Two (27521) kodları yeniden incelendi. Yerel Next.js 16.4.2 image/metadata kılavuzları okundu.
- TDD / RED: `npm run test -- tests/unit/asset-registry.test.ts` → **exit 1; 6 başarısız / 56 başarılı**. İstenen `asset-approvals` ve `runtime` alanlarının henüz desteklenmemesi doğrulandı.
- TDD / RED: `PLAYWRIGHT_BASE_URL=http://localhost:3024 PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/ms-playwright" npm run test:e2e -- tests/e2e/shell.spec.ts --project=chromium-320 --grep "shell exposes"` → **exit 1**; navbar'da `Afina Zeytin` isimli logo bulunamadı. Test güncel checkout'un `npm run build` çıktısından başlatılan `next start -p 3024` üzerinde çalıştı. 3004 kullanımda olduğu için mevcut süreç korunarak 3024 seçildi. İlk tarayıcı denemesindeki macOS MachPort izin hatası süreç izniyle çözüldü; geçerli RED eksik logo davranışıdır.
- Yolculuklar: onaylı logoların bozulmadan yüklenmesi ve favicon/OG bağlantıları; logo isteği başarısız olduğunda erişilebilir bağlantılar; mevcut mobil/klavye/reduced-motion/404 davranışlarının korunması; onay/kaynak hash'i uyuşmadığında ve runtime izni olmadığında doğrulamanın reddi.

## Durum: BEKLİYOR
