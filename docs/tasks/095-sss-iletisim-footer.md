# Task 095: SSS, toptan ziyaret kartı, etiketin arka yüzü

## Tür
frontend

## Amaç
Föy SSS (okuma metni), iletişim (fotoğraf üstünde ziyaret kartı) ve footer (fırfırlı etiket arka yüzü).

## Bağlam
Yeniden kurgu — **önce `docs/DESIGN.md` (tamamı), föy (`node ~/.claude/skills/design-taste-frontend/scripts/draw.mjs --show`) ve `~/PROJELER/AFINA-KAYNAK/kitler/ozet.md` okunur.** Korunanlar (fontlar, renkler, logolar, onaylı zeytinlik görseli/videosu, ScrollFrameSequence, sepet altyapısı, PayTR önizleme, resmi metinler) DEĞİŞMEZ. Kullanıcı (20 Eki): "ZEYTİN PROJESİNİDE VERDİĞİM PDFLERE GÖRE BAŞTAN KURGULA".

## Kullanılacak araçlar
- ECC skill: frontend-patterns, motion-patterns, motion-advanced, accessibility, design-system, verification-loop
- Skill: `profesyonel-web-sitesi`; rehber `~/.claude/skills/design-taste-frontend/references/{layout,type,colour,motion,imagery}.md`
- 21st MCP: hayır

## Adımlar
1. SSS: 'Sık sorulanlar' kol 1–3, kol 5–12 iki kolon okuma metni; yalnız `087-aeo-geo.md`'de resmi cevabı olan sorular (teyitliler); FAQPage JSON-LD 087/074 ile tek üreticiden.
2. İletişim: tesis fotoğrafı (093'teki onay durumuna göre; onaysızsa zeytin yeşili düz alan) tam ekran + 380px kağıt kart: 'Toptan satış', adres (SIRKET.md), telefon/e-posta alanları teyit gelene kadar GİZLİ (boş/yer tutucu gösterme), 'Toptan Satış İçin İletişime Geçin' → toptan form (081; gönderim 082 kararına bağlı, sahte başarı yok).
3. Footer: fildişi panel, üst kenar 12 fırfır (SVG/clip-path), sol imza 'Kökü toprakta. Yeri sofrada.' + iki satır mesaj, sağ adres/linkler + pul (tesis fotoğrafı veya zeytinlik minik), alt baskı satırı 13px: 'AFİNA ZEYTİNCİLİK TARIM ÜRÜNLERİ SAN. VE TİC. LTD. ŞTİ. · Düziçi VD · VKN 0091520061' + KVKK/Mesafeli Satış/İade linkleri + küçük AFİNA Şirketler Topluluğu logosu (afina.com.tr linki).

## Kabul kriterleri
- [ ] e2e: SSS'de teyitsiz soru yok; form doğrulama; footer yasal linkler çalışıyor; telefon/e-posta yer tutucusu yok
- [ ] `node ~/.claude/skills/design-taste-frontend/scripts/lint.mjs app components` → FAIL yok
- [ ] production (`next build && next start -p 3104`) üzerinde `inspect.mjs http://127.0.0.1:3104` → bu bölüm için FAIL yok; 1440/768/390 + iPhone 14 (WebKit) ekran görüntüleri `test-results/095/`
- [ ] lint/typecheck/build; ilgili e2e (reduced-motion + mobil WebKit dahil); sepet testleri bozulmaz

## Durum: BEKLİYOR
