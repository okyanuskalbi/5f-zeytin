> ONAY VERİLDİ (kullanıcı, 7 Kas 2026): "Ürünler 3 lt tenekeye geçsin: iki ürünün fotoğrafı, ağırlık yazısı ve açıklaması 3 lt teneke olur. Fiyatlar temsili olarak kalsın." Görseller kullanıcıya gösterildi; 1 numaralı adaylar kullanılır. Main push yetkilidir. Vercel REST yayını şu an 403 ile engelli (Task 181 notu); yayını dene, olmazsa Coder Notu’na yaz ve kod işini yine tamamla. Canlı veritabanı Codex tarafından DEĞİŞTİRİLMEZ (aşağıda snippet).

# Task 182: İki zeytin ürünü 3 lt yuvarlak tenekeye geçer

## Tür
fullstack (katalog verisi + görsel; canlı DB yalnız snippet)

## Amaç
"Doğal Kırma Yeşil Zeytin 10 kg" ve "Salamura Yeşil Zeytin 5 kg" ürünleri 3 lt yuvarlak tenekeye geçer: fotoğraf, ambalaj/ağırlık yazısı ve açıklama buna göre güncellenir. Fiyat ve stok aynen kalır.

## Bağlam
- Yeni görseller (onaylı, 1122×1402 PNG):
  - `~/PROJELER/AFINA-KAYNAK/urun-gorselleri/teneke-3lt/adaylar/dogal-kirma-yesil-3lt-studyo-1.png`
  - `~/PROJELER/AFINA-KAYNAK/urun-gorselleri/teneke-3lt/adaylar/salamura-yesil-3lt-studyo-1.png`
- Statik katalog: `lib/catalog/static-products.ts:15` (`sample-green-olive-10kg`, "10 kg") ve `:25` (`sample-brined-green-olive-5kg`, "5 kg").
- Açıklamalar: `lib/catalog/product-details.ts:6` ve `:26` ("10 kg teneke…", "5 kg tenekede").
- Görsel odakları: `lib/catalog/product-image-focus.ts:4-5, 14-15`. Dosyalar `public/images/v3/01-dogal-kirma-yesil-zeytin-10kg-{studyo,sahne}-w{800,1600}.{avif,webp}` ve `06-salamura-yesil-zeytin-5kg-…`.
- Hero ürün kartı: `lib/media/hero-card-asset.json` (alt "…10 kg teneke", `urun-01-kirma-10kg-w72/w96`).
- Canlı katalog veritabanından okunuyor (`/api/products` → `source: "database"`, `weight` alanı "10 kg"/"5 kg"). Seed: `supabase/snippets/seed-static-products.sql:14,18`.

## Kullanılacak araçlar
- Skill: `frontend-patterns`, `tdd-workflow`.
- 21st MCP: hayır. Yeni görsel ÜRETME.

## Adımlar
1. Görselleri mevcut boru hattıyla aynı formatlara dönüştür (w800 ve w1600, avif + webp; mevcut dosyalarla aynı adlandırma ve kalite ayarları). Mevcut `01-…-studyo` ve `06-…-studyo` dosyalarının yerine koy (dosya adları değişmeyebilir ya da yeni adla `3lt` eklenebilir; hangisi daha az değişiklikse). Kaynağa göre büyütme yapma; w1600 için kaynak 1122 px genişlikse en büyük boyutu kaynağı aşmadan üret ve srcset'i buna göre ayarla.
2. Bu iki ürünün **sahne** görselleri kare teneke gösteriyor. Yeni sahne görseli yok: bu iki üründe sahne görseli kullanılan her yerde yeni stüdyo görselini kullan (ya da sahne kalemini bu iki ürün için kaldır). Kare teneke hiçbir yerde bu iki ürünle görünmesin.
3. Hero ürün kartı (`hero-card-asset.json`): 10 kg ürünü gösteriyorsa küçük görselleri yeni stüdyo görselinden üret, alt metni "Doğal Kırma Yeşil Zeytin, 3 L teneke" yap. Sinematik hero sahne katmanlarında (`lib/media/hero-layers.json`, `urun-01-kirma-10kg.png`) kare teneke varsa DOKUNMA, yalnız Coder Notu'na yaz (sahne tasarımı ayrı karar).
4. Statik katalogda iki ürünün ambalaj/ağırlık değeri `"3 L"` olsun (yağ ürünlerindeki "1 L"/"5 L" yazımıyla tutarlı). Ürün kimlikleri (`sample-green-olive-10kg`, `sample-brined-green-olive-5kg`) ve SKU/slug DEĞİŞMEZ (sepet/sipariş bağları bozulmasın). Fiyat, stok, sıra aynen kalır.
5. Açıklamaları güncelle: "10 kg teneke"/"5 kg tenekede" → "3 L yuvarlak teneke". Kalan cümleler aynı kalsın; "%100/organik/doğal" iddiası ekleme ("Doğal Kırma" ürün adı istisna).
6. Sitede "10 kg" ya da "5 kg" yazısının bu iki ürün için kaldığı başka yer varsa (alt metinler, şema/JSON-LD, llms.txt, teklif seçici, upsell, test sabitleri) aynı biçimde güncelle. Diğer 4 ürüne dokunma.
7. **Canlı veritabanı için snippet** yaz, ÇALIŞTIRMA: `supabase/snippets/teneke-3lt.sql` → bu iki id için `update public.products set weight = '3 L' where id in (...)` (sütun adını şemadan doğrula; açıklama da DB'de tutuluyorsa onu da güncelle). Tek transaction, önce/sonra `select` ile kontrol satırları. Seed dosyasını da aynı değerlere çek.

## Kabul kriterleri
- [ ] Birim testi: statik katalogda iki ürünün ağırlığı "3 L", fiyat/stok/id eskisiyle aynı.
- [ ] Birim testi: iki ürünün açıklamasında "10 kg"/"5 kg" geçmez, "3 L" geçer.
- [ ] Kaynak taraması: repo içinde bu iki ürünle ilişkili "10 kg"/"5 kg" kalmadı (komut çıktısı Coder Notu'nda).
- [ ] Görsel dosyaları mevcut, boyutları srcset ile uyumlu, kare teneke bu iki ürünün hiçbir görsel referansında kalmadı.
- [ ] `supabase/snippets/teneke-3lt.sql` var, transaction içinde, yalnız iki id'yi etkiler.
- [ ] `npm test`, lint, typecheck, build yeşil; main push, exact-SHA CI, Vercel REST yayını READY, makbuz `.cache/task-182/final-receipt.json`.
- Canlı DB güncellemesi: Claude script hazırlar, kullanıcı çalıştırır. Görsel kabul: Claude canlıda doğrular.

## Yapılmaması gerekenler
- Canlı veritabanına bağlanma/yazma. Fiyat, stok, ürün id, sıralama, ödeme, sepet mantığı değişmez.
- Diğer 4 ürüne ve sinematik sahne tasarımına dokunma. Yeni görsel üretme.

## Durum: BEKLİYOR
