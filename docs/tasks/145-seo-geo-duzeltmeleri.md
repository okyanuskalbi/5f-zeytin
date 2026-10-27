> ONAY VERİLDİ (kullanıcı, 28 Eki 2026): "SEO/GEO uygulaması var olan skilllerle yap". Kaynak: [denetim](../denetim/2026-10-28-seo-aeo-guvenlik.md). Auth, ödeme ve DB şeması değişmez.

# Task 145: SEO/GEO düzeltmeleri (ISR, LCP, şema, meta, llms.txt, ikon)

## Tür
frontend (küçük bir sunucu önbellek ayarı dahil)

## Amaç
Canlı denetimde bulunan teknik SEO, hız ve AEO eksiklerini görsel tasarımı değiştirmeden kapatmak.

## Bağlam (Claude ölçümü, canlı afinazeytin.com, 28 Eki)
1. Ana sayfa her istekte dinamik render ediliyor: `app/page.tsx:14` `export const dynamic = "force-dynamic"`. Yanıt `cache-control: private, no-store`, `x-vercel-cache: MISS`, TTFB ~780 ms (kurumsal sitede 250 ms). Lighthouse "document latency" 810 ms tasarruf öneriyor. Veri `readProductFamilies()` (herkese açık ürün okuması).
2. LCP: mobil 4,4 sn, LCP öğesi bir ürün görseli (`urun-01-kirma-10kg-w144.avif`); masaüstünde LCP görseli `loading="lazy"` (Lighthouse `lcp-lazy-loaded`; `components/landing/SofraHero.tsx:31` `loading="lazy" fetchPriority="low"`).
3. `BusinessJsonLd` (`components/site/BusinessJsonLd.tsx`) tesis düğümünü `LocalBusiness` olarak veriyor ama adresi yok. Task 114 kararı: JSON-LD'de sokak adresi ve VKN yok. Adressiz `LocalBusiness` Google için geçersiz.
4. Başlık genel: "Afina Zeytin | Zeytin ve Zeytinyağı" (`app/layout.tsx:43`). H1 "Düziçi'nden sofranıza."
5. Ana sayfada `og:url`, `og:type`, `og:locale` yok.
6. `/llms.txt` 404 (kurumsal sitede var).
7. `x-powered-by: Next.js` başlığı açık.
8. `favicon.ico` 404 (yalnız SVG).
9. Ürün kartlarında tekrar eden H3: "Doğal Kırma Yeşil Zeytin" ×2, "Natürel Sızma Zeytinyağı" ×2 (gramaj/hacim farkı başlıkta yok).
10. WebSite şeması yok.

## Kullanılacak araçlar
- Skill: `optimize-geo-aeo-seo`, `claude-seo:seo-schema`, `vercel:next-cache-components` (ISR/revalidate), `frontend-patterns`, `tdd-workflow`.
- 21st MCP: hayır.

## Adımlar
1. **ISR:** `force-dynamic` yerine ana sayfa statik + yeniden doğrulama (`export const revalidate = 300` ya da proje sürümüne uygun eşdeğeri) olsun. Admin ürün kaydet/yayından kaldır başarılı olunca (`app/api/admin/products/route.ts`, RPC başarısından sonra) `revalidatePath("/")` çağrılsın. `requireAdmin`/`requireAdminMutation` sırası ve auth mantığı değişmesin. Ana sayfada oturuma/çereze bağlı bir okuma varsa ISR'yi bozmadan istemci tarafına ya da ayrı dinamik parçaya taşı; bu mümkün değilse dur ve Coder Notu'na sebebini yaz.
2. **LCP:** İlk ekranda (390 px ve 1440 px) LCP olan görsel(ler) `loading="lazy"` olmasın, `fetchPriority="high"` alsın; ilk ekran dışındaki görseller lazy kalsın. Hangi görselin LCP olduğunu kodda gerekçesiyle belirle. Görsel/animasyon değişmesin.
3. **Şema:** `BusinessJsonLd` içinde tesis düğümünü `LocalBusiness` yerine `Place` yap (`@id` `#tesis` aynı). `address` yalnız sayfada zaten görünen ilçe düzeyinde olsun: `{ "@type": "PostalAddress", addressLocality: "Düziçi", addressRegion: "Osmaniye", addressCountry: "TR" }`. Sokak adresi ve VKN ekleme (Task 114). Organization'a `sameAs: ["https://afina.com.tr"]` ve `location: { "@id": ".../#tesis" }` ekle. Aynı grafa `WebSite` düğümü (`@id: https://afinazeytin.com/#website`, `inLanguage: "tr-TR"`, `publisher` → organization) ekle. FAQPage aynı kalsın.
4. **Meta:** Varsayılan başlık "Afina Zeytin | Düziçi'nden Zeytin ve Zeytinyağı" olsun (≤60 karakter). `openGraph` içine `url: "/"` (metadataBase ile mutlak), `type: "website"`, `locale: "tr_TR"`, `siteName: "Afina Zeytin"` ekle. "%100/organik/doğal" iddiası ekleme.
5. **llms.txt:** `app/llms.txt/route.ts` (statik) ile Markdown üret: başlık, tek cümle tanım (mevcut site açıklaması), ürün listesi (yalnız ad + gramaj/hacim; fiyat yok, örnek fiyatlar onaysız), tesis yeri (Düziçi / Osmaniye), toptan iletişim bölümüne bağlantı (`/#toptan-iletisim`), SSS bağlantısı, `https://afina.com.tr` bağlantısı. Veriyi mevcut kaynaklardan oku, kopya metin yazma. noindex taslak yasal sayfaları listeleme. CSP/robots değişmesin; `/llms.txt` robots'ta açık olsun.
6. **Başlık sızıntısı:** `next.config.ts` içinde `poweredByHeader: false`.
7. **İkonlar:** `app/favicon.ico` (16/32/48) ve `app/apple-icon.png` (180), mevcut `public/brand/favicon.svg` çiziminden. SVG ikon kalsın.
8. **H3:** Ürün kartı başlığında varyant farkı (gramaj/hacim) görünsün ya da başlığın erişilebilir adına eklensin; görsel düzeni bozma. Tasarım değişikliği gerekiyorsa yalnız erişilebilir ada ekle.

## Kabul kriterleri
- [ ] Birim/kaynak testi: `app/page.tsx` `force-dynamic` içermiyor ve `revalidate` tanımlı; admin kaydet/kaldır başarı yolunda `revalidatePath("/")` çağrılıyor, başarısız yolda çağrılmıyor; mevcut admin auth testleri geçiyor.
- [ ] Birim testi: JSON-LD'de `LocalBusiness` yok; `Place` adresinde sokak yok; `WebSite` ve `sameAs` var; FAQPage değişmedi.
- [ ] Birim testi: metadata başlığı ve `openGraph.url/type/locale` beklenen değerlerde.
- [ ] `/llms.txt` 200, `text/plain` ya da `text/markdown`, fiyat içermiyor, 6 ürünün adını içeriyor.
- [ ] Build çıktısında `/favicon.ico`, `/apple-icon.png`; `x-powered-by` başlığı yok.
- [ ] `npm test`, lint, typecheck, build yeşil.
- Tarayıcı/Lighthouse/canlı başlık ölçümü Claude'da.

## Yapılmaması gerekenler
- Auth, Supabase RLS/migration, ödeme, CSP, kayıt/giriş akışı değişmesin.
- Ürün sayfası (`/urun/...`) ve Product/Offer şeması ekleme (fiyat onayı bekliyor, ayrı karar).
- Görünmeyen bilgiyi şemaya koyma; puan, yorum, sokak adresi, VKN ekleme.
- CI dosyasına dokunma. Yeni bağımlılık ekleme.

## Durum: BEKLİYOR
