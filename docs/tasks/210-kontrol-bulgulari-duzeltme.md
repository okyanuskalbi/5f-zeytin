# 210 Cihaz kontrolü bulgularının düzeltilmesi (F1–F4) + gerçek telefon çubukları

Kaynak: `output/task207-1/RAPOR.md` (Codex canlı cihaz kontrolü, 13 Kas) + 209 raporu (`output/task209/KANIT.md`). Kullanıcı: "kendin gör düzenle işte, codex ile". Kararlar (Claude): F1–F4 düzeltilir; F5 (açılış görseli keskinliği) YAPILMAZ (video da 720 piksel, yalnız poster keskinleşirse video başlarken sıçrama olur; ayrı medya işi); Tesisimiz fotoğrafları telefonda alçaltılır (gerçek tarayıcı çubuklarıyla bir ekrana sığsın).

## Çıkış noktası
Çalışma kopyası = yerel main `97ba510` (görev 209 kaydı; GitHub'a ve canlıya HENÜZ gitmedi). `https://localhost:3024` ön izleme bu derlemeyi gösterir. Bu görev **kod yazma görevidir**; yazar sensin (Codex). Denetimi ve kaydı Claude yapar.

## Yapılacaklar

### F1 (Yüksek) Düğmelerde görünen yazı ile erişilebilir ad uyuşmuyor
- Ürün seçici düğmesi (teklif formu): görünen "Ürünleri seçin" (seçim yapılınca "1 ürün, 2 adet"), erişilebilir ad "İlgilendiğiniz ürünler". Telefonda ülke kodu düğmesi: görünen "TR +90", ad "Telefon ülke kodu: +90 · Türkiye". axe kuralı `label-content-name-mismatch`.
- Kural (WCAG 2.5.3): görünen yazı erişilebilir adın içinde, aynen ve mümkünse başta yer alsın; seçim değişince ad da güncel kalsın. Yeni düğme tasarlama; görünüm değişmesin.
- Yer: `components/storefront/quote/QuoteProductTrigger.tsx`, `components/ui/phone-country-search.tsx`, gerekirse `DeferredPhoneField.tsx`. **Form mantığı, doğrulama, gönderim, fiyat/sepet davranışı değişmez**; yalnız adlandırma.
- Doğrulama: axe tam kural taraması (ana sayfa Toptan formu, hem 390 hem 1440 px, hem satır içi hem telefon penceresi açıkken, ürün seçili/seçilmemiş) → `label-content-name-mismatch` 0. Eski adı yazan testleri güncelle ve raporla.

### F2 (Orta) 320 px'te açılış videosunun açık karelerinde başlık okunmuyor
- Ana sayfa açılışı, 320×568, video ~5,5. sn: başlık harfi içi piksellerinde en düşük kontrast 1,21:1; 121 px 3:1'in, 303 px 4,5:1'in altında.
- Onaylı filmi değiştirme. Yalnız dar/kısa telefonda (≤ 359 px genişlik ya da kısa ekran) başlığın arkasındaki karartmayı genişlet/koyulaştır veya metni daha koyu bölgeye al. **≥ 360 px'te açılış görünümü piksel piksel aynı kalmalı** (390, 430, 768, 1024, 1440 için "önce/sonra" fark 0; poster ya da duran görüntü ile).
- Yer: `components/storefront/StoreHome.module.css` (açılış metni/karartma), `HeroVideo.tsx` yalnız gerekiyorsa.
- Doğrulama: 320×568, 360×740, 390×844, 1440×900'de videonun en az 14 karesi (5,5. sn dahil, azaltılmış hareketsiz değil, gerçek video karesi; Playwright ile `currentTime` ayarlayıp ekran görüntüsü) ve başlık harf içi pikselleri; hedef: tüm örneklerde başlık için en az 3:1, mümkünse 4,5:1; kullandığın yöntemi raporla.

### F3 (Orta) Dar ekranda "Sepete ekle" yazısı sepet simgesine biniyor
- Ürün sayfalarında alttaki "ilgili ürünler" kartları, 360 ve 375 px (360'ta kesişme 10,33 px, 375'te 2,83 px). Ana sayfada 360 px'te yazı alanı 4,33 px aşıyor (binmiyor ama daralıyor).
- Çözüm yazıyı küçültmek OLMASIN: kart genişliği, madalyon/yazı aralığı, gerekirse dar aralıkta tek sütun (`.relatedGrid`), ya da düğme düzeni. 
- Yer: `components/storefront/ProductDetail.module.css`, `ProductTile.module.css`, `StoreHome.module.css` kompakt kart ölçüleri, `ui/PillButton.module.css`.
- Doğrulama: 320, 360, 375, 390, 430, 768 px'te dört ürün sayfasının ilgili ürün kartları ve ana sayfa raf kartları: yazı kutusu ile simge kutusu kesişmez, yazı kendi kutusunu aşmaz (ölç, tablo olarak raporla). ≥ 768 ve masaüstünde görünüm piksel piksel aynı.

### F4 (Orta) Yazı iki katına çıkınca telefon sekmeleri/düğmeleri taşıyor
- Chromium, ana sayfa, 390 px, yazı 200%: "Tümü / Zeytinyağı / Zeytin" birbirine giriyor; satın alma ve talep hazırlama düğmelerinin yazısı kendi alanını aşıyor. 207-1 yöntemi: `output/task207-1/focused.json` → `zoom`, `extra.json` → `reflow` (yöntemi oku, aynısını yeniden kur).
- Çözüm: sabit yükseklik/genişlik yerine `min-height`, satır kırma, sütun sayısının uyarlanması; metin gizlenmesin. Normal yazı boyutunda görünüm **piksel piksel aynı** kalmalı.
- Yer: `components/storefront/StoreHome.module.css`, `components/storefront/ui/ui.module.css` (PillSwitch), `ui/PillButton.module.css`.
- Doğrulama: 390 ve 320 px'te yazı ×2: ürün sekmeleri, ürün kartı düğmeleri, Toptan/Bayilik kartı düğmeleri, alt bilgi başlıkları, form penceresi başlığı: metinler üst üste binmez, düğme metni kutusunu aşmaz (kutu ölçüleriyle raporla). Yatay taşma 0. Bu bir yazı büyütme benzetimidir; raporda öyle yaz.

### G (kullanıcı kararı) Gerçek telefon tarayıcı çubuklarıyla tek ekran
Gerçek tarayıcıda görünür alan daha kısa. Ölçü görünümleri: **390×664 (görünür sınır ≈ 599), 375×667 (≈ 602), 360×640 (≈ 575)** (sınır = görünür alan − üst menü).
- **Tesisimiz** (3 fotoğraf alt alta): telefonda kart oranını `2 / 1` yap (390 px'te üç kart ≈ 561 px); alt yazılar okunur kalsın (≥ 20 px, kontrast ≥ 4,5:1), konu kadrajda kalsın. Yalnız ≤ 767 px; ≥ 768 px piksel piksel aynı.
- **Hikâyemiz** bloğu 375×667'de sınırı 3 px aşıyor: bir miktar sıkılaştır (fotoğraf yüksekliği/boşluk) ki 390×664, 375×667, 360×640'ta sınır içinde kalsın; metin silinmez.
- Diğer bloklar (Ürünler, Toptan, Alt bilgi, Defter, SSS, İletişim, Hasat) bu üç görünümde sınır içinde mi ölç; aşan varsa raporla, bu görevde yalnız Tesisimiz ve Hikâyemiz'i düzelt. Hero aynen (kendi yüksekliğine göre uyum sağlar).

## Dokunulmaz
- `lib/auth`, `lib/db`, `lib/cart`, `lib/checkout`, `lib/payments`, `lib/orders`, `app/api`: hiçbir değişiklik yok. Form mantığı, fiyat, sepet, ödeme, doğrulama, yetki değişmez.
- 209'da kurulan yapı (iki kartlı Toptan & Bayilik + alttan pencere, tek form örneği, yatay ürün rafı, katlanır alt bilgi, `data-phone-screen` işaretleri) korunur; geri alma, yeniden yazma yok.
- Masaüstü/tablet (≥ 768) ve normal telefon görünümlerinde, yukarıda açıkça istenenler dışında hiçbir piksel değişmez.
- `.env*` okuma, sır yazdırma yok. `AFINA-KAYNAK/` ve `output/` git'e eklenmez (`git add -f` yasak).
- `node_modules` ve `.next` silinmez; `git stash/reset/clean` yok. Port 3497'ye dokunma. Branch/PR yok.
- **Commit YOK, push YOK, yayın YOK.** Kaydı Claude yapacak; dosyalar çalışma kopyasında kalsın. PDF/video hazırlanmaz.
- Görev dışına çıkma; F5 (açılış poster/video çözünürlüğü) ve medya üretimi YAPILMAZ.

## Sıra ve doğrulama
1. **ÖNCE, kod değiştirmeden:** "önce" görüntüleri: `node scripts/qa-shots-209.mjs https://localhost:3024 output/task210/once` (ana sayfa + 10 blok, 320/360/390/430/768/1024/1440), ayrıca dört ürün sayfası 320/360/375/390/768/1440 (kendi küçük betiğin; `scripts/` altına `qa-shots-210.mjs` olarak ekle). Ön izleme eski değilse (97ba510'dan farklıysa) önce `npm run build` ve sunucuyu yeniden başlat.
2. Düzeltmeleri yap (testle: önce başarısız, sonra geçen birim testler; erişilebilir ad testleri, kutu çakışma testleri mümkün olduğunca birim/DOM düzeyinde).
3. `npm run lint`, `npm run typecheck`, `npm test` geçmeli; ardından `npm run build` ve güvenli sunucu ile ön izlemeyi yeniden başlat: `TEST_DATABASE_URL=postgresql://localhost:5432/afina_kontrol189 node output/task201/run-clean.mjs --local-auth node output/task206/serve.mjs` (https://localhost:3024). İş bitince ön izleme AÇIK kalsın (önce `output/task206/stop.sh` ile 3024–3027'yi kapat).
4. "Sonra" görüntüleri (`output/task210/sonra/`) ve ölçümler: `node scripts/qa-screens-209.mjs ...` (gerekirse gerçek tarayıcı çubuklu görünümleri ekle); yatay taşma 0, konsol hatası 0, kırık görsel 0, dokunma hedefi ≥ 44 px.
5. **Değişmedi kanıtı:** "önce" ile "sonra" piksel karşılaştırması; fark yalnız yukarıda istenen yerlerde (Tesisimiz, Hikâyemiz telefon; hero ≤ 359 px; ilgili ürün kartları 360/375; F4 yalnız yazı 200% iken) olabilir. Başka her yerde fark 0 olmalı.
6. e2e: ana sayfa, ürün, sepet, teklif/bayilik formu belirtimleri (Chromium 390 + 1440). Taban: `output/task209/e2e-final-names.txt` (90 düşen); **yeni düşen 0**. Eski adlandırmayı (F1) bekleyen testleri güncelle ve listele.
7. Kısa rapor: `output/task210/KANIT.md` (sade Türkçe: her bulgu için ne yapıldı, ölçü önce → sonra, çalıştırılamayanlar). Bu görev dosyasının sonundaki durumu `## Durum: TAMAMLANDI` yap.

## Kullanılacak skill'ler
`better-accessibility` (varsa), `ui-ux-pro-max`, `design-taste-frontend`; mevcut `docs/DESIGN.md` kuralları.

## Teslim
Son mesajın sade Türkçe (jargonsuz): her bulgu için sonuç, ölçüler, hangi dosyalar değişti, çalıştırılan komutlar ve sonuçları, çalıştırılamayanlar, açık sorular.

## Coder Notu — 13 Kasım 2026

Kod uygulaması çalışma kopyasında bırakıldı. F1 adlandırma, F3 düğme çakışması,
F4 iki kat yazı ve G kısa telefon düzeni düzeltildi. F2 yalnız izin verilen
≤359 px aralığında düzeltildi: 14 video karesinde en düşük karşıtlık 7,37:1.
**F2 kabul sınırı açık:** 360/390/1440 px örneklerinde 3:1 altı noktalar da
ölçüldü; aynı genişliklerde piksel farkı 0 şartını korumak için bunlara
karartma eklenmedi. Dolayısıyla bütün genişliklerde karşıtlık kabulü verilmiyor.
Genişletme tercihi kullanıcıya soruldu; ek izin olmadan kapsam genişletilmedi.

Kod denetimi/tür kontrolü/derleme geçti; 160 dosyada 1466 birim test geçti.
8 tam erişilebilirlik taraması 0 ihlal; 40 sayfa/görünümde kart yazısı aşımı
ve simge kesişmesi 0. 768/1024/1440 px ana sayfa + dört ürün sayfasında tam
sayfa piksel farkı 0; konumu eşitlenen 43 korunacak telefon bölümünde fark 0.
Uçtan uca: 325 geçti, 90 eski başarısız, 169 atlandı, 30 çalışmadı;
209'un başarısız test adlarıyla fark 0 (yeni başarısız 0).

Kullanılan rehberler: better-accessibility, ui-ux-pro-max,
design-taste-frontend; v3 DESIGN ve yerel Next.js CSS kılavuzu korundu.
Yeni bileşen/bağımlılık yok; mevcut PillButton kullanıldı. Kayıt, gönderim,
yayın, canlı işlem, .env okuma ve korunan klasör değişikliği yok. F5 yapılmadı.
node_modules/.next korunuyor. Fiziksel telefon kabulü yapılmadı.
Ayrıntı, komutlar, ölçüler ve açık sınır: `output/task210/KANIT.md`.

## Durum: TAMAMLANDI
