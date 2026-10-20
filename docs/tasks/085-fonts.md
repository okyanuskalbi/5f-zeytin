# Task 085: Marka fontları — Z-A Ege Zanaat

## Tür
frontend

## Amaç
Geçici sistem fontlarını kullanıcının seçtiği eşleşmeyle değiştir: başlık/ürün adı **Fraunces** (opsz eksenli, 400 italic + 600, `SOFT` 50), metin ve fiyat **Figtree** (400/600).

## Bağlam
Kullanıcı 20 Eki 2026'da yazı karakteri sunumundan (https://claude.ai/artifact/6WaKhjSqh6k67kJde8ZTQw) **Z-A**'yı seçti.

## Kullanılacak araçlar
- ECC skill: design-system, nextjs-turbopack, accessibility
- 21st MCP: hayır

## Adımlar
1. `next/font/google`, `subsets: ['latin','latin-ext']`, `display: 'swap'`, Fraunces `axes: ['opsz','SOFT']`; değişkenler `--font-display` (Fraunces) ve `--font-body` (Figtree); geçici Georgia/Helvetica yığınlarını yerine koy (fallback kalır).
2. Ölçek: hero başlık Fraunces 600 `font-variation-settings: "SOFT" 50`; alt slogan Fraunces 400 italic; ürün adı Fraunces 600; gövde/etiket/buton Figtree; fiyatlar Figtree `font-variant-numeric: tabular-nums`.
3. Self-host (next/font).

## Kabul kriterleri
- [ ] `grep -rn "Georgia\|Helvetica" app components lib` → yalnız fallback yığınında
- [ ] e2e: h1 Fraunces, fiyat Figtree + tabular-nums; "İŞĞÜÖÇ ışğüöç ₺1.250,00" glif eksiksiz
- [ ] lint/typecheck/build; mevcut testler geçer

## Coder Notu

- `docs/PLAN.md`, `AGENTS.md`, görevde belirtilen ECC `design-system`, `nextjs-turbopack`, `accessibility` skill'leri ve kurulu Next.js 16.4.2 font kılavuzları okundu. Görev gereği 21st MCP kullanılmadı; ek paket kurulmadı.
- `next/font/google` ile Fraunces normal/italic, değişken `opsz` + `SOFT` eksenleri ve Figtree 400/600 bağlandı. Her iki aile `latin` + `latin-ext`, `display: swap` ve korunan fallback yığınlarını kullanıyor. Font değişkenleri kök `html` üzerinde; dosyalar aynı origin'in `/_next/static/media/` yolundan sunuluyor.
- Başlıklar, ana slogan ve ürün adları Fraunces 600 / `SOFT 50`; alt slogan Fraunces 400 italic. Gövde Figtree 400; etiket/buton/fiyat vurgularında mevcut `font-medium` token'ı seçilen 600 ağırlığına bağlandı. Fiyatlarda mevcut `tabular-nums` korundu; 0–9 rakamlarının gerçek genişlik eşitliği tarayıcıda doğrulandı.
- RED: uygulama değişikliğinden önce Chromium-320'de yeni tipografi testi gerçekten çalıştı ve h1 için beklenen Fraunces yerine Georgia bulduğu için başarısız oldu. İlk macOS tarayıcı başlatma kısıtı süreç izniyle giderildi; ortam hatası RED sayılmadı.
- Başlangıçta mevcut hero testi de Task 030 öncesinin boş katalog beklentisiyle başarısızdı. Yalnız bu eski beklenti mevcut üç kart ve erişilebilir ürün hedefiyle güncellendi. Bootstrap birim testine `next/font` derleme sınırı için mock eklendi; Türkçe `lang` kontrolü HTML sınıflarından bağımsızlaştırıldı.
- Glif kanıtı: Fraunces normal/italic ve Figtree 400/600 için `İŞĞÜÖÇ ışğüöç ₺1.250,00` sınandı. Figtree dosyasında **₺ glifi yoktur**; yalnız bu işaret korunan Helvetica Neue fallback'inden eksiksiz çiziliyor. Türkçe harfler ve rakamlar Figtree'den, Fraunces örneğinin tamamı Fraunces'ten çiziliyor. Chromium CDP gerçek çizim fontlarını, WOFF2 ikili incelemesi `opsz`/`SOFT`, Türkçe kapsamı ve Figtree `tnum` özelliğini doğruladı. Font dosyası hatasında içerik/CTA erişimi ve reduced-motion da test edildi.

| Kabul komutu | Sonuç |
| --- | --- |
| `grep -rn "Georgia\|Helvetica" app components lib` | **exit 0**; yalnız layout `fallback` seçenekleri ve CSS fallback token'ları: 4 satır. |
| `npm run lint` | **exit 0**; uyarı yok. |
| `npm run typecheck` | **exit 0**. |
| `npm run test` | **exit 0; 126/126**. |
| `npm run build` | **exit 0**; Next.js Turbopack production build ve 14 onaylı varlığın kontrolü başarılı. |
| `PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/ms-playwright" npm run test:e2e -- --config .cache/task-085/playwright.config.ts --output .cache/task-085/final-results` | **exit 0; 600/600, 3,5 dk**. Chromium/Firefox/WebKit × 320/390/768/1440; 36 yeni font senaryosu ve 564 mevcut senaryo başarılı. |

Kabul için mevcut 3004 süreci korundu; aynı checkout'un production çıktısı 3085 portunda çalıştırıldı. Geçici config, RED/ekran/trace/CDP raporları ve `font-binary-audit.json`, commit dışı `.cache/task-085/` altında. Masaüstü 1440 ve mobil 320 ekranları açılıp incelendi; taşma/kesilme görülmedi.

Task kapsamında açık engel yoktur. Build'in otomatik değiştirdiği `next-env.d.ts` başlangıç içeriğine döndürüldü. PLAN, diğer task'lar, `_legacy/`, görsel promptları ve backend/DB/ödeme/auth/yayın ayarları değiştirilmedi.

## Durum: TAMAMLANDI
