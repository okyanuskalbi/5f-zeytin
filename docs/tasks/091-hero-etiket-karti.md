# Task 091: Hero: etiket kartı, loş zeytinlik, canlı seçim

## Tür
frontend

## Amaç
Föy 'Card over a dim room': onaylı zeytinlik kare dizisi kararmış tam ekran; ortada Afina teneke etiketi dilinde kart; ürün/boy seçimi kartı 'yeniden basar'; scroll'da kart sol alta koçan olur ve sepet özeti gösterir.

## Bağlam
Yeniden kurgu — **önce `docs/DESIGN.md` (tamamı), föy (`node ~/.claude/skills/design-taste-frontend/scripts/draw.mjs --show`) ve `~/PROJELER/AFINA-KAYNAK/kitler/ozet.md` okunur.** Korunanlar (fontlar, renkler, logolar, onaylı zeytinlik görseli/videosu, ScrollFrameSequence, sepet altyapısı, PayTR önizleme, resmi metinler) DEĞİŞMEZ. Kullanıcı (20 Eki): "ZEYTİN PROJESİNİDE VERDİĞİM PDFLERE GÖRE BAŞTAN KURGULA".

## Kullanılacak araçlar
- ECC skill: frontend-patterns, motion-patterns, motion-advanced, accessibility, design-system, verification-loop
- Skill: `profesyonel-web-sitesi`; rehber `~/.claude/skills/design-taste-frontend/references/{layout,type,colour,motion,imagery}.md`
- 21st MCP: evet — ilham: sticky shrink kart, segment seçici (uyarla)

## Adımlar
1. Arka plan: 086'daki zeytinlik ScrollFrameSequence + poster, `filter: brightness(0.7)`.
2. Etiket kartı (kol 4–10, ~55% genişlik, ~62% yükseklik, kare köşe): sol ve sağ kenarda dikey yeşil bantlar (`#2F7A3B`, referans etiketteki gibi), beyaz orta alan, üstte AFİNA wordmark (onaylı logo, dark değil), ortada düz altın kurdele üzerinde seçili ürün adı (Fraunces 600), altında gramaj büyük ('10 KG'), fiyat tabular; 'Kökü toprakta. Yeri sofrada.' iki satır başlık; alt kenarda: solda 'Osmaniye / Düziçi' 14px, ortada 'Sepete ekle' düz düğme, sağda 'Tüm ürünler' linki.
3. Canlı öğe: ürün ve boy seçici (segment/radyo, klavye erişilebilir) → kart içeriği 200 ms çapraz geçişle değişir; veri `getProducts()` (geçici sabit veri, 030 sözleşmesi).
4. Sticky küçülme: scroll'da kart `transform: scale` + translate ile sol alta 120px koçan; koçan: sepet adedi · toplam · 'Sepete git'. Sepet boşsa koçan 'Ürünlere göz at'. reduced-motion: koçan yok, sepet üst çubukta.
5. Mobil: video 100svh, kart tam genişlik −16px, 70svh; başlık 9vw iki satır; düğme kart alt kenarında tam genişlik; koçan sol altta güvenli alan içinde.

## Kabul kriterleri
- [ ] e2e: seçim değişince ad/gramaj/fiyat değişiyor, sepete ekleme sepeti güncelliyor; scroll sonrası koçan görünür ve sepet özetini doğru gösteriyor; reduced-motion statik
- [ ] Mobil WebKit: başlık ilk ekranda tam görünür (kesilme yok)
- [ ] `node ~/.claude/skills/design-taste-frontend/scripts/lint.mjs app components` → FAIL yok
- [ ] production (`next build && next start -p 3104`) üzerinde `inspect.mjs http://127.0.0.1:3104` → bu bölüm için FAIL yok; 1440/768/390 + iPhone 14 (WebKit) ekran görüntüleri `test-results/091/`
- [ ] lint/typecheck/build; ilgili e2e (reduced-motion + mobil WebKit dahil); sepet testleri bozulmaz

## Durum: BEKLİYOR
