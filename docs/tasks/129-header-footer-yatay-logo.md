# Task 129: Header ve footer'da yatay AFİNA ZEYTİN logosu

## Tür
frontend

## Amaç
Kullanıcı (22 Eki): "Zeytinde header ve footer'da logoyu güncelleyelim." Müşterinin gönderdiği yatay logo: `docs/referans/logolar/afina-zeytin-yatay.svg` (Varlık 2; PDF'ten vektör çevrildi, SHA `6a4962…`). Şu an header'da düz yazı ("AFİNA / ZEYTİN"), footer'da yuvarlak amblem var.

## Kullanılacak araçlar
- **Kullanıcı isteği (22 Eki), hepsini fiilen yükle:** `ui-ux-pro-max` (§5 Layout & Responsive dahil), `frontend-design`, `better-layout`, `motion-framer`, `shadcn-ui` (resmi CLI, token'lara uyarla), 21st MCP (ilgili bileşeni ara/uyarla, seçilen bileşenin adı/ID'si Coder Notu'na). `responsiveness-check` Claude'da. Coder Notu'na "Skill / nerede kullanıldı" tablosu ekle.
- `tdd-workflow`, `frontend-patterns`.

## İstenen
1. SVG ~2 MB → `svgo` (gerekirse yol birleştirme/hassasiyet düşürme) ile **≤ 60 KB**; görünüm bozulmamalı (önce/sonra PNG karşılaştır, Coder Notu'na yaz). Sığmazsa 2x/3x WebP + SVG yerine `<picture>` (≤ 25 KB/adet).
2. **Koyu zemin sürümü:** "AFİNA" siyah harfleri → süt `#F7F3EA`; altın amblem ve "ZEYTİN" altın tonları korunur. Site koyu (v4), header ve footer bu sürümü kullanır. Açık zemin sürümü de `public/brand/` altında kalsın (ileride krem yüzeyler için).
3. **Header:** yatay logo, yükseklik masaüstü 40px, telefon 32px; `alt="AFİNA ZEYTİN"`; ana sayfaya link. Nav düzeni bozulmaz, sepet/menü yerinde.
4. **Footer:** marka bloğundaki yuvarlak amblem yerine yatay logo (yükseklik 44–48px). Topluluk satırı (küçük topluluk logosu + "Bir AFİNA Şirketler Topluluğu markası") kalır.
5. Favicon/OG görselleri değişmez.
6. LCP etkisi yok: header logosu küçük ve öncelikli değil (`fetchpriority` yok), CLS 0 (width/height).

## Kabul kriterleri
- [ ] Unit: header ve footer'da yatay logo `img`/svg, alt metinli; header'da "AFİNA / ZEYTİN" düz yazısı yok.
- [ ] Logo dosya boyutu sınırı (komut).
- [ ] `npm test`, lint, typecheck, build yeşil; 118–128 testleri korunur.
- [ ] Tarayıcı doğrulaması Claude'da.

## Yapılmaması gerekenler
- Logoyu yeniden çizme/renk değiştirme (yalnız siyah→süt koyu sürüm).
- `docs/` değiştirme (yalnız Coder Notu/Durum).

## Coder Notu

### Uygulama ve kaynak

- Müşterinin yatay SVG'si korundu: SHA-256 `6a49624852733560d2e14fb562b19ab3738824020f187cd44b84fdd88769d04c`. Yeni çizim, kırpma veya altın renk değişikliği yapılmadı. Koyu sürümde yalnız AFİNA yazısının altı siyah path'i `#F7F3EA` oldu; amblemdeki yedinci küçük siyah detay korundu.
- SVGO 4.1.0, multipass ve precision 2 ile kaynak **2.012.633 → 696.062 bayt** oldu; 60 KB sınırını aşınca görevin izin verdiği **kayıpsız, şeffaf 2x/3x WebP + picture** seçeneği uygulandı. Sınırı aşan SVG runtime'a eklenmedi. Açık ve koyu sürümler `public/brand/` altında.
- `BrandLogo` ortak bileşeni header'daki düz yazının ve footer'daki yuvarlak amblemin yerini aldı. Header masaüstünde 150×40px, ≤900px'de 120×32px; footer bütün ekranlarda 180×48px. Her iki görsel `alt="AFİNA ZEYTİN"` ve ana sayfa bağlantısıyla sunulur. Topluluk logosu/satırı korunur.
- Küçük telefonda (≤359px) header sepetinin yatay padding'i 8px'e indirildi; footer marka alanı tek kolona geçer. Menü/sepet hedeflerinin en az 44px yüksekliği ve mevcut reduced-motion davranışı korunur. Gerçek ekran yerleşimini Claude doğrulayacak.
- `width="180" height="48"` ve bunlarla aynı oranlı CSS ölçüleri yükleme öncesi alan ayırır. Header'da `fetchpriority`/preload yok; footer lazy yüklenir. Gerçek CLS/LCP ölçümü yapılmadı, Claude doğrulayacak. Favicon, OG ve özgün referans dosyaları değişmedi.
- Build'in mevcut varlık kapısı için `verifyHorizontalLogoDerivatives` eklendi: kaynak SHA'sı, dört sabit çıktı SHA'sı, WebP/alpha/ölçü ve 25 KB bütçesi doğrulanır. CI'da dosyalar yeniden encode edilmez; macOS/Linux encoder farkı onaylı dosyaları değiştiremez. Kontrol başka logo yollarına izin açmaz, onay defterleri değiştirilmedi.
- Seçilen 21st kaynağı: **[Agency Footer — ShadcnSpace](https://21st.dev/@shadcnspace/components/footer-01), demo 21474 / component 10510**. Katalog aramaları yapıldı, mevcut footer'ın bu kaynağı `get_component(21474)` ile fiilen alınıp incelendi; ana sayfaya bağlı logo slotu mevcut v4 uyarlamasında güncellendi.

### Dosya bütçesi ve PNG karşılaştırması

| Dosya (`public/brand/`) | Ölçü | Bayt | Sınır |
|---|---|---|---|
| `afina-zeytin-yatay@2x.webp` | 360×96 | 10.878 | ≤25.000, geçti |
| `afina-zeytin-yatay@3x.webp` | 540×144 | 18.166 | ≤25.000, geçti |
| `afina-zeytin-yatay-dark@2x.webp` | 360×96 | 11.266 | ≤25.000, geçti |
| `afina-zeytin-yatay-dark@3x.webp` | 540×144 | 18.820 | ≤25.000, geçti |

- `node scripts/prepare-horizontal-logo.mjs` dosyaları üretir; `node scripts/prepare-horizontal-logo.mjs --check` mevcut dosyaları kaynak PNG'leriyle karşılaştırır. Her iki komut tarayıcı kullanmaz.
- Önce: orijinal SVG'nin ilgili açık/koyu dönüşümünün PNG render'ı. Sonra: runtime WebP'nin tekrar PNG'ye açılmış hali. Dört dosyada da **değişen görünür piksel = 0, maksimum görünür RGB farkı = 0, maksimum alpha farkı = 0**. Tam şeffaf piksellerin görünmeyen RGB verisi karşılaştırmaya dahil edilmez.
- Amblem ve ZEYTİN satırı açık/koyu sürümler arasında ayrıca doğrulandı: 2x'te 19.072, 3x'te 42.816 pikselin görünür rengi/alpha'sı aynı. F harfinin opak iç örneği açık sürümde `[0,0,0,255]`, koyuda `[247,243,234,255]`; unit testleriyle sabit.
- PNG çiftleri `.cache/task-129/afina-zeytin-yatay[-dark]@{2,3}x-{before,after}.png`, ölçüm raporu `.cache/task-129/logo-comparison.json`. Açık/koyu PNG'ler ayrıca görsel olarak incelendi. Cache çıktıları commit'e alınmadı; yukarıdaki komutla yeniden üretilebilir.

### Skill / nerede kullanıldı

| Skill / araç | Nerede kullanıldı |
|---|---|
| `ui-ux-pro-max` | SKILL.md ve quick-reference §5 Layout & Responsive okundu; `responsive navbar logo --domain ux` araması çalıştırıldı. 900px ve küçük telefon kuralları, taşma önlemleri ve ayrılmış görsel alanı. |
| `frontend-design` | Onaylı yatay marka ve v4 koyu yüzey korundu; yeni tasarım yönü veya varsayılan component görünümü eklenmedi. |
| `better-layout` | Logo oranı, sabit görsel alanı, header flex öğelerinin küçülmemesi ve en küçük telefonda footer marka grubunun yeniden akışı. |
| `motion-framer` | SKILL.md yüklendi; mevcut AnimatePresence/sepet sayacı ve reduced-motion yolu incelendi. Logo statik bırakıldı, yeni hareket eklenmedi. |
| `shadcn-ui` | SKILL.md yüklendi; resmi `npx shadcn@latest docs navigation-menu` komutu çalıştırıldı. Mevcut tokenlara uyarlanmış Button/menu yeterli olduğundan yeni primitive kurulmadı. |
| `frontend-patterns` | Header/footer'ın aynı statik `BrandLogo` bileşenini paylaşması; yeni state, effect veya görsel optimizasyon runtime'ı eklenmemesi. |
| `tdd-workflow` | Önce logo beklentileri RED, sonra GREEN; varlık kapısı entegrasyonu için ayrıca RED/GREEN. Sonuçlar aşağıda. |
| 21st MCP | Agency Footer 21474 / 10510 kaynak kodu alındı; mevcut logo slotu v4 ölçülerine uyarlandı. |
| `responsiveness-check` | Görev/AGENTS.md gereği Claude doğrulayacak. |

### Komutla doğrulama ve TDD kanıtı

| Komut / kontrol | Gerçek sonuç |
|---|---|
| `npm test -- tests/unit/horizontal-logo.test.tsx --maxWorkers=2` | Uygulama öncesi RED: 5 beklenen hata (düz yazı header, eski footer alt/src, picture ve dosyaların yokluğu). Yerel RED kaydı `a26ec83`; uzak geçmişe gönderilmeden nihai yeşil commit'te birleştirildi. Son hedef koşu GREEN: 7/7. |
| `npm test -- tests/unit/asset-registry.test.ts -t 'Task 129 horizontal logo derivatives' --maxWorkers=2` | Önce 1 beklenen RED (logo kayıtsız), entegrasyon sonrası GREEN. Kaynak veya çıktı değiştirilince reddedildiği doğrulandı. Filtre dışındaki testler nihai tam koşuda çalıştırıldı. |
| `npm test -- --maxWorkers=2` | **37 dosya, 407/407 geçti**, atlanan test yok. 118–128 regresyonları korunur. Footer 127'de yalnız bu görevle değişen logo alt/src/yükseklik beklentileri uyarlandı; donmuş 123 fixture'ı, metin/link ve diğer görsellerin karşılaştırması korundu. |
| `npm run lint` | Geçti, uyarı yok. |
| `npm run typecheck` | Geçti; yeni/güncellenen e2e dosyaları dahil. |
| `npm run build` | Geçti; 18 kayıtlı görsel + dört logo türevi ve 112 v3 çıktının kaynak/hash/onay kontrolleri başarılı; production derlemesi tamamlandı. |
| `node scripts/prepare-horizontal-logo.mjs --check` | Dört dosyanın PNG karşılaştırması, kaynak/çıktı SHA'ları, ölçü/alpha ve bütçe geçti. |
| `wc -c public/brand/afina-zeytin-yatay*.webp` | 10.878 / 18.166 / 11.266 / 18.820 bayt; her dosya ≤25 KB. |
| Derlenen `.next/server/app/index.html` dosyasını Node + JSDOM ile parse etme | Header/footer picture, alt, `/` bağlantısı, width/height; logo fetchpriority/preload yokluğu ve favicon/OG adreslerinin korunması geçti. Tarayıcı açılmadı. |
| `git diff --check` ve referans/favicon/OG değişmezlik kontrolü | Geçti. |

### Claude doğrulayacak

- `tests/e2e/horizontal-logo.spec.ts` yazıldı, **çalıştırılmadı**: 320–1920px, 900/901 kırılımı, header 32/40px, footer 48px, logo/nav/sepet/menü çakışmaması, yatay taşma, doğru kaynağın yüklenmesi ve topluluk satırı.
- `tests/e2e/footer-127.spec.ts` yalnız logo alt metni ve yeni 48px masaüstü yüksekliği için güncellendi, çalıştırılmadı. Önceki footer yoğunluk ve dokunma hedefi kriterleri duruyor.
- Gerçek tarayıcıda okunurluk, mobil menü/CTA erişimi, responsive kabul ve CLS/LCP ölçümü Claude'a ait. Playwright, Lighthouse, inspect, tarayıcı ekran görüntüsü çalıştırılmadı. Bunlar AGENTS.md gereği TAMAMLANDI'yı engellemez.

## Durum: TAMAMLANDI
