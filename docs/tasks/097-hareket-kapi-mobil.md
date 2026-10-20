# Task 097: Hareket katmanı, kapı, eleştiri turu ve mobil analiz

## Tür
frontend

## Amaç
Tüm sayfada hareket katmanı, tasteskill kapısı (3 tur eleştiri) ve 4 cihazda mobil analiz raporu.

## Bağlam
Yeniden kurgu — **önce `docs/DESIGN.md` (tamamı), föy (`node ~/.claude/skills/design-taste-frontend/scripts/draw.mjs --show`) ve `~/PROJELER/AFINA-KAYNAK/kitler/ozet.md` okunur.** Korunanlar (fontlar, renkler, logolar, onaylı zeytinlik görseli/videosu, ScrollFrameSequence, sepet altyapısı, PayTR önizleme, resmi metinler) DEĞİŞMEZ. Kullanıcı (20 Eki): "ZEYTİN PROJESİNİDE VERDİĞİM PDFLERE GÖRE BAŞTAN KURGULA".

## Kullanılacak araçlar
- ECC skill: frontend-patterns, motion-patterns, motion-advanced, accessibility, design-system, verification-loop
- Skill: `profesyonel-web-sitesi`; rehber `~/.claude/skills/design-taste-frontend/references/{layout,type,colour,motion,imagery}.md`
- 21st MCP: hayır

## Adımlar
1. Pinned story (etiket kartı → koçan) + bölüm girişleri + kontrol geri bildirimi; inspect hareket sayımı ≥ 16.
2. `references/critique.md` ile 1440/768/390 puanlama, en büyük 3 sorun → düzelt → tekrar (≤ 3 tur), `docs/critique-097.md`.
3. Mobil: iPhone 14, iPhone SE (WebKit), Pixel 7, Galaxy S20 (Chromium) + yatay; `docs/mobil-analiz-097.md` önce/sonra tablosu: başlık satırları, min yazı, dokunma hedefleri, yatay taşma, kontrast, Lighthouse mobil (Perf ≥ 85, A11y ≥ 95, CLS < 0.1, LCP < 2.5 s), video/kare ağırlığı, iOS autoplay/Düşük Güç, svh/dvh, güvenli alan, sabit koçanın klavye/dokunmayla çakışmaması.

## Kabul kriterleri
- [ ] inspect FAIL 0, hareket ≥ 16; critique ve mobil raporları mevcut; tam e2e geçer
- [ ] `node ~/.claude/skills/design-taste-frontend/scripts/lint.mjs app components` → FAIL yok
- [ ] production (`next build && next start -p 3104`) üzerinde `inspect.mjs http://127.0.0.1:3104` → bu bölüm için FAIL yok; 1440/768/390 + iPhone 14 (WebKit) ekran görüntüleri `test-results/097/`
- [ ] lint/typecheck/build; ilgili e2e (reduced-motion + mobil WebKit dahil); sepet testleri bozulmaz

## Claude eleştirisi (20 Eki, 1440 kaydırma, 091–095 sonrası) — bu turda MUTLAKA çözülecek
1. **Hero sonrası boş sabit sahne:** kart küçüldükten sonra ~2 ekran boyunca yalnız zeytinlik görüntüsü + minik koçan kalıyor (near-empty ×2). Pinned run kısalsın (kart koçana dönüşür dönüşmez vitrin başlasın; ≤ 1 ekran geçiş).
2. **Koçan çok küçük ve okunmuyor** ('Ürünlere göz at' ~10px kutu): 120px genişlik, 14px+ metin, sepet adedi/toplam okunur; ürün fişleri ve footer üstüne binmesin (vitrin ve footer görünürken gizlenir veya kenara çekilir).
3. **Vitrin fişleri** fotoğrafın altına sıkışmış ve kesik görünüyor: föy 'slips standing along the bottom' — fişler alt kenarda AYAKTA, tam görünür, farklı yükseklikler; 'Ürünlerimiz' kolonu fotoğrafın üst bölümünde; fişler ile kolon arasında görünür nefes.
4. **Topraktan sofraya:** beş kolonda aynı zeytinlik kırpımı tekrar ediyor — kopya görsel yasak. Görsel üretimi onaylanana kadar kolonlar görselsiz tipografik (adım adı büyük Fraunces + kısa satır) ya da onaylı görüntülerin FARKLI kırpımları (tesis, şişe, kase, dal); aynı kare iki kez kullanılmaz.
5. **Toptan bölümü:** büyük boş yeşil alan + küçük kart (near-empty). Tesis fotoğrafı kullanıcı onayı gelene kadar: kart sola, alanın kalanına büyük tipografik 'Toptan satış' + ürün kapsamı; onay gelince fotoğraf.
6. **Osmaniye silüeti** kaba ve kesik görünüyor: gerçek il sınırı (kaynaklı, sadeleştirilmiş), Düziçi noktası + etiket; karo içinde ortalı, kırpılmadan.
Ekran görüntüleri: `/private/tmp/claude-501/-Users-emre/862bcbce-6e8d-4a73-a71a-971f141b67f4/scratchpad/mobil/z-yeni.jpg` (geçici).

## Coder Notu

20 Ekim 2026. Görev uygulandı ve komutlarla doğrulandı; aşağıdaki üç global
kapı kapanmadığı için **TAMAMLANDI yazılmadı**.

### Uygulananlar

- Pinned story 300 → 150: masaüstünde kartın koçana dönüşümü ile ürün başlangıcı
  arasında 2.3 ekran yerine 0.8 ekran. Hero, onaylı medya dosyaları,
  `ScrollFrameSequence`, sepet veri/ödeme altyapısı ve resmi marka metinleri korundu.
- Bölüm girişleri 80ms stagger; vitrin başlık/metin ayrı, SSS okuma sırası;
  mevcut tesis/ürün/süreç hareketleriyle birlikte inspect'te **29/29/29 hareket**.
- Koçan 120px, yazı ≥14px. Ürün/okuma engellerinde güvenli yere taşınır veya
  gizlenir; footer görünürken daima gizlenir. Koçan odaklıysa önce header
  sepetine odak aktarılır. Böylece footer linki hem klavye hem pointer ile erişilir.
- Vitrinin alt kenarda tam, farklı yükseklikte fişleri korundu ve e2e geometrisi
  yeniden çalıştırıldı. Süreçte tekrar eden altı zeytinlik kaldırıldı; büyük
  Fraunces adlar + resmi hikâyeden kısa ifadeler kullanıldı. Süreç iddiası eklenmedi.
- Toptan adres kartı solda, büyük “Toptan satış” + ürün kapsamı ortada, form
  sağda. Mobilde başlık → adres → form. Onaysız tesis fotoğrafı kullanılmadı.
- Mevcut gerçek Osmaniye sınırı, Düziçi noktası/etiketi ve geoBoundaries
  kaynak/hash/lisans kaydı doğrulandı. Harita yeniden çizilmedi.
- Beş ortak yazı basamağı; en küçük yazı 14px, footer KVKK hedefi 44×44px.
  Fraunces'in kullanılmayan yüzleri preload edilmez; onaylı posterin aynı
  kaynağı Next image servisiyle responsive teslim edilir. Menü açıkken hero'nun
  live region'ı yüzünden erişilebilir kalan arka plan ayrıca inert/aria-hidden olur.

### Raporlar ve görsel kanıt

- [Üç tur eleştiri](../critique-097.md), [mobil önce/sonra](../mobil-analiz-097.md).
  Bunlar task'ın açıkça istediği iki rapordur; PLAN/DESIGN/diğer task'lar değiştirilmedi.
- Production 1440/768/390: `test-results/097/after/`; iPhone 14 WebKit dahil
  dört cihazın dikey/yatay ekranları: `test-results/097/after-mobile/`.
- Radio focus, button hover/press, footer focus: `test-results/097/`.
  Sekiz mobil durumda taşma 0, başlıklar en fazla iki satır, min yazı 14px,
  44px altı hedef 0, form/koçan çakışması 0, sayfa hatası 0.
- Görseller/loglar `test-results/` altında yerel kabul kanıtıdır; dizin repo'nun
  mevcut `.gitignore` kuralıyla commit edilmez. Raporlar ve yeniden çalıştırılabilir
  `scripts/audit-mobile-097.mjs` commit kapsamındadır.

### Komutlarla doğrulama

| Komut | Sonuç |
|---|---|
| `npm run build` | PASS, varlık/onay/hash kontrolü de PASS (18 kayıt) |
| `npm run lint` | PASS, uyarı 0 |
| `npm run typecheck` | PASS |
| `npm test -- --coverage` | 248/248 PASS; statements 87.50%, branches 95.83%, functions 92.85%, lines 91.83% |
| `node ~/.claude/skills/design-taste-frontend/scripts/lint.mjs app components` | 0 FAIL, 2 WARN (korunan demo `h-screen`, resmi metinlerde em-dash) |
| `next start -p 3104` + `inspect.mjs http://127.0.0.1:3104 --out test-results/097/after` | **1 FAIL**, 4 WARN; hareket 1440/768/390'da 29 |
| `PLAYWRIGHT_PORT=3105 FRAME_SEQUENCE_DEV_URL=http://localhost:3004 npm run test:e2e` | 1.742 test: 1.722 PASS / 20 FAIL, 0 skip; Chromium/Firefox/WebKit 320/390/768/1440 + iPhone 14 WebKit |
| Aynı ortamda `npm run test:e2e -- --last-failed` | 19 PASS / **1 FAIL**: Firefox 320 sepet klavye odağı |
| `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3104 npm run test:e2e -- tests/e2e/motion-gate.spec.ts --project=chromium-1440 --project=webkit-iphone14 --output=test-results/097/gate-final --reporter=list` | Footer düzeltmesi dahil 8/8 PASS |
| `node scripts/audit-mobile-097.mjs after` | 4 cihaz × 2 yön; ham JSON ve ekran görüntüleri |
| Lighthouse mobil | Son iki ölçüm: Perf 82/80, A11y 100/100, LCP 4.43/4.85s, CLS 0.00016/0.00016 |
| `git diff --check` | PASS |

3004'teki dev sunucusunun cwd'si bu repo olarak `lsof` ile doğrulandı. Dev-only
kare dizisi/PayTR önizleme testleri bu sunucuya; production 404 ve landing
kontrolleri production'a yönlendirildi. Testler ağ üzerinden ödeme/DB yazmadı.

### TDD ve test uyarlamaları

- İlk üç regresyon: 3 RED → 3 GREEN. Checkpoint `b32cd42` → `04e7f72`.
- Odaklı koçanın footer'ı örtmesi: 1 RED → masaüstü + mobil WebKit'te GREEN.
  Checkpoint `272d6d3` → `30e3f3e`.
- Eski hero başlığı/sahne sırası/CTA ve tekrar fotoğraf beklentileri yeni
  tasarımla eşleştirildi. Katalog sınırı, sepet, no-JS, reduced-motion ve
  hata/fallback davranış testleri kaldırılmadı.
- Kısa mobil pin'de scroll CSS piksele yuvarlanır: kare beklentisi gerçek scroll
  konumundan hesaplanır, amaçlanan kareden sapma en fazla 2 kareyle sınırlıdır.
  Pozitif demo canvas testleri 900px yükseklikte; kısa görünümün poster fallback'i
  ayrı hero testlerinde korunur. Firefox'un 43.99998px ölçümü binde bir px'e yuvarlanır.
- Firefox no-JS realm'inde `img.complete` polling'i kilitleniyordu; aynı onaylı
  image servisinin başarılı yanıtı + görünür görsel geometrisiyle doğrulandı.
  Ek Firefox no-JS screenshot'ında gerçek poster ayrıca açılıp incelendi.
- Sepet kodu değişmedi. Firefox 320 odak hatası, task öncesi `b32cd42` checkout'u
  ve production'ında da aynı `cart-drawer.spec.ts:163` beklentisinde yeniden üretildi
  (`test-results/097/baseline-cart.log`). Buna rağmen global kapıda FAIL olarak tutuldu.

### Açık kapılar — yapılamayanlar

1. **Inspect `few-pictures`:** tekrar süreç görselleri kaldırılınca masaüstünde
   denetçinin saydığı gerçek resim sayısı 2, eşik 4. Tesis varlıkları hâlâ
   `candidate/runtime:false`; farklı onaylı görseller olmadan bu şart sağlanamıyor.
   Onaysız varlık kullanılmadı, tekrar fotoğraf eklenmedi, landing'e `--allow` verilmedi.
2. **Lighthouse:** performans ≥85 ve LCP <2.5s sağlanmadı. İyileşmeye rağmen
   son ölçüm 80 / 4.85s. A11y ve CLS hedefleri geçti. Ayrıntı mobil raporda.
3. **Tam e2e:** Firefox 320 sepet odak testi baseline'da da başarısız; son tekrar
   turunda tek kalan FAIL. Tam paket yeşil diye raporlanmadı.

Üç eleştiri turu tamamlandı; kalan inspect FAIL'i nedeniyle puan 6.0 tavanında.
Fiziksel iOS Düşük Güç/gerçek yazılım klavyesi kabulü yapılmadı; emülasyon kanıtı
bu iddiayla sunulmadı. Yeni skill kurulmadı; task'ın “21st MCP: hayır” tercihi uygulandı.

## Durum: BEKLİYOR
