# Task 093: Tesisimiz: geniş fotoğraf, renk karosu, bilgiler

## Tür
frontend

## Amaç
Gerçek Osmaniye tesis fotoğrafı (plaka yerelde bulanık), Osmaniye silüetli renk karosu ve dört bilgi çifti.

## Bağlam
Yeniden kurgu — **önce `docs/DESIGN.md` (tamamı), föy (`node ~/.claude/skills/design-taste-frontend/scripts/draw.mjs --show`) ve `~/PROJELER/AFINA-KAYNAK/kitler/ozet.md` okunur.** Korunanlar (fontlar, renkler, logolar, onaylı zeytinlik görseli/videosu, ScrollFrameSequence, sepet altyapısı, PayTR önizleme, resmi metinler) DEĞİŞMEZ. Kullanıcı (20 Eki): "ZEYTİN PROJESİNİDE VERDİĞİM PDFLERE GÖRE BAŞTAN KURGULA".

## Kullanılacak araçlar
- ECC skill: frontend-patterns, motion-patterns, motion-advanced, accessibility, design-system, verification-loop
- Skill: `profesyonel-web-sitesi`; rehber `~/.claude/skills/design-taste-frontend/references/{layout,type,colour,motion,imagery}.md`
- 21st MCP: hayır

## Adımlar
1. Kaynak: `~/PROJELER/AFINA-KAYNAK/fabrika/afina-zeytin-tesis-osmaniye.png` — plakayı (sol alttaki araç, '80 AFN 080') YEREL olarak (sharp/ffmpeg boxblur) bulanıklaştır; dış servise yükleme YOK. `public/images/tesis/` webp 2400/1200; onay kaydı: kaynak hash + 'kullanıcının kendi fotoğrafı, plaka bulanık' notu (kullanıcı fotoğrafı kendisi verdi; yayın için ayrıca Claude onay soracak — kayıt 'aday', runtime=true YALNIZ kullanıcı onayı sonrası; o zamana kadar bölüm fotoğrafsız tipografik varyantla).
2. Başlık 'Tesisimiz' + üç satır giriş (resmi 04 'Marka hikâyesi' 2. paragrafından birebir).
3. Sol karo (kol 1–8) 16:10 fotoğraf + sağ üst köşede 320px kağıt blok: resmi kısa tanım (≤35 kelime).
4. Sağ karo (kol 9–12) zeytin yeşili düz alan: Osmaniye ili sınır silüeti (doğru şekil, tek dolu SVG) + Düziçi noktası. Altında 2×2 bilgi: Konum: Ellek, Düziçi / Osmaniye · Ürünler: sofralık, salamura, zeytinyağı · Satış: perakende + toptan · Faaliyet: 2021'den bu yana.
5. Mobil: föy telefon kuralları.

## Kabul kriterleri
- [ ] Fotoğrafta plaka okunamaz (ekran görüntüsü kontrolü); dış yükleme yapılmadı (ağ logu)
- [ ] e2e: bilgiler resmi/levha verisiyle birebir
- [ ] `node ~/.claude/skills/design-taste-frontend/scripts/lint.mjs app components` → FAIL yok
- [ ] production (`next build && next start -p 3104`) üzerinde `inspect.mjs http://127.0.0.1:3104` → bu bölüm için FAIL yok; 1440/768/390 + iPhone 14 (WebKit) ekran görüntüleri `test-results/093/`
- [ ] lint/typecheck/build; ilgili e2e (reduced-motion + mobil WebKit dahil); sepet testleri bozulmaz

## Durum: BEKLİYOR
