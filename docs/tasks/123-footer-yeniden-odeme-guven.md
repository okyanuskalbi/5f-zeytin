# Task 123: Footer yeniden tasarım (21st.dev) + ödeme satırı + güven şeridi metni + tesis tonu

## Tür
frontend

## Amaç
Kullanıcı (22 Eki, canlı afinazeytin.com ekran görüntüleriyle):
- Güven şeridi: "PayTR ile güvenli ödeme yerine Güvenli Ödeme yaz sadece."
- Footer ödeme satırı (PayTR / Visa / Mastercard / troy): "burayı düzenle".
- Footer üst kısmı (logo, slogan, Alışveriş / Yardım / İletişim kolonları, topluluk logosu): "burayıda 21.dev ile düzenle".

Claude'un tespiti (`~/PROJELER/AFINA-KAYNAK/araclar/log/z-121/footer-crop.png`):
- `public/images/payment/paytr.svg`, `visa.svg`, `troy.svg` tamamen `fill="white"`. 121'de arkalarına `var(--sut)` krem plaka eklendi (`Footer.module.css` `.paymentPlate, .cards li`). Krem üstünde beyaz kaldıkları için PayTR, Visa ve troy görünmüyor; yalnız Mastercard seçiliyor.
- Footer üst kısmı: marka kolonu solda tek başına uzun, sağdaki üç kolon geniş boşlukla kopuk. İki ayrı logo (Zeytin + Topluluk) alt alta dağınık. "İletişim" kolonunda yalnız adres ve Tesisimiz var. Kolon başlıkları ile linkler arası boşluk fazla, linkler küçük ve soluk.

## Kullanılacak araçlar
- **21st MCP zorunlu (kullanıcı açıkça istedi):** "footer" araması yap, en az 3 aday incele (ör. çok kolonlu marka footer'ı, newsletter'sız e-ticaret footer'ı). Seçtiğin bileşenin adını/ID'sini Coder Notu'na yaz. Kodunu projenin CSS Module + token yapısına uyarla, varsayılan halde bırakma.
- **Kullanıcı isteği (22 Eki), hepsini fiilen yükle:** `ui-ux-pro-max` (§5 Layout & Responsive dahil), `frontend-design`, `better-layout`, `motion-framer` (gerekirse yalnız giriş hareketi), `shadcn-ui` (gerekirse). `responsiveness-check` Claude'da. Coder Notu'na "Skill / nerede kullanıldı" tablosu ekle.
- `tdd-workflow`, `frontend-patterns`.

## İstenen
### 1. Güven şeridi metni
- `components/landing/TrustStrip.tsx`: "PayTR ile güvenli ödeme" → **"Güvenli Ödeme"**. Diğer maddeler aynı. Testleri güncelle.

### 2. Footer üst kısmı (21st.dev uyarlaması)
- Zemin ink (`#0A0F0B` ya da mevcut footer tokenı), v4 renkleri, Fraunces + Figtree.
- Masaüstü (≥1024): solda marka bloğu (AFİNA ZEYTİN logosu + "Kökü toprakta. Yeri sofrada." + "Toprağın sunduğu lezzet, Afina'nın özeniyle."), sağda **aynı ızgarada** üç kolon: Alışveriş, Yardım, İletişim. Marka bloğu ile kolonlar arasında dengeli ızgara (ör. 5/12 + 7/12), dev boşluk yok.
- Kolon başlıkları 14px 600 büyük harf aralıklı ya da 16px 600; linkler 15–16px, `#C9CFC4` civarı, hover altın + alt çizgi, odak halkası altın 2px. Başlık–link aralığı 16px, link aralığı 10–12px.
- "Bir AFİNA Şirketler Topluluğu markası" + topluluk logosu marka bloğunun altında **tek satır**: küçük logo (24–28px yükseklik) + metin yan yana, `afina.com.tr` linki (`rel="noopener"`, yeni sekme). Ayrı dev ikinci logo yok.
- İletişim kolonu: adres iki satır + "Tesisimiz" linki. Telefon/e-posta henüz yok, **uydurma**.
- Tablet: marka bloğu üstte tam genişlik, altında 3 kolon. Telefon: marka bloğu, sonra kolonlar 2 sütun (Alışveriş + Yardım yan yana), İletişim tam genişlik. Yatay taşma yok, dokunma hedefi ≥ 44px.

### 3. Ödeme satırı
- Krem plakaları **kaldır**. Koyu zeminde: solda "Güvenli Ödeme" etiketi + PayTR logosu (beyaz), sağda Visa (beyaz), Mastercard (kendi renkleri), troy (beyaz). Hepsi 24–28px yükseklik, optik olarak eşit, dikey hizalı, aralarında 24px.
- İsteğe bağlı: logoları %80 opaklıkta göster, hover'da %100. Mastercard daireleri koyu zeminde okunur.
- Telefonda: etiket + PayTR bir satır, kart logoları altında bir satır, sola hizalı.
- Satır üst/alt ince ayraç `rgba(255,255,255,.08)`.
- 117 kuralları korunur: `alt` metinleri (`PayTR`, `Visa`, `Mastercard`, `Troy`), AmEx/Apple Pay yok, `SOURCES.md` atfı.

### 4. Alt satır
- Satıcı bilgisi, KVKK / Mesafeli Satış Sözleşmesi / İade ve İptal, © 2026 AFİNA ZEYTİN ve tek önizleme notu korunur. Masaüstünde tek satıra sığacak şekilde (sol: unvan + yasal linkler, sağ: © + not); telefonda alt alta. Metin ≥ 12px, kontrast ≥ 4.5:1.

### 5. Tesis fotoğrafı tonu (orta)
- `scripts/prepare-facility-v4.mjs` `operation: { saturation: 0.7, linear: [1.025, 1, 0.97] }` binanın fıstık yeşilini yeterince yatıştırmadı (`tesis-d04.jpg`).
- Yeni değer: `saturation: 0.48`, `linear: [1.04, 1.0, 0.95]`, `brightness: 0.96`. Kaynak yalnız `docs/referans/tesis/tesis-osmaniye-plaka-bulanik.jpg` (SHA doğrulaması korunur), plaka okunmaz. Çıktılar aynı adla yeniden üretilir, manifest/sha güncellenir. Bina yeşil kalır, gri yapma.
- Coder Notu'na HSV S ortalaması (öncesi/sonrası) yaz.

## Kabul kriterleri
- [ ] Güven şeridinde "Güvenli Ödeme" var, "PayTR ile" yok (unit).
- [ ] Footer'da 21st bileşen kaynağı Coder Notu'nda; 3 kolon başlığı + marka bloğu + tek topluluk satırı (unit).
- [ ] Ödeme logolarının arkasında açık renk zemin yok; 4 logo `alt` metinli (unit).
- [ ] Topluluk linki `https://afina.com.tr`, `rel` içinde `noopener` (unit).
- [ ] Önizleme notu sayfada tam 1 kez (unit).
- [ ] Tesis görseli HSV S ortalaması en az %25 düştü (komut).
- [ ] `npm test`, lint, typecheck, build yeşil; 118–122 testleri korunur.
- [ ] Tarayıcı doğrulaması Claude'da (320–1920 + iPhone + Pixel).

## Yapılmaması gerekenler
- İletişim bilgisi, MERSİS, sosyal medya linki uydurma; newsletter formu ekleme.
- Ödeme mantığına dokunma; yeni ödeme yöntemi logosu ekleme.
- Plakası bulanık olmayan kaynağa dokunma; yeni görsel üretme.
- `docs/` değiştirme (yalnız Coder Notu/Durum).

## Durum: BEKLİYOR
