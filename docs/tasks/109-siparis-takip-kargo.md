# Task 109: Sipariş takip ve kargo durumu

## Tür
frontend

## Amaç
Herkese açık sipariş takip (sipariş no + e-posta), adım adım teslimat zaman çizelgesi, kargo firması ve takip numarası.

## Bağlam
ZEYTİN v2 (`docs/DESIGN.md` "Topraktan sofraya" — krem 'sofra' dili, Fraunces/Figtree, ev kuralları). Kullanıcı (20 Eki): "21st.dev … MEMBERS ÜYELİK VS SİPARİŞ TAKİP KARGO VS ONLARIDA" + "GMAİL İLE GİRİŞ". **Bu görev yalnız arayüz + akış katmanıdır:** gerçek kimlik doğrulama, veritabanı ve kargo API'si YOK. Veriler bir **adaptör arayüzünün** arkasında (`lib/<alan>/adapter.ts`: `mock` uygulaması dev/test için; gerçek uygulama 040–050/069–072 ONAY GEREKLİ görevlerinde Supabase ile). Production build'de mock adaptör yalnız `NEXT_PUBLIC_DEMO=1` iken; aksi hâlde sayfalar "Yakında" durumunu gösterir (sahte başarı yok).

## Kullanılacak araçlar
- ECC skill: frontend-patterns, accessibility, security-review (form güvenliği), verification-loop; skill `motion-framer`, `ui-ux-pro-max`
- 21st MCP: Delivery progress 37491 (ibrandify), Order Status Tracker 8205 (ravikatiyar162), Order tracking 641 (kodu `mcp__21st__get_component` ile al, v2 tokenlarına uyarla; ikonlu kart ızgarası ev kuralı gereği YOK)

## Adımlar
1. `/siparis-takip`: form (sipariş no + e-posta/telefon son 4) → sonuç; giriş yapmış kullanıcıda doğrudan siparişlerinden.
2. Zaman çizelgesi (37491 uyarlaması): Sipariş alındı → Ödeme onaylandı → Hazırlanıyor → Kargoya verildi → Dağıtımda → Teslim edildi; her adımda tarih/saat; aktif adım vurgulu (Framer Motion çizgi dolumu); iptal/iade durumları.
3. Kargo kartı: firma adı, takip no (kopyala düğmesi), 'Kargo firmasında takip et' dış linki (firma kararı gelene kadar genel), tahmini teslim (veri varsa).
4. Sipariş özeti (8205 uyarlaması): ürünler, adet, tutar, teslimat adresi (kısmi maskeli).
5. Adaptör `lib/orders/tracking-adapter.ts` (mock: 3 örnek sipariş farklı durumlarda, yalnız demo). Gerçek: 044/069–072 (ONAY GEREKLİ).
6. Güvenlik: no+eşleşme yoksa genel 'bulunamadı' (bilgi sızdırmaz), deneme sınırı (rate limit arayüzü).

## Kabul kriterleri
- [ ] e2e (mock): 3 durumun doğru zaman çizelgesi, bulunamadı mesajı, kopyala, maskeleme
- [ ] `lint.mjs app components` 0 FAIL; production `inspect.mjs` (iç sayfa istisnasıyla) FAIL 0; 1440/390 + iPhone 14 ekran görüntüleri `test-results/109/`
- [ ] lint/typecheck/build; e2e (mock adaptörle) + reduced-motion

## Coder Notu

### Uygulama (21 Ekim 2026)
- `/siparis-takip`: sipariş no + e-posta/telefon son 4 formu, alan bazlı doğrulama, erişilebilir hata/sonuç duyuruları ve sonuç başlığına odak. URL'deki `no` misafirde yalnız formu doldurur; iletişim eşleşmesi olmadan sonuç açılmaz. Demo üyesi kendi siparişlerinden veya hesabımdaki mevcut `Takip et` bağlantısından doğrudan açabilir.
- `lib/orders/tracking-adapter.ts`: takip sözleşmesi, üç örnek sipariş (hazırlanıyor `DEMO-10902`, kargoya verildi `DEMO-10801`, teslim edildi `DEMO-10800`), sahiplik denetimi ve deneme sınırı arayüzü. Mevcut hesabım örneklerinin numara/tutar/durumları korunur. Dönen adres zaten maskelidir; ham adres UI'a verilmez. Sonuçlar bağımsız kopyalardır.
- Altı adımlı, tarih/saatli semantik zaman çizelgesi, güncel durum ve `motion/react` çizgi dolumu; reduced-motion anlık dolumla aynı içerik/CTA'ları korur. İptal/iade terminal durumu ve tarihi desteklenir; gerçekleşmeyen aşamalar teslim edilmiş gibi gösterilmez. Üç demo kaydı korunarak terminal durumlar ayrı bileşen testinde doğrulandı.
- Kargo firma/takip numarası, kopyalama başarı/izin hatası, veri varsa tahmini teslim; ürün/adet/tutar ve maskeli teslimat özeti. Firma kararı verilmediği için mock `trackingUrl: null` döndürür ve genel bağlantı bekleme açıklaması gösterilir. Adaptörden HTTPS URL geldiğinde güvenli dış bağlantı açılır; bu dal da testlidir. Gerçek firma veya URL seçilmedi, gerçek kargo sorgusu yapılmadı.
- Production demo yalnız `NEXT_PUBLIC_DEMO=1` ile açılır. Varsayılan/`0` değerinde form ve örnek sonuç içermeyen “Yakında” durumu vardır. Son yerel production build demo kapalı bırakıldı. Gerçek auth, Supabase, ödeme ve kargo bağlantısı kapsam dışındaki ONAY GEREKLİ görevlerindedir; yeni Route Handler, migration veya servis işlemi yoktur.
- Deneme sınırı bu UI demosunda sekme başına 60 saniyede 5 sorgudur; numara değişimi/yenileme sayacı sıfırlamaz, süre sonunda toparlanır. Depolama engelinde bellek yedeği vardır. Bu istemci sınırı gerçek güvenlik/yetki mekanizması değildir; sunucu doğrulaması ve gerçek rate limit onaylı entegrasyonda uygulanmalıdır. İletişim bilgisi URL'ye/depolamaya/loga yazılmaz.
- 21st MCP kaynak kodları alındı: ibrandify Delivery progress `37491`, ravikatiyar162 Order Status Tracker `8205`, javierdev0 Order tracking `641`. Krem/zeytin tokenları, Fraunces/Figtree, düz yüzey ve ikonlu kart ızgarası olmayan düzenle uyarlandı. shadcn resmi CLI `view button input` ile incelendi; mevcut özelleştirilmiş Button/Input kullanıldı, yeni bağımlılık gerekmedi.
- İstenen ECC skill'leri, TDD, `motion-framer`, yerelde bulunan `ui-ux-pro-max` ve üç motion skill'i kullanıldı. Genel tasarım sistemi önerisi proje tasarım sözleşmesinin yerine geçirilmedi; yeni skill kurulmadı.

### Komutla doğrulama

Kanıtlar, 30 PNG ve inspect renderleri `test-results/109/` altında; mevcut ignore kuralı gereği commit dışıdır.

| Kontrol | Sonuç / kanıt |
|---|---|
| TDD RED → GREEN | Eksik adaptör ve zaman çizelgesi önce FAIL (`red.log`, `red-timeline.log`); RED kontrol noktası `5eddf8f`. Sonrasında üç görev test dosyasında **14 PASS** (`green.log`). |
| `npm test -- --coverage` | **24 dosya, 280 test PASS**. Mevcut `app/` coverage kapsamı: statements %81.25, branches %84.37, functions %86.66, lines %87.03 (`unit-coverage.log`). |
| `npm run lint` / `npm run typecheck` | **PASS**, 0 hata (`lint.log`, `typecheck.log`). |
| `NEXT_PUBLIC_DEMO=1 npm run build` | **PASS**, varlık/onay denetimi dahil (`build-demo.log`). Son build yeni `next start` sürecinde doğrulandı. |
| Demo takip e2e | **25 PASS / 5 koşullu skip**, Chromium 390/768/1440, Firefox 390, iPhone 14 WebKit (`e2e-demo-final.log`). Üç zaman çizelgesi/tarih, maskeleme, eşleşme/genel bulunamadı, doğrulama, yenilemede deneme sınırı, kopyalama/izin hatası, hesap sahipliği/çıkış, taşma ve reduced-motion. Skip edilenler aşağıda demo kapalı build'de çalıştırıldı. |
| Görseller ve erişim | Aynı e2e'de form, üç sonuç ve reduced-motion PNG'leri; 1440/768/390 + iPhone 14 WebKit. Etiket, aria-live/aria-invalid, sonuç odağı, masaüstü klavye/görünür odak ve ≥44 px düğmeler doğrulandı. iOS WebKit Tab yalnız metin alanlarını ziyaret ettiğinden bu projede gönderim dokunmayla doğrulandı. Fiziksel cihaz testi değildir. Renderler görsel olarak incelendi. |
| Üyelik regresyonu | **10 PASS / 2 koşullu skip**, Chromium 390 ve iPhone 14 WebKit (`e2e-membership.log`). Google/e-posta mock akışları, profil/adres CRUD, sipariş bağlantısı, misafir sepeti ve isteğe bağlı ödeme girişi. |
| `lint.mjs app components` | **0 FAIL / 3 WARN** (`taste-lint.log`): mevcut demo `h-screen`, resmi Google düğmesi çerçevesi ve genel uzun tireler. |
| Production demo `inspect.mjs` | Form, hazırlanıyor, kargoya verildi, teslim edildi: her birinde 1440/768/390 **0 FAIL / 2 WARN** (`inspect-{form,preparing,shipped,delivered}/report.json`). Sonuç harness'i yalnız gerçek demo formunu doldurup sorgular ve doğru sonucu doğrular; özgün probe/judge/eşikler korunur. Yalnız iç sayfa istisnaları: `few-pictures,focal-point,still-page`. |
| `NEXT_PUBLIC_DEMO=0 npm run build` | **PASS** (`build-production.log`). |
| Demo kapalı production e2e | **20 PASS / 25 koşullu skip**, aynı beş tarayıcı/ekran projesi (`e2e-production.log`). Takip sayfası `no` parametresiyle de Yakında; form/örnek sonuç yok. İç sayfalar, sepet, 404/kurtarma, reduced-motion ve PayTR sayfa/token endpoint 404 kapıları PASS. Demo senaryoları bu build'de bilinçli atlanır. |
| Demo kapalı production inspect | 1440/768/390 **0 FAIL / 2 WARN** (`inspect-production/report.json`). Beş projenin `production-*.png` görüntüleri alındı. |
| Güvenlik ve diff | `git diff --check` PASS. Yeni takip dosyalarında HTML enjeksiyonu, ağ çağrısı, debug log veya secret env referansı yok (`security-review.json`). Env dosyası eklenmedi. |

Tekrarlanabilir ana komutlar (ilgili build'den sonra yeni `next start --hostname 127.0.0.1 --port 3119`; var olan dev sunucusu `localhost:3004`):

```sh
NEXT_PUBLIC_DEMO=1 npm run build
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3119 NEXT_PUBLIC_DEMO=1 npx playwright test tests/e2e/tracking.spec.ts --project=chromium-390 --project=chromium-768 --project=chromium-1440 --project=firefox-390 --project=webkit-iphone14 --output=test-results/109/demo-final-traces
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3119 FRAME_SEQUENCE_DEV_URL=http://localhost:3004 NEXT_PUBLIC_DEMO=1 npx playwright test tests/e2e/membership.spec.ts --project=chromium-390 --project=webkit-iphone14 --output=test-results/109/membership-traces
node /Users/emre/.claude/skills/design-taste-frontend/scripts/lint.mjs app components
node /Users/emre/.claude/skills/design-taste-frontend/scripts/inspect.mjs http://127.0.0.1:3119/siparis-takip --allow few-pictures,focal-point,still-page --out test-results/109/inspect-form
TRACKING_INSPECT_ORDER=DEMO-10801 node test-results/109/inspect-state.mjs http://127.0.0.1:3119/siparis-takip --allow few-pictures,focal-point,still-page --out test-results/109/inspect-shipped
NEXT_PUBLIC_DEMO=0 npm run build
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3119 NEXT_PUBLIC_DEMO=0 npx playwright test tests/e2e/tracking.spec.ts tests/e2e/interior-pages.spec.ts --project=chromium-390 --project=chromium-768 --project=chromium-1440 --project=firefox-390 --project=webkit-iphone14 --output=test-results/109/production-traces
```

Inspect WARN'ları onaylı krem palet ve işlevsel iç sayfada video bulunmamasıdır. İlk tarayıcı sandbox engeli ve eski production sürecine bağlı geçersiz deneme giderildi; kabul sonuçları yeniden başlatılmış son build sunucusuna aittir. Görev kapsamındaki uygulanamayan frontend adımı yoktur; bu sonuç gerçek üyelik/kargo entegrasyonu veya canlı yayın kabulü değildir.

## Durum: TAMAMLANDI
