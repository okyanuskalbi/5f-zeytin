# Task 085: Marka fontları — Z-A Ege Zanaat

## Tür
frontend

## Amaç
Geçici sistem fontlarını kullanıcının seçtiği eşleşmeyle değiştir: başlık/ürün adı **Fraunces** (opsz eksenli, 400 italic + 600, `SOFT` 50), metin ve fiyat **Figtree** (400/600).

## Bağlam
Kullanıcı 20 Eki 2026'da yazı karakteri sunumundan (https://claude.ai/artifact/6WaKhjSqh6k67kJde8ZTQw) **Z-A**'yı seçti.

## Kullanılacak araçlar
- ECC skill: design-system, nextjs-turbopack, accessibility
- 21st MCP: hayır

## Adımlar
1. `next/font/google`, `subsets: ['latin','latin-ext']`, `display: 'swap'`, Fraunces `axes: ['opsz','SOFT']`; değişkenler `--font-display` (Fraunces) ve `--font-body` (Figtree); geçici Georgia/Helvetica yığınlarını yerine koy (fallback kalır).
2. Ölçek: hero başlık Fraunces 600 `font-variation-settings: "SOFT" 50`; alt slogan Fraunces 400 italic; ürün adı Fraunces 600; gövde/etiket/buton Figtree; fiyatlar Figtree `font-variant-numeric: tabular-nums`.
3. Self-host (next/font).

## Kabul kriterleri
- [ ] `grep -rn "Georgia\|Helvetica" app components lib` → yalnız fallback yığınında
- [ ] e2e: h1 Fraunces, fiyat Figtree + tabular-nums; "İŞĞÜÖÇ ışğüöç ₺1.250,00" glif eksiksiz
- [ ] lint/typecheck/build; mevcut testler geçer

## Durum: BEKLİYOR
