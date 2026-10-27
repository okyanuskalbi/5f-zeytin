# afinazeytin.com: SEO + AEO + güvenlik denetimi (28 Eki 2026)

Claude, canlı site üzerinde. Araçlar: Playwright tarama (9 sayfa), Lighthouse 12.8.2 (yerel; PSI kotası doluydu), curl, `ecc:security-reviewer` (repo, salt okunur).

## Puan: 67/100

| Alan | Puan | Not |
| --- | --- | --- |
| Teknik | 75 | robots/sitemap doğru; ana sayfa `no-store` → TTFB ~780 ms |
| İçerik | 55 | İndekslenen tek sayfa; ürünlerin kendi URL'si yok |
| Sayfa içi | 70 | Başlık kısa/genel; og:url/type/locale yok; tekrar eden H3 |
| Şema | 55 | LocalBusiness'ta adres yok; Product/WebSite yok |
| Performans | 80 | Mobil 82 (LCP 4,4 sn), masaüstü 99 |
| AEO / AI arama | 60 | llms.txt yok; FAQPage (3 soru) var |
| Görseller | 80 | Alt eksik yok; duyarlı görsel tasarrufu var |

Lighthouse: mobil Perf 82 · A11y 100 · BP 100 · SEO 100; masaüstü 99 · 100 · 100 · 100. CLS ≈ 0, TBT 0.

## Bulgular

### Yüksek
1. **Ürün sayfası yok.** 6 ürün yalnız ana sayfada; `/urun/...` rotası yok. "salamura siyah zeytin 10 kg", "Düziçi zeytinyağı" gibi aramalarda sıralanacak sayfa ve Product/Offer şeması (Google Alışveriş/merchant listeleri) yok. Çözüm: `app/urun/[slug]` + Product + Offer + BreadcrumbList; sitemap'e ekle. Gerçek fiyatlar onaylanınca Offer açılsın (fiyat kullanıcıda bekliyor).
2. **Ana sayfa her istekte dinamik render** (`cache-control: private, no-store`, `x-vercel-cache: MISS`), TTFB ~780 ms (kurumsal 250 ms). Lighthouse "document latency" 810 ms tasarruf diyor. Muhtemel sebep: layout/proxy'de çerez/oturum okuma. Çözüm: ana sayfayı statik/ISR yap; oturum/sepet bilgisini istemci tarafında ya da ayrı dinamik parçada al.
3. **LocalBusiness şemasında adres yok** (Google için geçersiz). Ekle: `address` (Ellek Beldesi, Düziçi, Osmaniye, TR), `geo`, `telephone`, `openingHours` (onaylı bilgiyle). Organization'a `sameAs` (afina.com.tr, sosyal hesaplar), `parentOrganization`/`brand` bağı.

### Orta
4. **Mobil LCP 4,4 sn:** LCP öğesi bir ürün görseli (`urun-01-kirma-10kg-w144.avif`); masaüstünde LCP görseli `loading=lazy` (`lcp-lazy-loaded`). İlk ekrandaki görsele `priority`/`fetchpriority=high`, lazy kaldır. Görsel teslim tasarrufu 224 KiB.
5. Başlık "Afina Zeytin | Zeytin ve Zeytinyağı" genel. Öneri: "Afina Zeytin | Düziçi'nden Zeytin ve Zeytinyağı" (≤60 karakter; "%100/organik/doğal" yok).
6. Ana sayfada `og:url`, `og:type`, `og:locale` yok (kurumsalda var).
7. `llms.txt` yok (kurumsalda var). Ürünler, tesis, toptan iletişim ve SSS'yi listeleyen bir llms.txt ekle.
8. Ürün kartlarında tekrar eden H3 ("Doğal Kırma Yeşil Zeytin" ×2, "Natürel Sızma Zeytinyağı" ×2): gramaj/hacim başlığa girsin, ör. "Doğal Kırma Yeşil Zeytin 10 kg".
9. `x-powered-by: Next.js` başlığı açık → `poweredByHeader: false`.
10. `favicon.ico` 404 (yalnız SVG) → `app/favicon.ico` + apple-touch-icon.

### Düşük
11. WebSite şeması yok. 12. bf-cache 2 engel (masaüstü). 13. `unused-javascript` 47 KiB. 14. Google Search Console doğrulaması yok (bekleyen müşteri onayı). 15. Yasal sayfalar noindex taslak, sitemap dışında: doğru; onay gelince index + sitemap.

## AEO (cevap motorları)
- İyi: SSR, ham HTML'de tüm metin; robots AI botlarına açık; FAQPage 3 soru (nerede, ne üretiyor, perakende var mı).
- Eksik: llms.txt; ürün başına cevaplanabilir sayfa (içerik, gramaj, saklama, kargo); SSS'de kargo süresi, ödeme yöntemleri, toptan minimum, teneke saklama gibi gerçek alıcı soruları (cevapları müşteri onayıyla).

## Güvenlik (repo, salt okunur)
Kritik/Yüksek yok. `npm audit --omit=dev`: 0. Git geçmişinde sır yok. Tüm tablolarda RLS + FORCE + açık GRANT; SECURITY DEFINER yok; admin yollarında `requireAdmin` + Origin/Sec-Fetch-Site CSRF; açık yönlendirme yok; XSS/SSRF yüzeyi yok. Prod'da `NEXT_PUBLIC_DEMO` tanımlı değil (Vercel env listesinde yok, Claude doğruladı).
- Orta (ödeme açılmadan önce şart): PayTR callback rotası, orders tablosu ve atomik stok düşümü yok. Task 047 yazılırken: HMAC doğrulama → yalnız "OK"; toplam sunucuda `price_kurus` ile; `stock >= n` koşullu UPDATE; `merchant_oid` UNIQUE; orders migration + sunucu-only GRANT + RLS.
- Orta: login/kayıt için uygulama düzeyi rate limit yok (Supabase limitine dayanıyor); toptan formu arka ucu yazılırken rate limit + honeypot/Turnstile zorunlu.
- Orta: `NEXT_PUBLIC_DEMO=1` prod'da demo modunu açabiliyor (`lib/auth/adapter.ts:19`, `lib/checkout/adapter.ts:27`) → prod'da bayrağı tamamen yok say.
- Düşük: CSP `unsafe-inline`; auth çerezi `httpOnly:false` (Supabase istemcisi için); Actions SHA ile sabitlenmemiş; `supabase/snippets/admin-bootstrap.sql` herkese açık repoda e-posta içeriyor → parametreye çevir.

## Öncelik
1. Ana sayfayı statik/ISR yap (TTFB) + LCP görsel önceliği
2. LocalBusiness adresi + og etiketleri + başlık + llms.txt + favicon + poweredByHeader (tek küçük görev)
3. `NEXT_PUBLIC_DEMO` prod'da yok sayılsın + admin-bootstrap e-postası parametre
4. Ürün sayfaları + Product şeması (fiyat onayından sonra Offer)
5. Ödeme/toptan form görevlerine güvenlik şartları
