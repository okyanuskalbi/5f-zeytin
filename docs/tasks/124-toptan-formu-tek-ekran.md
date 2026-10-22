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

## Coder Notu

22 Ekim 2026 — uygulama ve komut doğrulamaları tamamlandı.

- Tek `h2` ve istenen açıklama kullanıldı; ikinci başlık, ayrı kapsam satırı ve görünür alan ipuçları kaldırıldı. Sınırlar ekran okuyucuya bağlı açıklamalarda ve placeholder'larda; mevcut hata metinleri ve doğrulama sözleşmesi korundu.
- Masaüstünde 720px Dialog, 768px altında tam yükseklik Sheet kullanılıyor. shadcn Sheet, projenin token uygulanmış ortak Radix Dialog temeline uyarlandı; eşik geçişinde form yeniden mount edilmez, yazılan değerler ve odak korunur.
- Mobil alanlar en az 48px; KVKK etiketi, bağlantı ve kapat düğmesi en az 44px. Gönder ve tek kullanılabilirlik notu, kayan fieldset'in dışında yapışık alt alanda. Safe-area ve `visualViewport` resize/scroll takibi klavye açılışını karşılıyor.
- Mesaj `rows=3`, otomatik büyüme en çok altı satır; SE boyunda yalnız mesajın asgari yüksekliği iki satıra iner. İlk alan odağı, Esc/arka plan/kapat ile kapanma, tetikleyiciye odak dönüşü, animasyonsuz reduced-motion ve gerçek Sheet açıkken mobil satın alma çubuğunun gizlenmesi unit testlerle doğrulandı.
- Gönderim bağımlılığı eklenmedi; mevcut pending/success/error davranışı ve gönderim yokken düğmenin devre dışı olması korundu.

### Skill / nerede kullanıldı

| Skill / araç | Nerede kullanıldı |
| --- | --- |
| `ui-ux-pro-max` | Mevcut yerel skill yüklendi; `compact mobile form responsive --domain ux` araması, mobil önce düzen, 48px alan ve 44px dokunma hedefleri. |
| `frontend-design` | Mevcut Fraunces/Figtree, ink/süt/altın tokenları ve tek başlık hiyerarşisi. |
| `better-layout` | 768px kolon geçişi, iç alanın kayması, sabit eylem alanı, safe-area ve SE mesaj yüksekliği. |
| `shadcn-ui` | Yerel skill yüklendi; resmi CLI `view sheet`, `docs dialog sheet`, `add sheet --yes`; Sheet ortak Dialog temeline ve proje tokenlarına uyarlandı. |
| 21st MCP | `contact form modal` ve `lead form` aramaları yapıldı; mevcut formun kaynak bileşeni `kevingirelli/Contact Form` (35258) bu oturumda MCP ile tekrar alındı. Footer içinde kalıcı durum bölgeleri ve iki kolonlu form düzeni uyarlandı. |
| `motion-framer` | Panelin alttan açılışı ve kapanışı, kapanış bitene kadar modalın korunması. |
| `motion-foundations`, `motion-patterns`, `motion-advanced` | Mevcut `motionTokens`, `useAnimate`, animasyon temizliği ve reduced-motion'da sıfır animasyon. |
| `tdd-workflow` | Önce başarısız davranış testleri, sonra uygulama; RED/GREEN kanıtı aşağıda. |
| `better-accessibility` | Native etiketler, `aria-modal`, hata/sınır bağlantıları, odak yönetimi, kalıcı canlı bölgeler ve dokunma hedefleri. |
| `responsiveness-check` | Tarayıcı kabulü kapsamında Claude doğrulayacak. |

### Komut kanıtı ve TDD

- İlk RED: yeni testler mevcut kodda çift başlığı, eksik mobil Sheet'i, yapışık alt alanı ve visualViewport eksiklerini gösterdi. RED checkpoint'i yalnız yerelde tutuldu; push öncesi GREEN ile tek final commit'te birleştirildi.
- Ek RED: `npm test -- tests/unit/wholesale-form-124.test.tsx -t 'two-line SE minimum'` → beklenen `66px`, mevcut `90px`. Otomatik büyüme ölçümü responsive CSS minimumundan başlatılarak düzeltildi.
- GREEN: Task 124 için 22 unit test; formun eski doğrulama/durum testleri ve 118–123 kapsamındaki mevcut regresyon testleri korunuyor.

| Komut | Sonuç |
| --- | --- |
| `npm test` | PASS — 33 dosya, 377 test; atlanan test yok. |
| `npm run lint` | PASS — sıfır uyarı. |
| `npm run typecheck` | PASS — E2E dosyaları dahil TypeScript doğrulandı. |
| `npm run build` | PASS — production build ve 16 sayfa tamamlandı. Ön build varlık kontrolleri: 18 görsel + 100 v3 çıktı PASS. |
| `git diff --check` | PASS. |

### Claude doğrulayacak

`tests/e2e/wholesale-form-124.spec.ts` yazıldı; 1366×768, 1440×900, 390×844 ve 375×667 için normal/reduced-motion toplam sekiz senaryo içeriyor: başlık/ilk alan/Gönder aynı anda görünür, iç kaydırma yok, dokunma hedefleri, kolon düzeni, mesajın altı satır sınırı, mobil satın alma çubuğu ve odak dönüşü. Eski E2E form seçicileri tek başlığa ve erişilebilir alan adlarına uyarlandı.

AGENTS.md gereği Playwright, Lighthouse, inspect veya ekran görüntüsü çalıştırılmadı. Gerçek iPhone/SE ve Pixel klavyesi açıkken alt çubuğun görünürlüğü, kaydırmasız sığma ve masaüstü görsel kabulü **Claude doğrulayacak**. Bu tarayıcı kriterleri dışındaki uygulama veya komut kapılarında açık engel yok.

## Durum: TAMAMLANDI
