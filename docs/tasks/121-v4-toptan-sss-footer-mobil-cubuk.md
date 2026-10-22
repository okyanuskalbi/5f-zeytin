# Task 121: v4 — toptan + SSS bölümü, footer uyarlaması, telefon sabit satın alma çubuğu

## Tür
frontend

## Amaç
Prova D'nin son bölümleri: iki kolonlu "Toptan + Sık sorulanlar", koyu footer (117'deki düzen korunur, renk v4) ve telefonda hero geçildikten sonra çıkan sabit alt çubuk. Sözleşme: `docs/DESIGN.md`, prova `d.html` (`.alt`, `footer`, `.bar`), kareler `mock-d-masa-05..06.png`, `mock-d-tel-06..07.png`.

## Kullanılacak araçlar
- Skill: `frontend-patterns`, `tdd-workflow`, `motion-patterns`, `impeccable` (craft-floor), `better-accessibility`.

## Adımlar
1. **Toptan + SSS** (`components/landing/WholesaleFaq.tsx` ya da mevcut `WholesaleContact`/`Faq` yeniden düzenlenir): `padding 96px 0` (telefon 64), zemin ink, 2 kolon gap 64 (telefon tek kolon gap 40).
   - Sol `id="toptan-iletisim"` **korunur**: `h2` "Market, restoran, otel, bayi." (`clamp(34px,4vw,54px)`), 17px gri "Toptan alım için miktar ve teslimat bilgisi verin; aynı gün dönüş yapalım." ve altın "Toptan teklif isteyin" düğmesi → mevcut `WholesaleForm` (dialog/açılır form) tetikler. Telefon/WhatsApp **uydurulmaz**; `hasSiteContact` boşsa yalnız form.
   - Sağ `id="sik-sorulanlar"` **korunur**: `h2` "Sık sorulanlar"; mevcut 3 teyitli soru (`Faq.tsx` verisi) `details/summary` ile: üst çizgi `rgba(255,255,255,.1)`, 18px dikey boşluk, summary 17px 600, sağda altın "+" / açıkken "–"; cevap 16px. Klavye ile açılır, `summary` odak halkası görünür.
2. **Footer** (`components/site/Footer.tsx`): 117'deki 4 kolon + güven satırı (PayTR, Visa, Mastercard, Troy) + alt satır korunur; renkler v4: zemin `#0A0F0B`, metin `#AEB5AA`, başlıklar beyaz, serif slogan 26px beyaz "Kökü toprakta. / Yeri sofrada.", alt satır `#7E867C` 12px. Kart logoları koyu zeminde okunur (beyaz/tek renk sürüm ya da açık yuvarlatılmış plaka). Tek önizleme notu footer'da kalır: "Önizleme: fiyatlar ve görseller temsilidir." Sayfada başka "temsili" yazısı **yok** (mevcut test korunur).
3. **Telefon sabit çubuk** (`components/landing/MobileBuyBar.tsx`): yalnız ≤900px; `position:fixed; bottom:0`, `padding 12px 16px calc(12px + env(safe-area-inset-bottom))`, zemin `rgba(14,21,16,.9)` + blur 14, üst çizgi; sol: small "Doğal Kırma · 10 kg" + 22px altın-2 fiyat; sağ: "Sepete ekle" altın hap (≥ 44px). `scrollY > innerHeight*.8` olunca `translateY(110%)→0` (.35 s); hero görünürken gizli; sepet çekmecesi/dialog açıkken gizli (çakışma yok); footer'ın son 120px'inde de gizli (satıcı bilgisi okunabilsin). Sepete ekleme ortak kalıp; geri bildirim çubukta "Eklendi ✓". `aria-hidden` gizliyken; görünürken `role=region aria-label="Hızlı satın alma"`. Sayfa altına çubuk yüksekliği kadar `padding-bottom` (içerik gizlenmesin).
4. **İç sayfalar** (`/sepet`, `/odeme`, `/hesabim`, `/siparis-takip`, `/kvkk`, `/mesafeli-satis`, `/iade`, `/giris`): v4 tokenlarıyla okunur; başlık Fraunces, gövde Figtree, kontrast ≥ 4.5:1. Yeni tasarım gerekmiyor, yalnız kırık/okunmaz yer kalmasın.
5. **Testler**: `faq-contact-footer.test.tsx` güncelle (anchor id'leri, 3 soru, önizleme notu 1 kez, kart logoları alt metni); `mobile-buy-bar.test.tsx` yeni (eşik, gizleme koşulları, ekleme). E2E `faq-contact-footer.spec.ts`, `process-faq-footer.spec.ts` güncel seçicilerle (Claude çalıştırır).

## Kabul kriterleri
- [ ] `#toptan-iletisim` ve `#sik-sorulanlar` id'leri var, nav/footer linkleri çalışır (unit).
- [ ] SSS 3 soru `details`; klavyeyle açılır (unit).
- [ ] Önizleme notu sayfada tam 1 kez (unit).
- [ ] Telefonda çubuk hero'dan sonra görünür, çekmece açıkken ve footer sonunda gizli; iPhone 14/SE + Pixel 7 şeridinde içerik örtülmez (Claude).
- [ ] Footer kart logoları koyu zeminde okunur (Claude görsel).
- [ ] İç sayfalarda okunmaz metin yok (Claude; sen 8 sayfayı build sonrası elle kontrol et, Coder Notu'na yaz).
- [ ] `npm test`, lint, typecheck, build yeşil.

## Yapılmaması gerekenler
- İletişim bilgisi/MERSİS uydurma; yeni SSS cevabı yazma.
- Ödeme/sepet mantığı, Supabase, e-posta.
- AmEx/Apple Pay logosu ekleme.
- `docs/` değiştirme (yalnız Coder Notu/Durum).

## Durum: BEKLİYOR
