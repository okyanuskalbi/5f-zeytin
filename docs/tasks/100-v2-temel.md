# Task 100: v2 temel: tokenlar, tipografi, uyarlanan üst çubuk, v1 temizliği

## Tür
frontend

## Amaç
DESIGN.md v2 renk/tip tokenları; v1 etiket bileşenlerinin kaldırılması; zemine göre renk değiştiren üst çubuk ve sepet rozeti.

## Bağlam
ZEYTİN v2 — **önce `docs/DESIGN.md` (tamamı; v2 "Topraktan sofraya") okunur**; v1 (`DESIGN-v1-etiket.md`) bileşenleri (etiket kartı, koçan, fişler, fırfırlı footer) kaldırılır/dönüştürülür. Korunanlar DEĞİŞMEZ. Kullanıcı (20 Eki): "ZEYTİN SİTESİNİ HİÇ BEĞENMEDİM BAŞTAN YAP" + "21.DEV VE FRAMER MOTION UX/UI SKİLLERİ İLE EN İYİ SEÇENEKLERİ YAP".

## Kullanılacak araçlar
- ECC skill: frontend-patterns, motion-patterns, motion-advanced, accessibility, design-system, verification-loop; skill `motion-framer`, `profesyonel-web-sitesi`, `ui-ux-pro-max` (e-ticaret UX)
- 21st MCP: hayır

## Adımlar
1. Tokenlar: toprak/zeytin/krem/kum/altın/fabrika yeşili; Fraunces/Figtree ölçeği (DESIGN.md).
2. v1 kaldırma: HeroLabel (etiket kartı + koçan), vitrin fişleri, fırfırlı footer, etiket bandı yeşili tokenı; ilgili testler v2'ye dönüştürülür (silinmez, davranış sözleşmesi korunur: sepete ekle, boy seçimi).
3. Üst çubuk: sol AFİNA ZEYTİN logosu (koyu zeminde dark varyant), orta/sağ Ürünler · Tesisimiz · Toptan, hesap, sepet (adet rozeti, değişince spring zıplama); hero üzerinde şeffaf + krem metin, ışık doğduktan sonra krem zemin + zeytin metin (scroll'a bağlı, düz renk). Mobil: logo + sepet + 'Menü' (tam ekran menü, odak tuzağı).
4. Düğmeler: kare köşe; birincil koyu zeminde altın/toprak metin, açık zeminde zeytin/krem metin.

## Kabul kriterleri
- [ ] e2e: v1 bileşenleri DOM'da yok; üst çubuk renk geçişi; sepet rozeti; mobil menü odak tuzağı
- [ ] `lint.mjs app components` 0 FAIL; production (`next build && next start -p 3104`) `inspect.mjs` bu bölüm için FAIL 0; 1440/768/390 + iPhone 14 (WebKit) + Pixel 7 ekran görüntüleri `test-results/100/`
- [ ] lint/typecheck/build; ilgili e2e (reduced-motion + mobil); sepet/PayTR önizleme/toptan form testleri bozulmaz

## Coder Notu

- DESIGN.md v2 esas alındı. Toprak/krem/kum/altın/fabrika yeşili tokenları ve beş basamaklı Fraunces/Figtree ölçeği uygulandı. Fraunces dosyasında gerçek `wght=500..700`, `opsz=9..144`, SOFT 50; Figtree 400/600/800 bulunuyor. Türkçe karakterler, lira ve font dosyası hatası senaryosu tarayıcıda doğrulandı.
- `HeroLabel` ve koçan hareketi kaldırıldı; `HeroIntro` düz yüzeylere dönüştürüldü. Ürün/boy seçimi, doğru SKU, stok sınırı ve sepete ekleme sözleşmeleri korundu. Vitrin fişleri, dekoratif noktalar/şeritler ve footer fırfır/pulu kaldırıldı; footer toprak zeminine geçti. Etiket yeşili tokenı ve iç sayfalardaki şeritleri kaldırıldı.
- Üst çubuk hero üzerinde şeffaf/krem ve dark logo; açık bölüm sınırında krem/zeytin ve normal logo. Doğal scroll, geri kaydırma, doğrudan iç sayfa ve istemci navigasyonu doğrulandı. Masaüstünde Ürünler/Tesisimiz/Toptan/hesap/sepet; mobilde logo/sepet/Menü. Radix tam ekran menüde odak tuzağı, ESC, odak iadesi, arka plan izolasyonu ve ekran büyüyünce kapanma var.
- Rozet adet değişiminde `motion/react` spring (`visualDuration: 0.35`, `bounce: 0.2`) kullanıyor; sayılar üst üste binmiyor. Reduced-motion modunda transform yok. Üst çubuk metni, zeminle aynı anda değişerek geçişte kontrastını koruyor. Kare düğmeler koyu yüzeyde altın/toprak, açıkta zeytin/krem.
- Kullanılan skill'ler: görevdeki altı ECC skill'i, `motion-foundations`, `motion-framer`, `profesyonel-web-sitesi`, `ui-ux-pro-max`, TDD. Hepsi yerelde bulundu; ek skill kurulmadı. Görevin açık `21st MCP: hayır` talimatı uygulandı. Mevcut shadcn Button/Dialog resmi CLI ile incelendi (`npm --cache .cache/npm exec --yes --package shadcn@latest -- shadcn view button dialog`); Dialog'a merkez yerleşimini koruyan `fullscreen` seçeneği eklendi.
- Toptan form birim testindeki effect sonrası odak beklentisi `waitFor` ile beklenir hale getirildi; davranış ve üretim form kodu değiştirilmedi. Yeni görsel üretimi veya onaysız görsel kullanımı yapılmadı. 101–106'nın ayrıntılı sahne/ürün/çekmece işleri bu görevin kabulüne dahil değildir.

### Komutla doğrulama

| Kontrol | Sonuç / kanıt |
|---|---|
| RED: `npm test -- tests/unit/v2-foundation.test.tsx` | Mevcut v1 DOM ve eksik v2 tokenları nedeniyle 2 test başarısız; `test-results/100/red.log`. RED commit: `06e525d`, mevcut HEAD'in atası. |
| `npm test -- --coverage` | 18 dosya, **252/252 PASS**. Yapılandırılmış app kapsamı: statement %87.50, branch %95.83, function %92.85, line %91.83; `unit.log`. |
| `npm run lint` | **PASS**, 0 uyarı; `eslint.log`. |
| `npm run typecheck` | **PASS**; `typecheck.log`. |
| `npm run build` | **PASS**; görsel kaynak/hash/onay kontrolü de 18/18 PASS; `build.log`. |
| `node ~/.claude/skills/design-taste-frontend/scripts/lint.mjs app components` | **0 FAIL / 2 WARN**: korunan demo `h-screen`, genel metinlerde uzun tire; `taste-lint.log`. |
| Production `next start -H 127.0.0.1 -p 3104` + `inspect.mjs` | **Task 100 kapsamı 0 FAIL**. Global rapor **4 FAIL / 3 WARN**; ayrıntı aşağıda. `inspect/report.json`, `inspect-scope.json`, `inspect.log`. |
| İlgili e2e + korunan akışlar | **293 PASS / 3 bilinçli SKIP / 0 FAIL**. Üç SKIP, Pixel 7 çekiminin yalnız Chromium-1440 projesinde bir kez yapılması içindir; diğer üç profilde yinelenmez. `e2e-final.log`. |
| `git diff --check` + eklenen kodda sır/debug çıktısı taraması | PASS; sır, env veya yeni debug çıktısı eklenmedi. |

Kabul e2e komutu (repo'nun kendisinin başlattığı production sunucusu; fixture'ların yerel kontrolünü korumak için `PLAYWRIGHT_BASE_URL` tanımlanmadı):

```sh
PLAYWRIGHT_PORT=3106 FRAME_SEQUENCE_DEV_URL=http://localhost:3004 npm run test:e2e --   tests/e2e/foundation.spec.ts tests/e2e/hero.spec.ts tests/e2e/hero-motion.spec.ts   tests/e2e/showcase.spec.ts tests/e2e/cart-wire.spec.ts tests/e2e/cart-drawer.spec.ts   tests/e2e/cart-page.spec.ts tests/e2e/upsell.spec.ts tests/e2e/payment-preview.spec.ts   tests/e2e/wholesale-form.spec.ts tests/e2e/tokens.spec.ts tests/e2e/shell.spec.ts   tests/e2e/fonts.spec.ts tests/e2e/faq-contact-footer.spec.ts   --project=chromium-1440 --project=chromium-768 --project=chromium-390   --project=webkit-iphone14 --output=test-results/100/playwright
node ~/.claude/skills/design-taste-frontend/scripts/inspect.mjs   http://127.0.0.1:3104 --out test-results/100/inspect
```

PayTR önizlemenin yalnız geliştirmede açılan yolları aynı checkout'un mevcut 3004 dev sunucusunda; iframe/token/hata/tekrar deneme fixture'ları production test ortamında sınandı. Canlı ödeme veya servis gönderimi yapılmadı.

### Ekran görüntüsü ve görsel ölçüm

Dosyalar `test-results/100/` altında (gitignore kapsamındaki yerel kanıtlar). `chromium-{1440,768,390}-{no-preference,reduce}-{dark,light}.png`, tablet/mobil `*-menu.png`, `webkit-iphone14-*.png`, `Pixel-7-{dark,light,menu}.png`; inspect'in üç genişlikte fold/page JPG'leri. iPhone 14 gerçek WebKit, Pixel 7 Chromium cihaz profili emülasyonudur.

| Kontrol | Ekran / seçici / ölçüm | Sonuç |
|---|---|---|
| Marka ana/nötr/vurgu | `*-dark.png`, `*-light.png`; üst çubuk/hero/düğme | Toprak, krem, zeytin, altın; fabrika yeşili yalnız token olarak hazır. |
| Başlık/gövde fontu | `#hero-title`, `#urunler h3`, body; `fonts.spec.ts` | Fraunces 500/700, Figtree 400/600/800 dosyadan yüklendi. |
| Boşluk ölçeği | `visual-metrics.json`; vitrin padding 64px, metin arası 24px; düzen gap 48px | PASS; mevcut akışkan yan marj korunuyor. |
| Hiyerarşi | 1440: hero 144px / bölüm 72px / ürün 30px / gövde 18.72px; 768/390: bölüm 40px / ürün 26px / gövde 17px | PASS; hero iki satır, taşma yok. Mobil hero 13vw, 101'in mobil kuralıyla uyumlu. |
| Asimetri | `inspect/desktop-fold.jpg`, `#hero-title`, üst çubuk | Sol başlık/logo, sağ navigasyon. |
| Hover/focus/active | Menü bağlantısı, düğme, footer yasal bağlantısı; shell/tokens/footer e2e | PASS; tam ekran odak tuzağı ve görünür focus halkası. |
| Kenarlık/gölge | Form kontrolü/ring marka zeytini; `inspect` ve tasteskill lint | Süslü kart kenarlığı veya durağan gölge yok. |
| İkon ailesi | Üst çubuk, sepet/adet, kapatma | Korunan tek Lucide ailesi. |
| Metin kontrastı | `visual-metrics.json`: zeytin/krem **10.89:1**, toprak/altın **9.66:1**, toprak/krem **16.90:1** | AA PASS. |
| Yasak görsel dil | tasteskill lint + açılıp incelenen 1440/390, iPhone ve Pixel ekranları | Degrade, emoji, blur yığını, etiket/koçan/fiş/fırfır yok. |

### Kapsam dışında kalan global kapı

AGENTS.md'nin yeniden kurgu ara görev kuralı gereği aşağıdakiler gizlenmedi; **Task 100 kabulünü engellemez**, global kabul 107'de kapanır:

- `headline-lines`: henüz v2'ye uyarlanmayan tesis hikâyesindeki “Zeytinin hikâyesi toprakta başlar, sofrada tamamlanır.” paragrafı 1440/768/390'da üç satır (3 FAIL; 104).
- `few-pictures`: sayfa genelinde tek ayrı onaylı raster görsel var (1 FAIL; 101–105 görsel/bölüm akışı ve 107). Onaysız ürün/tesis görseli ekleyerek kapı aşılmadı.
- Genel WARN'lar: marka tarafından istenen krem palet; kare dizisi nedeniyle video öğesi bulunmaması; sonraki süreç bölümünün yatay şeridi.
- `inspect-scope.json`, orijinal global raporu koruyarak yalnız bu açıkça adlandırılmış dış kapsam bulgularını ayırır; Task 100'e ait kalan FAIL sayısı sıfırdır. Diğer bölümlerin tüm eski/global e2e ve performans kabulü bu görevde tamamlandı sayılmaz.

## Durum: TAMAMLANDI
