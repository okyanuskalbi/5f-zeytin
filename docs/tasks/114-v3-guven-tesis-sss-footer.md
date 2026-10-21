# Task 114: Güven şeridi, tesis + toptan, SSS, footer

## Tür
frontend

## Amaç
Taslak B'nin alt bölümleri:
- sofra beyazı güven şeridi;
- gerçek tesis fotoğraflı "Osmaniye'de, kendi tesisimizde." bloğu ve toptan iletişim satırı;
- yalnız tam cümleli SSS;
- kiler yeşili footer ve tek önizleme notu.

## Bağlam
- Bağımlılık: 111–113 TAMAMLANDI.
- Oku: `docs/DESIGN.md` v3 bölüm 3–6; `mix-b.webp` alt bölüm.
- Tesis görseli `docs/referans/tesis/tesis-osmaniye-plaka-bulanik.jpg`. Kullanıcı yayın onayı 21 Eki'de verildi. Optimize kopya `public/images/v3/`'e alınır; plaka okunur hâle gelmeyecek, kırpma ve keskinleştirme yok.
- Toptan formunun gönderimi yok (backend onay bekliyor).
- Satıcı bilgisi: `~/PROJELER/AFINA-KAYNAK/sirket/SIRKET.md` içindeki kamuya açık alanlar. Matrah, vergi tutarı ve PDF ASLA kullanılmaz.

## Kullanılacak araçlar
- Skill: `impeccable` (craft-floor, `clarify`), `better-writing` (SSS ve UX metni), `better-layout`, `landing-page-design` (güven ögeleri).
- ECC: frontend-patterns, accessibility, e2e-testing, seo.
- 21st MCP: "trust badges strip", "split feature image" ara; uyarla.

## Adımlar
1. **Güven şeridi:**
   - 3 öğe: "Kargo 2–4 iş günü" (örnek, açık karar), "PayTR ile güvenli ödeme", "Kendi tesisimizde dolum".
   - İnce zeytin yeşili çizgi ikonlar (kutusuz). Arada ince ayırıcı.
2. **Tesis bloğu:**
   - Solda başlık "Osmaniye'de, kendi tesisimizde." ve 2 satır metin: Ellek · Düziçi · 2021'den bu yana · sofralık zeytin, salamura ve zeytinyağı; perakende ve toptan.
   - Sağda tesis fotoğrafı (cover, 4:3 masaüstü, 16:10 telefon).
3. **Toptan (`#toptan`):**
   - Form gönderimi yokken çalışmayan form GÖSTERME.
   - Yerine "Toptan alım için bize yazın" başlığı ve iletişim düğmeleri: telefon, WhatsApp, e-posta.
   - Değerler `lib/site/contact.ts` içinde **boş** yer tutucu olarak tanımlanır. Boşken düğmeler render edilmez; yerine "İletişim bilgileri yakında" yazar.
   - Mevcut form kodu korunur, gizlenir. Backend gelince açılacak.
4. **SSS:**
   - Yalnız `docs/teyit` ve resmi metinlerden tam, kendi içinde anlamlı cevaplar. Yarım cümleli cevabı olan soru kaldırılır.
   - En fazla 6 soru. Akordeon (klavye erişilir, `aria-expanded`).
5. **Footer:**
   - Kiler yeşili zemin, logo, linkler, satıcı bilgisi satırı (unvan · Düziçi VD · VKN), yasal linkler, Topluluk logosu → afina.com.tr.
   - Tek satır "Önizleme: fiyatlar ve görseller temsilidir."
6. **SEO:**
   - `Organization` + `LocalBusiness` (adres, VKN yok) JSON-LD.
   - Product JSON-LD yalnız gerçek fiyat gelince eklenir; şimdi yok.

## Kabul kriterleri
- [ ] Sayfada "henüz kullanıma açık değil", "Gerçek satış kataloğu" gibi taslak yazısı yok. Önizleme notu tam 1 kez geçer (test).
- [ ] SSS cevaplarının her biri büyük harfle başlar, noktayla biter, ≥ 6 kelime (birim test).
- [ ] Tesis görselinde plaka okunur değil: kaynak bulanık dosya, SHA eşleşir.
- [ ] Kaydırma kare şeridi (masaüstü/iPhone/Pixel) `test-results/114/`; 120px tekerlek testiyle footer'a ulaşılır.
- [ ] Lighthouse mobil 3 ölçüm medyanı ≥ 85, A11y ≥ 95. inspect.mjs FAIL 0. Build, lint ve tüm e2e yeşil.

## Yapılmaması gerekenler
- İletişim bilgisi uydurma.
- Formu gerçek bir servise bağlama.
- Kargo firması adı yazma.

## Durum: BEKLİYOR
