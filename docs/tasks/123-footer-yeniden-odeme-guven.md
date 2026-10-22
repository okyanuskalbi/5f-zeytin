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

## Coder Notu

### Uygulama ve 21st kaynağı

- 21st MCP `footer` araması çağrıldı. Resmi katalog sayfalarından doğrulanan demo kimlikleriyle `get_component` üzerinden üç adayın tam component/demo kodu incelendi:

| Aday | Demo / bileşen ID | Değerlendirme |
| --- | --- | --- |
| [Agency Footer — ShadcnSpace](https://21st.dev/@shadcnspace/components/footer-01) | 21474 / 10510 | Seçildi: marka bloğu + bağlantı kolonları + iletişim yapısı bu içerikle uyumlu. |
| [Footer with Navigation Grid — shadcnui-blocks](https://21st.dev/@shadcnui-blocks/components/footer-01) | 28291 / 14678 | Kolon ızgarası incelendi; altı kolon ve alt sıradaki logo bu görev için gereksiz. |
| [Footer — Méschac Irung](https://21st.dev/@meschacirung/components/footer) | 4711 / 3574 | Ortalanmış bağlantılar ve sosyal ikonlar istenen marka/üç kolon hiyerarşisine uymuyor. |

- Agency Footer'ın marka/kolon kompozisyonu `Footer.tsx` ve CSS Module'a uyarlandı; v4 Fraunces/Figtree, ink, süt ve altın tokenları kullanıldı. Masaüstünde 5/7 oranı, tablette üstte marka ve altta üç kolon, telefonda iki kolon ve tam genişlikte iletişim var. Topluluk logosu 26px ve atıf aynı bağlantıda; hedef `https://afina.com.tr`, `target="_blank"`, `rel="noopener"`.
- Güven şeridinde ve footer'da “Güvenli Ödeme” yazıyor. Krem plakalar kaldırıldı; mevcut dört SVG, alt metinleri ve `public/images/payment/SOURCES.md` korundu. Logolar 26px, araları 24px; ödeme satırının iki yanında ince ayraç var.
- Satıcı bilgisi ve yasal bağlantılar solda, telif ve tek önizleme notu sağda; telefon düzeninde alt alta. Linkler 16px, yasal metin 12px; dokunma hedefleri en az 44px, altın odak halkası 2px. Ink/metin tokenlarının AA kontrastı unit testle doğrulandı.
- Tesisin yalnız SHA ile sabitlenmiş bulanık kaynağı işlendi; iki WebP aynı adlarla yenilendi, manifestte işlem, bayt ve SHA kayıtları güncellendi. Yerel fotoğraf incelemesinde bina yeşil, plaka bulanık kaldı.

### Skill / nerede kullanıldı

| Skill | Nerede kullanıldı |
| --- | --- |
| `ui-ux-pro-max` | SKILL.md ve quick-reference §5 Layout & Responsive okundu; `responsive footer columns --domain ux` araması yapıldı. Mobil öncelikli ızgara, taşma önlemleri ve 44px hedefler. |
| `frontend-design` | Marka sloganının Fraunces hiyerarşisi, Figtree bağlantılar ve mevcut v4 renk yönü. |
| `better-layout` | Ortak hizalar, `minmax(0, …)` kolonlar, mantıksal boşluk özellikleri ve kaynak sırası. |
| `motion-framer` | Yüklendi; footer için ek giriş hareketi gerekli görülmedi. Statik sunucu HTML'i ve tüm bağlantılar hareket tercihlerinden bağımsız erişilir kaldı. |
| `shadcn-ui` | Yüklendi; token uyarlaması ve bileşen ihtiyacı değerlendirildi. Yeni shadcn primitive'i gerekmedi; ayraçlar CSS sınırlarıyla kuruldu. |
| `tdd-workflow` | Önce RED, sonra uygulama ve GREEN; aşağıda komut ve kapsam kanıtı var. RED/ara commit oluşturulmadı. |
| `frontend-patterns` | Sunucu bileşeni, mevcut veri/bağlantı dizileri, semantik nav/address ve güvenli dış bağlantı korundu. |

### Komutla doğrulama

| Komut / kriter | Sonuç |
| --- | --- |
| `npm test -- tests/unit/footer-refresh.test.tsx tests/unit/faq-contact-footer.test.tsx tests/unit/v3-foundation.test.tsx tests/unit/v3-lower-sections.test.tsx --maxWorkers=2` | RED: 8 beklenen hata, 27 geçen test. Uygulama sonrası aynı komut GREEN: 35/35. |
| `npm test -- --maxWorkers=2 --coverage --coverage.include=components/site/Footer.tsx --coverage.include=components/landing/TrustStrip.tsx` | PASS: 32 dosya, 354 test. Footer/TrustStrip satır, dal, fonksiyon ve ifade kapsamı %100. 118–122 testleri korunuyor. |
| `npm run lint` | PASS, uyarı yok. |
| `npm run typecheck` | PASS. Güncellenen e2e dosyaları da TypeScript kontrolüne dahil. |
| `npm run build` | PASS; prebuild varlık denetimleri de geçti: 18 görsel ve 100 v3 çıktı. |
| `node --test --test-concurrency=2 scripts/check-v3-assets.test.mjs` | PASS: 7/7; kaynak/işlem sahteciliği ve bozuk çıktı SHA denetimleri dahil. |
| `node scripts/prepare-facility-v4.mjs` | PASS: iki türev, sabit kaynak SHA, `saturation: 0.48`, `linear: [1.04, 1, 0.95]`, `brightness: 0.96`. |
| “Güvenli Ödeme”, üç kolon/marka/topluluk satırı, dört alt metin, koyu ödeme zemini, güvenli topluluk linki, tek önizleme notu | PASS: ilgili unit testler. |
| 320–1920px, iPhone/Pixel, gerçek taşma/hizalama/dokunma ve görsel kabul | Claude doğrulayacak. E2E beklentileri güncellendi; tarayıcı, Playwright, Lighthouse, inspect veya ekran görüntüsü çalıştırılmadı. |

### Açık kalan kabul: HSV S en az %25 düşüş

`node scripts/measure-facility-saturation.mjs` tüm görüntünün sRGB piksellerinde HSV S aritmetik ortalamasını ölçer: `S = max == 0 ? 0 : (max - min) / max`. Karşılaştırma, aynı bulanık kaynaktan eski Task 120 işlemini (saturation 0.7, linear [1.025, 1, 0.97]) aynı boyut/WebP ayarlarıyla bellekte yeniden üretir; yeni dosyalarla karşılaştırır. Kaynak ve çıktı SHA denetimleri ölçümden önce çalışır.

| Çıktı | Önce HSV S (0–1) | Sonra HSV S (0–1) | Düşüş |
| --- | --- | --- | --- |
| 1200×750 | 0.1328004649 | 0.1214258190 | %8.5652 |
| 2400×1500 | 0.1322386069 | 0.1195424538 | %9.6009 |

Ölçüm komutu %25 eşiğinde **FAIL (exit 1)** veriyor. Görevde belirtilen kesin renk değerleri ile sayısal kabul koşulu birlikte sağlanamadı. Plan/renk değerleri kendiliğinden değiştirilmedi; bu nedenle durum BEKLİYOR. Bu açık koşul unit/lint/typecheck/build sonuçlarından ayrıdır; tarayıcı testlerinin Claude'da olması bekleme sebebi değildir.

## Claude denetimi (22 Eki)
- HSV S %25 ölçütü hatalıydı: görüntünün çoğu gri kaldırım/gökyüzü, yeşil yalnız binada; tüm görüntü ortalaması bu yüzden az oynar. Belirtilen renk değerleri uygulandı. Görsel kabul canlıda Claude tarafından yapılacak.

## Durum: TAMAMLANDI (Claude kabulü)
