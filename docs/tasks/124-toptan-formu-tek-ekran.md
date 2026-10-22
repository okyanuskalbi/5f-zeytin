# Task 124: Toptan teklif formu — tek ekranda, mobil sürüm

## Tür
frontend

## Amaç
Kullanıcı (22 Eki, canlı form ekran görüntüsüyle): "lead formu tek sayfada görünsün, mobil sürüm de olsun."
Şu anki "Toptan teklif isteyin" diyaloğu uzun: iki başlık ("Toptan teklif isteyin" + "Toptan talep formu"), kapsam satırı, uzun bilgi notu, her alanın altında ipucu metni, 5 satırlık mesaj alanı. KVKK ve Gönder düğmesi ekranın altına taşıyor, kaydırmak gerekiyor.

## Bağlam
- `components/landing/WholesaleForm.tsx` (157 satır) ve onu açan diyalog (`WholesaleFaq`/toptan bölümü, 121). shadcn `Dialog`, `Input`, `Textarea`.
- Form şu an gönderim yapmıyor ("Bilgileriniz gönderilmez"). Bu görev gönderim **eklemez**; doğrulama ve durum mesajları korunur.

## Kullanılacak araçlar
- **Kullanıcı isteği (22 Eki), hepsini fiilen yükle:** `ui-ux-pro-max` (§5 Layout & Responsive: mobil-first, dokunma ≥ 44px), `frontend-design`, `better-layout`, `shadcn-ui` (Dialog + Drawer/Sheet; resmi CLI, token'lara uyarla), 21st MCP ("contact form modal", "lead form" ara; uyarla), `motion-framer` (açılış/kapanış). `responsiveness-check` Claude'da. Coder Notu'na "Skill / nerede kullanıldı" tablosu ekle.
- `tdd-workflow`, `better-accessibility`.

## İstenen
1. **Tek başlık + tek satır açıklama:** "Toptan teklif isteyin" (h2) ve altında tek satır "Sofralık zeytin, salamura zeytin ve zeytinyağı için miktar ve teslimat bilgisini yazın." İkinci başlık "Toptan talep formu" ve ayrı kapsam satırı kalkar.
2. **Bilgi notu kısalır:** "Toptan iletişim bilgileri yakında paylaşılacak. Bilgileriniz gönderilmez." doğru bilgi olduğu için kalır ama tek satır küçük not olarak formun **altına**, Gönder düğmesinin yanına/altına iner.
3. **İpuçları kısalır:** alan altı ipucu metinleri kalkar. Zorunluluk etikette "*" ile, sınırlar `placeholder`/`aria-describedby` ile verilir ("En az 10 karakter"). Hata mesajları aynen kalır (yalnız hata olunca görünür).
4. **Düzen (masaüstü ≥ 768):** diyalog genişliği 640–720px. Satır 1: İsim/firma (tam). Satır 2: E-posta | Telefon (yan yana). Satır 3: Talep mesajı, 3 satır (`rows=3`, otomatik büyüme en çok 6 satır). Satır 4: KVKK onayı (etiket tamamı tıklanabilir, ≥ 44px). Satır 5: Gönder (altın, sağda) + not. **1366×768 ve 1440×900'de tüm form kaydırmadan görünür**; diyalog `max-height: calc(100dvh - 48px)`, taşarsa yalnız iç alan kayar.
5. **Mobil sürüm (< 768):** diyalog yerine **alttan açılan tam yükseklik sayfa** (shadcn Drawer/Sheet): üstte başlık + kapat (≥ 44px), alanlar tek kolon (E-posta ve Telefon alt alta), alan yüksekliği ≥ 48px, `inputmode`/`autocomplete` doğru (`email`, `tel`, `name`/`organization`). Gönder düğmesi alt kenarda **yapışık** (safe-area dahil), klavye açıkken görünür kalır. 390×844 (iPhone 14) ve 375×667 (iPhone SE)'de başlıktan Gönder'e kadar her şey tek ekranda; SE'de yalnız mesaj alanı küçülür.
6. Erişilebilirlik: odak ilk alana gider, Esc/arka plan kapatır, kapanınca odak tetikleyici düğmeye döner, `aria-describedby` hata/sınır bağlar. Reduced-motion'da animasyon yok.
7. Telefonda sabit "Sepete ekle" çubuğu (121) form açıkken gizli kalır.

## Kabul kriterleri
- [ ] Formda tek başlık; "Toptan talep formu" metni yok (unit).
- [ ] Alan altı ipucu metinleri yok; hata metinleri korunur (unit).
- [ ] < 768'de Drawer/Sheet, ≥ 768'de Dialog render edilir (unit, matchMedia mock).
- [ ] Mobilde Gönder düğmesi yapışık alt çubukta (unit: sınıf/yapı).
- [ ] E2E (yaz, çalıştırma) `tests/e2e/wholesale-form-124.spec.ts`: 1366×768, 1440×900, 390×844, 375×667'de formun ilk alanı ve Gönder düğmesi aynı anda görünür (kaydırmasız); dokunma hedefleri ≥ 44px.
- [ ] `npm test`, lint, typecheck, build yeşil; 118–123 testleri korunur.
- [ ] Tarayıcı doğrulaması Claude'da (iPhone + Pixel + masaüstü).

## Yapılmaması gerekenler
- Gönderim/API/e-posta ekleme; iletişim bilgisi uydurma.
- Doğrulama kurallarını gevşetme.
- `docs/` değiştirme (yalnız Coder Notu/Durum).

## Durum: BEKLİYOR
