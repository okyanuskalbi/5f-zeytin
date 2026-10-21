# Task 117: Footer düzeni + ödeme/kart logoları

## Tür
frontend

## Amaç
Kullanıcı canlı afinazeytin.com footer'ının ekran görüntüsüyle: "kart logoları gelsin ve bu kısım düzenle".

Footer, e-ticaret sitesine yakışan düzenli kolonlara ve bir güven satırına (kart ve ödeme logoları) kavuşacak.

## Bağlam (ekran görüntüsü sorunları)
- Sol: logo + slogan + önizleme notu. Sağ: adres satırı (çok uzun, tek satır) + iki link. Ortası boş, düzensiz.
- Topluluk logosu sağ altta tek başına, ne olduğu belli değil.
- Kart/ödeme logosu yok. E-ticarette güven için beklenir.
- Kart logoları için:
  - 21st MCP `search_logo` (Visa, Mastercard, Troy, PayTR) ya da resmi SVG'ler. Marka renkleri korunur.
  - Ödeme yalnız PayTR iFrame; PayTR Visa, Mastercard ve Troy kabul eder. American Express EKLEME (teyitsiz).

## Kullanılacak araçlar
- Skill: `impeccable` (craft-floor, `layout`), `better-layout`, `landing-page-design` (güven öğeleri), `ecc:frontend-patterns`.
- 21st MCP: `search_logo` ile logolar; "ecommerce footer" ara, uyarla.

## İstenen düzen (masaüstü 4 kolon, telefon akordeon ya da tek kolon)
1. **Marka kolonu:**
   - AFİNA ZEYTİN logosu, "Kökü toprakta. Yeri sofrada." (daha küçük, 24–28px), "Toprağın sunduğu lezzet, Afina'nın özeniyle."
   - Altında küçük "Bir AFİNA Şirketler Topluluğu markası" + topluluk logosu → https://afina.com.tr (yeni sekme). Sağ alttaki yalnız logo kalkar.
2. **Alışveriş:** Ürünler (`#kiler`), Kışlık kiler, Toptan alım (iletişim bilgisi varsa), Sepetim.
3. **Yardım:** Sipariş takibi (`/siparis-takip`), Hesabım (`/hesabim`), Sık sorulan sorular (`#sss`), İade ve İptal.
4. **İletişim:**
   - Adres, iki ya da üç satıra bölünmüş: "Şehit Ali Gökçe Mah. Şehit Ömer Halis Demir Sk. No: 35" / "Ellek Beldesi, Düziçi / Osmaniye".
   - Tesisimiz linki. Telefon/e-posta henüz yok; boşsa gösterilmez.
5. **Güven satırı** (ince ayraçla ayrılmış tam genişlik):
   - Solda "Güvenli ödeme" + PayTR logosu.
   - Sağda Visa, Mastercard ve Troy logoları: gri/tek renk ya da orijinal renkler, 32–40px yükseklik, eşit aralık.
   - "SSL ile korunan bağlantı" kısa ifadesi isteğe bağlı (HTTPS gerçek).
6. **Alt satır:**
   - Satıcı bilgisi (unvan · Düziçi VD · VKN), küçük punto.
   - Yasal linkler (KVKK, Mesafeli Satış Sözleşmesi, İade ve İptal).
   - "© 2026 AFİNA ZEYTİN" ve tek önizleme notu.

Renk: kiler yeşili zemin. Metin krem, ikincil metin ≥ 4.5:1. Link hover ve odak belirgin.

## Kabul kriterleri
- [ ] Footer'da 4 kolon başlığı (Alışveriş, Yardım, İletişim + marka) ve güven satırı var (unit).
- [ ] Kart logoları `alt` metinli (`Visa`, `Mastercard`, `Troy`, `PayTR`), dekoratif değil; logolar `public/images/payment/` altında SVG.
- [ ] Topluluk bağlantısı afina.com.tr, `rel="noopener"`.
- [ ] Önizleme notu sayfada tam 1 kez (mevcut test korunur).
- [ ] `npm test`, lint, typecheck, build yeşil. Görsel doğrulama Claude'da.

## Yapılmaması gerekenler
- İletişim bilgisi uydurma.
- Ödeme mantığına dokunma.
- American Express / Apple Pay gibi teyitsiz yöntem logosu ekleme.

## Durum: BEKLİYOR
