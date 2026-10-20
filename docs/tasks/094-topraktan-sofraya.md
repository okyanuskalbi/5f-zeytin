# Task 094: Topraktan sofraya: sürüklenen anlar şeridi

## Tür
frontend

## Amaç
Altı anlık süreç şeridi (Hasat, Seçim, Kırma, Salamura, Dolum, Sofrada), yatay sürüklenir, ilerleme çubuğu.

## Bağlam
Yeniden kurgu — **önce `docs/DESIGN.md` (tamamı), föy (`node ~/.claude/skills/design-taste-frontend/scripts/draw.mjs --show`) ve `~/PROJELER/AFINA-KAYNAK/kitler/ozet.md` okunur.** Korunanlar (fontlar, renkler, logolar, onaylı zeytinlik görseli/videosu, ScrollFrameSequence, sepet altyapısı, PayTR önizleme, resmi metinler) DEĞİŞMEZ. Kullanıcı (20 Eki): "ZEYTİN PROJESİNİDE VERDİĞİM PDFLERE GÖRE BAŞTAN KURGULA".

## Kullanılacak araçlar
- ECC skill: frontend-patterns, motion-patterns, motion-advanced, accessibility, design-system, verification-loop
- Skill: `profesyonel-web-sitesi`; rehber `~/.claude/skills/design-taste-frontend/references/{layout,type,colour,motion,imagery}.md`
- 21st MCP: evet — ilham: drag carousel + progress bar

## Adımlar
1. Föy 'Drag row of moments' geometrisi: başlık 'Topraktan sofraya', sağda geri/ileri kare düğmeler, altında 6px ilerleme çubuğu (düz dolgu), 280px kolonlar, scroll-snap, değişen boşluklar, 4:5 görsel.
2. Metinler: her an için 1 satır başlık + ≤ 3 satır. **İddia kuralı:** yöntem/süre/sıcaklık/katkısız gibi teknik iddia YOK; genel, doğrulanabilir ifadeler; her metin `docs/teyit/surec.md` listesine 'kullanıcı teyidi bekliyor' olarak yazılır ve UI'da ancak teyit sonrası açılır — o zamana kadar yalnız başlıklar + resmi belgeden türeyen tek cümle ('Zeytinin hikâyesi toprakta başlar, sofrada tamamlanır.').
3. Görseller: şimdilik onaylı zeytinlik/tesis kırpımları (4:5); Atlas üretimi ayrı onaylı görev.
4. Mobil: 72vw kolonlar, düğmeler yok, çubuk kalır.

## Kabul kriterleri
- [ ] e2e: sürükleme/klavye ile ilerleme, çubuk ilerliyor; teyitsiz süreç metni UI'da yok
- [ ] `node ~/.claude/skills/design-taste-frontend/scripts/lint.mjs app components` → FAIL yok
- [ ] production (`next build && next start -p 3104`) üzerinde `inspect.mjs http://127.0.0.1:3104` → bu bölüm için FAIL yok; 1440/768/390 + iPhone 14 (WebKit) ekran görüntüleri `test-results/094/`
- [ ] lint/typecheck/build; ilgili e2e (reduced-motion + mobil WebKit dahil); sepet testleri bozulmaz

## Durum: BEKLİYOR
