# Task 033: Hikâye ve tesis bölümü

## Tür
frontend

## Amaç
Kökler ve tesis hikâyesini landing içine yerleştir.

## Bağlam
`docs/PLAN.md`: Hedef, Teknoloji, Mimari kararlar ve ilgili kapsam bölümü. Bağımlı task’lar / addBlockedBy: 032 (scenes). Komutlar 001 görevinde kurulacak araçlara dayanır; bağımlılıklar tamamlanmadan bu task çalıştırılmaz.

## Kullanılacak araçlar
- ECC skill: frontend-patterns, frontend-design-direction
- 21st MCP: evet — marka hikâyesi / tesis
- find-skills ile bulunup kurulacak ek skill: yok; yeni ihtiyaç varsa önce `npx skills find <konu>`, kurulan skill Coder Notu’na yazılır.

## Dokunulacak dosyalar
- `components/landing/Facility.tsx` (oluştur / düzenle)
- `app/page.tsx` (oluştur / düzenle)
- `tests/e2e/facility.spec.ts` (oluştur / düzenle)

## Adımlar
1. PLAN, AGENTS ve bağımlı task’ları oku; gereken kullanıcı kararları/onayları yoksa başlamadan Coder Notu’na engeli kaydet.
2. “Tesisimiz” başlığı altında Osmaniye üretim tesisi ve docs/referans/icerik.md bölüm 04 marka hikâyesi birebir; sofralık/salamura zeytin, zeytinyağı, perakende + toptan kapsamı. “Köklerinden aldığı güçle büyüyor” yalnız ikincil hikâye metni olabilir. Onaylı tesis/P01–P12 varlıkları, yoksa placeholder; “%100 organik / %100 doğal” ve doğrulanmamış sertifika/liderlik/kapasite iddiaları kullanılmaz.
3. Uygulama görevinde ilgili davranış testini önce başarısız çalıştır, uygula ve geçir. Görsel görevinde model/kaynak/çıktı doğrulaması yap; key ve kişisel veri kaydetme.
4. Kabul komutlarını çalıştır, çıktıyı ve varsa kullanıcı onay kaydını Coder Notu’na ekle; yalnız bu task kapsamını commit et.

## Kabul kriterleri
- [ ] `npm run test:e2e -- tests/e2e/facility.spec.ts` başarılı; aşağıdaki davranışın normal, hata ve reduced-motion/klavye senaryoları doğrulanır.
- [ ] `npm run lint && npm run typecheck && npm run build` başarılı.

- [ ] `npm run test:e2e -- tests/e2e/facility.spec.ts` Tesisimiz/Osmaniye metnini, resmi hikâye eşitliğini ve onaysız görselin yayınlanmamasını doğrular.

## Yapılmaması gerekenler
- Task dışına çıkma, ek iyileştirme yapma; diğer repolara yazma.
- Kullanıcı yerine açık karar verme; gizli bilgi commit etme; onaysız görseli yayınlama.
- Gerçek ödeme, üretim DB değişikliği, canlı e-posta veya domain mutasyonu için bu taslağı tek başına yetki sayma.

## Coder Notu

- Bağımlı Task 032 `TAMAMLANDI`. PLAN, AGENTS, resmi içerik bölüm 04, görsel manifesti/onay kaydı ve Task 034 sınırı okundu. Bu statik frontend görevi için yeni servis veya kullanıcı kararı gerekmiyor. `frontend-patterns`, `frontend-design-direction` ve CLI alternatifi için `21st-cli-use` skill'leri; kurulu Next.js Server/Client Components ve Playwright rehberleri kullanıldı. Ek skill veya bağımlılık kurulmadı.
- **21st MCP bu oturumda erişilebilir değildi.** Repo içi npm cache ile `npx -y @21st-dev/cli search 'about story image section' --limit 3 --json`, `search 'about us' --limit 3 --json` ve `get 2202 --json` çalıştırıldı. [About 3](https://21st.dev/@shadcnblockscom/components/about-3) kaynak düzeni incelenip AFİNA tokenlarına, serif/sans hiyerarşisine ve resmi içeriğe uyarlandı. Varsayılan görseller, şirket logoları ve istatistikler alınmadı. Mevcut özelleştirilmiş Button yeniden kullanıldı; resmi `npx shadcn@latest docs button` komutu başarılı, yeni shadcn bileşeni eklenmedi. MCP ayarı değiştirilmedi.
- `Facility` bir Server Component'tir. Mevcut `Hikâyemiz` sahnesi/kısa tanımı korunarak içine semantik `Tesisimiz` alt bölümü eklendi; navbar/footer'ın mevcut `/#tesisimiz` hedefi artık gerçektir. Resmi iki hikâye paragrafı ve beş faaliyet başlığı birebir kullanıldı. Perakende ve toptan bağlantıları mevcut `#urunler` / `#toptan-iletisim` hedeflerine gider. Yeni animasyon, scroll kilidi, veri kaynağı veya iddia eklenmedi.
- Manifestte onaylı tesis görseli yok. Task'ın izin verdiği, ağ isteği yapmayan **16:9 placeholder** ve “Osmaniye üretim tesisi” altyazısı kullanıldı. Görsel üretimi/onayı ve Task 034 aktarımı yapılmadı; bu durum Task 033 için engel değildir. Onaysız aday veya P08–P12 görseli yayınlanmadı. Katalog, backend/DB/auth/ödeme, diğer task/plan dosyaları, `_legacy/` ve özgün promptlar değiştirilmedi.

### Komutla doğrulama — 20 Ekim 2026

| Kontrol | Sonuç / kanıt |
| --- | --- |
| RED: `PLAYWRIGHT_BASE_URL=http://localhost:3004 PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/ms-playwright" npm run test:e2e -- tests/e2e/facility.spec.ts --project=chromium-320 -g 'facility presents' --output=.cache/task033/red` | **exit 1**; uygulama yazılmadan önce `Tesisimiz` bölümü/başlığı bulunamadı. Tarayıcı sandbox başlatma hatası ve ikinci dev sunucusunun mevcut checkout kilidine takılması RED sayılmadı. Gerçek davranış hatası, aynı checkout'a ait mevcut 3004 sunucusunda tarayıcı süreç izniyle doğrulandı. Mevcut sunucu durdurulmadı. |
| GREEN: aynı dosya, `chromium-320`, bu checkout'un ayrı production sunucusu `localhost:3033` | **exit 0; 5/5**. |
| `PLAYWRIGHT_BASE_URL=http://localhost:3033 PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/ms-playwright" npm run test:e2e -- tests/e2e/facility.spec.ts --output=.cache/task033/acceptance` | **exit 0; 60/60, 33,1 saniye**. Chromium/Firefox/WebKit × 320/390/768/1440. Resmi hikâye/faaliyet eşitliği, Osmaniye ve Tesisimiz metni, placeholder, onaysız görsel isteğinin olmaması, görsel ağ hatası, navbar ile klavye erişimi, görünür odak, ≥44px CTA'lar, iki hedefe geçiş, reduced-motion ve JavaScript kapalı SSR doğrulandı. |
| İlk geniş E2E turunun düzeltilmesi | İlk tur **52/60** idi; sekiz hata yalnız WebKit/macOS klavye testinin `Tab` kullanmasıydı. Test mevcut shell/scenes testlerindeki `Alt+Tab` kuralına uyarlandı; odak/klavye assertion'ları korunarak önce **4/4 WebKit** ve ardından yukarıdaki **60/60** geçti. Ürün kodunda hata gizleyen değişiklik veya skip/retry eklenmedi. |
| Kabul JSON'una Node assertion'ları | **exit 0**; 60 beklenen, **0 başarısız/atlanan/flaky**, 12 proje ve 60 adet `localhost:3033` hedef annotation'ı. |
| `npm run lint && npm run typecheck && npm run build` | **exit 0**, son uygulama ve test dosyalarıyla başarılı. `/` statik üretildi; prebuild kaynak/hash/onay/runtime varlık kontrolü **16/16 PASS**. |
| `npm run test -- tests/unit/scenes.test.tsx` | **exit 0; 2/2**. Boş katalog/CTA hedefleri ve değişmez altı ürün sınırı korundu. |
| `PLAYWRIGHT_BASE_URL=http://localhost:3033 PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/ms-playwright" npm run test:e2e -- tests/e2e/scenes.spec.ts --project=chromium-320 --project=webkit-1440 -g 'landing composes\|scene entrances' --output=.cache/task033/scenes-regression` | **exit 0; 4/4**. Sahne sırası, mevcut ürünler ve native scroll ile tek seferlik girişler korundu. |
| Kontrast ve gerçek viewport ölçümü | Node assertion'ları **exit 0**; kullanılan metin/zemin çiftlerinde kontrast **4,76–11,97:1**. WebKit 390 reduced-motion hash girişinde tesis üstü **144,05px**, sticky header altı **97px**; genişlik/scrollWidth **390/390px**. Hedef başlığın altında görünür, yatay taşma yok. |
| Frontend design evidence kontrolü | Checker'ın kaynakla `cmp` eşitliği doğrulanmış `.cjs` kopyasıyla `node .cache/task033/check-evidence.cjs .cache/task033/design-evidence.json`: **exit 0**. Repo ES module olduğu için CommonJS checker yalnız ignored cache altında aynı baytlarla çalıştırıldı; skill kaynağı değiştirilmedi. |
| `git diff --check` | **exit 0**. Build'in otomatik `next-env.d.ts` farkı başlangıç içeriğine geri alındı. |

320/390/768/1440 bölüm ekranları ve WebKit 390 reduced-motion gerçek viewport görüntüsü açılarak incelendi. Metin/CTA kesilmesi veya yatay taşma görülmedi. Tasarım sözleşmesi, kanıt JSON'u, ekranlar ve test raporları `.cache/task033/` altında commit dışındadır. Kabul raporu `acceptance-results.json`, ilk tur `initial-results.json`, odaklı sahne regresyonu `scenes-regression-results.json` dosyalarıdır. Bu görev yerel tarayıcı kabulüdür; dağıtım veya canlı satış kabulü değildir. Task 033 kapsamında kalan engel yoktur.

## Durum: TAMAMLANDI
