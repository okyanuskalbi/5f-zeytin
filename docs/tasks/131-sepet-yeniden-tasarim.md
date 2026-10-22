# Task 131: Sepet — çekmece ve sepet sayfası yeniden tasarım (v4)

## Tür
frontend

## Amaç
Kullanıcı (22 Eki): "Sepeti şekil şukul yapalım." Sepet çekmecesi (`components/cart/CartDrawer.tsx`, `MiniCart`, `CartSummary`, `Upsell`) ve `/sepet` sayfası v4 "Sinematik sofra" diline (koyu zemin, süt yüzeyler, altın eylem, Fraunces + Figtree) getirilsin; satın almaya güven veren, düzenli bir sepet.

## Kullanılacak araçlar
- **Kullanıcı isteği (22 Eki), hepsini fiilen yükle:** `ui-ux-pro-max` (§5 Layout & Responsive dahil), `frontend-design`, `better-layout`, `motion-framer`, `shadcn-ui` (resmi CLI, token'lara uyarla), 21st MCP (ilgili bileşeni ara/uyarla, seçilen bileşenin adı/ID'si Coder Notu'na). `responsiveness-check` Claude'da. Coder Notu'na "Skill / nerede kullanıldı" tablosu ekle.
- `tdd-workflow`, `frontend-patterns`.
- 21st MCP: "shopping cart drawer", "cart page ecommerce", "order summary" ara; en az 3 aday, seçilen Coder Notu'na.

## İstenen
1. **Çekmece (sağdan, masaüstü 440px; telefonda tam ekran):**
   - Başlık "Sepetim (n)" + kapat (44×44).
   - Ürün satırı: 72px görsel (süt zeminli küçük kart), ad (Fraunces 17px), boy çipi, birim fiyat, adet seçici (− n +, 36px görsel / 44px dokunma), satır toplamı (tabular), "Kaldır" ikon butonu (çöp, aria-label). Satırlar arası ince ayraç.
   - Upsell (mevcut mantık): "Sofranıza ekleyin" başlığıyla en çok 2 küçük ürün kartı, yatay; "Ekle" düğmesi.
   - Alt sabit blok: Ara toplam, Kargo ("Ödeme adımında hesaplanır" — ücret uydurma yok), Toplam (büyük, altın), "Ödemeye geç" (altın, tam genişlik, ≥ 52px), altında "Güvenli Ödeme" + PayTR/Visa/Mastercard/troy küçük logolar, "Kargo 2–4 iş günü" satırı. "Sepeti görüntüle" ikincil link → `/sepet`.
   - Boş sepet: amblem/teneke küçük görseli + "Sepetiniz boş" + "Ürünlere göz atın" (altın) → `/#urunler` (çekmeceyi kapatır).
   - Ekleme/silme/adet değişimi: satır yükseklik animasyonu (motion `layout`, reduced-motion'da yok), toplam rakamı yumuşak geçiş.
2. **`/sepet` sayfası:** masaüstü 2 kolon (sol ürün listesi kartlar halinde, sağda yapışık sipariş özeti kartı: ara toplam, kargo notu, kupon alanı varsa mevcut mantıkla, toplam, Ödemeye geç, güven satırı). Telefonda liste, altında özet; "Ödemeye geç" alt yapışık çubuk (safe-area). Boş sepet durumu çekmeceyle aynı dil.
3. **Kupon/indirim/upsell/terk edilen sepet** mantığına dokunma; yalnız görünüm. Mevcut testlerin davranışı korunur, seçiciler güncellenir.
4. Kontrast ≥ 4.5:1, dokunma ≥ 44px, odak halkası altın 2px; yatay taşma yok (320–1920).
5. Sepet açıkken telefondaki "Sepete ekle" çubuğu gizli (121).

## Kabul kriterleri
- [ ] Unit: dolu çekmecede satır öğeleri (görsel, ad, boy, adet, satır toplamı, kaldır), ara toplam/toplam, Ödemeye geç, güven satırı.
- [ ] Unit: boş durum metni ve CTA.
- [ ] Unit: adet artır/azalt/kaldır toplamları doğru günceller (mevcut store ile).
- [ ] Unit: `/sepet` özet kartı ve telefonda yapışık "Ödemeye geç".
- [ ] E2E (yaz, çalıştırma) `tests/e2e/cart-131.spec.ts`: 1440/390/375×667'de çekmece ve sayfa, taşma yok, dokunma hedefleri.
- [ ] `npm test`, lint, typecheck, build yeşil; mevcut sepet/checkout testleri korunur.
- [ ] Tarayıcı doğrulaması Claude'da.

## Yapılmaması gerekenler
- Fiyat, kargo ücreti, indirim oranı uydurma; ödeme/checkout mantığı değiştirme.
- `docs/` değiştirme (yalnız Coder Notu/Durum).

## Durum: BEKLİYOR
