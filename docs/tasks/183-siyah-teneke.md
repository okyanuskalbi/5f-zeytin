# Task 183: 3 L tenekeleri siyah + altın tasarıma geçir

## Tür
frontend (görsel varlık)

## Amaç
Kullanıcı kararı (9 Kas 2026: "teneke siyah olabilir"): Doğal Kırma Yeşil Zeytin ve Salamura Yeşil Zeytin 3 L teneke görselleri, onaylanan **siyah + altın A** tasarımıyla değişir. Ürün id, ad, ağırlık ("3 L"), fiyat ve stok aynı kalır.

## Bağlam
- Kaynaklar: `AFINA-KAYNAK/urun-gorselleri/teneke-3lt/siyah/A-dogal-kirma-yesil-3lt.png`, `A-salamura-yesil-3lt.png` (koyu stüdyo zeminli, 1122×1402).
- Varlık anahtarları değişmez: `urun-01-kirma-10kg` (sample-green-olive-10kg) ve `urun-06-salamura-yesil-5kg` (sample-brined-green-olive-5kg). Böylece sepet, ürün detayı, "Tüm ürünler", OG ve JSON-LD görselleri kendiliğinden güncellenir.
- 182-1'deki dekupe boru hattı: `scripts/prepare-v3-assets.mjs`, `scripts/v3-asset-specs.mjs`, `scripts/masks/`, `scripts/teneke-cutout.test.mjs`, `scripts/check-v3-assets.mjs`.

## Kullanılacak araçlar
- ECC skill: `tdd-workflow`, `frontend-patterns`.
- Codex alt ajanları (multi_agent): maske/dekupe ve test güncellemesini paralel yürütebilirsin.
- Görsel üretimi gerekirse YALNIZ yerleşik görsel üretim aracı; ücretli API yok.

## Dokunulacak dosyalar
- `scripts/masks/*` (yeni maskeler), `scripts/v3-asset-specs.mjs` (gerekirse), `public/images/v3/urun-01-*`, `public/images/v3/urun-06-*` ve ilgili sahne/stüdyo türevleri
- Hash/beklenen değer tutan testler

## Adımlar
1. Kaynak tenekeyi koyu zeminden temiz ayır. Koyu gövde koyu zeminde zor ayrılır: önce yerel maske (OpenCV/Pillow) dene; kenar temiz çıkmazsa aynı tasarımı (mat siyah gövde, altın ağız/kenar çizgileri, altın çerçeveli AFiNA rozeti, altın kurdele ve ürün adı, çizgisel zeytin dalı) birebir koruyarak açık düz zeminde yerleşik görsel araçla yeniden üret ve onu ayır. Tasarımı değiştirme, yeni yazı ekleme.
2. Şeffaf PNG kaynakları `AFINA-KAYNAK/urun-gorselleri/teneke-3lt/siyah/dekupe/` altına kaydet; mevcut boru hattıyla tüm AVIF/WebP türevlerini yeniden üret; 182-1'deki yumuşak zemin gölgesi aynı.
3. Ürün açıklamalarında (`lib/catalog/product-details.ts` vb.) teneke rengini çelişkili anlatan ifade varsa ("beyaz/yeşil teneke") düzelt; yoksa dokunma.

## Kabul kriterleri
- [ ] İki ürünün tüm türevleri şeffaf; kenarda koyu hale/eski zemin kalıntısı yok (teneke-cutout testi + 2 kat yakınlaştırılmış kontrol görüntüsü `.cache/task-183/` altında).
- [ ] Krem (#F7F4ED) ve beyaz zeminde ürün kartında doğal görünüyor (kontrol görüntüleri `.cache/task-183/`).
- [ ] Diğer 4 ürünün görselleri bayt bayt aynı.
- [ ] `npm run check:assets`, `npm run test`, `npm run lint`, `npm run typecheck`, `npm run build` yeşil.

## Yapılmaması gerekenler
- Id, ad, fiyat, stok, ağırlık değiştirme; canlı DB'ye dokunma.
- Production yayını yapma (Vercel REST dahil). Yalnız commit + testler yeşilse `origin main` push (CI çalışır, yayın yapmaz).
- `docs/` değiştirme (yalnız Coder Notu/Durum).

## Durum: BEKLİYOR
