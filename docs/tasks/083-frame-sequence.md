# Task 083: Scroll'a bağlı kare dizisi oynatıcısı (canvas)

## Tür
frontend

## Amaç
Bir videodan çıkarılmış WebP kare dizisini scroll pozisyonuna göre `<canvas>`'a çizen, yeniden kullanılabilir `ScrollFrameSequence` bileşeni (Apple tarzı scroll-scrub).

## Bağlam
Kullanıcı (20 Eki): "framlerine ayırıp scrolling ile gelsin", "videolama yapabilirsin, atlas gerekiyorsa". Kullanımlar: KURUMSAL marka sahnelerinde onaylı görselden üretilen 5 sn videolar (037) ve ZEYTİN hero/ürün (084). Kullanıcının kurumsal videosu KULLANILMAZ (20 Eki: "video kullanmana gerek yok metni yeter"); yalnız metni Hikâyemiz manifestosunda. Bağımlı: 025 (hero).

## Kullanılacak araçlar
- ECC skill: motion-advanced, motion-patterns, frontend-patterns, accessibility, tdd-workflow
- 21st MCP: hayır (özel canvas bileşeni)
- Skill rehberi: `~/.claude/skills/cinematic-hero-video/references/scroll-scrub.md` (canvas alternatifi)

## Dokunulacak dosyalar
- `components/media/ScrollFrameSequence.tsx`, `lib/media/frames.ts`, `scripts/extract-frames.mjs`, testler

## Adımlar
1. `scripts/extract-frames.mjs <video> <çıkış-klasörü> --fps 24 --widths 1920,960 --quality 72`: ffmpeg ile `frame-0001.webp…` + `manifest.json` ({count, fps, widths, aspect, poster}). Poster = ilk kare (ayrıca `poster.webp`).
2. Bileşen props: `src` (manifest yolu), `scrollLength` (vh, varsayılan 300), `fit` ('cover'|'contain'), `children` (üstteki metin katmanı), `blurFill` (contain modunda kenarları bulanık aynı kareyle doldur; opsiyonel).
3. Davranış: sticky 100vh sahne; Framer Motion `useScroll({target})` → `useTransform` → kare indeksi; çizim `requestAnimationFrame`; DPR'ye göre canvas boyutu; ekran genişliğine göre 960/1920 seti; önce poster + ilk ~15 kare, kalanı `IntersectionObserver` yaklaşınca kademeli ön yükleme (eşzamanlı ≤6 istek); yüklenmemiş kare için en yakın yüklü kare.
4. `prefers-reduced-motion: reduce` → yalnız poster (statik), scrub yok. Mobilde (<768px) 960 seti, `scrollLength` %70.
5. Metin katmanı scroll ilerlemesine bağlanabilsin (`progress` MotionValue children'a render-prop ile).
6. Testler: kare indeksi hesabı (birim), reduced-motion poster (e2e), yükleme sırası (birim, mock Image).

## Kabul kriterleri
- [ ] `npm run test -- tests/unit/frame-sequence.test.ts` başarılı
- [ ] `npm run test:e2e -- tests/e2e/frame-sequence.spec.ts` başarılı (demo sayfası `/__demo/frames` yalnız dev'de; prod build'de 404)
- [ ] `npm run lint && npm run typecheck && npm run build` başarılı
- [ ] Lighthouse/Playwright: kareler lazy, ilk yüklemede ≤ 20 kare isteği

## Yapılmaması gerekenler
- `<video currentTime>` scrub kullanma (titrer); kare dizisi + canvas.
- Kareleri repoya 50 MB üstü koyma; her dizi ≤ 12 MB (1920 set) hedefi.

## Coder Notu

### Uygulama ve TDD — 20 Ekim 2026

- Başlangıç: `main`, temiz çalışma ağacı; 025 tamamlanmış. PLAN/AGENTS, task ve yerel Next.js 16.4.2 sayfa, Server/Client Component, private-folder ve `notFound` kılavuzları okundu. `motion-advanced`, `motion-patterns`, `motion-foundations`, `frontend-patterns`, `accessibility`, `tdd-workflow` ve belirtilen scroll-scrub rehberi kullanıldı. Task'ın özel canvas istisnasıyla 21st kullanılmadı; ek skill/bağımlılık kurulmadı.
- RED: `npm run test -- tests/unit/frame-sequence.test.ts` → **exit 1**, henüz bulunmayan `@/lib/media/frames` import'u. Eksik modül compile-time RED checkpoint'i: **`1003a1a`**, mevcut `main` üzerinde. GREEN: aynı komut **30/30**; kapsam genişletilen tüm birim testleri **167/167**.
- `ScrollFrameSequence`: manifest fetch/validation, sticky 100vh canvas, `useScroll({ target })` → `useTransform` kare indeksi, olay başına tek `requestAnimationFrame`, DPR/ResizeObserver, cover/contain ve aynı kareden blur fill. Render-prop `children(progress)` metin katmanını MotionValue'ya bağlar. Poster yüklenmeden kare kuyruğu başlamaz; başlangıç **15 kare + 1 poster**, kare kuyruğu en fazla **6 eşzamanlı istek**. IntersectionObserver yakınlık kapısı ve scroll ilerlemesi, hedef kareye öncelik veren 15 karelik ileri / 3 karelik geri tamponu kademeli yükler; tüm dizi başlangıçta indirilmez. Eksik karede en yakın yüklenen kare çizilir. Unmount/kaynak/çözünürlük değişiminde istekler, observer/listener ve RAF temizlenir; gizli sekmede çizim durur.
- `<768px`: 960 seti, 300vh varsayılanın %70'i (**210vh**); masaüstünde viewport'a göre 960/1920. Reduced-motion ilk yüklemede ve tercih değişiminde statik **yalnız poster**, scrub aboneliği/canvas yok, progress=0; metin/CTA erişilir. Manifest/poster hatası erişilebilir durum mesajı gösterir, metin ve bağlantı korunur.
- `extract-frames.mjs`: istenen CLI argümanları, ffprobe ile görüntü oranı (SAR/rotasyon dahil), 1 tabanlı numaralı WebP setleri, ilk kareyle aynı `poster.webp` ve `{count,fps,widths,aspect,poster}` manifest'i. Geçici dizinde üretip başarıda taşır; mevcut çıktı dizininin üzerine yazmaz. 1920 seti >12 MiB veya tüm dizi >50 MiB ise başarısız olur. Yerel ffmpeg'de `libwebp` kodlayıcısı yoktur; script bu durumu algılar, **ffmpeg PNG çıkarımı + mevcut sharp WebP kodlaması** kullanır. WebP destekli ffmpeg'de doğrudan libwebp kullanılır. Yerel fallback gerçek ffmpeg ve WebP metadata/poster eşitliğiyle test edildi; native libwebp kolu bu makinede çalıştırılamadı.
- Demo: `app/%5F%5Fdemo/frames/` → `/__demo/frames`; Next.js'te `_` özel klasör olduğu için belgelenen `%5F` kaçışı kullanıldı. Yalnız `NODE_ENV=development` render eder; production build'de **404**, noindex. `public/media/frame-demo/` yalnız ffmpeg sentetik test desenidir: **48 kare × 2 set**, 1920 seti **1.159.106 bayt**, 960 seti **533.792 bayt**, poster dahil yaklaşık **1,64 MiB**. Marka görseli/onayı değildir; ana sayfaya bağlanmadı. Kaynak üretimi: `ffmpeg -v error -f lavfi -i 'testsrc2=size=320x180:rate=24:duration=2' -c:v libx264 .cache/task-083/demo.mp4`; çıkarım: `node scripts/extract-frames.mjs .cache/task-083/demo.mp4 public/media/frame-demo --fps 24 --widths 1920,960 --quality 72` (çıktı mevcutsa yeni bir dizin seçilir).

### Kabul kanıtları

| Komut / kontrol | Sonuç ve garanti |
| --- | --- |
| `npm run test -- tests/unit/frame-sequence.test.ts` | **exit 0; 30/30**: kare sınırları/indeks, manifest, çözünürlük, mock Image ile ilk 15/kuyruk sırası/≤6 istek/öncelik/fallback/cleanup; bileşen yakınlık kapısı, reduced-motion, tercih değişimi, blur, resize, sekme görünürlüğü, hata ve stale fetch iptali. |
| `npm run test -- tests/unit/frame-extraction.test.ts` (kapsam koşumunda ve tüm testlerde) | **exit 0; 3/3**: gerçek ffmpeg → 1920/960 WebP setleri, count/fps/ölçüler ve poster ilk kare eşitliği; geçersiz argümanlar ve mevcut dizinin korunması. |
| `npm run test` | **exit 0; 167/167**, mevcut birim testleri dahil. |
| `npm run test -- tests/unit/frame-sequence.test.ts tests/unit/frame-extraction.test.ts --coverage --coverage.include=lib/media/frames.ts --coverage.include=components/media/ScrollFrameSequence.tsx` | **exit 0; 33/33**. İki runtime dosyası: statement **%97,36**, branch **%92,18**, function **%97,87**, line **%100**. Bu oran CLI script'ini kapsamaz; CLI yukarıdaki gerçek araç testiyle doğrulandı. |
| `PLAYWRIGHT_BASE_URL=http://localhost:3183 FRAME_SEQUENCE_DEV_URL=http://localhost:3004 PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/ms-playwright" npm run test:e2e -- tests/e2e/frame-sequence.spec.ts --output=.cache/task-083/verified-results` | **exit 0; 72/72; 37,7 sn**, Chromium/Firefox/WebKit × **320/390/768/1440**, **0 skipped / 0 unexpected**. Başlangıçta tam **15 kare** (idle sonrası da ≤20), doğru çözünürlük, ileri/geri scrub ve değişen canvas pikseli, 0–100% metin progress, 210/300vh, reduced-motion yalnız **1 poster isteği**, klavye CTA, eksik kare fallback, tercih değişimi, manifest hatası, contain/blur, DPR=2 ve resize doğrulandı. |
| `npm run lint && npm run typecheck && npm run build` | **exit 0**; production build ve prebuild varlık denetimi **14/14**. |
| Son build `npm exec next start -- -p 3183` + Node HTTP assertion | **PASS**: `/__demo/frames` → **404**. E2E'nin production 404 testi de 12 projede geçti. |
| Node manifest/dosya boyutu ve Playwright JSON assertion'ları; `git diff --check` | **exit 0**: 48'er kare, her set <12 MiB, toplam <50 MiB; 72 başarılı E2E, atlanan/başarısız yok; whitespace hatası yok. |

Test düzeni: `PLAYWRIGHT_BASE_URL` production `next start` hedefine, **`FRAME_SEQUENCE_DEV_URL` aynı checkout'un `next dev` hedefine** verilmelidir; geliştirme demo testleri bu değişken olmadan açıklayıcı hata verir, sessizce atlanmaz. 3004'teki mevcut dev sürecinin cwd'si bu repo olarak doğrulandı ve süreç korundu; 3183'te ayrı production süreç açıldı. 3083'te ikinci dev başlatma Next.js tek-dev kilidiyle durdu; testler mevcut 3004'e yöneltildi. İlk sandbox tarayıcı denemesi macOS `MachPortRendezvousServer: Permission denied` nedeniyle çalışmadı; süreç izniyle gerçek tarayıcı testleri tamamlandı. İlk gerçek koşumdaki poster/canvas aynı-key sorunu ayrık key'lerle düzeltildi; WebKit klavye senaryosu önceki checkbox'tan `Alt+Tab` ile ilerleyecek şekilde düzeltildi. Nihai matris tümüyle GREEN'dir.

Ekran/trace sonuçları `.cache/task-083/verified-results/` altında yereldir; Chromium 1440 normal ve WebKit 390 reduced-motion ekranları açılıp incelendi. `next-env.d.ts` otomatik build değişikliği başlangıç içeriğine döndürüldü. Task kapsamında kalan kabul engeli yoktur. Gerçek/onaylı hero videosu ve landing entegrasyonu 084'e aittir; `_legacy`, görsel onay kayıtları, özgün promptlar, diğer task'lar ve PLAN değiştirilmedi.

## Durum: TAMAMLANDI
