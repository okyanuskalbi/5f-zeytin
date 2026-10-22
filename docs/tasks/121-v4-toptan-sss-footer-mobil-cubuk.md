# Task 121: v4 — toptan + SSS bölümü, footer uyarlaması, telefon sabit satın alma çubuğu

## Tür
frontend

## Amaç
Prova D'nin son bölümleri: iki kolonlu "Toptan + Sık sorulanlar", koyu footer (117'deki düzen korunur, renk v4) ve telefonda hero geçildikten sonra çıkan sabit alt çubuk. Sözleşme: `docs/DESIGN.md`, prova `d.html` (`.alt`, `footer`, `.bar`), kareler `mock-d-masa-05..06.png`, `mock-d-tel-06..07.png`.

## Kullanılacak araçlar
- **Kullanıcı isteği (22 Eki), hepsini fiilen yükle:** `ui-ux-pro-max` (genel yön: "Trust & Authority" + dönüşüm kalıbı), `frontend-design` (renk, yazı tipi, düzen), `motion-framer` (Framer Motion animasyonları), `shadcn-ui` (bileşen gerekirse; resmi CLI, proje token'larına uyarlanmış), 21st MCP (bileşen arama/üretme, uyarla). Coder Notu'na "Skill / nerede kullanıldı" tablosu ekle.
- **Kullanıcı isteği (22 Eki), yerleşim:** `ui-ux-pro-max` §5 "Layout \& Responsive" (mobil-first kırılımlar, yatay kaydırma yok, dokunma hedefi ≥ 44px) ve `better-layout` (yerleşim düzeltmeleri) fiilen yüklenir. `responsiveness-check` (320/375/390/430/768/1024/1440 genişlik kontrolü) tarayıcı testidir; Claude çalıştırır, sen kodu bu genişliklere göre yaz.
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

## Coder Notu

### Uygulama
- `WholesaleFaq` iki kolonu birleştirir; `#toptan-iletisim` ve `#sik-sorulanlar` korunur. `WholesaleOffer`, mevcut shadcn/Radix dialog içinde mevcut `WholesaleForm`u açar. Telefon/WhatsApp/e-posta yalnız yapılandırılmışsa gösterilir. Mevcut formda `submitRequest` bulunmadığından gerçek gönderim kapalı ve bu bilgi formda görünür; servis bağlamak bu frontend görevinin dışında.
- Mevcut üç teyitli SSS cevabı değiştirilmedi. Native `details/summary`, eşzamanlı expanded durumu, altın +/– ve görünür odak halkası korunur. Footer'ın dört kolonu, satıcı bilgisi, yasal bağlantıları ve tek önizleme notu korunur; dört ödeme logosu açık plaka üstündedir.
- `MobileBuyBar`, katalogdaki 10 kg ürünü ve fiyatını kullanır; ortak `AddToCart` ile sepete ekler ve `Eklendi ✓` bildirir. ≤900px, strict %80 eşik ve hero'nun çıkması birlikte aranır. Çekmece, portal/native dialog ve footer son 120px koşulları gizler. Gizli çubuk `aria-hidden` ve `inert` alır; reduced-motion modunda kayma kaldırılır. Ölçülen yüksekliği + safe area kadar alt boşluk ve scroll padding ayrılır; viewport-fit=cover eklendi.
- Ana sayfadaki eski MiniCart, yeni çubukla çakışmaması için bu rotada kaldırıldı; iç sayfalardaki davranışı korunur ve unit testle doğrulandı. Sepet/ödeme iş mantığı değiştirilmedi.

### Skill / nerede kullanıldı
| Skill / araç | Nerede kullanıldı |
|---|---|
| `ui-ux-pro-max` | `trust-authority-conversion` landing kalıbı yerel aramada doğrulandı; gerçek satıcı/ödeme bilgisi ve teklif CTA'sı. §5 Layout & Responsive: mobil-first tek kolon, 901px iki kolon, minmax(0,1fr), ≥44px hedef, sabit çubuk rezervi. Onaylı v4 renkleri ve fontları korundu. |
| `frontend-design` | Prova D `.alt`, footer ve `.bar` ölçüleri; Fraunces/Figtree, ink/altın/süt hiyerarşisi. |
| `motion-framer` | Mobil çubuğun state tabanlı `motion/react` translate/opacity geçişi. |
| `shadcn-ui` | `npm_config_cache="$PWD/.cache/npm" npx shadcn@latest docs dialog` çalıştırıldı; mevcut dialog, Button ve form alanları tokenlara uyarlandı; yeni bağımlılık gerekmedi. |
| 21st MCP | Bileşen araması üç sorguyla denendi; yeni kaynak alınamadı. Mevcut 117 footer ve 081 formunun önceki 21st uyarlamaları ile projedeki shadcn dialog yeniden kullanıldı. |
| `better-layout` | DOM sırası, taşmayan kolonlar, butonların kenar payı, değişken yükseklik ve safe area rezervi; 320/375/390/430/768/1024/1440 için kod ve e2e senaryoları. |
| `frontend-patterns` | Sunucu wrapper + küçük client dialog/çubuk; ortak sepet bileşeni yeniden kullanımı. |
| `tdd-workflow` | Testler önce yazıldı ve RED görüldü; uygulama sonrası aynı testler GREEN, tam unit suite ve coverage çalıştırıldı. |
| `motion-foundations`, `motion-patterns`, `motion-advanced` | Mevcut `motionTokens.duration.landing` (0,35s), reduced-motion, SSR'de gizli başlangıç, listener/observer temizliği. |
| `impeccable` | Context ve craft-floor yüklendi; tamamlanan UI için mekanik `detect --json` sonucu `[]`. Onaylı prova korundu; görsel inceleme Claude'a bırakıldı. |
| `better-accessibility` | Native disclosure, Radix odak yönetimi/Escape, dialog'dan tetikleyiciye odak dönüşü, hidden+inert çubuk ve kalıcı canlı bildirim alanları. |

### Komutla doğrulama
| Kontrol | Sonuç |
|---|---|
| RED: `npm test -- tests/unit/faq-contact-footer.test.tsx tests/unit/mobile-buy-bar.test.tsx tests/unit/v3-foundation.test.tsx tests/unit/products-grid.test.tsx --maxWorkers=2` | Uygulamadan önce 4 dosya FAIL: yeni iki bileşen yoktu; bölüm sırası ve eski MiniCart beklentisi de yeni davranışı yakaladı. Yerel RED checkpoint'i `1c91881`; push öncesi son görev commit'inde birleştirildi. |
| GREEN: aynı hedefler + `tests/unit/v3-lower-sections.test.tsx` | 5 dosya, 47 test PASS. Anchor/form, üç disclosure, önizleme notunun tekliği, kart logoları alt metni; çubuk eşikleri/gizleme/ekleme/stok/reduced-motion ve iç sayfada MiniCart. |
| `npm test -- --maxWorkers=2` | 29 dosya, 334 test PASS. |
| `npm run lint` | PASS, sıfır uyarı. |
| `npm run typecheck` | PASS; güncellenen e2e dosyaları da TypeScript kapsamındadır. |
| `npm run build` | PASS; asset kontrolleri ve production build tamamlandı. |
| Hedefli v8 coverage | `faq-contact-footer`, `mobile-buy-bar`, `v3-lower-sections` testleri; include: `MobileBuyBar`, `WholesaleFaq`, `WholesaleOffer`, `Faq`, `FaqDisclosure`, `Footer`. 34 test PASS; satır/statement/fonksiyon %100, branch %97,77. |
| `git diff --check` | PASS. |

### İç sayfalar ve Claude kabulü
- Build sonrası yerel production sunucusunda `/sepet`, `/odeme`, `/hesabim`, `/siparis-takip`, `/kvkk`, `/mesafeli-satis`, `/iade`, `/giris` tek tek HTTP/HTML ile kontrol edildi: 8/8 HTTP 200, beklenen h1, Fraunces/Figtree CSS ve viewport-fit mevcut; landing çubuğu bu sayfalara taşınmıyor. `InnerPage`, `Membership`, `Tracking` ve `CartExperience` stil kaynakları elle incelendi; okunurluk için mevcut v4 semantik tokenları yeterli, ek iç sayfa değişikliği gerekmedi. Açılan production sunucusu kapatıldı.
- Kaynak renk çiftleri ayrıca hesaplandı: footer ana metin 9,20:1, alt satır 5,15:1; iç sayfa süt/zeytin 12,18:1, gri/zeytin-2 5,65:1. Bunlar kaynak renk ölçümüdür; tarayıcıda render edilmiş kontrast/görünürlük kabulü değildir.
- **Claude doğrulayacak:** iPhone 14/SE + Pixel 7 kaydırma şeridi, footer kart logolarının görsel okunurluğu, sekiz iç sayfanın render kontrolü, SSS'nin gerçek Enter/Space davranışı, 320/375/390/430/768/1024/1440 responsiveness-check. `faq-contact-footer.spec.ts` ve `process-faq-footer.spec.ts` güncellendi; Playwright, Lighthouse, inspect veya ekran görüntüsü çalıştırılmadı.
- Görev dosyasındaki mevcut skill ekleri korundu. Başlangıçta değişmiş olan 122 numaralı task dosyasına dokunulmadı ve commit'e alınmadı.

## Durum: TAMAMLANDI
