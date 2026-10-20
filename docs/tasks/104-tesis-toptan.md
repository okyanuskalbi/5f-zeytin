# Task 104: Tesisimiz + Toptan (fabrika yeşili bandı)

## Tür
frontend

## Amaç
Tesis cephesi yeşili bandında 'Osmaniye'de, kendi tesisimizde.' + bilgiler + tesis fotoğrafı (onaylıysa); altında toptan formu.

## Bağlam
ZEYTİN v2 — **önce `docs/DESIGN.md` (tamamı; v2 "Topraktan sofraya") okunur**; v1 (`DESIGN-v1-etiket.md`) bileşenleri (etiket kartı, koçan, fişler, fırfırlı footer) kaldırılır/dönüştürülür. Korunanlar DEĞİŞMEZ. Kullanıcı (20 Eki): "ZEYTİN SİTESİNİ HİÇ BEĞENMEDİM BAŞTAN YAP" + "21.DEV VE FRAMER MOTION UX/UI SKİLLERİ İLE EN İYİ SEÇENEKLERİ YAP".

## Kullanılacak araçlar
- ECC skill: frontend-patterns, motion-patterns, motion-advanced, accessibility, design-system, verification-loop; skill `motion-framer`, `profesyonel-web-sitesi`, `ui-ux-pro-max` (e-ticaret UX)
- 21st MCP: hayır

## Adımlar
1. Bant `#6CCB3C` zemin, siyah mürekkep (AA ölç), sol: dev başlık 'Osmaniye'de, kendi tesisimizde.' + resmi 04 hikâye 2. paragrafı + bilgiler (Ellek, Düziçi / Osmaniye · Sofralık, salamura, zeytinyağı · Perakende + toptan · 2021'den bu yana).
2. Sağ: tesis fotoğrafı (plaka bulanık, `public/images/tesis`) YALNIZ `docs/gorsel-onay.md`'de kullanıcı onayı varsa; yoksa Osmaniye il silüeti (doğru sınır, Düziçi noktası) siyah dolgu.
3. Altında zeytin zeminli 'Toptan satış' bölümü: mevcut 081 formu yeni dile; adres (SIRKET.md), telefon/e-posta teyit gelene kadar gizli.

## Kabul kriterleri
- [ ] e2e: form doğrulama + KVKK onayı; fotoğraf onaysızsa render edilmiyor; kontrast AA
- [ ] `lint.mjs app components` 0 FAIL; production (`next build && next start -p 3104`) `inspect.mjs` bu bölüm için FAIL 0; 1440/768/390 + iPhone 14 (WebKit) + Pixel 7 ekran görüntüleri `test-results/104/`
- [ ] lint/typecheck/build; ilgili e2e (reduced-motion + mobil); sepet/PayTR önizleme/toptan form testleri bozulmaz

## Durum: BEKLİYOR
