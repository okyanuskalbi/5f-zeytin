# Task 134: Google için robots.txt, sitemap.xml ve canonical

## Tür
frontend

## Amaç
Kullanıcı (22 Eki): "Google için SEO: sitemap, robots aktif et."
Canlıda `https://afinazeytin.com/robots.txt` ve `/sitemap.xml` 404. Ana sayfada canonical yok. Kişisel/işlem sayfaları (`/sepet`, `/odeme`, `/odeme-onizleme`, `/hesabim`, `/giris`, `/kvkk`, `/mesafeli-satis`, `/iade`, `/__demo`) zaten `noindex`.

## Kullanılacak araçlar
- `vercel:nextjs` (App Router metadata route'ları), `claude-seo:seo-technical` yaklaşımı, `tdd-workflow`.

## İstenen
1. **`app/robots.ts`** (Next metadata route):
   - `User-Agent: *`, `Allow: /`.
   - `Disallow`: `/api/`, `/sepet`, `/odeme`, `/odeme-onizleme`, `/hesabim`, `/giris`, `/siparis-takip`, `/__demo`, `/%5F%5Fdemo`.
   - `Sitemap: https://afinazeytin.com/sitemap.xml`, `Host` yok.
   - Yapay zeka eğitim botları için ayrı kural **eklenmez** (karar kullanıcıda; varsayılan genel kural).
2. **`app/sitemap.ts`:** yalnız dizinlenebilir sayfalar. Şu an: `https://afinazeytin.com/` (`changeFrequency: "weekly"`, `priority: 1`, `lastModified` build zamanı). `noindex` sayfalar ve `?urun=` adresleri **eklenmez**.
3. **Canonical:** ana sayfa metadata'sına `alternates: { canonical: "/" }` (`metadataBase` mevcut). `?urun=` ile açılan ürün penceresi adresleri de ana sayfaya canonical verir (aynı sayfa). `noindex` sayfalarda canonical eklemek zorunlu değil.
4. **www yönlendirmesi:** `www.afinazeytin.com` → `afinazeytin.com` 308 yönlendirmesi Vercel tarafında zaten varsa dokunma. Yoksa Coder Notu'na yaz (Claude ayarlar).
5. Mevcut `BusinessJsonLd` ve `FAQPage` şeması aynen kalır.

## Kabul kriterleri
- [ ] Unit: `robots()` çıktısı yukarıdaki allow/disallow ve sitemap satırını içerir.
- [ ] Unit: `sitemap()` yalnız `/` döndürür; noindex sayfa yok.
- [ ] Unit: ana sayfa metadata'sında canonical `/`.
- [ ] Build çıktısında `/robots.txt` ve `/sitemap.xml` statik route olarak var.
- [ ] `npm test`, lint, typecheck, build yeşil.
- [ ] Canlı doğrulama Claude'da (`curl` 200, içerik, canonical etiketi).

## Yapılmaması gerekenler
- Noindex sayfaları dizine açma; ürün başına yeni sayfa açma.
- `docs/` değiştirme (yalnız Coder Notu/Durum).

## Coder Notu
- `app/robots.ts` istenen tek genel bot kuralını, dokuz dışlama yolunu ve sitemap adresini döndürüyor; Host veya ayrı eğitim botu kuralı eklenmedi.
- `app/sitemap.ts` yalnız `https://afinazeytin.com/` adresini weekly/1 ve statik üretim zamanı ile içeriyor. Ana sayfaya sabit `alternates.canonical: "/"` eklendi; `?urun=` adresleri de aynı metadata'yı kullanıyor.
- TDD RED: `npm test -- tests/unit/seo-routes.test.ts tests/unit/home-metadata.test.ts` eksik route import'u ve eksik canonical nedeniyle başarısız oldu. Uygulama sonrası aynı komut GREEN: 2 dosya, 3 test geçti. Ara/RED commit oluşturulmadı.
- `npm test -- --maxWorkers=2 --coverage --coverage.include=app/robots.ts --coverage.include=app/sitemap.ts`: 43 dosya, 466 test geçti. Coverage yalnız iki yeni metadata route'u için ölçüldü: %100.
- `npm run lint`, `npm run typecheck`, `npm run build` ve build öncesi görsel kontrolleri başarılı. Build listesinde `○ /robots.txt` ve `○ /sitemap.xml` statik route olarak var.
- Tarayıcı açmadan `node --input-type=module` ile `.next/prerender-manifest.json`, üretilen robots/sitemap gövdeleri ve ana sayfa HTML'i assert edilerek doğrulandı. Sitemap tek ana sayfayı içeriyor; robots yönergeleri birebir eşleşiyor. Next.js canonical etiketi `https://afinazeytin.com` olarak üretiyor (kök URL).
- `BusinessJsonLd`, `FAQPage`, mevcut noindex sayfaları ve kök layout değişmedi; `git diff --exit-code` ile kontrol edildi.
- 22 Ekim `curl --head https://www.afinazeytin.com/` sonucu: Vercel'den HTTP 200, Location yok. Mevcut www → kök alan adı 308 yönlendirmesi yok; görevdeki sorumluluk ayrımına göre Claude Vercel'de ayarlayacak, uygulamaya yönlendirme eklenmedi.
- Task'taki `vercel:nextjs` ve `claude-seo:seo-technical` skill dosyaları kurulu bulunamadı. `tdd-workflow` kullanıldı; metadata uygulaması kurulu Next.js 16.4.2'nin `node_modules/next/dist/docs/` altındaki robots, sitemap ve generate-metadata kılavuzları ile resmi Next.js dokümantasyonuna göre yapıldı.
- Canlı `/robots.txt`, `/sitemap.xml`, ana sayfa ve `?urun=` canonical kabulünü Claude doğrulayacak. Playwright, Lighthouse, inspect ve tarayıcı testleri çalıştırılmadı.

## Durum: TAMAMLANDI
