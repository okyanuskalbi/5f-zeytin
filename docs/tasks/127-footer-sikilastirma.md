# Task 127: Footer — boşlukları azalt, sıkı ve dengeli düzen (21st.dev)

## Tür
frontend

## Amaç
Kullanıcı (22 Eki, canlı footer ekran görüntüsüyle): "Boşluklarını azalt, güzel bir düzen kur." ve "21.dev'den faydalan."
123'teki footer çalışıyor (taşma yok, logolar okunur) ama dikeyde çok seyrek:
- link satırları arası ~54px, başlık–link arası ~48px;
- marka bloğu solda uzun, kolonlar sağda; ortada geniş boşluk;
- ödeme satırı ve alt satır arasında fazla dikey boşluk.
Kanıt: `~/PROJELER/AFINA-KAYNAK/araclar/log/z-123/footer-d1440.png`, `footer-iphone.png`.

## Kullanılacak araçlar
- **21st MCP zorunlu (kullanıcı açıkça istedi):** "footer" araması yap, **yoğun/kompakt** e-ticaret footer'larına bak (ör. 4 kolon tek satır + alt bar). En az 3 aday; seçilenin adı/ID'si Coder Notu'na. Projenin CSS Module + v4 token'larına uyarla, varsayılan bırakma.
- **Kullanıcı isteği (22 Eki), hepsini fiilen yükle:** `ui-ux-pro-max` (§5), `frontend-design`, `better-layout`, `shadcn-ui` (gerekirse). `responsiveness-check` Claude'da. Coder Notu'na "Skill / nerede kullanıldı" tablosu.
- `tdd-workflow`.

## İstenen
1. **Dikey ritim:** footer üst padding 56px, alt 24px. Kolon başlığı ile ilk link arası 14px; link satır aralığı 8–10px (link kendi `min-height: 32px` masaüstü, telefonda 44px dokunma alanı korunur ama görsel aralık sıkı: `padding-block` ile). Kolon başlığı 13px 600 büyük harf aralıklı.
2. **Yatay düzen (≥ 1024):** tek ızgara, 4 kolon: marka bloğu (1.4fr) + Alışveriş (1fr) + Yardım (1fr) + İletişim (1.2fr), `gap: 48px`. Marka bloğu: logo 56px yükseklik, slogan Fraunces 26–28px, açıklama 15px, topluluk satırı (küçük logo + metin) — aralarında 12–16px. Footer üst bölümünün toplam yüksekliği masaüstünde ≤ 260px.
3. **Ödeme satırı:** üst bölümden 32px sonra, dikey padding 16px; solda "Güvenli Ödeme" + PayTR, sağda Visa/Mastercard/troy (123 görünümü korunur).
4. **Alt satır:** ödeme satırından 16px sonra tek satır (masaüstü): solda unvan · VD · VKN, ortada KVKK / Mesafeli Satış / İade ve İptal, sağda © 2026 AFİNA ZEYTİN ve önizleme notu. 12–13px. Telefonda alt alta, aralık 8px.
5. **Tablet (768–1023):** marka bloğu üstte tam genişlik (logo + slogan yan yana olabilir), altında 3 kolon.
6. **Telefon (< 768):** marka bloğu sıkı (logo 48px, slogan 24px), kolonlar 2 sütun (Alışveriş | Yardım), İletişim tam genişlik; toplam footer yüksekliği 123'e göre en az %30 kısa. Telefondaki sabit "Sepete ekle" çubuğu footer'ın son satırlarını örtmez (121 kuralı).
7. 123'ün içeriği ve kuralları korunur: "Güvenli Ödeme", dört logo `alt` metni, topluluk linki `https://afina.com.tr` (`noopener`), tek önizleme notu, iletişim uydurma yok.

## Kabul kriterleri
- [ ] Unit: footer yapısı (4 kolon, ödeme satırı, alt satır) ve içerik 123 ile aynı; önizleme notu 1 kez.
- [ ] Unit/CSS: kolon başlığı–link ve link–link aralık token'ları yukarıdaki değerlerde.
- [ ] E2E (yaz, çalıştırma) `tests/e2e/footer-127.spec.ts`: 1440'ta footer üst bölüm yüksekliği ≤ 260px; 390'da footer toplam yüksekliği 123 ölçümünden en az %30 kısa (123 değeri: Claude ölçümü ~1990px iPhone 14 @3x ≈ 663 CSS px üst bölüm; Codex kendi build'inde önce/sonra ölçüp yazsın); 320–1920'de yatay taşma yok; telefonda dokunma hedefleri ≥ 44px.
- [ ] `npm test`, lint, typecheck, build yeşil; 118–126 testleri korunur.
- [ ] Tarayıcı doğrulaması Claude'da.

## Yapılmaması gerekenler
- İletişim/MERSİS/sosyal medya uydurma; newsletter ekleme.
- Ödeme mantığı; yeni logo.
- `docs/` değiştirme (yalnız Coder Notu/Durum).

## Durum: BEKLİYOR
