# 198 — Kimi'ye özel ek (B tasarımı)

> Görev: `docs/tasks/198-onyuz-yeniden-kurgu-tasarim.md` (A1 + A2). Talimat: `docs/MASTER-PROMPT.md` v1.1 (§13 çakışma kuralı dahil). `198-1` ve `198-2` Codex'e aittir, uygulama — ama 198-2'deki **çakışma testi** gereğini (metin–görsel kesişmesi 0, otomatik + gözle) baştan karşıla.
> Ajan adın: **kimi**. Çıktılar `output/task198-kimi/`. Bu kopya ayrıdır; Codex'in A tasarımını görmeye ÇALIŞMA, bağımsız bir yön öner.

## 1. Canlı site analizi (Kimi 197) — yeni tasarımda tekrar etme
Rapor: `/Users/emre/PROJELER/5F-ZEYTIN/AFINA-KAYNAK/tasarim/uygulama-kontrol/197/RAPOR.md` (oku). 198 kapsamına girenler:
- Dokunma hedefi < 44 px metin bağlantıları ve seçim alanları (WebKit'te select 25 px) → tüm bağlantı/düğme/select ≥ 44×44.
- Yardımcı metin 11 px → en az 12 px (gövde 16).
- Yavaş ağda ana sayfa LCP 3,47 sn → ilk ekranda poster öncelikli (`fetchpriority="high"`, `preload`), video LCP adayı olmasın; hedef ≤ 2,5 sn (§13 yöntemi).
- Ürün sayfası: aynı ailenin farklı boyları aynı title/description → seçili boy metadata'ya girsin.
- 320 px'de benzer ürün görselleri küçük kaynaktan büyütülüyor → `sizes`/`srcset` doğru.
- 820×1180 WebKit'te üyelik kartının ön/arka yüzü üst üste biniyordu (bu görevde giriş sayfası yok; 199'da dikkate alınacak, not et).

## 2. 21st bileşen listesi (Claude seçti; sende 21st MCP yok)
Ortamda `API_KEY_21ST` var (değerini yazdırma). Kurulum: `npx shadcn@latest add "https://21st.dev/r/<yazar>/<ad>?api_key=$API_KEY_21ST"`. Kurulan kod MASTER-PROMPT §7–§9'a göre uyarlanır (renk, font, 8 px, Motion değerleri, yasak liste); gereksiz parça (bülten formu, sosyal ikon, rozet, karusel) çıkarılır. 401 alırsan Coder Notu'na yaz, el yazımıyla devam et.

| Bölüm | Bileşen | Kurulum adresi |
|---|---|---|
| Üst menü (masaüstü + mobil) | efferd/header-3 (#8971) | `https://21st.dev/r/efferd/header-3` |
| Mobil menü / sepet çekmecesi | wensity/drawer (#31360) | `https://21st.dev/r/wensity/drawer` |
| Ürün kartı | shadcnstore/product-card-1 (#28227) | `https://21st.dev/r/shadcnstore/product-card-1` |
| Adet seçici (ürün sayfası) | youcefbnm/quantity (#20055) | `https://21st.dev/r/youcefbnm/quantity` |
| Hasat maddeleri / 3'lü değer ikonları | felipemenezes098/content-09 (#28299) | `https://21st.dev/r/felipemenezes098/content-09` |
| Blog kartları | efferd/blogs-3 (#30531) | `https://21st.dev/r/efferd/blogs-3` |
| Alt bilgi | meschacirung/footer-4 (#27511) — bülten formu çıkarılır | `https://21st.dev/r/meschacirung/footer-4` |

Kaydırmayla tetiklenen hazır animasyonları (ör. content-09'daki) MASTER-PROMPT §8'e göre kaldır ya da yalnız izinli iki bölümde `once: true` bırak.

## 3. Çalışma kopyası notu
Bu kopyada `node_modules` ana projeye bağlantıdır. Derleme için gerekirse `next.config.ts` turbopack kökü yalnız bu kopyada değiştirilebilir ama **kayda girmez** (`git restore next.config.ts` sonra kaydet). Port: 3006.
