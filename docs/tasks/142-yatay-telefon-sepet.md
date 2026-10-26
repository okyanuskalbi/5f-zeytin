> ONAY VERİLDİ (kullanıcı, 26 Eki 2026): "bunları vs yaptır codex'e" (yatay telefonda sepet düzeltmesi).

# Task 142: Yatay telefonda üst çubuk + yapışkan sepet çubuğu yer kaplıyor

## Tür
frontend (yalnız CSS, gerekirse küçük JSX)

## Amaç
iPhone 15 yatay (852×393) gibi kısa ekranlarda üst başlık (~100px) ve alttaki yapışkan "ürün · fiyat · Sepete ekle" çubuğu (~100px) birlikte ekranın yarısını kaplıyor; ürün kartı/sayfa içeriği ~130px'lik şeride sıkışıyor. Kısa ekranlarda ikisini incelt.

## Bağlam
- Kanıt: Claude cihaz matrisi `mob-iphone15-land-webkit` (sepete ekle sonrası ekran).
- Dosyalar: `components/site/Navbar.module.css` (`.bar`), yapışkan sepet çubuğu bileşeni ve CSS'i (Task 136'da auth/yasal sayfalarda gizlenen çubuk; `grep -rn "sticky" components` ile bul).
- Task 140'ın mobil pill/opak başlık kuralları korunur.

## Kullanılacak araçlar
- ECC/skill: `ui-ux-pro-max`, `better-layout`, `frontend-design`, `ai-tool-prompts` (son kontrol). Coder Notu'na kısa skill tablosu.
- 21st MCP: hayır.

## Adımlar
1. `@media (orientation: landscape) and (max-height: 500px)` için:
   - Üst başlık: dikey dolgu küçülsün, logo yüksekliği ≤ 40px; toplam başlık yüksekliği ≤ 56px. Sepet/Menü dokunma hedefi ≥ 44px kalsın.
   - Yapışkan sepet çubuğu: tek satır (ürün adı · fiyat · düğme yan yana), toplam yükseklik ≤ 64px, `env(safe-area-inset-*)` sol/sağ/alt dolgusu korunur.
2. Dikey telefonda, tablette ve masaüstünde hiçbir ölçü değişmesin.

## Kabul kriterleri
- [ ] Kaynak/kabul testi: yukarıdaki medya sorgusu ve değerler mevcut; dikey kurallar aynı (diff yalnız yeni medya bloğu + gerekiyorsa sınıf).
- [ ] `npm test`, lint, typecheck, build, `check:assets` yeşil.
- Tarayıcı ekran testi Claude'da (WebKit iPhone 15 yatay + SE dikey regresyon).

## Yapılmaması gerekenler
- Hero, renk token'ları, metin ve görsellere dokunma.
- Yapışkan çubuğu yatayda tamamen kaldırma (sepete ekleme yolu kalmalı).

## Durum: BEKLİYOR
