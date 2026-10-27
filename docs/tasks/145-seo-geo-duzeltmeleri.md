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

## Coder Notu

- Ana sayfa `force-static` + `revalidate = 300` kullanıyor. Anonim katalog okuması çerez/oturum okumuyor; mevcut `no-store` katalog API davranışı korundu. Admin POST/PATCH/DELETE işlemlerinde yalnız geçerli RPC başarısından sonra `revalidatePath("/")` çağrılıyor; yetki kontrol sırası değişmedi.
- Mobil satın alma kartı ve arka plan zaten eager/high idi. 390/1440 px hero yerleşimindeki teneke/kavanoz ve bunların görünmesini bekleten dal da eager/high yapıldı; gerekçe `SofraHero.tsx` içinde. İlk ekran dışındaki ürün/tesis görselleri lazy kaldı. Görsel, CSS ve animasyon değiştirilmedi.
- Graf `Organization → Place` ve `WebSite → Organization` bağlantılarını, `sameAs` ve yalnız ilçe düzeyindeki adresi içeriyor. `Place` için uygun olmayan eski `parentOrganization` kaldırıldı; ilişki Organization'ın `location` alanında. FAQ bileşeni ve FAQPage içeriği değişmedi; görünür cevaplarla eşleşmesi mevcut testlerle doğrulandı.
- Başlık/OG düzeltildi. Mevcut açıklama ve kamusal kimlik `lib/site/identity.ts` üzerinden metadata, şema ve statik `llms.txt` arasında paylaşılıyor; altı varyant adı/boyu mevcut katalogdan okunuyor, fiyat/yasal taslak listelenmiyor. Robots ve CSP değişmedi.
- ICO (16/32/48) ve Apple PNG (180) mevcut SVG'den `node scripts/generate-site-icons.mjs` ile türetildi. SVG korundu; Apple ikon bağlantısı metadata'da açıkça tanımlandı. Ürün H3, başlık düğmesi ve makalenin erişilebilir adı boyla ayrışıyor; görünen tasarım aynı.
- Task'taki beş skill'in kurulu kopyaları okundu; ek skill/bağımlılık kurulmadı. Projedeki Cache Components kapalı olduğundan global mimari değiştirilmedi; kurulu Next.js 16.4.2 belgelerindeki statik ISR yolu kullanıldı. Referanslar: [Next.js önbellek](https://nextjs.org/docs/app/guides/caching-without-cache-components), [revalidatePath](https://nextjs.org/docs/app/api-reference/functions/revalidatePath), [Schema.org Place](https://schema.org/Place).

### Komutla doğrulama

| Kriter | Komut / kanıt | Sonuç |
|---|---|---|
| TDD | İlgili 8 test dosyası önce çalıştırıldı: 12 FAIL / 90 PASS; uygulamadan sonra admin auth, robots ve offline kalite kapısı dahil 11 dosya / 180 PASS. Apple metadata bağlantısı için ek RED de görüldü, ardından düzeltildi. | PASS |
| ISR + admin yetkisi/başarı/hata | `home-metadata`, `admin-products-api`, `admin-auth` ve `security-admin-origin` birim testleri; build manifestinde `/` için `initialRevalidateSeconds: 300`. Başarısız RPC, geçersiz sonuç ve yetkisiz istekte invalidation yok. | PASS |
| Şema / FAQ / metadata / H3 | `v3-lower-sections`, `v4-quality-gate`, `bootstrap`, `products-grid`, `hero-layers`, `hero-card-lcp` testleri. | PASS |
| llms / ikon / başlık | `node scripts/verify-seo-geo.mjs`: yerel production HTTP'de `/`, `/llms.txt`, `/favicon.ico`, `/apple-icon.png`, `/brand/favicon.svg` beşi de 200; tümünde `x-powered-by` yok. llms `text/markdown; charset=utf-8`, 6 varyant, fiyat yok. İkonlar kaynak dosyayla byte düzeyinde aynı; Apple bağlantısı HTML'de. | PASS |
| Tüm birim testleri | Son `npm test -- --maxWorkers=2`: 70 dosya / 1088 test geçti. | PASS |
| Lint | Son `npm run lint`: exit 0, uyarı yok. | PASS |
| Typecheck | Son `npm run typecheck`: exit 0. | PASS |
| Build | Son `npm run build`: exit 0; `/` statik / 5m, `/llms.txt` statik, iki ikon build manifestinde. | PASS |

- Değişen uygulama dosyalarına odaklı coverage koşusunda bütün 1088 test geçti: statement %94,22, branch %89,88, function %96,55, line %99,41 (80 eşikleri yeşil). Komut:

  ```sh
  npm test -- --maxWorkers=2 --coverage \
    --coverage.include=app/page.tsx --coverage.include=app/layout.tsx \
    --coverage.include=app/api/admin/products/route.ts --coverage.include=app/llms.txt/route.ts \
    --coverage.include=components/site/BusinessJsonLd.tsx --coverage.include=components/catalog/ProductCard.tsx \
    --coverage.include=components/landing/SofraHero.tsx --coverage.include=lib/site/identity.ts
  ```

- İlk tam koşuda mevcut `login-ui.test.tsx:89` odak beklentisi bir kez başarısız oldu; auth/giriş dosyaları değiştirilmedi. Takip eden tam koşular ve son koşu 1088/1088 geçti.
- Yerel build, mevcut Supabase public URL ayarı için CSP uyarısı verdi ve mevcut katalog fallback yoluyla tamamlandı; gerçek DB yazması yapılmadı. Bu görev Supabase/env yapılandırmasını değiştirmiyor.
- Tarayıcı, Lighthouse, gerçek 390/1440 px LCP ölçümü ve canlı başlık kontrolü **Claude doğrulayacak**. `tests/e2e/seo-geo-145.spec.ts` eklendi, bootstrap başlık beklentisi güncellendi; e2e/Lighthouse/inspect/ekran görüntüsü çalıştırılmadı. Yerel HTTP kontrolünün açtığı Next sunucusu SIGTERM ile düzgün kapatıldı.
- Çalışma sırasında oluşan görev dışı `docs/tasks/146-guvenlik-sertlestirme.md` korunarak bu commit'in dışında bırakıldı.

## Durum: TAMAMLANDI
