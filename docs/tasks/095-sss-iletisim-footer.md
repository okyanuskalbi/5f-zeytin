# Task 095: SSS, toptan ziyaret kartı, etiketin arka yüzü

## Tür
frontend

## Amaç
Föy SSS (okuma metni), iletişim (fotoğraf üstünde ziyaret kartı) ve footer (fırfırlı etiket arka yüzü).

## Bağlam
Yeniden kurgu — **önce `docs/DESIGN.md` (tamamı), föy (`node ~/.claude/skills/design-taste-frontend/scripts/draw.mjs --show`) ve `~/PROJELER/AFINA-KAYNAK/kitler/ozet.md` okunur.** Korunanlar (fontlar, renkler, logolar, onaylı zeytinlik görseli/videosu, ScrollFrameSequence, sepet altyapısı, PayTR önizleme, resmi metinler) DEĞİŞMEZ. Kullanıcı (20 Eki): "ZEYTİN PROJESİNİDE VERDİĞİM PDFLERE GÖRE BAŞTAN KURGULA".

## Kullanılacak araçlar
- ECC skill: frontend-patterns, motion-patterns, motion-advanced, accessibility, design-system, verification-loop
- Skill: `profesyonel-web-sitesi`; rehber `~/.claude/skills/design-taste-frontend/references/{layout,type,colour,motion,imagery}.md`
- 21st MCP: hayır

## Adımlar
1. SSS: 'Sık sorulanlar' kol 1–3, kol 5–12 iki kolon okuma metni; yalnız `087-aeo-geo.md`'de resmi cevabı olan sorular (teyitliler); FAQPage JSON-LD 087/074 ile tek üreticiden.
2. İletişim: tesis fotoğrafı (093'teki onay durumuna göre; onaysızsa zeytin yeşili düz alan) tam ekran + 380px kağıt kart: 'Toptan satış', adres (SIRKET.md), telefon/e-posta alanları teyit gelene kadar GİZLİ (boş/yer tutucu gösterme), 'Toptan Satış İçin İletişime Geçin' → toptan form (081; gönderim 082 kararına bağlı, sahte başarı yok).
3. Footer: fildişi panel, üst kenar 12 fırfır (SVG/clip-path), sol imza 'Kökü toprakta. Yeri sofrada.' + iki satır mesaj, sağ adres/linkler + pul (tesis fotoğrafı veya zeytinlik minik), alt baskı satırı 13px: 'AFİNA ZEYTİNCİLİK TARIM ÜRÜNLERİ SAN. VE TİC. LTD. ŞTİ. · Düziçi VD · VKN 0091520061' + KVKK/Mesafeli Satış/İade linkleri + küçük AFİNA Şirketler Topluluğu logosu (afina.com.tr linki).

## Kabul kriterleri
- [ ] e2e: SSS'de teyitsiz soru yok; form doğrulama; footer yasal linkler çalışıyor; telefon/e-posta yer tutucusu yok
- [ ] `node ~/.claude/skills/design-taste-frontend/scripts/lint.mjs app components` → FAIL yok
- [ ] production (`next build && next start -p 3104`) üzerinde `inspect.mjs http://127.0.0.1:3104` → bu bölüm için FAIL yok; 1440/768/390 + iPhone 14 (WebKit) ekran görüntüleri `test-results/095/`
- [ ] lint/typecheck/build; ilgili e2e (reduced-motion + mobil WebKit dahil); sepet testleri bozulmaz

## Coder Notu

20 Ekim 2026. SSS, ziyaret kartı ve etiket arka yüzü uygulandı; **form ve schema bağımlılıkları tamamlanmadığı için görev BEKLİYOR**.

### Uygulananlar ve sınırlar

- PLAN, DESIGN, föy, dört kit özeti, layout/type/colour/motion/imagery rehberleri ve kamuya açık `AFINA-KAYNAK/sirket/SIRKET.md` okundu. ECC frontend-patterns, tdd-workflow, motion-foundations/patterns/advanced, accessibility, design-system, verification-loop ve profesyonel-web-sitesi kullanıldı. Yeni skill veya paket kurulmadı. Next 16.4.2'nin yerel Server/Client Components, CSS ve Image rehberleri incelendi.
- Marka kararı: mevcut zeytin mürekkebi/fildişi/altın, Fraunces + Figtree ve 8px boşluk sistemi korundu. SSS `Faq` içinde SSR okuma metni; masaüstünde başlık 1–3, cevaplar 5–12 kolonlarında iki sütun, dar ekranlarda tek sütun. Yalnız 087'nin ortak seçimi **Z01/Z05/Z06/Z07**, bölüm 04'ten birebir cevap parçaları kullanıldı. Diğer 12 teyitsiz soru/cevap yayımlanmadı.
- `WholesaleContact`: 380px kağıt kart ve kamuya açık adres. 093 tesis adaylarının onayı kapalı olduğundan fotoğraf yerine task'ın izin verdiği düz zeytin yeşili kullanıldı. Telefon/e-posta alanı veya yer tutucusu yok.
- `Footer`: fildişi panel, 12 SVG fırfır, resmi imza + iki resmi mesaj, adres/keşif linkleri, onaylı zeytinlikten pul, 13px unvan/VD/VKN, üç hukuk bağlantısı ve afina.com.tr'ye bağlı mevcut normal topluluk logosu. Logo/medya kaynakları değiştirilmedi. Hukuk route'ları 200 ve açıkça taslak; bu çalışma politika metni onayı değildir.
- AGENTS.md'deki genel UI arama kuralı nedeniyle, task'ın “21st MCP: hayır” satırına rağmen yalnız okuma amaçlı 21st araması yapıldı; **ln-dev7 / Minimal Two-Column Footer, demo 26908** alındı. İki kolon marka/gezinme iskeleti Afina'nın etiket düzenine uyarlandı; örnek metin, kenarlık ve stiller alınmadı. Yeni shadcn bileşeni eklenmedi; mevcut Button kullanıldı.
- Mevcut SceneFlow, iletişim başlığının girişini yönetir; reduced-motion ve JS kapalı durumda içerik görünür kalır. Koçanın SSS/kart/footer üzerine gelmemesi için yalnız mevcut HeroLabel engel listesine `data-reading-safe` ve bu bölüm hedefleri eklendi. Sepet/ürün/ödeme iş mantığı değiştirilmedi. Footer bölüm bağlantılarında doğal hash/klavye odağı kullanıldı; shell'in footer metni/logo beklentileri yeni tasarıma uyarlandı.

### Tamamlanamayan bağımlılıklar

1. **081 formu yok:** `components/landing/WholesaleForm.tsx`, `lib/contracts/wholesale.ts`, `tests/e2e/wholesale-form.spec.ts` bulunmuyor. Form doğrulaması ve CTA→form kabulü çalıştırılamadı. `npx playwright test tests/e2e/wholesale-form.spec.ts --project=chromium-1440 --list` → **0 test / çıkış 1**, `test-results/095/form-dependency.log`. Kapsamı 081'e genişletmek yerine CTA devre dışı ve erişilebilir açıklaması “Toptan talep formu henüz kullanıma açık değil.” olarak bırakıldı. 082 gönderimi/servisi seçilmedi; sahte başarı yok. 081 geldiğinde CTA gerçek forma bağlanmalı ve doğrulama kabulü çalıştırılmalı.
2. **074/087 schema üreticisi yok:** `lib/seo/schema.ts` henüz oluşturulmamış; iki görev de BEKLİYOR. Task'ın tek üretici şartı gereği bağımsız FAQPage/Organization üretilmedi. `verifiedFaqs`, görünür SSR verisinin tek kaynağı olarak hazır; 074/087 aynı görünür seçkiyi kendi graph'ına bağlamalı. **FAQPage kabulü bu çalışmada tamamlanmadı.**

Tesis fotoğrafı onaysızlığı ayrıca bir uygulama engeli değildir: bu task açıkça yeşil zemin ve zeytinlik pulu alternatifi sunuyor. Gerçek iletişim/hukuk onayları ve 081/082/074/087 bağımlılıkları bu görevle verilmiş sayılmaz.

### Komutla doğrulama ve TDD kanıtı

| Komut / kanıt | Gerçek sonuç |
|---|---|
| RED: `npm test -- tests/unit/faq-contact-footer.test.tsx` | Eksik SSS/adres/imza için **3 beklenen FAIL**; `red.log`, commit `b330a78` |
| GREEN: aynı unit hedefi | **3/3 PASS**; `green.log`, uygulama commit'i `9c08e7d` |
| Production e2e RED | Hash odağı ve grid başlık kutusu için 7 FAIL; ayrıca koçan çakışması tekrarlandı (`stub-red.log`); test commit'i `67e0478` |
| Production e2e GREEN | **30/30 PASS**, commit `12ca090`; son ortak koşuda da aynı 30 test PASS |
| `npm test -- --coverage` | **14 dosya, 222/222 test PASS**; global coverage eşiği aşağıda |
| `npm test -- tests/unit/faq-contact-footer.test.tsx --coverage --coverage.include=components/landing/Faq.tsx --coverage.include=components/landing/WholesaleContact.tsx --coverage.include=components/site/Footer.tsx --coverage.reportsDirectory=test-results/095/coverage-section` | Üç yeni/değişen bölüm: **%100 statement/line/function**, dal yok; `section-coverage.log` |
| `npm run lint` / `npm run typecheck` / `npm run build` | **PASS**; build ön adımı varlık/onay/hash **18/18 PASS** |
| `node ~/.claude/skills/design-taste-frontend/scripts/lint.mjs app components` | **0 FAIL / 2 WARN**: mevcut demo h-screen ve genel uzun tire sayısı |
| Production `next start -H 127.0.0.1 -p 3104` + `inspect.mjs http://127.0.0.1:3104 --out test-results/095/inspect` | **Tüm sayfada 0 FAIL / 5 WARN**, 1440/768/390; `inspect.log`, `inspect/report.json` |
| 095 Playwright | **30/30 PASS**: teyitli soru/cevaplar, gizli iletişim alanları, fotoğraf kapısı, kart ölçüsü, hukuk route'larına gerçek gezinme, klavye/odak/hover/press, reduced-motion, JS kapalı, medya hatası ve koçan çakışması |
| Sepet/hero/vitrin regresyonu | **220/220 PASS**; `regression.log`, `regression-results.json` |
| Son ortak shell/hukuk/095 koşusu | **70 PASS / 15 FAIL**; 095 **30/30**, hukuk **25/30**, shell **15/25**; genel bulgular aşağıda |
| `git diff --check` ve eklenen kodda sır/debug taraması | **PASS**, şüpheli ekleme yok; env dosyası değiştirilmedi |

Tarayıcı komutları (production build hazırken):

```sh
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3104 npx playwright test tests/e2e/faq-contact-footer.spec.ts tests/e2e/shell.spec.ts tests/e2e/legal.spec.ts --project=chromium-1440 --project=chromium-768 --project=chromium-390 --project=chromium-320 --project=webkit-iphone14
PLAYWRIGHT_PORT=3114 npx playwright test tests/e2e/cart-wire.spec.ts tests/e2e/cart-drawer.spec.ts tests/e2e/cart-page.spec.ts tests/e2e/upsell.spec.ts tests/e2e/hero.spec.ts tests/e2e/hero-motion.spec.ts tests/e2e/hero-zeytinlik.spec.ts tests/e2e/showcase.spec.ts --project=chromium-1440 --project=chromium-768 --project=chromium-390 --project=webkit-iphone14
```

3114 sepet fixture'larının kendi yerel webServer'ı içindir; harici base URL ile fixture koşulmadı. Sandbox içindeki ilk tarayıcı başlatmaları işletim sistemi tarafından engellendi; yerel Chrome/Playwright kontrolleri izinli sandbox dışı süreçte tekrarlandı. Raporlar `test-results/095/{final-e2e,regression}-results.json`, loglar aynı dizindedir. Ekranlar `chromium-{1440,768,390,320}-{faq,contact,footer,footer-end,reduced}.png`, `webkit-iphone14-*.png` ve `inspect/` altındadır; görüntüler açılıp incelendi. Ek iPhone 14 yatay 844×390, iPhone SE 320×568, Pixel 7 412×839 ve Galaxy boyutunda 360×800 emülasyonlarında yatay taşma yok (`style-audit.json`). Bunlar yerel tarayıcı/emülasyon kanıtıdır; fiziksel cihaz veya canlı yayın kabulü değildir. `test-results/` gitignore kapsamındadır.

### Genel bulgular — 097 kapısı

- Ortak koşudaki 15 FAIL: `legal.spec.ts:50` ve `shell.spec.ts:175` hâlâ eski **H1 “Afina Zeytin”** bekliyor (5'er hedef); `shell.spec.ts:90` menü açıkken `getByRole('main')` sayısını 0 bekliyor, 1 görüyor (5 hedef). 095'in bölüm testleri/koçan/odak ve footer sözleşmesi geçti. Genel hero beklentileri ve menü modal erişilebilirliği bu görevde değiştirilmedi; 097'de ele alınmalı. Bu hatalar gizlenmedi veya skip edilmedi.
- App-geneli coverage: satır **%71,73**, statement **%69,81**, function **%63,63**, branch **%95,83**. Sepet ve hukuk route'ları unit kapsamı dışında; %80 global eşik nedeniyle coverage komutu çıkış 1. Eşik düşürülmedi; AGENTS.md ara görev kuralı gereği bu bölüm kabulünü tek başına engellemez.
- Inspect WARN: korunan fildişi palet, video etiketi olmaması (korunan kare dizisi), mevcut yatay anlar şeridi, uzun paragraf ölçüsü, hero pin/metin-fotoğraf gözlemi. FAIL yok; mevcut palet/medya/diğer bölüm kararları değiştirilmedi.

### Profesyonel web sitesi kanıtı

| Kontrol | Nerede / ölçüm | Sonuç |
|---|---|---|
| Ana / nötr / vurgu | `*-faq.png`, `*-contact.png`, `*-footer.png`; `style-audit.json` | #243A29 / #F5F1E7 + #FFFCF5 / korunmuş logo altını #D4B483 |
| Başlık + gövde fontu | `*-metrics.json`, h2 / SSS metni | Fraunces 600 + Figtree; SSS gövdesi 16px, baskı satırı 13px |
| 8px boşluk sistemi | SSS/kart/footer | 24/32/48/64/96px; mevcut akışkan sayfa kenarı mobil 24px, 1440'ta 31,68px |
| h1/h2/h3 hiyerarşisi | Mevcut hero / bölüm başlığı / run-in sorular | h2 başlıklar ≤2 satır, sorular semantik h3 ve 16px Figtree |
| Kırık simetri | `chromium-1440-faq.png`, `chromium-1440-contact.png` | 3 + boş kolon + 8 kolon SSS, sağ üstte 380px ziyaret kartı |
| Hover/focus/active, üç bağlantı | `{explore,legal,community}-{focus,active}.png`, `style-audit.json` | Tesisimiz/KVKK/topluluk; ≥44px hedef, 2px odak, alt çizgi/dolgu/mürekkep geri bildirimi |
| Marka kenarlığı / gölge | Bölüm, kağıt kart ve footer | Durağan gölge/dekoratif çerçeve yok; işlevsel odak zeytin yeşili |
| Tek ikon ailesi | Yeni bölümler / mevcut CTA sistemi | Yeni ikon eklenmedi; mevcut Lucide ailesi korundu; fırfır bir kağıt kesimidir |
| Kontrast ≥4,5:1 | `style-audit.json` | Yeşil/fildişi **10,87:1**, gövde/kağıt **17,25:1**, açıklama/kağıt **5,95:1** |
| Yasak liste taraması | Lint, inspect ve görüntüler | Mor degrade, emoji, glass/blur yığını, stok 3D veya boş medya yer tutucusu yok |

## Durum: BEKLİYOR
