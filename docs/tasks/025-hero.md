# Task 025: Hero bileşeni

## Tür
frontend

## Amaç
Hero içeriğini ve duyarlı yerleşimini kur.

## Bağlam
`docs/PLAN.md`: Hedef, Teknoloji, Mimari kararlar ve ilgili kapsam bölümü. Bağımlı task’lar / addBlockedBy: 024 (shell). Komutlar 001 görevinde kurulacak araçlara dayanır; bağımlılıklar tamamlanmadan bu task çalıştırılmaz.

## Kullanılacak araçlar
- ECC skill: frontend-patterns, frontend-design-direction
- 21st MCP: evet — premium hero
- find-skills ile bulunup kurulacak ek skill: yok; yeni ihtiyaç varsa önce `npx skills find <konu>`, kurulan skill Coder Notu’na yazılır.

## Dokunulacak dosyalar
- `components/landing/Hero.tsx` (oluştur / düzenle)
- `app/page.tsx` (oluştur / düzenle)
- `tests/e2e/hero.spec.ts` (oluştur / düzenle)

## Adımlar
1. PLAN, AGENTS ve bağımlı task’ları oku; gereken kullanıcı kararları/onayları yoksa başlamadan Coder Notu’na engeli kaydet.
2. Ana slogan “Kökü toprakta. Yeri sofrada.”, alt “Toprağın sunduğu lezzet, Afina’nın özeniyle.” birebir. “Ürünlerimizi Keşfedin” → ≤6 ürünlü perakende vitrin; “Toptan Satış İçin İletişime Geçin” → #toptan-iletisim. Resmi bölüm 04, optimize zeytin logosu; onaylı sahne görseli yoksa etiketli placeholder. Bu görevde scroll animasyonu ekleme.
3. Uygulama görevinde ilgili davranış testini önce başarısız çalıştır, uygula ve geçir. Görsel görevinde model/kaynak/çıktı doğrulaması yap; key ve kişisel veri kaydetme.
4. Kabul komutlarını çalıştır, çıktıyı ve varsa kullanıcı onay kaydını Coder Notu’na ekle; yalnız bu task kapsamını commit et.

## Kabul kriterleri
- [ ] `npm run test:e2e -- tests/e2e/hero.spec.ts` başarılı; aşağıdaki davranışın normal, hata ve reduced-motion/klavye senaryoları doğrulanır.
- [ ] `npm run lint && npm run typecheck && npm run build` başarılı.

- [ ] `npm run test:e2e -- tests/e2e/hero.spec.ts` iki sloganı ve perakende/toptan CTA metin-hedeflerini resmi kaynakla birebir doğrular.

## Yapılmaması gerekenler
- Task dışına çıkma, ek iyileştirme yapma; diğer repolara yazma.
- Kullanıcı yerine açık karar verme; gizli bilgi commit etme; onaysız görseli yayınlama.
- Gerçek ödeme, üretim DB değişikliği, canlı e-posta veya domain mutasyonu için bu taslağı tek başına yetki sayma.

## Coder Notu

### Başlangıç ve TDD / RED — 20 Ekim 2026

- `main`, temiz çalışma ağacı; bağımlı 024 (024-a dahil) `TAMAMLANDI`. Resmi logo setinin kullanıcı onayı kayıtlıdır; 14 marka varlığı `approved` / `runtime: true`. Onaylı hero sahnesi yoktur; adım 2'de açıkça izin verilen etiketli placeholder kullanılacaktır. Görsel üretimi veya yeni onay kararı bu görevin kapsamında değildir.
- `frontend-patterns`, `frontend-design-direction`, `tdd-workflow` okundu. Yerel Next.js 16.4.2 sayfa / Server Component / image kılavuzları incelendi. 21st MCP `search` ve `get_component` ile [Editorial Hero](https://21st.dev/@felipemenezes098/components/hero-05) (19075) alındı; sol marka/hikâye, sağ slogan/CTA ve altta geniş medya alanı marka tokenlarına uyarlanacak. Kaynağın animasyon ve ek paketleri alınmayacak. `npm_config_cache="$PWD/.cache/npm" npx shadcn@latest docs button` → **exit 0**; mevcut özelleştirilmiş Button kullanılacak. Ek skill/bağımlılık kurulmadı.
- Tasarım sözleşmesi: perakende ve toptan ziyaretçi ilk ekranda markayı ve resmi iki sloganı okur; öncelikli eylem ürünler, ikinci eylem toptan taleptir. Fildişi yüzey, zeytin rengi metin/ana CTA, şampanya altını detaylar; serif slogan ve sakin editoryal yerleşim. Hedefler: **320×900, 390×900, 768×900, 1440×900**. Referans: resmi bölüm 04, mevcut shell/tokenlar ve 21st Editorial Hero.
- Kapsam sınırı: 030 ürün kartları ve 081 toptan formu henüz uygulanmadı. `app/page.tsx` içinde hero CTA'larına gerçek hash/odak hedefi sağlayan açık boş durumlar kurulacak; ürün, fiyat, stok veya gönderim başarısı uydurulmayacak. En fazla 6 ürün sözleşmesi korunur; bu görev gerçek katalog/form uygulamaz. Optimize zeytin logosu mevcut onaylı navbar'da korunur; hero içinde ikinci logo kopyası eklenmez.
- Yolculuklar/test eşlemesi (`tests/e2e/hero.spec.ts`): resmi slogan/CTA eşitliği ve hedefe varış; onaylı logo + sahne placeholder'ı; logo isteği hatasında kullanılabilir içerik/CTA; normal/reduced-motion klavye/odak; JavaScript olmadan yerel bağlantılar. Statik hero için async yükleme/submit/izin durumu yoktur; boş/eksik sahne ve logo hata durumları tarayıcıda sınanır.
- `npm run build` → **exit 0**, mevcut checkout'un production çıktısı `next start -p 3025` ile başlatıldı. 3004'teki mevcut süreç korundu. `PLAYWRIGHT_BASE_URL=http://localhost:3025 PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/ms-playwright" npm run test:e2e -- tests/e2e/hero.spec.ts --project=chromium-320 --grep 'hero matches' --output=.cache/task-025/red-results` → **exit 1**: `getByRole('region', { name: 'Afina Zeytin' })` bulunamadı. Test derlenip çalıştı, eksik hero davranışı doğrulandı. İlk koşumdaki macOS `MachPortRendezvousServer: Permission denied` ortam hatası süreç izniyle giderildi; geçerli RED ikinci koşumdaki eksik uygulamadır. Rapor/trace/ekran `.cache/task-025/red-results/` altında yereldir.

### Uygulama / GREEN

- `components/landing/Hero.tsx` statik Server Component olarak kuruldu; 21st düzeni fildişi/zeytin/altın tokenlarına, serif slogana ve mevcut shadcn Button'a uyarlandı. Ek bağımlılık, animasyon veya istemci durum yönetimi eklenmedi. Resmi bölüm 04'teki iki slogan, marka adı, tesis konumu ve ilk hikâye cümlesi kullanıldı. Mevcut `Afina Zeytin` h1 / ortak kabuk sözleşmesi korundu.
- Ana CTA `Ürünlerimizi Keşfedin` → `#urunler`, ikincil CTA `Toptan Satış İçin İletişime Geçin` → `#toptan-iletisim`. Native bağlantılar JavaScript olmadan çalışır; hedeflerin `tabIndex=-1` ve scroll margin'i odağın sticky navbar altında görünmesini sağlar. Boş perakende alanında **0 ürün** bulunur (≤6); toptan hedefi formun henüz açık olmadığını belirtir. Katalog ve gerçek form sonraki görevlerin kapsamıdır. Shell'in önceki `/#toptan` sözleşmesi bu task dışında olduğundan değiştirilmedi; hero, 025/081'in açık `#toptan-iletisim` sözleşmesini kullanır.
- Onaylı optimize logo mevcut navbar'da yüklenir. Hero sahnesi için görünür `Hero görseli / Onaylı sahne görseli bekleniyor.` figürü kullanıldı; aday/uzak görsel, video veya canvas bağlanmadı. Kaynaklar, manifest ve kullanıcı onay kayıtları korunur.
- RED kanıtı bu dalda `70f5fde` commit'indedir. Aynı `hero matches` testi dahil önce Chromium-320 **5/5**, ardından tüm matris **60/60** GREEN oldu. Ayrı bir üretim refaktörü gerekmedi.

### Nihai komutla doğrulama — 20 Ekim 2026

| Komut / kontrol | Sonuç / doğrulanan garanti |
| --- | --- |
| `npm run lint && npm run typecheck && npm run build` | **exit 0**; Next.js production build ve prebuild varlık denetimi (**14/14**) başarılı. |
| `PLAYWRIGHT_BASE_URL=http://localhost:3025 PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/ms-playwright" npm run test:e2e -- tests/e2e/hero.spec.ts --output=.cache/task-025/final-results` | **exit 0; 60/60, 26,9 sn**. Chromium/Firefox/WebKit × 320/390/768/1440. Resmi slogan/CTA eşitliği, iki hash/odak hedefi, onaylı logo/etiketli placeholder, logo hata durumu, overflow/touch sınırları, klavye, reduced-motion, JavaScript kapalı kullanım. |
| `npm run test -- --coverage --coverage.include=app/page.tsx --coverage.include=components/landing/Hero.tsx` | **exit 0; 69/69** birim testi. İki statik render fonksiyonu için statement/function/line **%100**; branch yok. Bu ölçüm tarayıcı etkileşim kapsamı değildir; etkileşimler yukarıdaki E2E ile doğrulandı. |
| Aynı yerel env ile `npm run test:e2e -- tests/e2e/shell.spec.ts tests/e2e/bootstrap.spec.ts tests/e2e/tokens.spec.ts --output=.cache/task-025/regression-results` | Karma koşum **exit 1**: shell **60/60**, bootstrap **12/12** başarılı; token fixture'ın `PLAYWRIGHT_BASE_URL` koruması nedeniyle **12 kurulum hatası**. Hero/kabuk davranış hatası değil; token aşağıda doğru koşulla ayrıca doğrulandı. |
| `env -u PLAYWRIGHT_BASE_URL PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/ms-playwright" npm run test:e2e -- --config=.cache/task-025/playwright.tokens.config.ts tests/e2e/tokens.spec.ts --output=.cache/task-025/token-results` | **exit 0; 12/12, 13,0 sn**. Commit dışı geçici config, aynı checkout'un `localhost:3025` production sunucusunu kullanır; token fixture yerelde derlenir. Renk/kontrast, Button/Dialog, normal/hover/disabled, uzun etiketler, klavye ve reduced-motion başarılı. Proje config'i değiştirilmedi. |
| Playwright JSON raporlarına Node assertion'ları | **PASS**: hero **60**, shell/bootstrap **72**, düzeltilmiş token **12** başarılı; **12 proje**, yerel hedef. Hero/token raporlarında **0 başarısız / 0 atlanan / 0 flaky**; shell/bootstrap alt kümesindeki 72 testin her biri tek denemede geçti. |
| `node .cache/task-025/check-evidence.cjs .cache/task-025/design-evidence.json` | **exit 0**; `frontend-design-direction` yerel kanıt denetimi. Skill'in CommonJS checker'ı ESM proje içinde çalışabilmesi için baytları değişmeden `.cjs` kopyasıyla çalıştırıldı (`cmp` başarılı). |
| `git diff --check` | **exit 0**. |

Ekran/trace/raporlar `.cache/task-025/` altında yerel ve commit dışındadır. `hero-results.json`, `regression-mixed-results.json`, `tokens-results.json` ve `design-evidence.json` sonuçları saklar. Chromium **320/390/768/1440** tam sayfa, WebKit **390 reduced-motion** ve Chromium **1440 logo hata** ekranları açılıp incelendi; taşma/kesilme/çakışma yok, CTA ve placeholder okunur. Statik içerikte yükleme ve izin talebi uygulanabilir değildir; boş ürün, eksik sahne, logo hatası ve başarılı hedefe varış durumları kanıt kaydında ayrıdır.

Task 025 kapsamında kalan engel yoktur. Sahne placeholder'ı görevde izin verilen sonuçtur; ürün kartı/toptan formu/hero hareketi 030/081/026'ya aittir. `next-env.d.ts` build'in otomatik değişikliğinden başlangıç baytlarına döndürüldü. Yalnız Hero, ana sayfa, hero testi ve bu task'ın Coder Notu/Durum alanı commit kapsamındadır. PLAN, diğer task'lar, `_legacy/`, özgün promptlar ve backend/DB/auth/ödeme/yayın ayarları değiştirilmedi.

## Durum: TAMAMLANDI
