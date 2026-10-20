# Task 092: Vitrin: kenarda dizili etiket fişleri

## Tür
frontend

## Amaç
≤ 6 ürün, tam ekran zeytinlik/tesis görüntüsü önünde ayakta duran etiket fişleri; her fişte gerçek satın alma kontrolleri.

## Bağlam
Yeniden kurgu — **önce `docs/DESIGN.md` (tamamı), föy (`node ~/.claude/skills/design-taste-frontend/scripts/draw.mjs --show`) ve `~/PROJELER/AFINA-KAYNAK/kitler/ozet.md` okunur.** Korunanlar (fontlar, renkler, logolar, onaylı zeytinlik görseli/videosu, ScrollFrameSequence, sepet altyapısı, PayTR önizleme, resmi metinler) DEĞİŞMEZ. Kullanıcı (20 Eki): "ZEYTİN PROJESİNİDE VERDİĞİM PDFLERE GÖRE BAŞTAN KURGULA".

## Kullanılacak araçlar
- ECC skill: frontend-patterns, motion-patterns, motion-advanced, accessibility, design-system, verification-loop
- Skill: `profesyonel-web-sitesi`; rehber `~/.claude/skills/design-taste-frontend/references/{layout,type,colour,motion,imagery}.md`
- 21st MCP: evet — ilham: horizontal scroll row (mobil)

## Adımlar
1. Bölüm 100vw×96svh, arka plan onaylı zeytinlik görseli (statik, poster); üst ortada kolon (%18'den başlar) iki kısa paragraf 28–32px fildişi, nötr scrim yalnız kolon arkasında: 'Ürünlerimiz' + resmi ürün kapsamı cümlesi (sofralık zeytin, salamura, zeytinyağı; perakende ve toptan).
2. Alt kenarda yan yana fişler (12px aralık), farklı yükseklikler (26–44svh), 2–3 tanesi 1–2° eğik; fiş = kağıt panel: üstte ince yeşil bant (etiket bandı, düz dolgu — çizgi değil), ad (Fraunces 600, 1. satır kalın), yazılmış karakterlerden ayraç ('· · · · ·'), gramaj, fiyat (tabular), stok/tükendi, adet −/+, 'Sepete ekle'. Fişin alt ucu kesilmez (satın alma kontrolleri her zaman görünür — föy uyarlaması, raporla).
3. Mobil: yatay kaydırılan sıra, fiş 72vw, sonraki fiş sağda görünür; metin 14px'in altına inmez.
4. Ürün görselleri gelince fişin üst yarısına 'tipped-in plate' olarak eklenir (şimdilik yok; boş kutu YOK).

## Kabul kriterleri
- [ ] e2e: her fişte sepete ekle çalışıyor, tükendi fişi devre dışı, mobilde yatay kaydırma + dokunma hedefleri ≥44px
- [ ] `node ~/.claude/skills/design-taste-frontend/scripts/lint.mjs app components` → FAIL yok
- [ ] production (`next build && next start -p 3104`) üzerinde `inspect.mjs http://127.0.0.1:3104` → bu bölüm için FAIL yok; 1440/768/390 + iPhone 14 (WebKit) ekran görüntüleri `test-results/092/`
- [ ] lint/typecheck/build; ilgili e2e (reduced-motion + mobil WebKit dahil); sepet testleri bozulmaz

## Durum: BEKLİYOR
