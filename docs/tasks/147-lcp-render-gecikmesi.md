> ONAY VERİLDİ (kullanıcı, 28 Eki 2026): "gerekli işleri codex'e yaptır" (SEO/GEO hız maddesi). 145 sonrası canlı ölçüm.

# Task 147: Mobil LCP render gecikmesi

## Tür
frontend

## Amaç
Mobil LCP'yi düşürmek: LCP görseli hızlı iniyor ama geç boyanıyor.

## Bağlam (Claude ölçümü, canlı, 145 sonrası, Lighthouse 12.8.2 mobil, 3 koşu)
- Perf 78, LCP 4,7–4,9 sn. TTFB artık ~0,35–0,65 sn (ISR çalışıyor, `x-vercel-cache: HIT`).
- LCP öğesi `/images/v3/urun-01-kirma-10kg-w144.avif` (mobil satın alma kartındaki ürün görseli). Load Delay 0, Load Time 150–280 ms.
- Sorun **Render Delay ~3,8 sn**. `components/landing/MobileBuyBar.tsx:73-74` kart `motion` ile `opacity: visible ? 1 : 0` ve `y: "110%"` başlıyor; görünürlük istemci durumuna (`visible`) bağlı. Hero katmanları da (`SofraHero.tsx`) giriş animasyonuyla geliyor olabilir.

## Kullanılacak araçlar
- Skill: `chrome-devtools-mcp:debug-optimize-lcp`, `vercel:react-best-practices`, `motion-framer`, `frontend-patterns`.

## Adımlar
1. Yerelde production build + Lighthouse mobil (ya da DevTools trace) ile gecikmenin sebebini doğrula, Coder Notu'na yaz.
2. İlk ekranda görünmesi tasarlanan öğeler (hero katmanları; ilk ekranda görünüyorsa satın alma kartı) SSR HTML'de JS beklemeden görünür boyansın. Giriş animasyonu korunacaksa `opacity: 0` başlangıcı yerine transform ile ya da LCP olmayan katmanda yap. Kart ilk ekranda tasarım gereği gizliyse (kaydırınca açılıyorsa) LCP öğesinin hero'daki görünür bir görsel olmasını sağla, kartın davranışını değiştirme.
3. Görsel sonuç, yerleşim ve animasyon hissi aynı kalsın; reduced-motion değişmesin.

## Kabul kriterleri
- [ ] Yerel production Lighthouse mobil (3 koşunun medyanı): LCP Render Delay < 1,2 sn ve LCP < 2,5 sn; tablo Coder Notu'nda.
- [ ] Mevcut e2e (hero, satın alma kartı, sepet) testleri zayıflatılmadan yeşil; `npm test`, lint, typecheck, build yeşil.
- Canlı ölçüm Claude'da.

## Yapılmaması gerekenler
- Görseller, metinler, Task 145 şema/meta/ISR, auth, ödeme, CSP değişmesin. Yeni bağımlılık yok.

## Durum: BEKLİYOR
