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

## Durum: BEKLİYOR
