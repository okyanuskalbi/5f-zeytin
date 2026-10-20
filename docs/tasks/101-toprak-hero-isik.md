# Task 101: Toprak hero ve ışığın doğuşu

## Tür
frontend

## Amaç
Koyu zeytinlik hero (kare dizisi) + scroll ile ışık doğuşu: zemin toprak→krem, görüntü aydınlanır, 'Yeri sofrada.' gelir.

## Bağlam
ZEYTİN v2 — **önce `docs/DESIGN.md` (tamamı; v2 "Topraktan sofraya") okunur**; v1 (`DESIGN-v1-etiket.md`) bileşenleri (etiket kartı, koçan, fişler, fırfırlı footer) kaldırılır/dönüştürülür. Korunanlar DEĞİŞMEZ. Kullanıcı (20 Eki): "ZEYTİN SİTESİNİ HİÇ BEĞENMEDİM BAŞTAN YAP" + "21.DEV VE FRAMER MOTION UX/UI SKİLLERİ İLE EN İYİ SEÇENEKLERİ YAP".

## Kullanılacak araçlar
- ECC skill: frontend-patterns, motion-patterns, motion-advanced, accessibility, design-system, verification-loop; skill `motion-framer`, `profesyonel-web-sitesi`, `ui-ux-pro-max` (e-ticaret UX)
- 21st MCP: evet — ilham: scroll-linked hero (uyarla)

## Adımlar
1. Sticky ~180vh sahne; arka plan onaylı zeytinlik ScrollFrameSequence (poster SSR, LCP: ≤60 KB AVIF + fetchpriority=high; kare dizisi boşta/etkileşimde).
2. Başlık sol alt: 'Kökü toprakta.' (display, krem); %40 ilerlemede ikinci satır 'Yeri sofrada.' alttan yükselerek gelir.
3. Işık doğuşu (motion-framer `useScroll` + `useTransform`): %35→%85 arası zemin `#0D110D`→`#F6F1E6`, görüntü `brightness(0.55)`→`1`, sonra görüntü yukarı kayar/küçülür ve vitrine yer açar; metin rengi krem→zeytin. Düz renk enterpolasyonu, gradyan yok.
4. Sağ altta 'Ürünleri keşfet' (altın) → Lenis yoksa doğal kaydırma ile vitrine; destek cümlesi: resmi alt slogan.
5. Mobil: 100svh, başlık 13vw iki satır, dikey kırpım; ışık geçişi aynı; LCP posteri mobil boyutta.
6. reduced-motion: ikinci satır ve krem zemin hemen; poster statik.

## Kabul kriterleri
- [ ] e2e: scroll %20/%60/%95'te zemin rengi ve başlık satırları beklenen; reduced-motion statik
- [ ] Lighthouse mobil bu bölümle LCP < 2.5 s (3 ölçüm medyanı)
- [ ] `lint.mjs app components` 0 FAIL; production (`next build && next start -p 3104`) `inspect.mjs` bu bölüm için FAIL 0; 1440/768/390 + iPhone 14 (WebKit) + Pixel 7 ekran görüntüleri `test-results/101/`
- [ ] lint/typecheck/build; ilgili e2e (reduced-motion + mobil); sepet/PayTR önizleme/toptan form testleri bozulmaz

## Coder Notu

### Uygulanan bölüm

- `HeroLightScene`: doğal kaydırmaya bağlı 180svh sahne ve 100svh sticky görünüm. Onaylı `ScrollFrameSequence`/SSR poster korundu; kare oynatıcısına dış sahnenin sabit scroll hedefi veriliyor. Poster `fetchpriority=high`; kareler boşta/etkileşimde, ilk yükleme 10 kare. Mobil dikey kırpım ve kısa ekran/data-saver/düşük donanım poster geri dönüşleri korunuyor.
- `useScroll` + `useTransform`: %35–85 düz toprak→krem renk ve brightness 0.55→1; %40–52 ikinci satırın 24px aşağıdan gelişi; %65–100 görüntünün yukarı çekilmesi/küçülmesi. Gradyan ve Lenis yok. Sol altta resmi başlık, resmi alt slogan ve sağ altta altın “Ürünleri keşfet” → `#urunler` var. Mobil başlık 13vw.
- Başlığın mürekkebi büyük metin AA eşiğinde (%56,5), destek metni ve opak okuma zemini birlikte %65'te değişiyor. Zıt metin/zemin renklerini aynı anda yumuşatarak kontrast kaybı oluşturulmadı. Üst çubuk aynı açık bölüm sınırına bağlandı; üstteki düz koyu okuma katmanı fotoğraf üzerindeki navigasyonu koruyor. Kısa yatay ekranda CTA taşması giderildi.
- Reduced-motion: CSS ile ilk boyamadan itibaren krem zemin, iki başlık satırı ve statik poster; transform ve kare istekleri yok. JavaScript kapalı, manifest/kare/canvas hataları, canlı tercih değişimi ve geri kaydırma doğrulandı. Ürün/boy/SKU/stok/sepet sözleşmesi korundu; bu geçici satın alma yüzeyinin yerine 102'nin vitrini uygulanmadı.
- Masaüstü AVIF, aynı onaylı kaynaktan tekrar kodlandı: **49.543 B**; mobil AVIF **26.829 B**, mobil WebP **59.528 B**. Kaynak/çıktı hash ve deterministik türetme kontrolü korundu; AVIF 60 KB bütçesi masaüstüne de uygulandı.
- 21st MCP'den [Smooth Scroll Hero / ishamsu, 2061](https://21st.dev/@ishamsu/components/smooth-scroll-hero) arandı ve kodu alındı; sabit hedef/sticky görsel yaklaşımı `motion/react`, AFİNA tokenları ve mevcut poster/kare yükleyicisine uyarlandı. Yeni shadcn bileşeni eklenmedi.
- Kullanılan skill'ler: görevdeki altı ECC skill'i; motion-foundations, tdd-workflow, motion-framer, profesyonel-web-sitesi, ui-ux-pro-max ve debug-optimize-lcp. Yerelde bulundu; ek skill kurulmadı.

### Komutla doğrulama

Kanıtlar `test-results/101/` altında, repo'nun mevcut gitignore kuralı gereği yereldir.

| Kontrol | Sonuç / kanıt |
|---|---|
| TDD RED → GREEN | Yeni scroll kabul testi mevcut sahnede eksik `[data-hero-scene]` nedeniyle RED, uygulamadan sonra aynı test GREEN. `red.log`, `green.log`; checkpoint'ler `60f8fa7` → `fc317d1`, mevcut main geçmişinde. |
| `npm test -- --coverage` | **18 dosya, 252/252 PASS**. Statement %87,50 / branch %95,83 / function %92,85 / line %91,83; `unit.log`. |
| `npm run lint` | **PASS, 0 uyarı**; `eslint.log`. |
| `npm run typecheck` | **PASS**; `typecheck.log`. |
| `npm run build` | **PASS**, onaylı varlık kontrolü **18/18 PASS**; `build.log`. |
| `node ~/.claude/skills/design-taste-frontend/scripts/lint.mjs app components` | **0 FAIL / 2 WARN**; korunan demo `h-screen` ve genel metinlerde uzun tire. `taste-lint.log`. |
| Production `next start -H 127.0.0.1 -p 3104` + `inspect.mjs` | **Hero kapsamı 0 FAIL**; global rapor 4 FAIL / 4 WARN. `inspect/report.json`, `inspect-scope.json`, `inspect.log`. |
| İlgili e2e + korunan akışlar | **298 PASS / 6 bilinçli SKIP / 0 FAIL / 0 flaky**; `e2e-verified.log`. SKIP'ler iki Pixel 7 çekim testinin yalnız Chromium-1440 projesinde birer kez çalıştırılması içindir. |
| Mobil Lighthouse, üç aynı standart simulated-throttling koşusu | LCP **3,303 / 3,304 / 3,678 s**, medyan **3,304 s: FAIL**. Performans medyanı **91**, A11y **100**, CLS **0,000164: PASS**. `lighthouse-{1,2,3}.json`, `lighthouse-summary.json`. |
| `git diff --check` + eklenen kodda sır/debug taraması | **PASS**; env, anahtar, şifre veya yeni debug çıktısı yok. |

Son e2e komutu (fixture'ları korumak için `PLAYWRIGHT_BASE_URL` tanımlanmadı):

```sh
PLAYWRIGHT_PORT=3107 FRAME_SEQUENCE_DEV_URL=http://localhost:3004 npm run test:e2e -- \
  tests/e2e/hero-light.spec.ts tests/e2e/hero.spec.ts tests/e2e/hero-motion.spec.ts \
  tests/e2e/hero-zeytinlik.spec.ts tests/e2e/hero-performance.spec.ts \
  tests/e2e/foundation.spec.ts tests/e2e/cart-wire.spec.ts tests/e2e/cart-drawer.spec.ts \
  tests/e2e/cart-page.spec.ts tests/e2e/upsell.spec.ts tests/e2e/payment-preview.spec.ts \
  tests/e2e/wholesale-form.spec.ts tests/e2e/fonts.spec.ts \
  --project=chromium-1440 --project=chromium-768 --project=chromium-390 \
  --project=webkit-iphone14 --output=test-results/101/verified
node ~/.claude/skills/design-taste-frontend/scripts/inspect.mjs \
  http://127.0.0.1:3104 --out test-results/101/inspect
```

Lighthouse CLI **13.5.0**, yereldeki Chromium 1248 ile `--chrome-flags='--headless --no-sandbox' --only-categories=performance,accessibility --output=json` kullanılarak 3104'te üç kez çalıştırıldı. Mobil form factor, simulated throttling, ekran/ağ/CPU ayarlarının üç raporda aynı olduğu özetleyicide kontrol edildi. Ölçüm sırasında e2e/build çalıştırılmadı. PayTR önizleme dev yolu aynı checkout'un 3004 sunucusunda; ödeme ve gönderim senaryoları fixture ile doğrulandı.

### Ekran ve tasarım kanıtı

1440/768/390 + iPhone 14 gerçek WebKit + Pixel 7 Chromium cihaz emülasyonu çekimleri: `chromium-{1440,768,390}-{0.2,0.6,0.95}.png`, `webkit-iphone14-{0.2,0.6,0.95}.png`, `Pixel-7-{0.2,0.6,0.95}.png`, dört profilin `*-reduce.png` dosyaları. Ekran görüntüleri açılarak incelendi; inspect fold/page JPG'leri de kaydedildi. WebKit'in ara renk çıktısı Chromium'dan birkaç kanal değeri farklı; test beklentisi gerçek tarayıcı ölçümüyle ayrı tutuluyor. Aynı AA sınırları iki motorda da geçiyor.

| Kontrol | Ekran / seçici / ölçüm | Sonuç |
|---|---|---|
| Ana / nötr / vurgu | `*-0.2.png`, `*-0.95.png`; hero/CTA | Toprak, krem/zeytin, altın; proje tokenları. |
| Başlık / gövde fontu | `#hero-title`, `.support`; fonts e2e | Korunan Fraunces 500/700 + Figtree 400/600/800. |
| Boşluk ölçeği | `visual-metrics.json`; copy/support | 24px üst, 16px destek üstü, 48px alt, 32px gap; mevcut akışkan yan marj. |
| Başlık hiyerarşisi | 1440/768/390 başlık | 144 / 76,8 / 50,7px, en fazla iki satır; taşma yok. |
| Asimetri | Masaüstü ve mobil ekranlar | Sol başlık, sağ CTA; fotoğraf dikeyde sağdan kırpılır. |
| Hover / focus / active | CTA, ürün segmenti, boy segmenti | Üç kontrol de tarayıcıda ölçüldü; marka renkleri, 2px focus halkası, 48/44/44px hedefler. `visual-metrics.json`. |
| Gölge / kenarlık | Hero ve segmentler | Durağan gölge/etiket çerçevesi yok; focus zeytin/toprak. |
| İkon ailesi | Korunan üst çubuk | Lucide; yeni ikon ailesi yok. |
| Kontrast | Dört profilde 10 ara scroll noktası | Normal destek metni minimum **10,89:1**, CTA **9,66:1**; büyük display minimum **3,04:1** (büyük metin AA ≥3). `contrast-summary.json` ve fotoğraf üzerinden pixel örnekleyen hero e2e. |
| Yasak görsel dil | Tasteskill lint + açılan ekranlar | Gradyan, emoji, glass/blur yığını, stok 3D veya iki CTA şablonu yok. |

### Kalan kabul engeli: LCP

**“Lighthouse mobil bu bölümle LCP < 2.5 s (3 ölçüm medyanı)” karşılanmadı.** Son teslim kodunda medyan 3,304 s. Bu, Task 101'in kendi kabul kriteridir; ara görevlerin global hata istisnasıyla geçilmiş sayılmadı ve durum **BEKLİYOR** bırakıldı.

Lighthouse/DevTools kaydı LCP öğesini `#hero-title > span` (“Kökü toprakta.”) olarak gösteriyor. Standart Lighthouse tahmininin kritik yoluna sayfa genelindeki normal Fraunces (97.653 B transfer), Figtree ve mevcut JavaScript yükleri de giriyor. Yerel, yavaşlatmasız 52–76ms gözlemi mobil Lighthouse sonucu yerine kullanılmadı. `app/layout.tsx` font düzeni ve diğer bölümlerin yükleme mimarisi değiştirilmedi; kapsamı genişletecek karar Claude planına bırakıldı.

Aynı fontun yalnız hero harflerini içeren 12.848 B alt kümesini erken yükleme denemesi yapıldı; eksik preload RED testi `3379f83`, GREEN denemesi `5bdb254`. Medyan LCP yaklaşık **3,829 s** oldu; performansı iyileştirmediği için ek font, alt küme betiği, font testi ve mock'ları tamamen geri alındı. Mevcut font dosyaları/eksenleri korundu. Önceki ölçümler `lighthouse-before/`, deneme `lighthouse-font-trial/` içinde; son kök raporları teslim koduna aittir. Checkpoint geçmişi yeniden yazılmadı.

### Kapsam dışındaki global bulgular

AGENTS.md'nin yeniden kurgu ara görev kuralı uyarınca ayrıca kaydedildi:

- `headline-lines`: henüz v2'ye uyarlanmayan tesis hikâyesi 1440/768/390'da üç satır (3 FAIL; 104).
- `few-pictures`: sayfa genelinde tek ayrı onaylı raster görsel var (1 FAIL; sonraki onaylı görsel/bölüm işleri ve 107). Onaysız görsel eklenmedi.
- WARN: onaylı krem palet, video öğesi yerine kare dizisi, sonraki süreç bölümünün yatay şeridi; hero'da geometrik olarak fotoğraf üzerinde görünen sticky başlık. Başlığın gerçek opak okuma zemini ve kontrastı ayrıca ölçüldü.
- `inspect-scope.json` orijinal raporu koruyarak yalnız bu açıkça adlandırılmış dış kapsam FAIL'leri ayırır. Hero inspect FAIL'i sıfır; LCP engeli açık kalır.

## Durum: BEKLİYOR
