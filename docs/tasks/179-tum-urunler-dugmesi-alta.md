> ONAY VERİLDİ (kullanıcı, 3 Kas 2026, mobil ekran görüntüsüyle): "buraya alta, ama buton sepete ekle butonuyla aynı stilde olsun". Main push ve Vercel REST yayını AGENTS.md'deki gibi yetkilidir. Task 178 (Düzeltme 178-1 dahil) bittikten sonra başlar.

# Task 179: "Tüm ürünler" düğmesi alta + mobil menü üst satırına zemin

## Tür
frontend

## Amaç
Task 178'de başlığın altına eklenen "Tüm ürünler" düğmesi galerinin altına taşınsın ve kartlardaki "Sepete ekle" düğmesiyle aynı görünsün.

## Bağlam
- `components/landing/HorizontalProductGallery.tsx:191`: düğme şu an başlıkta, `variant="outline"` + `styles.allButton`. Alt satır: `:229` `styles.foot` ("6 ambalaj. Aynı üretici." / "Kaydırarak ya da sürükleyerek keşfedin.").
- "Sepete ekle" düğmesi `components/catalog/ProductCard.tsx` içindeki satın alma düğmesi: koyu zeytin yeşili dolgu, fildişi yazı, tam yuvarlak (pill), kalın yazı.
- Kullanıcının işaretlediği yer: mobilde galerinin en altı, foot satırının bulunduğu bölge.

## Kullanılacak araçlar
- Skill: `ui-ux-pro-max`, `frontend-design`, `better-layout`, `tdd-workflow`.
- 21st MCP: hayır.

## Adımlar
1. Düğmeyi başlıktan kaldır. Galerinin altına, foot satırının hemen üstüne koy (masaüstü ve mobil). Mobilde ortalı ya da tam genişliğe yakın; masaüstünde foot satırıyla hizalı, ortalı.
2. Stil "Sepete ekle" ile birebir aynı olsun: renk, yazı tipi ve kalınlığı, yükseklik, köşe yuvarlaklığı, hover/focus/active/disabled durumları. Tercihen aynı sınıfı ya da ortak bir token/bileşeni paylaşsınlar, kopya CSS yazma. Grid ikonu kalabilir, yazı rengiyle aynı renkte olsun.
3. Mobilde düğme ilk yüklemede görünür alana sığmayabilir; sorun değil. Ancak scrub/pin modunda galerinin son ürününe gelince düğme ekranda görünür ve tıklanabilir olmalı. Masaüstünde sabitlenmiş sahnede kesilmesin, kart düğmeleriyle çakışmasın.
4. **Mobil menü üst satırı** (kullanıcı ekran görüntüsü, "buraya da zemin gir"): `components/site/NavbarMenu.tsx:67` `styles.menuToolbar` (logo + "Ana Sayfa" + Kapat). Telefon alt panelinde (bottom sheet) bu satır şu an panelin açık fildişi zemininde kalıyor. Satıra sitenin üst çubuğuyla aynı koyu zeytin yeşili zemin ver (`--pro-ink`, navbar `.bar` ile aynı). Panelin üst köşe yuvarlaklığıyla uyumlu olsun. Logo açık tonda net okunsun. "Ana Sayfa" yazısı ve Kapat (X) düğmesi açık renkte olsun, kontrast en az 4.5:1. Kapat düğmesinin hover/focus görünümü koyu zeminde görünür kalsın. Menünün geri kalanı (hızlı erişim kartları, bağlantılar) değişmesin. Masaüstü/tablet tam ekran menüde zaten koyu zemin varsa dokunma.
5. Panelin açılması/kapanması, odağın düğmeye dönmesi, Esc ve "Teklife ekle" davranışı Task 178'deki gibi kalsın.

## Kabul kriterleri
- [x] Birim testi: başlık alanında "Tüm ürünler" düğmesi yok, galerinin altında (foot'tan önce) bir tane var.
- [x] Birim/kaynak testi: düğme "Sepete ekle" ile aynı stil kaynağını (sınıf/token/bileşen) kullanıyor.
- [x] Birim/kaynak testi: telefon menüsünde `menuToolbar` koyu zemin (`--pro-ink`) kullanıyor; "Ana Sayfa" ve Kapat açık renk.
- [x] Mevcut Task 178 panel testleri geçiyor (sıra, sayı, Esc, odak dönüşü, teklif).
- [ ] `npm test`, lint, typecheck, build yeşil. Yayın + makbuz `.cache/task-179/final-receipt.json`.
- Görsel kabul (mobil menü üst satırı, mobil 390, masaüstü 1280/1440, son ürünle görünürlük): Claude doğrular.

## Yapılmaması gerekenler
- Galeri, sürükleme, kart ve panel tasarımı değişmesin; yalnız düğmenin yeri ve stili ile menü üst satırının zemini.
- "Sepete ekle" düğmesinin kendi görünümü değişmesin.
- Yeni bağımlılık ekleme. Sepet, teklif, fiyat ve stok mantığına dokunma.


## Coder Notu
- `ui-ux-pro-max`, `frontend-design`, `better-layout`, `tdd-workflow` okundu ve uygulandı. Task gereği 21st kullanılmadı; yeni bağımlılık yok.
- Galeri düğmesi raydan sonra, foot'tan önce ortalanır. Scrub grid dört satırla düğmeye ayrı alan ayırır; görsel alan kalan yüksekliği kullanır.
- `PurchaseButton`, mevcut AddToCart CSS ve Motion hover/tap/reduced/disabled davranışını ortaklaştırır. Sepet mantığı ve stil değerleri değişmez; galeri düğmesi aynı renk değişkenlerini kullanır.
- Yalnız telefon menü üst satırı koyulaştı. Koyu zemin için mevcut açık logo seçildi; Ana Sayfa/Kapat/focus açık, hesaplanan metin kontrastı 13,62:1.
- RED: `npm test -- tests/unit/gallery-interactions-178.test.tsx`: 11 PASS, yeni iki test FAIL. GREEN: aynı komut 13/13 PASS; sıra/tek düğme/ortak sınıf/menü kaynakları ve mevcut panel Esc/odak/teklif/sepet testleri geçti.
- `npm test`: 122 dosya, 1445 test PASS. `npm run lint`, `npm run typecheck`, `npm run build` (Turbopack) PASS. Loglar `.cache/task-179/{red,green,unit,lint,typecheck,build}.log`.
- Tarayıcı/cihaz/görsel testleri kullanıcının talimatıyla çalıştırılmadı; 390/1280/1440 ve son ürün/düğme görünürlüğü Claude'a aittir. Komut kabulü görsel kabul iddiası değildir.
- Main/API yayını ve `.cache/task-179/final-receipt.json` sırada.

## Durum: BEKLİYOR
