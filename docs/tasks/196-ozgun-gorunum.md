# Task 196: Özgün görünüm — örnek siteye benzememe

## Tür
frontend (tasarım)

## Amaç
Kullanıcı (10 Kasım 2026): "kopyalamış gibi olmasın site ona göre düzenle". 192–195 ile kurulan yeni site, müşterinin istediği **içerik ve bölüm sırasını** (BRIEF.md) korur. Görünüm ise kokluzeytincilik.com.tr'ye benzemeyecek, AFİNA'ya özgü bir kimlikle yeniden düzenlenir. Bir ziyaretçi iki siteyi yan yana açınca "kopya" dememeli.

## Bağlam
- Müşteri metni: `AFINA-KAYNAK/musteri-2026-11-10/BRIEF.md`. Referans görüntüleri: `output/task192/referans/` (yoksa siteyi aç, bölüm bölüm görüntü al).
- Mevcut uygulama: ana sayfa (`components/landing/Customer*`), üst menü, alt bilgi, `/urunler`, `/urun/[slug]`, `/hakkimizda`, `/toptan-satis`, `/blog`.
- Marka: zeytin yeşili `#243A29`, fildişi `#F5F1E7`, şampanya altını `#D4B483`. İmza öğe: logodaki **altın zeytin dalı + el** motifi. Slogan "Köklerinden aldığı güçle büyüyor" / "Kökü toprakta. Yeri sofrada." (mevcut). Açık ton korunur.
- Kopya izlenimi veren mevcut noktalar (Claude tespiti; hepsi değişecek):
  1. Referanstaki üst yazılar birebir: "TOPRAKTAN SOFRAYA" (Hikayemiz), "TARLADAN SOFRAYA" (Bereketin Hasat Vakti). Ayrıca her bölümde aynı kalıp var: büyük harfli küçük üst yazı + başlık + açıklama + sağda düğme.
  2. 4 kutu: referanstaki gibi yuvarlak görsel + başlık + alt bağlantı dizilimi.
  3. 3'lü banner: referanstaki gibi eşit üç dikey görsel + "01 / 02 / 03" numara + "Keşfedin".
  4. Bereketin Hasat Vakti: referanstaki gibi solda numaralı 01–04 madde listesi + sağda fotoğraf.
  5. Hikayemiz: referanstaki gibi solda görsel, sağda metin + 3'lü ikon listesi dizilimi.
  6. Ürün bölümleri: referanstaki gibi başlık bloğu + sağ üstte "Tüm Ürünler" + 4'lü kart sırası.
  7. Alt bilgiden önceki güven şeridi (referanstaki 5'li şerit gibi) ve alt bilgi sütun düzeni.
  8. Kayan şerit referanstaki gibi düz yazı bandı.

## Değişmeyecekler (müşteri istedi)
- Bölüm sırası ve içerikleri. Müşterinin yazdığı metinler aynen kalır: 4 kutu başlıkları ve "Ürünleri İnceleyin" / "Hakkında Bilgi Alın"; "Bereketin Hasat Vakti" başlığı ve açıklaması; "Elle Hasat", "Doğal Dinlendirme", "Özenli Paketleme", "%100 Doğal ve Katkısız"; kayan şerit kelimeleri; "Hikayemizi Keşfet" → Hakkımızda; Toptan Satış / Bayilik Başvurusu düz zeminde iki kutu; blog.
- Hero video, ürün verisi, sayfa adresleri, sepet/teklif akışı, açık ton.

## Kullanılacak araçlar
- Fiilen yükle: `frontend-design` (önce kısa tasarım planı: renk, yazı, yerleşim, ilkeler; ardından "genel/kalıp mı?" öz incelemesi), `ui-ux-pro-max`, `better-layout`, `better-typography`, `better-colors`, `avoid-ai-ui-cliches` ya da `audit-ai-design-slop`, `motion-framer`, `responsiveness-check`.
- **Codex alt ajanları (multi_agent):** (a) tasarım planı + karşılaştırma, (b) ana sayfa bölümleri, (c) menü/alt bilgi/iç sayfalar, (d) testler.

## Adımlar
1. **Tasarım planı** (`output/task196/PLAN.md`): AFİNA'ya özgü yön. Öneriler (zorunlu değil, daha iyisini seçebilirsin):
   - Zeytin dalı motifi bölümler arası ince çizgisel geçiş ya da başlık süsü olarak (tek imza öğe, abartısız).
   - Kemer/yaprak biçimli görsel maskeleri ya da asimetrik, üst üste binen fotoğraf kompozisyonları; eşit kart dizileri yerine ritimli yerleşim.
   - 4 kutu: yuvarlak yerine dikey kemerli fotoğraf kartları ya da yatay şerit. 3'lü banner: bir büyük + iki küçük mozaik, numarasız, başlıklar görsel üstünde.
   - Bereketin Hasat Vakti: numaralı liste yerine 2×2 küçük ikonlu kartlar (çizgisel zeytin/el/kutu/yaprak simgeleri), fotoğraf kemerli maske.
   - Hikayemiz: tam genişlik fotoğraf üstünde metin kartı ya da metin solda fotoğraf sağda + değerler alt satırda yatay.
   - Kayan şerit: zeytin yaprağı ayraçlı, marka renginde ince bant (yazı + küçük dal simgesi).
   - Üst yazı kalıbını bırak: her bölümde büyük harfli üst yazı kullanma; başlık hiyerarşisini yazı tipi ölçeğiyle kur.
   - Ürün bölümü başlıkları ve "Tüm Ürünler" yerleşimi farklı (ör. başlık solda, kartlar yatay kaydırmalı raf ya da 3+1 düzen).
   - Alt bilgiden önceki 5'li güven şeridi kaldırılır ya da AFİNA'ya özgü tek satırlık bir slogan/imza bandına dönüşür; alt bilgi sütunları yeniden düzenlenir (ör. solda büyük logo + slogan, sağda gruplanmış bağlantılar).
   Planı yazdıktan sonra kendini denetle: hangi kısım "her zeytin sitesinde olur" kalıbı? Onu değiştir.
2. **Uygula:** ana sayfa + üst menü + alt bilgi; iç sayfalar (`/urunler`, `/urun`, `/hakkimizda`, `/toptan-satis`, `/blog`) aynı yeni dile uyarlanır.
3. **Benzerlik denetimi** (`output/task196/karsilastirma/`): her bölüm için referans ve AFİNA görüntüsü yan yana (1440 ve 390). Coder Notu'nda bölüm bölüm "ne farklı" listesi.
4. Metin taraması: referanstaki ifadeler sitede geçmez: "TOPRAKTAN SOFRAYA", "TARLADAN SOFRAYA", "Doğallığın", "Keşfedin" (numaralı banner), "Sizden Gelen", "Rehberi" yerine AFİNA'ya özgü blog başlığı (ör. "Zeytin Defteri"), "Daha Fazlasını Keşfet", "En Beğenilen". Müşterinin kendi yazdığı ifadeler hariç.

## Kabul kriterleri
- [ ] Unit: BRIEF içerik ve sıra testleri geçmeye devam eder; yasaklı referans ifadeleri testi (yukarıdaki liste) eklenir ve geçer.
- [ ] `output/task196/karsilastirma/` yan yana görüntüler + Coder Notu'nda bölüm bölüm fark listesi.
- [ ] e2e: mevcut 154 tarayıcı testi yeni tasarıma göre güncellenip geçer (renk karşıtlığı 0 ihlal, CLS < 0.05, taşma yok, video oynar, azaltılmış hareket, kaydırmaya bağlı hareket yok — kayan şerit hariç).
- [ ] `npm run lint`, `typecheck`, `test`, `build`, `git diff --check` yeşil.

## Yapılmaması gerekenler
- Müşterinin istediği bölümleri/metinleri silmek ya da sırasını değiştirmek; yeni iddia (rakam, ödül, sertifika).
- Referans sitenin görsel/ikon/yazı tipini almak; yeni görsel üretimi (mevcut onaylı görseller + müşteri görselleri).
- Push/yayın yok; `node_modules`/`.next` SİLME; AFINA-KAYNAK git'e eklenmez. Tek kayıt.
- `docs/` altında yalnız bu dosyaya Coder Notu ve Durum.

## Durum: BEKLİYOR
