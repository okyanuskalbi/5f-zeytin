# Task 189: Renk düzeni ve okunabilirlik (C açık tema, site geneli)

## Tür
frontend

## Amaç
Kullanıcı isteği (10 Kasım 2026, "Tüm ürünler" penceresindeki "Kapat" düğmesini okla gösteren ekran görüntüsüyle: "renk sorunlarını çöz codex'e yaptır"): sitedeki renk ve okunabilirlik sorunları giderilir. Site, yeni C açık tasarımıyla tutarlı tek bir renk düzenine geçer; her yazı ve düğme okunur.

## Bağlam
- **188 tamamlanmış olmalı** (`/urunler` sayfası; "Tüm ürünler" penceresi kalktı). Bu görev aynı ağaçta 188'den sonra yürür.
- **Kök neden:** `app/globals.css` genel ayarları eski koyu temada kaldı: `color-scheme: dark`, `--background: var(--ink)`, `--foreground: var(--sut)` (koyu zemin, açık yazı). C tasarımı ise açık fildişi yüzeyler kullanıyor. Bu ayarları kullanan bileşenler (shadcn `Button` `outline`/`ghost`: `bg-background text-foreground`, `Dialog`, form alanları) açık sayfada koyu kutu gibi kalıyor. Bazı yerlerde yazı rengi elle koyuya çevrilmiş ve "koyu zemin üstünde koyu yazı" oluşmuş (ör. eski "Kapat": `ProductGroups.module.css` `.panelHeading button { color:#172B21 }`).
- `dark:` yardımcıları Tailwind 4'te varsayılan olarak işletim sisteminin koyu moduna bağlı. Sonuç: bilgisayarı koyu moddaki ziyaretçide renkler değişiyor. Kullanıcının ekranında "Kapat" koyu yeşil, açık modda siyah görünüyor.
- Canlı sitenin "önce" görüntüleri: `AFINA-KAYNAK/tasarim/uygulama-kontrol/189-once/` (`_ozet.png` toplu görünüm). Bu klasör git dışıdır; okumak için kullan, git'e ekleme.
- Görülen sorunlar:
  1. "Kapat" (pencere kalktı ama `outline` düğme her yerde aynı kökten etkileniyor): koyu zemin + koyu yazı.
  2. Ürün detay penceresi (`components/catalog/ProductDetail*`) tamamen koyu; açık sitede ayrı bir temadan gelmiş gibi duruyor (`01-urun-detayi.png`).
  3. `/siparis-takip` sayfasının zemini eski koyu tema (`08-siparis-takip.png`).
  4. "Mevcut değil" (stokta olmayan ürün, `AddToCart`) "Sepete ekle" ile aynı bej dolgu; tıklanabilir sanılıyor.
  5. Eski penceredeki koyu kaydırma çubuğu: `color-scheme: dark` yüzünden açık yüzeylerde tarayıcının kendi denetimleri (kaydırma çubuğu, açılır liste, otomatik doldurma zemini) koyu çıkıyor.
  6. Sepet özetindeki düğmeler ("Ödemeye geç", "Kuponu uygula") koyu yeşil zemin üstünde koyu yeşil; karşıtlık ölçülecek.

## Hedef renk düzeni
- **Genel varsayılan = C açık tema:** zemin fildişi (C sayfalarında kullanılan `#F7F4ED` / `#F5F1E7` ailesi), yazı koyu yeşil-mürekkep (`#172B21`), vurgu altın (`#88630B` düğme, `#B58933` çizgi), kenarlık `#D6D0C3` / `#B9AD88` ailesi. `color-scheme: light`. Shadcn ayarları (`--background`, `--foreground`, `--card`, `--popover`, `--muted`, `--accent`, `--border`, `--input`, `--ring`, `--primary`, `--secondary` ve `-foreground` eşleri) buna göre.
- **Bilerek koyu kalan yüzeyler (bugünkü görünümleri değişmez):** üst menü çubuğu, alt bilgi (footer), giriş/kayıt sayfasındaki koyu marka paneli, hero ve fotoğraflı kartların üstündeki koyu katmanlar, "Sepet özeti" kartı (`/sepet` ve sepet çekmecesi), **admin paneli (tamamı)**. Bu yüzeyler yerel bir koyu kapsam alır (ör. `data-surface="dark"` ya da sınıf): içinde koyu ayarlar ve `color-scheme: dark` geçerli olur.
- **Açığa geçenler:** ürün detay penceresi ("Tüm ürünler" kartlarıyla aynı dil: fildişi zemin, koyu yeşil yazı, altın vurgular, ince kenarlık), `/siparis-takip`, zemini hâlâ eski koyu tema olan diğer sayfalar (tüm rotaları kontrol et: `/iade`, `/kvkk`, `/mesafeli-satis`, `/odeme`, `/odeme-onizleme`, `/hesabim` giriş yapılmış görünümleri, `not-found`, `forbidden`, `unauthorized`).
- **İşletim sistemi koyu modu siteyi değiştirmez:** `dark:` varyantı `prefers-color-scheme` yerine koyu yüzey kapsamına bağlanır (`@custom-variant dark (...)`). Açık ve koyu modda sayfalar aynı görünür.
- **"Mevcut değil":** dolgu yok ya da soluk, ince kenarlık, `cursor: default`, hover yok; yazı yine okunur (≥ 4.5:1). "Sepete ekle" ile karıştırılmaz.
- Marka renkleri, logo, yazı tipleri, yerleşim ve boşluklar değişmez. Yalnız renk ve karşıtlık.

## Kullanılacak araçlar
- Fiilen yükle: `ui-ux-pro-max` (§1 erişilebilirlik: 4.5:1 karşıtlık; §6 renk: anlamsal renk ayarları), `better-colors`, `better-accessibility`, `frontend-design`, `responsiveness-check`.
- ECC skill: `frontend-patterns`, `tdd-workflow`, `e2e-testing`.
- Tailwind 4 `@custom-variant` ve shadcn tema ayarları için kurulu sürümün belgesini oku; tahmin etme.
- 21st MCP: hayır.
- **Codex alt ajanları (multi_agent):** (a) genel ayarlar + koyu kapsam, (b) ürün detay penceresi + "Mevcut değil", (c) sayfa sayfa tarama ve testler paralel; birleştirme ve son kontrol ana ajanda.

## Adımlar
1. Ayarları kullanan tüm yerlerin envanteri: `bg-background`, `text-foreground`, `bg-card`, `bg-popover`, `bg-muted`, `bg-accent`, `border-input`, `dark:` kullanımları, `var(--background)` vb. ve CSS modüllerindeki elle verilmiş açık/koyu yazı renkleri. Her biri hangi yüzeyde (açık/koyu) duruyor, not et (`output/task189-envanter.md`).
2. `app/globals.css`: genel varsayılanı C açık temaya çevir; koyu kapsamı tanımla; `dark:` varyantını koyu kapsama bağla.
3. Bilerek koyu kalan yüzeylere koyu kapsamı uygula. Görünümleri bugünküyle aynı kalmalı (önce/sonra görüntüsüyle kanıtla).
4. Ürün detay penceresini açık C diline geçir; "Mevcut değil" durumunu ayır; eski koyuya göre yazılmış elle renk düzeltmelerini temizle.
5. **Renk karşıtlığı testi (kalıcı):** `@axe-core/playwright` geliştirme bağımlılığı olarak eklenebilir (tam sürüm sabit, `package-lock.json` güncel, `npm ci` çalışır). `tests/e2e/` altında bir test, `npm run build && npm run start` ile açılan yerel sitede axe `color-contrast` kuralını şu durumlarda çalıştırır, **390 ve 1440** genişlikte, işletim sistemi **açık ve koyu** modunda (`emulateMedia({ colorScheme })`):
   - `/`, `/urunler`, `/bayilik` (boş gönderim hata durumu dahil), `/giris`, `/kayit`, `/hesabim` (girişsiz), `/sepet` (1 ürünle), `/siparis-takip`, `/kvkk`, `/iade`, `/mesafeli-satis`, bir 404 sayfası;
   - ürün detay penceresi açık (stokta olan ve "Mevcut değil" olan ürün), sepet çekmecesi açık (1 ürünle), telefon menüsü açık (390), teklif formu hata durumu (`/#toptan`).
   - Beklenen: **0 ihlal**. Ayrıca aynı durumların açık mod ve koyu mod ekran görüntüleri piksel olarak aynı ya da yalnız ihmal edilebilir fark (raporla).
6. Giriş yapılmış müşteri sayfaları (`/hesabim` siparişler, adresler, bilgiler) için 186'daki gibi yerel test veritabanı (`TEST_DATABASE_URL`, yerel Postgres) ile bir müşteri oluşturup aynı taramayı yap. Canlı Neon'a bağlanma. Kuramazsan nedenini Coder Notu'na yaz, bileşen testleriyle karşıtlığı doğrula.
7. Önce/sonra görüntüleri: `output/task189-sonra/` (390 ve 1440; ana sayfa, `/urunler`, ürün detayı, sepet çekmecesi, `/sepet`, `/giris`, `/siparis-takip`, `/bayilik` form hatası, telefon menüsü).

## Kabul kriterleri
- [x] e2e: axe `color-contrast` 0 ihlal (yukarıdaki tüm sayfa/durum × 390/1440 × açık/koyu mod). `npm run test:e2e -- <dosya>` ile çalışır.
- [x] Unit: "Mevcut değil" düğmesi devre dışı ve "Sepete ekle"den farklı sınıf/stil alır. Ürün detay penceresi açık yüzey sınıfını taşır. Koyu kapsam yalnız listelenen yüzeylerde var.
- [x] `app/globals.css` içinde `color-scheme: dark` yalnız koyu kapsamda. Genel `--background` açık renk. `dark:` işletim sistemi moduna bağlı değil.
- [x] Üst menü, alt bilgi, giriş paneli, "Sepet özeti" ve admin panelinin görünümü değişmedi (önce/sonra görüntüleri; admin için bileşen testi ya da yerel görüntü).
- [x] `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`, `git diff --check` yeşil.
- [ ] Tarayıcı doğrulaması Claude'da.

## Yapılmaması gerekenler
- Yerleşim, boşluk, yazı tipi, logo, marka rengi değiştirme; yeni görsel üretme.
- Admin panelinin görünümünü değiştirme (koyu kapsamda aynen kalır).
- Ödeme/sepet/üyelik mantığına, ürün verisine, fiyatlara dokunma.
- Canlı veritabanına bağlanma; ortam değişkeni değiştirme.
- `AFINA-KAYNAK/` git'e eklenmez (`git add -f` YASAK). `output/` kayıtları git'e girmez (mevcut kural neyse ona uy).
- **Push yok, production yayını yok.** Testler yeşilse tek kayıt (commit); gönderimi Claude kullanıcı onayıyla yapar.
- `docs/` altında yalnız bu dosyaya Coder Notu ve Durum.

## Coder Notu
- 10 Kasım 2026: Task188 `0009275` kaydından sonra aynı ağaçta yürütüldü. Üç Codex alt ajanı genel tema/koyu yüzeyler, ürün detayı/stok dışı durum ve envanter/test işlerini paylaştı; son birleştirme ve yerel doğrulama ana ajanda yapıldı.
- İstenen ui-ux-pro-max, better-colors, better-accessibility, frontend-design, responsiveness-check, frontend-patterns, tdd-workflow ve e2e-testing rehberleri fiilen okundu. Kurulu Tailwind 4.3.3 kaynağındaki custom-variant/default dark davranışı ile resmi Tailwind dark-mode ve shadcn theming belgeleri incelendi. Yeni UI bileşeni veya 21st kullanımı yok.
- RED: açık varsayılanlar/koyu kapsam için 6, ürün yüzeyi/stok dışı görünüm için 4 beklenen başarısız kontrol; müşteri hesap özetindeki beyaz üstüne beyaz hızlı bağlantıda ölçülen 1:1 karşıtlık görüldü. GREEN: açık semantik çiftler, yerel koyu kapsam, gerçek kurulu Tailwind derleyicisiyle işletim sistemi medyası içermeyen dark yardımcıları, ürün detayı/stok dışı durum ve müşteri bileşenleri geçti. Eski ürün görseli/tema testlerinin renk beklentileri güncellendi; geometri ve mevcut kontroller korunuyor.
- Genel varsayılan C açık tema oldu. Ürün detayı açık yüzey/altın vurgu kullanır; stokta olmayan düğme ayrı soluk sınıf ve kenarlık alır, native disabled kalır, hover ve Motion tepkisi yoktur. Gerçek Chromium ölçümünde 390/1440 genişlikte yazı `rgb(79,89,75)` / zemin `rgb(232,227,215)` = 5,728:1; cursor default, opacity 1.
- Görev metnindeki admin varsayımı kaynakla uyuşmuyor: panel zaten kendi AÇIK temasını kullanıyor. "Görünümü değiştirme" şartı öncelendi; panel koyuya zorlanmadı. `data-surface="admin"` ile mevcut açık yerel renkler ve önceden genel temadan devraldığı ikincil/hata renkleri korundu. Ana kabuk ve portal için bileşen testi var.
- Yerel kapılar: lint, typecheck, `npm run test -- --maxWorkers=2 --testTimeout=15000` = 137 dosya / 1359 PASS; mevcut 6 dosya / 26 yerel Postgres testi atlandı. Varlık kontrolü ve Next 16.4.2 Turbopack production derlemesi PASS; `git diff --check` PASS. Eski 5 saniyelik varlık testi sınırının yoğun koşuda aşılması nedeniyle son tam koşuda 15 saniyelik test süresi kullanıldı; kalıcı genel süre/test ayarı değiştirilmedi.
- `@axe-core/playwright` geliştirme bağımlılığı tam `4.14.0` sürümüne sabitlendi. `npm ci --ignore-scripts --no-audit --no-fund` 591 paketle başarılı; kilit dosyasındaki mevcut platformlar arası optional kayıtlar korundu. Yeni üretim bağımlılığı yok.
- Kalıcı yerel tarayıcı testi: `npm run test:e2e -- color-contrast-189.spec.ts --config output/tmp/playwright189.config.ts --project=chromium-390 --workers=1` = 39/39 PASS; 390/1440 genişlikte 78 açık/koyu mod taraması, axe color-contrast ihlali 0. Tüm 39 görüntü çiftinde değişen piksel oranı TAM 0. Yerel HTTP durumları, gerçek ürün pencereleri, 1 ürünlü sepet/çekmece, telefon menüsü, teklif ve bayilik hata durumları dahildir. Aynı kalıcı dosya standart `playwright.config.ts` ile de `npm run test:e2e -- color-contrast-189.spec.ts --project=chromium-390 --workers=1` olarak çalışır. Bu koşuda uzak bağlantıları engellenmiş mevcut yerel sunucuyu kullanmak için geçici ayar dosyası kullanıldı; geçici dosyalar teslim sonrasında temizlendi.
- Otomatik ölçümün sınırı gizlenmedi: axe'nin kesin karar veremediği öğeler 34 ölçümün ayrıntılı `incomplete` kayıtlarında hedef/sebep bilgisiyle tutuldu. Özellikle görüntü arkasındaki renklerin tümü için elle WCAG kabulü yapıldığı iddia edilmez; Claude görsel incelemesi ayrı bekler. Toplu sonuç `output/task189/contrast-summary.json`, görüntüler ve tekil ölçüm raporları `output/task189-sonra/` içindedir.
- Envanter: git dışı `output/task189-envanter.md`. Önce/sonra ve koyu yüzey karşılaştırmaları `output/task189-once/`, `output/task189-preservation/`, `output/task189-sonra/`; komut kayıtları `output/task189/` altındadır. Menü iki genişlikte, masaüstü footer, giriş marka bölgesi ve masaüstü sepet özeti piksel olarak aynı. Mobil footer farkı tek alt sınır piksel satırında; içerik rengi değişmedi. Mobil sepet özetinin kendi alanı aynı; yalnız sabit ödeme çubuğunun önceden silik düğme yazısı okunur hale geldi (923–971. satırlar, özetin kalanında değişen piksel 0).
- Canlı bağlantılar engellenerek yerel sunucu/derleme çalıştırıldı. Ortam dosyaları veya ayarları değiştirilmedi; canlı Neon/Supabase, ödeme veya müşteri verisi kullanılmadı. `TEST_DATABASE_URL` tanımlı değil; ortam değiştirme yasağı altında yerel müşteri/veritabanı oluşturulmadı. Bu nedenle giriş yapılmış müşteri için VERİTABANLI tarayıcı taraması yapılmadı. Görevin izin verdiği yedek kontrol olarak gerçek orders/addresses/profile/summary bileşenleri yerel veriyle ve kaynak CSS renk çiftlerinden hesaplanan karşıtlıkla 4 testte doğrulandı. Bu, gerçek oturum/veritabanı kabulü değildir.
- Ödeme önizlemesi mevcut ayarlar değiştirilmeden kapalı durumuyla kontrol edilir; gerçek ödeme akışı açılmadı. Yetki hata bileşenleri ve diğer sayfalar ortak açık EmptyState/semantik renkleri kullanır. Ürün bilgileri/fiyat/stok, auth/sepet/ödeme davranışı, ölçüler/font/logo düzeni değiştirilmedi.
- Ayrı karşılanmayan kabul: Claude'da tarayıcı doğrulaması yapılmadı; ilgili kutu açık tutuldu. TAMAMLANDI yerel kod/test teslimini belirtir; Claude incelemesi, fiziksel cihaz, gerçek oturum/veritabanı ya da yayın kabulü değildir.
- Push, production/Vercel yayını ve ortam değişikliği yapılmadı. AFINA-KAYNAK ve output git'e eklenmedi.

## Durum: TAMAMLANDI
