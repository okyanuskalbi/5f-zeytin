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
- [x] Birim testi: statik katalogda iki ürünün ağırlığı "3 L", fiyat/stok/id eskisiyle aynı.
- [x] Birim testi: iki ürünün açıklamasında "10 kg"/"5 kg" geçmez, "3 L" geçer.
- [x] Kaynak taraması: repo içinde bu iki ürünle ilişkili "10 kg"/"5 kg" kalmadı (komut çıktısı Coder Notu'nda).
- [x] Görsel dosyaları mevcut, boyutları srcset ile uyumlu, kare teneke bu iki ürünün hiçbir görsel referansında kalmadı.
- [x] `supabase/snippets/teneke-3lt.sql` var, transaction içinde, yalnız iki id'yi etkiler.
- [x] `npm test`, lint, typecheck, build yeşil; main push, exact-SHA CI, Vercel REST yayını READY, makbuz `.cache/task-182/final-receipt.json`.
- Canlı DB güncellemesi: Claude script hazırlar, kullanıcı çalıştırır. Görsel kabul: Claude canlıda doğrular.

## Yapılmaması gerekenler
- Canlı veritabanına bağlanma/yazma. Fiyat, stok, ürün id, sıralama, ödeme, sepet mantığı değişmez.
- Diğer 4 ürüne ve sinematik sahne tasarımına dokunma. Yeni görsel üretme.

## Coder Notu

- 7 Kasım 2026: `frontend-patterns` ve `tdd-workflow` uygulandı. Kullanıcının yalnız yeşil nihai kayıt isteği nedeniyle RED/ara kayıt oluşturulmadı. Yeni UI bileşeni veya görsel üretimi yok.
- RED: `npm test -- tests/unit/teneke-182.test.ts --maxWorkers=2` → iki ürünün eski ağırlığı nedeniyle 2 FAIL. GREEN: `npm test -- --maxWorkers=2` → 125 dosya / 1463 test PASS. İki ürünün id/fiyat/stok ve yeni açıklamaları test edildi; SQL dosyası yerel bellek içi PostgreSQL üzerinde iki kez çalıştırılarak yalnız iki ağırlığı değiştirdiği doğrulandı. Canlı DB bağlantısı/yazımı yapılmadı.
- `npm run lint`, `npm run typecheck`, `npm run build` (Turbopack), `git diff --check` PASS. `npm run check:assets` PASS; `node --test scripts/check-v3-assets.test.mjs` → 7 PASS.
- Onaylı iki PNG'nin hash'leri kaynak kaydına eklendi. 6 ürün görsel anahtarı (küçük ürün, sahne ve stüdyo) yeni fotoğraflardan üretildi; AVIF 50 / WebP 76 başlangıç kalitesi ve mevcut boyut bütçeleri korundu. Galeri 800×1000 ve 1122×1402; 1600w dosyaları kaldırıldı, srcset gerçek boyutları kullanıyor. Küçük hero kartı 72/96/144/192/216/288w. Diğer 19 görsel kaydı, özellikle diğer dört ürün, önceki kayıtla birebir aynı.
- İki eski sahne anahtarı artık yeni stüdyo fotoğrafını gösteriyor; odakları ortalandı. Story'de yalnız ilgili fotoğrafın oranı 4:5 yapıldı. Sinematik `hero-layers.json` içindeki `zeytin-v3-gorseller/urun-01-kirma-10kg.png` eski kare teneke kaynağı görevdeki açık istisna gereği DEĞİŞTİRİLMEDİ; sahne tasarımı ayrı karar. Eski kimlikler/dosya anahtarları sipariş bağları için korundu.
- Kaynak taraması: `rg -n '10 kg|5 kg' app components lib supabase/snippets PRODUCT.md` → çıktı yok (0 eşleşme). Repo genelindeki tarihsel görev/referans/arşiv metinleri, eski onay hash'leri, genel serbest miktar testleri ve eski metnin bulunmamasını denetleyen testler korunur; bunlar canlı ürün metni değildir.
- `supabase/snippets/teneke-3lt.sql` kullanıcı tarafından çalıştırılmak üzere hazır; tek transaction, önce/sonra SELECT, yalnız iki id için weight UPDATE. Şemada ürün açıklaması sütunu yok; açıklamalar kodda. Seed güncellendi. Canlı katalog DB kullandığı için kullanıcı bu dosyayı çalıştırana kadar canlı ağırlık eski kalabilir.
- Vercel REST hedef erişim kontrolü yeniden denendi: HTTP **403 forbidden / Not authorized**; dağıtım oluşturulmadı, READY iddiası yok. Kullanıcının açık istisnası gereği kod işi TAMAMLANDI. Main gönderimi ve aynı kaynak kaydına ait GitHub doğrulama sonucu `.cache/task-182/final-receipt.json` içinde takip edilir.
- Tarayıcı çalıştırılmadı; görsel/canlı kabul Claude'da. Tarayıcı testlerindeki eski ürün metinleri güncellendi ama bu testler çalıştırılmadı. Bu devir ve canlı DB'nin kullanıcı tarafından uygulanması kod tamamlanmasını engellemez.

## Yayın — 7 Kasım 2026

- Task 181 + 182 içeren `bc4f16da4e025004ae3c5f6f8e8ceea6bf570d11`, aynı kayda ait [GitHub doğrulaması](https://github.com/okyanuskalbi/5f-zeytin/actions/runs/42370005956) başarılı olduktan sonra doğrudan Vercel REST ile yayımlandı. `dpl_GMnXJDmfsymRAbto7Spgkb9xGqXx` **READY**; `afinazeytin.com` bağlantısı doğrulandı. Önceki 403 yayın engeli kalktı.
- Canlı ana sayfa ve sekiz alt sayfa HTTP 200; sayfaların canonical adresleri, SSS boşlukları ve iki yeni ürün fotoğrafının kaynakla birebir eşleşmesi doğrulandı. Tarayıcı testi yapılmadı; tarayıcı/görsel kabul Claude'da. Kod ve canlı veritabanı değiştirilmedi.
- Canlı veritabanındaki ağırlık güncellemesi kullanıcıya ait ayrı adımdır; bu yayın onu uygulamaz.
- Güncel makbuz: `.cache/task-182/final-receipt.json` (Git dışında yerel kayıt).

## Durum: TAMAMLANDI

## Düzeltme 182-1 (Claude canlı denetimi, 7 Kas)
- Yeni iki teneke görseli kartlarda/“Tüm ürünler” ızgarasında krem dikdörtgen bir kutu içinde görünüyor (fotoğrafın kendi düz krem zemini). Diğer 4 ürün arka planı temizlenmiş dekupe görsel + yumuşak gölge. Ekran: `/private/tmp/claude-501/-Users-emre/862bcbce-6e8d-4a73-a71a-971f141b67f4/scratchpad/kontrol/grid-1440.png`.
- Düzelt: iki görseli diğer ürünlerle aynı biçime getir — arka planı şeffaf, kenarları temiz dekupe (altın ağız/kapak ve etiket kenarları bozulmadan), diğer ürünlerdeki gibi yumuşak zemin gölgesi; boyut/oran ve kadraj diğer kartlarla uyumlu (teneke kartta diğer ürünler kadar büyük görünsün). Önce diğer ürün görsellerinin nasıl hazırlandığına bak (`~/PROJELER/AFINA-KAYNAK/urun-gorselleri/hazirla.py`, `public/images/v3` boru hattı) ve aynı yolu izle. Yeni görsel ÜRETME; mevcut onaylı iki PNG'den dekupe çıkar. Ücretli API kullanma; yerel araç (Python/Pillow, var olan kurulu araçlar) kullan. Etiket yazıları ve renkler değişmesin.
- Canlı veritabanında weight hâlâ "10 kg"/"5 kg" (API). Arayüz "3 L" gösteriyor; arayüzün bu değeri nereden aldığını Coder Notu'na kısaca yaz (sepet/sipariş satırına DB değeri mi yazılıyor?). DB'ye dokunma.
- Bitince yine Vercel REST ile yayınla (token: Keychain `-a afina -s vercel-afina-token`, değeri asla yazdırma), READY + alias doğrula.
