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

## Durum: TAMAMLANDI

## Coder Notu

### Uygulama
- Çekmece masaüstünde sağdan 440 px, telefonda 100dvh tam ekran. Başlık adetle güncellenir; Radix odak kilidi, Escape, açana odak dönüşü ve scroll kilidi korunur. Önceki mobil 85/95% snap/drag düzeni görevde istenen tam ekran düzenine çevrildi.
- Ortak `CartPresentation`: süt zeminli 72 px görsel, Fraunces 17 px ürün adı, boy çipi, birim fiyat, 36 px görsel / 44 px dokunma alanlı adet düğmeleri, satır toplamı, çöp düğmesi, toplamlar, amblemli boş durum ve ödeme güven satırı.
- Sipariş özeti süt kart üzerinde; toplam koyu alan içinde altın. Masaüstünde yapışık özet, telefonda safe-area dolgulu sabit ödeme çubuğu. Aynı stok/yenileme/checkout bağlantısı kontrolleri her iki ödeme eyleminde de korunur.
- Kargo ücreti hesaplanmaz; “Ödeme adımında hesaplanır” gösterilir. Toplam tahminidir; kargo ve indirimlerin dahil olmadığı belirtilir. Mevcut kupon alanı read-only, uygula düğmesi kapalı kalır. Kupon/indirim/checkout/store/terk edilen sepet işleyişi değiştirilmedi.
- Upsell yalnız mevcut onaylı ilişki/aktif ürün/stok koşullarıyla, “Sofranıza ekleyin” altında en çok iki yatay kart sunar. Yeni ilişki veya kampanya eklenmedi.
- Motion `layout` ve `AnimatePresence` ile satır değişimleri, opacity geçişiyle güncel tutar; çıkıştaki satırlar inert/aria-hidden. Reduced-motion modunda layout/transform kapalı, içerik ve eylemler erişilir.
- MiniCart v4 tokenlarına uyarlandı; açık sepet sırasında gizlenmesi ve açana odak dönüşü korunur. 121 mobil satın alma çubuğunun mevcut `cart.open`/inert kontrolü korunur; yeni e2e bunu da kapsar.

### Skill / nerede kullanıldı
| Skill / araç | Nerede kullanıldı |
|---|---|
| `ui-ux-pro-max` (yerel kurulu SKILL.md) | §5 Layout & Responsive ve `mobile cart responsive overflow --domain ux` sorgusu: dar ekran kartları, minmax(0,1fr), 100dvh, safe-area, taşma ve 44 px hedefler. |
| `frontend-design` | Onaylı v4 renkleri ve Fraunces/Figtree ile süt özet kartı, koyu toplam alanı ve altın ödeme hiyerarşisi. |
| `better-layout` | Ürün bilgisi/eylem grupları, esneyen satırlar, iki kolon → tek kolon, 320–1920 px için CSS düzeni ve DOM sırası. |
| `motion-framer` | Satır ekleme/silme/adet değişiminde layout/presence, tutar geçişleri. |
| `motion-foundations` | Mevcut `lib/ui-motion.ts` tokenları/spring'leri ve reduced-motion. |
| `motion-patterns` | popLayout, sabit ürün anahtarları, forwardRef ve çıkışta inert satır. |
| `motion-advanced` | Güncel tutarı tek erişilebilir output içinde sunma, çıkıştaki rakamları çoğaltmadan opacity geçişi. |
| `shadcn-ui` (yerel kurulu SKILL.md) | Resmi CLI `npx shadcn@latest docs sheet` ve `view button` fiilen çalıştırıldı. Mevcut Radix Dialog/Button kullanıldı; 44/52 px, altın odak, marka yüzeyleri ve pill eylemlerle özelleştirildi. Var olan primitive'ler yeniden eklenmedi. |
| 21st MCP | `shopping cart drawer`, `cart page ecommerce`, `order summary` sorguları denendi; aşağıdaki üç adayın kaynakları ID üzerinden fiilen alınıp incelendi. |
| `tdd-workflow` | Önce `cart-131.test.tsx`: 7 testin başarısız olduğu RED doğrulandı; uygulama sonrasında GREEN. |
| `frontend-patterns` | Mevcut external store/subscription ve durum kontrollerini koruyan ortak sunum bileşenleri. |
| `responsiveness-check` | AGENTS.md gereği Claude doğrulayacak; Codex tarayıcı çalıştırmadı. |

### 21st adayları ve seçim
| Aday | Demo ID | Uyarlama |
|---|---|---|
| ddoemonn / Drawer | `23558` | Seçildi: sağ panel + scroll gövdesi + sabit alt blok; mevcut Radix odak/scroll mekanizmasına uyarlandı. |
| astralyxdev / Checkout Summary | `36084` | Seçildi: semantik ara toplam/kargo/toplam satırları; bilinmeyen kargoya sıfır ücret yazmama. |
| shadcnstore / Product Listing Card | `28227` | Seçildi: küçük ürün görseli + ad/fiyat + ekle hiyerarşisi; mevcut onaylı upsell filtresiyle iki karta uyarlandı. |

### Kabul doğrulaması
| Kriter | Komut / kanıt | Sonuç |
|---|---|---|
| Dolu çekmece: görsel, ad, boy, adet, satır toplamı, kaldır; toplamlar/ödeme/güven | `npm test -- tests/unit/cart-131.test.tsx tests/unit/cart-experience.test.tsx` ve tam unit koşusu | Geçti. |
| Boş durum ve CTA; CTA çekmeceyi kapatır | `tests/unit/cart-131.test.tsx` | Geçti. |
| Gerçek store ile artır/azalt/kaldır ve toplamlar | `tests/unit/cart-131.test.tsx` | Geçti. |
| Sepet sayfası özeti ve mobil ödeme eylemi; stok/yenileme/bağlantı kapıları; katalog hatasında sepet korunması | `tests/unit/cart-131.test.tsx` | Geçti. |
| Upsell en fazla iki onaylı kart ve ekleme | `tests/unit/cart-131.test.tsx` | Geçti. |
| Tam unit ve mevcut checkout/sepet testleri | `npm test` | 39 dosya, 441 test geçti. |
| Lint | `npm run lint` | Geçti, sıfır uyarı. |
| Typecheck | `npm run typecheck` | Geçti. E2E kaynakları da TypeScript kontrolüne dahil. |
| Production build ve görsel manifesti | `npm run build` | Geçti; 18 görsel ve 112 v3 çıktı doğrulandı. |
| Kontrast | Node ile `app/globals.css` içindeki gerçek tokenlardan WCAG bağıl parlaklık hesabı | 14 metin/zemin çifti ≥4,5:1; en düşük gri/zeytin-2 5,65:1. Altın ödeme düğmesinde ink/altın 9,40:1. Gerçek render ve odak halkası Claude doğrulayacak. |
| E2E kaynakları | `tests/e2e/cart-131.spec.ts` | Yazıldı, çalıştırılmadı. 1440×900, 390×844, 375×667; ayrıca 320×640 ve 1920×1080. Dolu/boş çekmece, özet, mobil bar, taşma, hedef ölçüsü, odak, reduced-motion, kalıcılık. Önceki sepet/checkout testlerinin değişen seçicileri güncellendi. |
| Tarayıcı kabulü | AGENTS.md: Tarayıcı testleri Claude'da | **Claude doğrulayacak:** e2e, gerçek 320–1920 taşma/hedef ölçümleri, sticky/safe-area, görsel hiyerarşi, render kontrastı, mobil satın alma çubuğunun açık sepette gizlenmesi. Playwright/Lighthouse/inspect/ekran görüntüsü çalıştırılmadı. |

Uygulanamayan kod maddesi yok. Tarayıcı kabulü, AGENTS.md'deki açık istisna uyarınca TAMAMLANDI durumunu engellemez.
