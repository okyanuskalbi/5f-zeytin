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

## Coder Notu

- Footer masaüstünde 4 kolon, tablette 2 kolon, telefonda tek kolon olarak düzenlendi. Marka/topluluk grubu, iki satırlı mevcut adres, alışveriş/yardım linkleri, güven satırı, satıcı/yasal bilgiler ve tek önizleme notu tamamlandı. Boş telefon/e-posta ve toptan iletişim bağlantısı gizli kalır.
- `impeccable` (craft-floor/layout), `better-layout`, `landing-page-design` ve `ecc:frontend-patterns` okundu. 21st MCP `ecommerce footer` araması ve `shadcnspace/footer-01` (21474) kaynak kodundaki kolon gruplaması mevcut CSS Module/marka tokenlarına uyarlandı. Yeni shadcn bileşeni veya bağımlılık gerekmedi.
- 21st `search_logo`, Visa/Mastercard/Troy/PayTR için eşleşme vermedi. PayTR ve Troy kendi resmi sitelerinden; Visa ve Mastercard, ödeme sağlayıcısı Datatrans'ın resmi `payment-logos` deposundan alındı. SVG kaynakları, CC BY-SA 4.0 atfı ve viewBox/zemin uyarlaması `public/images/payment/SOURCES.md` içinde kayıtlıdır; marka çizimleri ve renkleri korunur.
- Görevdeki `#sss` mevcut sayfada bulunmadığından SSS bağlantısı çalışan `/#sik-sorulanlar` hedefine bağlandı. Ürünler `/#kiler`, Kışlık kiler mevcut `/#urunler` hedefine gider.
- TDD RED: `npm test -- tests/unit/faq-contact-footer.test.tsx --maxWorkers=2` → yeni davranışlar için 4 beklenen hata, 8 geçen test. GREEN: footer ve mevcut önizleme regresyonlarını kapsayan 3 dosya/25 test geçti.
- Genel doğrulama: `npm test -- --maxWorkers=1 --testTimeout=20000` → **27 dosya, 302 test geçti**. İki worker/varsayılan 5 saniyede yalnız mevcut Playwright yapılandırma import testi süreyi aştı; tek başına 9/9 geçti. Bu test veya global yapılandırma değiştirilmeden genel koşu tek worker ve 20 saniyelik komut parametresiyle doğrulandı; tarayıcı başlatılmadı.
- `npm run lint`, `npm run typecheck`, `npm run build` ve `git diff --check` geçti. Build öncesi varlık kontrolü 18 kayıt ve 98 v3 çıktıda PASS verdi. Impeccable kaynak taraması `[]`; mevcut renk tokenlarından hesaplanan krem/yeşil kontrastı **11,46:1**, altın/yeşil hover ve odak kontrastı **6,22:1**.
- **Claude doğrulayacak:** gerçek tarayıcıda 4/2/1 kolon görünümü, 320px taşma, logoların yüklenmesi/32px yüksekliği, kontrast/odak ve görsel kabul. Yeni footer e2e testi yazıldı; eski kabuk/yasal-link/sayfa-sonu beklentileri yeni düzene uyarlandı. Playwright, Lighthouse, inspect, ekran görüntüsü ve kare şeridi çalıştırılmadı.
- Başlangıçtaki görev dışı `.gitignore` değişikliği korunup görev commit'inin dışında bırakıldı.

## Durum: TAMAMLANDI
