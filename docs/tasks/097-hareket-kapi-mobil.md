# Task 097: Hareket katmanı, kapı, eleştiri turu ve mobil analiz

## Tür
frontend

## Amaç
Tüm sayfada hareket katmanı, tasteskill kapısı (3 tur eleştiri) ve 4 cihazda mobil analiz raporu.

## Bağlam
Yeniden kurgu — **önce `docs/DESIGN.md` (tamamı), föy (`node ~/.claude/skills/design-taste-frontend/scripts/draw.mjs --show`) ve `~/PROJELER/AFINA-KAYNAK/kitler/ozet.md` okunur.** Korunanlar (fontlar, renkler, logolar, onaylı zeytinlik görseli/videosu, ScrollFrameSequence, sepet altyapısı, PayTR önizleme, resmi metinler) DEĞİŞMEZ. Kullanıcı (20 Eki): "ZEYTİN PROJESİNİDE VERDİĞİM PDFLERE GÖRE BAŞTAN KURGULA".

## Kullanılacak araçlar
- ECC skill: frontend-patterns, motion-patterns, motion-advanced, accessibility, design-system, verification-loop
- Skill: `profesyonel-web-sitesi`; rehber `~/.claude/skills/design-taste-frontend/references/{layout,type,colour,motion,imagery}.md`
- 21st MCP: hayır

## Adımlar
1. Pinned story (etiket kartı → koçan) + bölüm girişleri + kontrol geri bildirimi; inspect hareket sayımı ≥ 16.
2. `references/critique.md` ile 1440/768/390 puanlama, en büyük 3 sorun → düzelt → tekrar (≤ 3 tur), `docs/critique-097.md`.
3. Mobil: iPhone 14, iPhone SE (WebKit), Pixel 7, Galaxy S20 (Chromium) + yatay; `docs/mobil-analiz-097.md` önce/sonra tablosu: başlık satırları, min yazı, dokunma hedefleri, yatay taşma, kontrast, Lighthouse mobil (Perf ≥ 85, A11y ≥ 95, CLS < 0.1, LCP < 2.5 s), video/kare ağırlığı, iOS autoplay/Düşük Güç, svh/dvh, güvenli alan, sabit koçanın klavye/dokunmayla çakışmaması.

## Kabul kriterleri
- [ ] inspect FAIL 0, hareket ≥ 16; critique ve mobil raporları mevcut; tam e2e geçer
- [ ] `node ~/.claude/skills/design-taste-frontend/scripts/lint.mjs app components` → FAIL yok
- [ ] production (`next build && next start -p 3104`) üzerinde `inspect.mjs http://127.0.0.1:3104` → bu bölüm için FAIL yok; 1440/768/390 + iPhone 14 (WebKit) ekran görüntüleri `test-results/097/`
- [ ] lint/typecheck/build; ilgili e2e (reduced-motion + mobil WebKit dahil); sepet testleri bozulmaz

## Claude eleştirisi (20 Eki, 1440 kaydırma, 091–095 sonrası) — bu turda MUTLAKA çözülecek
1. **Hero sonrası boş sabit sahne:** kart küçüldükten sonra ~2 ekran boyunca yalnız zeytinlik görüntüsü + minik koçan kalıyor (near-empty ×2). Pinned run kısalsın (kart koçana dönüşür dönüşmez vitrin başlasın; ≤ 1 ekran geçiş).
2. **Koçan çok küçük ve okunmuyor** ('Ürünlere göz at' ~10px kutu): 120px genişlik, 14px+ metin, sepet adedi/toplam okunur; ürün fişleri ve footer üstüne binmesin (vitrin ve footer görünürken gizlenir veya kenara çekilir).
3. **Vitrin fişleri** fotoğrafın altına sıkışmış ve kesik görünüyor: föy 'slips standing along the bottom' — fişler alt kenarda AYAKTA, tam görünür, farklı yükseklikler; 'Ürünlerimiz' kolonu fotoğrafın üst bölümünde; fişler ile kolon arasında görünür nefes.
4. **Topraktan sofraya:** beş kolonda aynı zeytinlik kırpımı tekrar ediyor — kopya görsel yasak. Görsel üretimi onaylanana kadar kolonlar görselsiz tipografik (adım adı büyük Fraunces + kısa satır) ya da onaylı görüntülerin FARKLI kırpımları (tesis, şişe, kase, dal); aynı kare iki kez kullanılmaz.
5. **Toptan bölümü:** büyük boş yeşil alan + küçük kart (near-empty). Tesis fotoğrafı kullanıcı onayı gelene kadar: kart sola, alanın kalanına büyük tipografik 'Toptan satış' + ürün kapsamı; onay gelince fotoğraf.
6. **Osmaniye silüeti** kaba ve kesik görünüyor: gerçek il sınırı (kaynaklı, sadeleştirilmiş), Düziçi noktası + etiket; karo içinde ortalı, kırpılmadan.
Ekran görüntüleri: `/private/tmp/claude-501/-Users-emre/862bcbce-6e8d-4a73-a71a-971f141b67f4/scratchpad/mobil/z-yeni.jpg` (geçici).

## Durum: BEKLİYOR
