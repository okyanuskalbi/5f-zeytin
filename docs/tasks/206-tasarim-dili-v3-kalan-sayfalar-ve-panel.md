# Task 206: Tasarım dili v3 — kalan sayfalar + yönetim paneli

> Sözleşme: `docs/DESIGN.md` (v3) + `docs/MASTER-PROMPT.md` (v2.0). Parçalar: 204 "Arayüzler".

## Tür
frontend

## Bağımlılık
205 TAMAMLANDI.

## Amaç
Kalan bütün sayfaları v3 diline geçirmek: `/hakkimizda`, `/toptan-satis` (+ `?teklif=`), `/bayilik`, `/blog`, `/blog/[slug]`, `/giris`, `/kayit`, `/hesabim/*`, `/siparis-takip`, `/iade`, `/kvkk`, `/mesafeli-satis`, 404, `/admin`, `/admin/urunler`.

## Genel kısıtlar
204 "Genel kısıtlar" aynen. Ek: form gönderim mantığı, doğrulama, il/ilçe araması, telefon alanı yükleyicisi (`DeferredPhoneField`) ve yetki kontrolleri değişmez. Yerel test DB: `TEST_DATABASE_URL` (`afina_kontrol189`), sunucu `output/task201/run-clean.mjs`.

## Adımlar (her biri: test yaz → FAIL gör → uygula → PASS; test dosyası `tests/unit/storefront-pages-206.test.tsx`)
1. **Hakkımızda:** ana görsel kemer (`--sf-radius-arch`), `SectionHeading as="h1"`, `Stamp` (bu sayfadaki tek mühür), kayan şerit koyu yeşil bantta Cormorant fildişi + "Şeridi duraklat" hap düğme (şerit kuralları §8), süreç maddeleri madalyonlu, SSS akordeonu köşe 12.
2. **Toptan + Bayilik:** giriş bölümü fotoğraflı/adaçayı bant (düz boş başlık yok); form alanları DESIGN.md "Formlar"; gönder `primary` tam genişlik (telefon); iki seçenekli alanlar hap anahtar; `?teklif=<id>` ön seçimi çalışır (mevcut testler PASS).
3. **Blog + yazı:** liste 1 büyük + küçük kartlar; yazı sayfası başlık Cormorant 44–56 px, gövde Montserrat 17 px / 1,7, satır ≤ 68 karakter, içindekiler hapları, SSS akordeonu; AEO yapısı ve JSON-LD (201) değişmez.
4. **Giriş, kayıt, hesap, sipariş takibi:** tek sütun kâğıt panel köşe 24; sekme (Giriş yap / Hesap oluştur) hap anahtar; şifre göster/gizle alan içinde; hesap menüsü hap bağlantılar (etkin yeşil dolgu); sipariş durumu `Tag`.
5. **Yasal sayfalar + 404:** uzun metin düzeni (≤ 68 karakter, içindekiler); 404'te `OliveBranch` + `primary` "Ana sayfa" + `outline` "Ürünler".
6. **Yönetim paneli:** aynı tokenlar; düğmeler hap `icon="none"`; tablo satırı 52 px; Cormorant yalnız sayfa başlığında; yetki/API değişmez (girişsiz `/admin` 401).
7. **Eski sınıfların temizliği:** `rg` ile artık kullanılmayan CSS modül sınıfları ve tokenlar silinir; liste Coder Notu'na.
8. **Kapılar:** lint, typecheck, test, build, `git diff --check`; `scripts/qa-design-v3.mjs` bütün 38 rota × 320, 390 (WebKit), 768, 1440 + girişli sayfalar: 204 Adım 9 ölçümleri; akışlar: teklif formu (WebKit'te telefon alanı **görünür alana kaydırıldıktan sonra** düzenlenebilir), giriş → hesabım, menü 12 bağlantı.

## Denetimde özellikle bakılacaklar
1. Form hata durumunda alan + mesaj + hap düğme 320 px'te taşmaz. 2. Kısa ekranda (390×500) klavye açıkken gönder düğmesi görünür. 3. Uzun e-posta/adres hesap panelinde kırılır, taşmaz. 4. Kayan şerit azaltılmış harekette durağan ve okunur. 5. Panelde 6 ürün + uzun ürün adıyla tablo telefonda yatay taşma üretmez.

## Kabul
Adım 8 PASS; `output/task206/{KANIT.md,ekran/}`; §14.1 (v2.0) 12 madde her sayfada PASS; korunan klasör diff'i boş (`lib/auth`, `lib/db`, `lib/cart`, `lib/checkout`, `lib/payments`, `lib/orders`, `app/api`). Tek kayıt: `feat: 206 tasarım dili v3 kalan sayfalar ve panel`. Son satır: `206 BİTTİ`.

## Coder Notu (fable)

Uygulama 12 Kasım 2026'da tamamlandı. Kanıt ve sayılar: `output/task206/KANIT.md`; ekran görüntüleri `output/task206/ekran/`.

**Araçlar:** `ui-ux-pro-max`, `frontend-design`, `better-typography`, `better-colors`, `better-layout`, `motion-framer`, `responsiveness-check`, `audit-ai-design-slop` ve panel için `shadcn-ui` Skill aracıyla çağrıldı; panelde resmi araç `npx shadcn@latest docs table` çalıştırıldı (`output/task206/shadcn-cli.log`). 21st'ten yeni bileşen alınmadı: 204 parçaları yetti. Yeni paket yok, yeni görsel yok.

**Yeni ortak parça:** `components/storefront/ui/PageBand.tsx` (`PagePath` içerik yolu + `PageBand` adaçayı başlık bandı; fotoğraflı ya da zeytin dallı). DESIGN.md "İç sayfa başlığı" tarifinin tek karşılığı; Toptan, Bayilik, Blog, yasal sayfalar ve sipariş takibi bunu kullanıyor. `SectionHeading` isteğe bağlı `id` aldı (bölüm `aria-labelledby` ile adlandırılabilsin diye).

**Adımlar:**
1. Hakkımızda: `SectionHeading as="h1"`, fabrika fotoğrafı kemer (`--sf-radius-arch`), sayfanın tek mührü fotoğrafın köşesinde, şerit yeşil bantta Cormorant fildişi + hap "Şeridi duraklat", süreç ve değerler madalyonlu, SSS satırları köşe 12.
2. Toptan + Bayilik: `PageBand` (Toptan'da depo fotoğrafı, Bayilik'te zeytin dalı), alanlar 52 px / köşe 12 / 1 px çizgi, gönder `primary` tam genişlik. Ortak alan stilleri (`contact-fields.css`, `phone-country-search.css`, `quote-product-picker`) aynı ölçülere çekildi.
3. Blog: 1 büyük (yatay) + 3 küçük kart, kartta okuma süresi; yazıda başlık 44–56 px, gövde 17 px / 1,7, 68 karakter, içindekiler hapları (bölüm başlıklarına `bolum-N` kimliği), SSS köşe 12. JSON-LD ve AEO yapısı aynı.
4. Giriş, kayıt, hesap, sipariş takibi: kâğıt panel, sekmeler hap anahtar (`ui.switch`; sayfada bağlantı, pencerede düğme), gönder `primary` tam genişlik, hesap menüsü hap bağlantı, sipariş durumu `Tag`, bütün düğmeler `PillButton`.
5. Yasal sayfalar + 404: `PageBand` + 68 karakter sütun + içindekiler hapları; 404'te zeytin dalı, `primary` "Ana sayfa", `outline` "Ürünler". `EmptyState` (401/403 sayfaları) aynı düzende.
6. Panel: düğmeler `PillButton icon="none"`, tablo satırı 52 px, Cormorant yalnız `h1`; dar panelde ürün listesi etiketli karta, sütun başlıkları sıralama haplarına dönüşüyor.
7. Silinen sınıflar: aşağıda.
8. Kapılar: `KANIT.md`.

**Adım 7, silinen CSS sınıfları** (başvuru kalmadığı taramayla doğrulandı; tam liste `output/task206/silinen-siniflar.txt`): `AboutPage` breadcrumb, factoryPhoto, goldButton · `DealershipPage` actions, darkGoldButton, heroContent, heroCopy, icon, outlineButton · `Blog` breadcrumb, intro · `toptan-satis/page` breadcrumb, container, heading · `QuoteComposer` emailAction · `DealershipForm` submit · `Membership` alternateSignIn, formSide, separator, split, story · `AccountSummary` profile, shell, title · `AccountSurface` addressHead, addresses, status · `Tracking` current, marker, steps · `InnerPage` drawer*, empty, legal, legalNav, line, previewCard, receipt, scopeTitle, seller, statePaper, textLink · `AdminShell` primaryLink · `Products` tableHint · `quote-product-picker` done. Token silinmedi (eski `--sf-radius-*` tokenları 204'te kalkmıştı); bu dosyalardaki ham `border-radius: 0` ve `50%` değerleri tablo tokenlarına çevrildi.

**Uyarlanan eski beklentiler (davranış silinmedi):**
- `tests/unit/dealership-page.test.tsx`: giriş bölümünün zemini `.hero` fildişi yerine ortak adaçayı bant; "açık zemin, fotoğraf ve koyu katman yok" beklentisi duruyor.
- `tests/unit/device-audit-181.test.ts`: açılır alan yüksekliği 48 px yerine 52 px (DESIGN.md Formlar).
- `tests/unit/interior-pages.test.tsx`: 404'te ürünler bağlantısının adı "Ürünler" (bu görevin 5. adımı).
- `tests/e2e/admin-products.spec.ts`: "telefonda tablo sağa kaydırılır" beklentisi yerine "liste yana kaymaz, her değer sütun adını taşır, dört sıralama düğmesi görünür"; bölge adı "Ürün tablosu".

**Sapmalar ve kararlar:**
1. Panel ürün listesi yalnız telefonda değil, panel 928 px'ten dar olduğunda (telefon, tablet, kenar çubuklu 1024) kart düzenine geçiyor (kapsayıcı sorgusu). "Tüm sütunları görmek için tabloyu yana kaydırabilirsiniz" cümlesi kaldırıldı (artık doğru değil); tablo parçalarına açık `role` eklendi (görünüm CSS'te değişirken tablo anlamı kaybolmasın).
2. Toptan ve Bayilik formlarında iki seçenekli alan yok; hap anahtara çevrilecek alan çıkmadı (İşletme türü üç ve daha çok seçenekli, açılır liste kaldı).
3. Bayilik girişinde fotoğraf yok, adaçayı bant + zeytin dalı var (mevcut "girişte fotoğraf yok" testi korundu; fotoğraf alttaki ambalaj bölümünde).
4. Toptan ve Bayilik gönder düğmeleri sayfa etkileşime hazır olduğunda yeniden bağlanıyor (`key`): hazır değilken görünen pasif hâlden etkin hâle renk geçişi oynamasın diye. Form mantığı aynı.
5. 404 düğme adları görev metnindeki gibi "Ana sayfa" ve "Ürünler" (önceden "Ana sayfaya dön", "Ürünleri İnceleyin").
6. Blog liste kartlarında "Yazıyı oku" duruyor (mevcut test), yanına okuma süresi eklendi.
7. Ölçüm ayrı dosyada: `scripts/qa-design-v3-pages.mjs`, `qa-design-v3.mjs` üçüncü parametre `pages` ile çağırıyor (205'teki `shop` deseni). `shop` kapsamına iki kategori eklendi ki 38 rota tamamlansın. `tests/helpers/storefront-local-auth.mjs` adresi ortam değişkeniyle alabiliyor (yalnız `https://localhost:<port>`).
8. Google giriş düğmesinde yalnız köşe hap oldu; renkleri Google'ın marka kuralındaki gibi bırakıldı (düğme şu an yapılandırılmadığı için görünmüyor).
9. Ortak `PillButton.module.css`'e tek kural eklendi (`quiet` düğme pasifken dolgu almaz). Adres silme onay penceresi kâğıt panele çekildi. Ortak telefon ve adres alanlarında yer tutucu yazı karşıtlığı 3,07:1'den 6,44:1'e çıkarıldı (§14.1 madde 11).

**Yapılmayanlar:** panel özet kartlarına veri bağlama (kapsam dışı) · gerçek cihaz ve Firefox (207) · ayrıntılar `KANIT.md` "Ölçülemeyen / çalıştırılmayan".

## Durum: TAMAMLANDI
