# Task 090: Temel: tokenlar, süs temizliği, üst çubuk

## Tür
frontend

## Amaç
DESIGN.md renk/tip tokenları, tek düğme biçimi, yasaklı süslerin ve 'görsel hazırlanıyor' kutularının temizliği; e-ticaret için ince sabit üst çubuk.

## Bağlam
Yeniden kurgu — **önce `docs/DESIGN.md` (tamamı), föy (`node ~/.claude/skills/design-taste-frontend/scripts/draw.mjs --show`) ve `~/PROJELER/AFINA-KAYNAK/kitler/ozet.md` okunur.** Korunanlar (fontlar, renkler, logolar, onaylı zeytinlik görseli/videosu, ScrollFrameSequence, sepet altyapısı, PayTR önizleme, resmi metinler) DEĞİŞMEZ. Kullanıcı (20 Eki): "ZEYTİN PROJESİNİDE VERDİĞİM PDFLERE GÖRE BAŞTAN KURGULA".

## Kullanılacak araçlar
- ECC skill: frontend-patterns, motion-patterns, motion-advanced, accessibility, design-system, verification-loop
- Skill: `profesyonel-web-sitesi`; rehber `~/.claude/skills/design-taste-frontend/references/{layout,type,colour,motion,imagery}.md`
- 21st MCP: hayır

## Adımlar
1. Tokenlar: fildişi zemin, zeytin yeşili mürekkep, etiket bandı yeşili `#2F7A3B`, altın yalnız kurdele; 5 tip boyutu; 12 kolon; kenar 24–32px.
2. Temizlik: eyebrow etiketleri ('OSMANİYE / ÜRETİM TESİSİ', 'PERAKENDE', 'TOPRAKTAN SOFRAYA'), hairline/çerçeveli kutular, gölgeler, yer tutucu kutular (görsel yoksa bileşen tipografiyle tamamlanır, kutu görünmez).
3. Üst çubuk (föy 'no navigation outside the card' e-ticaret için uyarlandı — raporla): sol AFİNA ZEYTİN wordmark, sağ hesap + sepet (adet rozeti) + 'Menü'; düz fildişi zemin, şeffaf değil; mobil ≥44px hedefler, güvenli alan.
4. Düğme: kare köşe, düz dolgu (birincil zeytin yeşili, ikincil fildişi üstüne yeşil metin).

## Kabul kriterleri
- [ ] `grep -rnE 'linear-gradient|backdrop-filter|box-shadow' app components` → yalnız izinli scrim
- [ ] e2e: yer tutucu metinler ('hazırlanıyor', 'yakında' kutu) görünmüyor; sepet rozeti çalışıyor
- [ ] `node ~/.claude/skills/design-taste-frontend/scripts/lint.mjs app components` → FAIL yok
- [ ] production (`next build && next start -p 3104`) üzerinde `inspect.mjs http://127.0.0.1:3104` → bu bölüm için FAIL yok; 1440/768/390 + iPhone 14 (WebKit) ekran görüntüleri `test-results/090/`
- [ ] lint/typecheck/build; ilgili e2e (reduced-motion + mobil WebKit dahil); sepet testleri bozulmaz


## Coder Notu

20 Ekim 2026 — 090 kapsamındaki uygulama ve işlevsel kontroller tamamlandı; genel tasarım kapısı geçmediği için durum **BEKLİYOR** bırakıldı.

- `docs/PLAN.md`, `docs/DESIGN.md`, yön föyü, kit özeti ve layout/type/colour/motion/imagery rehberleri okundu. ECC frontend-patterns, tdd-workflow, motion-foundations, motion-patterns, motion-advanced, accessibility, design-system, verification-loop ve profesyonel-web-sitesi kullanıldı. Ek skill/bağımlılık kurulmadı. Görevdeki açık istisnaya göre 21st MCP kullanılmadı; mevcut shadcn bileşenleri resmi `npx shadcn@latest docs button` incelemesiyle uyarlandı.
- Fildişi/zeytin mürekkebi, `#2F7A3B` etiket bandı tokenı, beş tip boyutu, 12 kolon ve 24–32 px kenar payı tanımlandı. Altın düğme/metin vurguları kaldırıldı; altın tokenı kurdele için ayrıldı, onaylı logo renkleri korundu. Bu sayfada AFİNA'nın teneke etiketi sayfanın nesnesine dönüşür; 090 bu yönün ortak baskı tokenlarını ve üst çubuğunu uygular, 091–097 bileşimlerini uygulamaz.
- Eyebrow metinleri, görsel yer tutucuları, dekoratif çerçeve/ayraç ve gölgeler temizlendi. Ürün ve tesis görselsizken gerçek metinle tamamlanır. Resmi hikâye paragrafları aynen kaldı. Girdi alanlarının işlevsel kenarlıkları ve odak çizgileri korundu.
- Föyün “no navigation outside the card” kuralı, görevde istenen e-ticaret uyarlamasıyla uygulandı: 64 px, opak fildişi, üstte kalan çubuk; solda AFİNA ZEYTİN wordmark, sağda hesap/sepet/adet rozeti ve her genişlikte Menü. Güvenli alan payları, ≥44 px hedefler, modal odak kapanı, Escape ve odağı açıcıya döndürme doğrulandı. Toptan bağlantıları mevcut `#toptan-iletisim` hedefine bağlandı.
- Kare köşeli tek düğme biçimi, zeytin yeşili birincil ve fildişi ikincil dolgu kullanıldı. Logo dosyaları, onaylı zeytinlik görseli/kareleri, ScrollFrameSequence, sepet iş mantığı, katalog/fiyat/stok, PayTR işlemleri, `_legacy/` ve özgün promptlar değiştirilmedi. `next-env.d.ts` production build'in ürettiği tip yollarıyla güncellendi.
- Playwright'a doğrulanmış `PLAYWRIGHT_PORT` seçeneği ve gerçek iPhone 14 WebKit profili eklendi. Kanıtlar test koşularında silinmesin diye çalışma çıktısı `test-results/playwright/`, görev kanıtı `test-results/090/` olarak ayrıldı. Eski testlerin masaüstü navigasyon/logo/yer tutucu beklentileri yeni sözleşmeye uyarlandı. Yinelenen CTA seçicileri hero bölgesiyle sınırlandırıldı. iPhone'un 390×664 kullanılabilir alanında hover/mouse-wheel varsayımları kaldırıldı; aktif kare testleri 900 px yükseklikte, poster/odak/sepet testleri gerçek cihaz profilinde çalışır. Kısa ekranda mevcut hero ilk ekranın altına uzanır; CTA'lara odak/kaydırma ile erişim doğrulandı, 091 hero bileşimi bu görevde değiştirilmedi.

### Komutla doğrulama

| Kontrol | Gerçek sonuç |
|---|---|
| RED: `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3104 npm run test:e2e -- tests/e2e/foundation.spec.ts --project=chromium-1440 --workers=1 --max-failures=1` | Üretim kodundan önce wordmark beklentisi başarısız oldu; `4cb2db7` commit'i RED kanıtıdır. |
| `grep -rnE 'linear-gradient|backdrop-filter|box-shadow' app components` | Yalnız Hero.module.css içindeki iki onaylı 086 okunurluk scrim'i. Değerleri korunmuştur; iki satırdaki açıklamalı taste-skill-ignore yalnız bu gerçek istisnadır. |
| `node ~/.claude/skills/design-taste-frontend/scripts/lint.mjs app components` | **0 FAIL, 2 WARN**: mevcut demo h-screen ve metinlerde uzun tire kullanımı. |
| `npm run build` | PASS; ön adım `check:assets`: 16 varlığın hash/onay/runtime kontrolü PASS. |
| `npm run lint` / `npm run typecheck` / `git diff --check` | PASS. |
| `npm run test` | **9 dosya, 204/204 PASS**; sepet depolama, stok ve hata/kurtarma testleri dahil. |
| Production E2E | **364/364 PASS**; Chromium 1440/768/390 ve iPhone 14 WebKit; reduced-motion, sepet/drawer/upsell, menü, font, hukuk, hero/kare ve sahne kontrolleri dahil. Ek 320 px koşusunda temel/menü kontrolleri geçti. |
| `next start -p 3104` üzerinde `node ~/.claude/skills/design-taste-frontend/scripts/inspect.mjs http://127.0.0.1:3104 --out test-results/090/inspect` | **2 FAIL, 7 WARN; çıkış 1.** Başlıklar ≤2 satır, beş tip boyutu, iki font, eyebrow/çerçeve/gölge kontrolleri geçti. Kalanlar aşağıda. |
| Ek `npm run test -- --coverage` | 204 test PASS; global V8 kapsamı: satır **%72,34**, ifade %70,37, işlev %66,66, dal %96,15. %80 eşiği nedeniyle çıkış 1; eşik düşürülmedi. Hukuk ve sepet route'ları E2E'de doğrulanmış olsa da bu unit coverage raporuna dahil değildir. |

E2E tekrar komutu (production build hazır olmalı):

```sh
PLAYWRIGHT_PORT=3104 npm run test:e2e -- tests/e2e/{foundation,shell,tokens,cart-wire,cart-drawer,cart-page,upsell,product-card,facility,hero,hero-zeytinlik,legal,fonts,hero-motion,card-motion,scenes}.spec.ts --project=chromium-1440 --project=chromium-768 --project=chromium-390 --project=webkit-iphone14
```

Sonuçlar: `test-results/090/e2e.log`, `e2e-results.json`, `inspect.txt`, `inspect/report.json`, `measurements.json`. 1440/768/390 fotoğrafları `inspect/` altında; normal/reduced-motion PNG'leri `chromium-{1440,768,390}-*.png` ve `webkit-iphone14-*.png`. Kanıt dizini repo'nun mevcut `.gitignore` kuralıyla yerel kalır.

### Görsel kanıt tablosu

Aşağıdaki dosyalar `test-results/090/` altındadır; ekranlar açılarak incelendi.

| Kontrol | Ekran + seçici/bileşen | Sonuç |
|---|---|---|
| Ana / nötr / vurgu | `desktop-header.png`, `inspect/desktop-fold.jpg`; `.site-bar`, `body`, CSS tokenları | #243A29 / #F5F1E7; #2F7A3B bant ve #D4B483 kurdele için ayrıldı. |
| Başlık + gövde fontu | `inspect/desktop-fold.jpg`; h1 / body | Fraunces 600 + Figtree 400/600; font E2E geçti. |
| Boşluk ölçeği | `measurements.json`, `inspect/desktop-page-01.jpg`; `.page-grid`, article | 12 kolon, aralık 24 px, kart içi 24 px; masaüstü kenar 31,68 px, mobil 24 px. |
| h1/h2/h3 hiyerarşisi | `inspect/desktop-fold.jpg`, `chromium-1440-no-preference.png` | 1440 px'de 56 / 36 / 24 px; gövde 16, küçük metin 13 px; toplam beş boyut. |
| Kırık simetri | `inspect/desktop-page-01.jpg`; `#tesisimiz .page-grid` | Başlık 1–4, hikâye 6–12 kolon; medya yer tutucusu yok. |
| Hover/focus/active, üç kontrol | `desktop-header.png`, `desktop-menu.png`, `desktop-cart.png`; wordmark, Menü, Sepete ekle; `measurements.json` | Hover alt çizgi/dolgu, 2 px odak, basılı eylem geri bildirimi; klavye ve reduced-motion E2E PASS. |
| Gölge/kenarlık | `desktop-menu.png`, `desktop-cart.png`; Dialog/Button | Gölge yok, köşe 0 px; işlevsel input ve odak çizgisi marka tokenından. |
| Tek ikon ailesi | `desktop-header.png`, `desktop-cart.png` | Lucide outline. |
| Kontrast ≥4,5:1 | `measurements.json`; zeytin/fildişi ve gövde mürekkebi/fildişi | **10,87:1 / 15,67:1**; hero fotoğraf/scrim AA örnekleme testleri PASS. |
| Yasak liste | kaynak lint + inspect ekranları | Mor degrade, emoji, blur yığını, stok 3D veya görsel hazırlanıyor kutusu eklenmedi. Mevcut CTA kurgusunun yeniden bileşimi 091'dedir. |

### Tamamlanamayan kapı

`inspect.mjs` sayfanın tamamını ölçüyor ve 1440 px'de iki FAIL bırakıyor:

1. `few-pictures`: yalnız bir gerçek fotoğraf sayıyor; en az dört istiyor. 090 ise onaysız görsel eklememeyi ve görsel yokken tipografiyle tamamlamayı gerektiriyor. 092–095/varlık onayı kapsamına geçilip yeni görseller yerleştirilmedi.
2. `empty-screens`: korunan hero/kare sahnesinin ilk üç ekranını düşük doluluk olarak ölçüyor. 091 hero yeniden bileşimi ve 096 pinned story bu görevin kapsamı dışında; sırf ölçeri geçirmek için scrub uzunluğu/medya davranışı değiştirilmedi.

Yedi WARN'ın ayrıntısı inspect raporundadır: korunan fildişi, muted metin, video etiketi olmaması (runtime kare dizisi kullanır), paragraf ölçüsü ve pin/hareket gözlemleri. Ayrıca ek unit coverage kapısı %80'in altında kalıyor. Bu nedenlerle genel kabul geçmiş gibi gösterilmedi ve **TAMAMLANDI yazılmadı**. Plan/görev kapsamı kendiliğinden genişletilmedi.

## Durum: BEKLİYOR
