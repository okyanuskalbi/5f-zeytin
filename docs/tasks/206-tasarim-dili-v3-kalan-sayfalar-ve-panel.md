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

## Durum: BEKLİYOR (205 sonrası)
