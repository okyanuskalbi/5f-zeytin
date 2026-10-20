# Task 100: v2 temel: tokenlar, tipografi, uyarlanan üst çubuk, v1 temizliği

## Tür
frontend

## Amaç
DESIGN.md v2 renk/tip tokenları; v1 etiket bileşenlerinin kaldırılması; zemine göre renk değiştiren üst çubuk ve sepet rozeti.

## Bağlam
ZEYTİN v2 — **önce `docs/DESIGN.md` (tamamı; v2 "Topraktan sofraya") okunur**; v1 (`DESIGN-v1-etiket.md`) bileşenleri (etiket kartı, koçan, fişler, fırfırlı footer) kaldırılır/dönüştürülür. Korunanlar DEĞİŞMEZ. Kullanıcı (20 Eki): "ZEYTİN SİTESİNİ HİÇ BEĞENMEDİM BAŞTAN YAP" + "21.DEV VE FRAMER MOTION UX/UI SKİLLERİ İLE EN İYİ SEÇENEKLERİ YAP".

## Kullanılacak araçlar
- ECC skill: frontend-patterns, motion-patterns, motion-advanced, accessibility, design-system, verification-loop; skill `motion-framer`, `profesyonel-web-sitesi`, `ui-ux-pro-max` (e-ticaret UX)
- 21st MCP: hayır

## Adımlar
1. Tokenlar: toprak/zeytin/krem/kum/altın/fabrika yeşili; Fraunces/Figtree ölçeği (DESIGN.md).
2. v1 kaldırma: HeroLabel (etiket kartı + koçan), vitrin fişleri, fırfırlı footer, etiket bandı yeşili tokenı; ilgili testler v2'ye dönüştürülür (silinmez, davranış sözleşmesi korunur: sepete ekle, boy seçimi).
3. Üst çubuk: sol AFİNA ZEYTİN logosu (koyu zeminde dark varyant), orta/sağ Ürünler · Tesisimiz · Toptan, hesap, sepet (adet rozeti, değişince spring zıplama); hero üzerinde şeffaf + krem metin, ışık doğduktan sonra krem zemin + zeytin metin (scroll'a bağlı, düz renk). Mobil: logo + sepet + 'Menü' (tam ekran menü, odak tuzağı).
4. Düğmeler: kare köşe; birincil koyu zeminde altın/toprak metin, açık zeminde zeytin/krem metin.

## Kabul kriterleri
- [ ] e2e: v1 bileşenleri DOM'da yok; üst çubuk renk geçişi; sepet rozeti; mobil menü odak tuzağı
- [ ] `lint.mjs app components` 0 FAIL; production (`next build && next start -p 3104`) `inspect.mjs` bu bölüm için FAIL 0; 1440/768/390 + iPhone 14 (WebKit) + Pixel 7 ekran görüntüleri `test-results/100/`
- [ ] lint/typecheck/build; ilgili e2e (reduced-motion + mobil); sepet/PayTR önizleme/toptan form testleri bozulmaz

## Durum: BEKLİYOR
