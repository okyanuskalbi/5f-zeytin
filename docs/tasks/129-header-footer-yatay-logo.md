# Task 129: Header ve footer'da yatay AFİNA ZEYTİN logosu

## Tür
frontend

## Amaç
Kullanıcı (22 Eki): "Zeytinde header ve footer'da logoyu güncelleyelim." Müşterinin gönderdiği yatay logo: `docs/referans/logolar/afina-zeytin-yatay.svg` (Varlık 2; PDF'ten vektör çevrildi, SHA `6a4962…`). Şu an header'da düz yazı ("AFİNA / ZEYTİN"), footer'da yuvarlak amblem var.

## Kullanılacak araçlar
- **Kullanıcı isteği (22 Eki), hepsini fiilen yükle:** `ui-ux-pro-max` (§5 Layout & Responsive dahil), `frontend-design`, `better-layout`, `motion-framer`, `shadcn-ui` (resmi CLI, token'lara uyarla), 21st MCP (ilgili bileşeni ara/uyarla, seçilen bileşenin adı/ID'si Coder Notu'na). `responsiveness-check` Claude'da. Coder Notu'na "Skill / nerede kullanıldı" tablosu ekle.
- `tdd-workflow`, `frontend-patterns`.

## İstenen
1. SVG ~2 MB → `svgo` (gerekirse yol birleştirme/hassasiyet düşürme) ile **≤ 60 KB**; görünüm bozulmamalı (önce/sonra PNG karşılaştır, Coder Notu'na yaz). Sığmazsa 2x/3x WebP + SVG yerine `<picture>` (≤ 25 KB/adet).
2. **Koyu zemin sürümü:** "AFİNA" siyah harfleri → süt `#F7F3EA`; altın amblem ve "ZEYTİN" altın tonları korunur. Site koyu (v4), header ve footer bu sürümü kullanır. Açık zemin sürümü de `public/brand/` altında kalsın (ileride krem yüzeyler için).
3. **Header:** yatay logo, yükseklik masaüstü 40px, telefon 32px; `alt="AFİNA ZEYTİN"`; ana sayfaya link. Nav düzeni bozulmaz, sepet/menü yerinde.
4. **Footer:** marka bloğundaki yuvarlak amblem yerine yatay logo (yükseklik 44–48px). Topluluk satırı (küçük topluluk logosu + "Bir AFİNA Şirketler Topluluğu markası") kalır.
5. Favicon/OG görselleri değişmez.
6. LCP etkisi yok: header logosu küçük ve öncelikli değil (`fetchpriority` yok), CLS 0 (width/height).

## Kabul kriterleri
- [ ] Unit: header ve footer'da yatay logo `img`/svg, alt metinli; header'da "AFİNA / ZEYTİN" düz yazısı yok.
- [ ] Logo dosya boyutu sınırı (komut).
- [ ] `npm test`, lint, typecheck, build yeşil; 118–128 testleri korunur.
- [ ] Tarayıcı doğrulaması Claude'da.

## Yapılmaması gerekenler
- Logoyu yeniden çizme/renk değiştirme (yalnız siyah→süt koyu sürüm).
- `docs/` değiştirme (yalnız Coder Notu/Durum).

## Durum: BEKLİYOR
