# Task 115: v3 kapı (Impeccable critique/audit, performans, mobil)

## Tür
frontend

## Amaç
v3'ü kullanıcıya göstermeden önce bağımsız kalite kapısından geçirmek.

## Bağlam
- Bağımlılık: 111–114 TAMAMLANDI.
- Kullanıcı iki sürümü reddetti. Bu kapı, kullanıcının "berbat" diyebileceği her şeyi önceden yakalamak içindir.

## Kullanılacak araçlar
- Skill:
  - `impeccable` (`critique`, `audit`, `polish`; finish reviewer ve documenter);
  - `audit-ai-design-slop`, `web-design-guidelines`, `review-animations`, `interface-review`, `design-taste-frontend` (inspect + critique);
  - `web-perf`.
- ECC: verification-loop, e2e-testing, accessibility.

## Adımlar
1. **Impeccable critique** (`.claude/skills/impeccable/reference/critique.md`, iki bağımsız değerlendirme):
   - Hedef: Nielsen ≥ 28/36 (7 ve 10 n/a). P0 ve P1 sorun kalmayacak.
   - Rapor: `docs/kabul/115-critique.md`.
2. **Impeccable audit:** a11y, performans, responsive. `audit-ai-design-slop` ile slop taraması.
3. **Düzeltme:** Bulunan P0/P1 sorunları düzelt, en fazla 2 tur. Sonra Impeccable documenter ile `docs/DESIGN.md`'yi kurulan dünyadan güncelle; karar geçmişini koru.
4. **Ölçümler:**
   - **Performans:** Lighthouse mobil ve masaüstü, production, 3'er ölçüm.
   - **Kaydırma ve cihaz:**
     - Kare şeridi: 1440×900, 1280×800, iPhone 14, iPhone SE, Pixel 7, yatay mod.
     - Tekerlek ile alt-üst gidiş.
     - Reduced-motion.
   - **Sepet akışı:** hero ekle → kiler ekle → çekmece → sepet → ödeme önizleme.

## Claude'un gerçek iOS Safari bulgusu (21 Eki, Xcode iPhone 17 simülatörü, iOS 27)
- Hero'daki altın "Sepete ekle" butonu gerçek iOS Safari'de soluk kalıyor: piksel (157,135,97), beklenen #D4B483 (212,180,131). Büyük olasılıkla giriş animasyonu ~0,75 opaklıkta takılıyor. Playwright WebKit taklidinde görünmüyordu.
  - Animasyonun iOS Safari'de bitmesini garanti et, ya da CTA'yı hiç soluk başlatma (yalnız translate).
  - Bu madde Claude tarafından simülatörde tekrar doğrulanacak.
- Kiler bölümü, etiketler ve hero metni iOS Safari'de doğru görünüyor.

## Kabul kriterleri
- [ ] Kapı eşikleri:
  - Critique toplamı ≥ 28/36, P0/P1 = 0.
  - Mobil Lighthouse medyanı ≥ 85, LCP < 2.5 s, CLS < 0.1, A11y ≥ 95.
  - inspect.mjs FAIL 0.
- [ ] Kare şeritlerinin hepsinde boş ekran ve kesik başlık yok. Claude'un denetimi için şeritler `test-results/115/` altında.
- [ ] Tüm e2e ve birim testler, build ve lint yeşil.
- [ ] `docs/kabul/115-ozet.md`: kullanıcıya gösterilecek 6 ekran görüntüsü (masaüstü 3, iPhone 3) ve kalan açık kararlar (fiyat, kargo, iletişim, gerçek ürün fotoğrafı).

## Yapılmaması gerekenler
- Yeni bölüm ya da özellik ekleme.
- Onaysız görsel kullanma.

## Coder Notu

### Uygulama ve sınırlar — 21 Ekim 2026
- Bağımlılık 111–114 task dosyalarının hepsi TAMAMLANDI; başlangıçta çalışma ağacı temiz ve dal `main` idi.
- Onaylı B dünyası, görseller, marka tokenları ve mevcut özellik kapsamı korundu. Backend, DB, ödeme entegrasyonu ve başka repo değiştirilmedi.
- **Safari CTA düzeltmesi:** güncel `SofraHero.tsx` satın alma butonunda giriş opaklık animasyonu yok. Somut soluklaştırma, hydration sırasında disabled olan butonun `.purchase:disabled { opacity: 0.7 }` kuralıdır; bu, Claude'un piksel gözlemiyle uyumludur ancak gerçek iOS kök nedeni ölçülmüş sayılmaz. Disabled opaklık düşüşü kaldırıldı; `appearance: none` ve `opacity: 1` ile ilk çizim/etkin/devre dışı renk sabitlendi. Native `disabled`, stok/hydration koruması, erişilebilir ad ve basma transformu korundu. Gerçek iOS Safari tekrarını Claude doğrulayacak.
- `cart-wire.spec.ts`, `cart-experience.spec.ts`, `scenes.spec.ts` kaynak incelemesinde bulunan v3 uyuşmazlıkları için güncellendi: raf düğmesi “Ekle”, boylar radio, adet hızlı görünümde, çekmece yalnız açık kullanıcı isteğiyle açılır. Sepet restore/stok/depolama hatası/klavye/regresyon senaryoları korundu. Mobil compact çekmece beklentisi mevcut 85dvh / minimum min(95dvh, 560px) sözleşmesine taşındı.
- `tests/e2e/v3-quality-gate.spec.ts` yazıldı, **çalıştırılmadı**: altı cihaz/viewport, %40 kaydırma kareleri, 120px aşağı/yukarı hareket, başlıkların yatay sınırları, reduced-motion, CTA'nın SSR/hydration/basma renk kontrolü ve hero → kiler → çekmece → sepet → mevcut ödeme kapısı. Çekilen kareler insanın boş/kesik bölüm ve B kompozisyonu kontrolünün yerine geçmez.
- Impeccable context/critique/audit/polish/craft-floor/finish reviewer/documenter, audit-ai-design-slop, web-design-guidelines, review-animations, interface-review ve design-taste-frontend rehberleri; ECC verification-loop/e2e-testing/accessibility/TDD ve ilgili motion rehberleri kullanıldı. Eksik görünen skill'ler global kurulumda bulundu; yeni skill/bağımlılık kurulmadı. Next.js 16.4.2'nin yerel CSS ve server/client rehberleri okundu.
- 21st MCP'de `ecommerce hero add to cart accessible button` arandı (34564 / 4927 / 109). Yeni bileşen gerekmeyen bu düzeltmede mevcut onaylı CTA korundu; katalog kodu alınmadı, yeni shadcn bileşeni eklenmedi. Web Interface Guidelines'ın resmi güncel kaynağı okundu: https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md.
- Impeccable context kökte DESIGN aradığından gerçek tasarım sözleşmesi `docs/DESIGN.md` doğrudan okundu. Bildirdiği eski `buildPath` eksikliği bu bakım görevinin B seçimini değiştirmedi; config yenilenmedi.

### İki bağımsız değerlendirme / critique
Method: dual-agent (A: `/root/critique_a` · B: `/root/critique_b`). A, detector çıktısını görmeden raporunu tamamladı; B daha sonra tek mekanik tarama yaptı. İki değerlendirme de kaynak tabanlıdır; görsel kabul veya ölçülmüş Lighthouse sonucu değildir.

| Nielsen ölçütü | A'nın geçici kaynak puanı |
|---|---:|
| 1. Sistem durumu | 4 |
| 2. Gerçek dünyayla uyum | 4 |
| 3. Kontrol ve özgürlük | 3 |
| 4. Tutarlılık | 4 |
| 5. Hata önleme | 3 |
| 6. Tanıma | 4 |
| 7. Esneklik/verimlilik | n/a |
| 8. Sadelik | 3 |
| 9. Hata kurtarma | 3 |
| 10. Yardım/dokümantasyon | n/a |
| **Toplam** | **28/32 — görsel puan değil** |

- Task'ın “7 ve 10 n/a” ile “/36” ifadeleri matematiksel olarak uyuşmuyor: sekiz ölçütün doğru üst sınırı 32. Kabul metni/plan kendiliğinden değiştirilmedi; Claude eşik ifadesini netleştirecek. Bu tablo ölçülmemiş görsel kapıyı geçmiş sayılmaz.
- A: sofra fotoğrafı, Düziçi anlatısı, ceviz raf, sicimli kraft ve ambalaj aileleri ürüne özgü bir dünya kuruyor; dört aile ve en fazla iki boy satın alma kararını sade tutuyor. Başarı/stok bildirimleri, ESC/geri ve fotoğraf-fiyat-varyant ilişkisi kaynakta mevcut. İlk mobil ziyaretçide soluk CTA, toptancıda eksik iletişim ve sepet kullanıcısında etkin olmayan kupon alanı ana risklerdir. Onay bekleyen veri uydurulmadı.
- B: `impeccable detect --json app/page.tsx components/landing components/catalog components/cart components/site` **exit 0, raw `[]`, bulgu 0**, rule/location/false-positive yok. Bu sonuç görsel kalite, kontrast, hareket hissi veya inspect.mjs kabulü değildir.
- B'nin ilk turdaki P1 kabul-otomasyonu bulguları sepet testlerindeki eski düğme/adet/otomatik drawer ve compact yükseklik beklentileriydi; ilgili üç dosya düzeltildi. Tüm e2e için başarı iddiası yoktur.
- İkinci/son kaynak turu bu üç diff'te yeni kesin sözleşme hatası bulmadı. Yeni kare testinde lazy görsellerin geç yüklenme riski bildirildi; her viewport karesinden önce görünür resimlerin `complete/naturalWidth` ve `decode()` bitişi beklenerek giderildi. Görsel doğruluk yine Claude'a aittir.
- **Açık P1 kabul otomasyonu:** kaynak taramasında eski landing sözleşmesine bağlı başka testler bulundu: `bootstrap.spec.ts` (eski H1), `foundation.spec.ts` (eski ürün/otomatik drawer), `fonts.spec.ts` (eski hero/CTA), `hero.spec.ts`, `hero-motion.spec.ts`, `hero-light.spec.ts`, `hero-performance.spec.ts`, `hero-zeytinlik.spec.ts` (kaldırılmış seçici/ışık/frame sahneleri), `moments.spec.ts`, `motion-gate.spec.ts` (kaldırılmış süreç şeridi), `featured-product.spec.ts` (kaldırılmış #one-cikan), `showcase.spec.ts` (eski ürün bölgeleri), `tokens.spec.ts:70` (gerçek ana sayfada eski zemin), `payment-preview.spec.ts:18` (artık olmayan sample-table-olive ile gerçek sepet yolu). İki düzeltme/inceleme turunda bunların tamamı v3'e taşınamadı; testler atlanmadı, silinmedi veya başarı gibi gösterilmedi. Tüm e2e yeşil / P1=0 kapısı **tamamlanmadı**. Bağımsız fixture bölümleri ve `/__demo/frames` korunur; v3'e taşınmış `facility-wholesale-v2`/`process-faq-footer` yalnız dosya adından dolayı eski sayılmadı.
- Kalan P2 kaynak bulguları: `QuickView.tsx` geçersiz adet uyarısı varken eklemeyi etkin tutuyor (store bozuk yazımı reddediyor); `CartSummary.tsx` çalışmayan kupon grubunu gösteriyor; `RollingPrice.tsx` 180ms yerine drawer spring'ini kullanıyor; doğrudan `?urun=...` açılışında opener yokken kapanış odağı için fallback eksik; hızlı görünüm açıklaması tüm ailelerde aynı genel metin. Bu turda P0/P1 dışına çıkıp yeni özellik/iddia eklenmedi.
- Finish reviewer `/root/finish_document`: **disposition: recapture**. Güncel capture olmadığı için görsel ship kararı vermedi; bu tarayıcı devri AGENTS.md gereği tek başına BEKLİYOR sebebi değildir. CTA diff'inde yeni kaynak sorunu bildirmedi. Yeni CTA testindeki click sonrası değişen ada bağlı locator, aynı DOM butonunu hedefleyecek şekilde düzeltildi.
- Questions skipped: kullanıcı task uygulama/commit/push istedi; tasarım yönü ve B sözleşmesi zaten onaylı.

### Documenter çıktısı / yapılamayan doküman adımları
- `docs/kabul/115-critique.md`, `docs/kabul/115-ozet.md` ve `docs/DESIGN.md` yazımı **uygulanmadı**: AGENTS.md “`docs/` altındaki dosyaları değiştirme — tek istisna: task dosyasına `## Coder Notu` ve `## Durum` eklemek” diyor. Bu task'ın rapor/DESIGN adımları bu kuralla çakışıyor. Bulgular kaybolmasın diye yalnız izinli Coder Notu'na kaydedildi; ayrı raporlar varmış gibi gösterilmedi. Bu, tarayıcı devrinden ayrı, tamamlanmamış bir task adımıdır.
- **BEKLİYOR gerekçesi:** yukarıdaki doküman adımları ile kaynakta saptanmış eski e2e sözleşmeleri açık. Yalnız Claude'a devredilen tarayıcı ölçümlerinden dolayı bekletilmiyor. Kullanıcının “yapamadığını yaz, yine de commit+push” talimatı uygulanır.
- Documenter kaynak özeti: zeytin/kraft/ceviz/sofra beyazı paleti; Fraunces + Figtree; hero 56–120px / gövde 17–18px / etiket 20–24px; raf yerleşmesi 12px ve 70ms sıra; reduced-motion'da tam içerik. Onaylı görseller/iddia sınırı/tek footer önizlemesi korunuyor.
- `docs/DESIGN.md` sapmaları: 113-a sözleşmesine göre masaüstünde dört aile + sağda koli **tek raf**, 5–6 ailede ikinci raf; etiketler her boyutta rafın altında; Ekle **yeşil**, altın hero CTA'da. DESIGN'ın eski iki raf ve altın Ekle tarifi güncellenmeli; eski düzen koda geri taşınmadı, karar geçmişi değiştirilmedi.
- Açık kullanıcı kararları: gerçek fiyatlar; kargo firması/ücreti/süresi; telefon/WhatsApp/e-posta; temsili ambalajlar yerine gerçek ürün fotoğrafları. İletişim veya fiyat uydurulmadı.

### Komutla doğrulama — gerçek sonuçlar

| Kontrol | Sonuç |
|---|---|
| TDD RED | `npm test -- tests/unit/hero-cta-visibility.test.ts --maxWorkers=2`: **2 FAIL**; gerçek CSS cascade'inde disabled opacity **0.7**, native appearance **auto**. |
| TDD GREEN + hero davranışı | `npm test -- tests/unit/hero-cta-visibility.test.ts tests/unit/sofra-hero.test.tsx --maxWorkers=2`: **2 dosya / 5 PASS**. JSDOM cascade'i ile etkin/devre dışı opacity=1 ve appearance=none; ekleme, stok hatası ve alternatif link doğrulandı. Gerçek Safari piksel kabulü değildir. |
| Tüm birim testleri / coverage | `npm test -- --coverage --maxWorkers=2`: **26 dosya / 288 PASS**. Yapılandırılmış `app/**` kapsamı: statements **%82,85**, branches **%86,11**, functions **%88,88**, lines **%87,93**; mevcut eşikler PASS. Bileşenlerin tümüne ait coverage iddiası değildir. |
| Lint | `npm run lint`: **PASS**, sıfır uyarı; e2e güncellemeleri sonrasında da PASS. |
| Tipler | `npm run typecheck`: **PASS**; yeni/güncellenen e2e dosyaları dahil. |
| Production build | `npm run build`: **PASS**, 16 rota; ön kapılar **18 onaylı görsel + 98 v3 çıktı PASS**. |
| Kaynak ve varlık onayı | `node scripts/check-v3-assets.mjs --require-sources`: **98 çıktı PASS**; özgün onay SHA'ları, boyut/alpha/oran/bütçe doğrulandı. |
| Diff / gizlilik | `git diff --check`: PASS. Değişen altı kod/test dosyasında anahtar/private-key desen taraması: **0 bulgu**; `.env*`/sır eklenmedi. |

### Claude doğrulayacak — çalıştırılmayan tarayıcı kabulü
- Playwright/e2e, Lighthouse, inspect.mjs, ekran görüntüsü ve kare şeridi **çalıştırılmadı**. Açılan test tarayıcısı veya dev/start sunucusu yoktur; `test-results/115/` görselleri üretilmiş sayılmaz.
- Yeni kapı: `npm run test:e2e -- tests/e2e/v3-quality-gate.spec.ts --project=chromium-1440 --project=webkit-iphone14 --workers=2`. Test kodu mevcut yerel production webServer sözleşmesini kullanır; headless ve proje Chromium'u, kullanıcının Google Chrome'u değil. Her özel context `finally` ile kapanır.
- Altı hedef: 1440×900, 1280×800, iPhone 14, iPhone SE, Pixel 7 ve iPhone 14 yatay. Başarılı koşuda `test-results/115/filmstrip-*.jpg`, cihaz başına scroll kareleri, masaüstü `desktop-1..3.png` ve iPhone `iphone14-1..3.png` üretilir. WebKit mobilde wheel API olmadığı için 120px native scroll kullanılır; bu gerçek touch/Safari testi diye sunulmaz.
- İlk normal production build'de checkout kapalı kalmalı; demo checkout geçişi için Claude ayrıca `NEXT_PUBLIC_DEMO=1 npm run build` ve aynı env ile e2e koşmalı. Yeni test, normal build'de disabled ödeme kapısını; demo build'de `/odeme` bilgi/özet ekranını doğrular. Gerçek ödeme/callback/tahsilat kabulü değildir. Eski `/odeme-onizleme` production'da 404 sözleşmesi korunur.
- Gerçek iOS Safari/simülatörde altın CTA, tüm cihazlarda boş/kesik bölüm olmaması, rendered kontrast/zoom/odak, tekerlek alt-üst gidiş, reduced-motion ve sepet akışı: **Claude doğrulayacak**.
- Production Lighthouse mobil + masaüstü üçer ölçüm: mobil medyan ≥85, LCP <2,5s, CLS <0,1, A11y ≥95; inspect.mjs FAIL 0; güncel görsel critique ve tüm e2e: **Claude doğrulayacak**. Ölçüm sonucu uydurulmadı.

## Durum: BEKLİYOR
