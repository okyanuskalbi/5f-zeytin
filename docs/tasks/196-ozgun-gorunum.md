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
- [x] Unit: BRIEF içerik ve sıra testleri geçmeye devam eder; yasaklı referans ifadeleri testi (yukarıdaki liste) eklenir ve geçer.
- [x] `output/task196/karsilastirma/` yan yana görüntüler + Coder Notu'nda bölüm bölüm fark listesi.
- [x] e2e: mevcut 154 tarayıcı testi yeni tasarıma göre güncellenip geçer (renk karşıtlığı 0 ihlal, CLS < 0.05, taşma yok, video oynar, azaltılmış hareket, kaydırmaya bağlı hareket yok — kayan şerit hariç).
- [x] `npm run lint`, `typecheck`, `test`, `build`, `git diff --check` yeşil.

## Yapılmaması gerekenler
- Müşterinin istediği bölümleri/metinleri silmek ya da sırasını değiştirmek; yeni iddia (rakam, ödül, sertifika).
- Referans sitenin görsel/ikon/yazı tipini almak; yeni görsel üretimi (mevcut onaylı görseller + müşteri görselleri).
- Push/yayın yok; `node_modules`/`.next` SİLME; AFINA-KAYNAK git'e eklenmez. Tek kayıt.
- `docs/` altında yalnız bu dosyaya Coder Notu ve Durum.

## Coder Notu

- BRIEF.md, 192–195 Coder Notları ve 192-1 video düzeltmesi önce okundu. Referansın mevcut görüntüleri ve yeniden tamamen yüklenen 1440/390 görüntüleri incelendi; referansın metni, görseli, logosu, ikonu veya yazı tipi taşınmadı. Bekleyen hikâye ve yağ görselleri için önceki onaylı geçici kaynaklar korundu.
- `frontend-design` ile uygulamadan önce `output/task196/PLAN.md` yazıldı; renk, yazı, yerleşim ve tek marka imzası tanımlandı. `ui-ux-pro-max`, `better-layout`, `better-typography`, `better-colors`, `avoid-ai-ui-cliches` ve tam denetim tablosu, `motion-framer`, `responsiveness-check`, `frontend-patterns`, `tdd-workflow` ve mevcut e2e düzeni kullanıldı; kurulu Next.js CSS kılavuzu okundu. Güncel görev ve kullanıcının tercihi, skill dosyalarındaki tarihsel v9 hareket/renk önerileri ile çoklu kayıt önerisinin önündedir. Yeni skill, bağımlılık veya global ayar kurulmadı.
- Alt ajanlar tasarım planı/karşılaştırma ve ana sayfa, menü/alt bilgi/iç sayfalar, testler rollerinde çalıştı. Plan ayrıca uygulamadan önce bağımsız denetlendi; gerçek sayfa görüntüleri uygulama sonrasında yeniden eleştirildi. 21st aramasındaki 28291/35677/33290 örnekleri incelendi; eşit kolon, genel yuvarlak tepe ve ilgisiz hareket nedeniyle hazır aktarılmadı. Mevcut bileşenler yeniden düzenlendi; ücretli kaynak alınmadı.
- Küçük kararlar: dört ürünü korurken son kartı yalnız bırakan 3+1 yerine 2×2 raf seçildi. Referansın hasadı zaten 2×2 ikon kartı olduğundan bu öneri elendi; çerçevesiz ve numarasız metin grupları kullanıldı. Kavis yalnız hikâye/kurumsal ana fotoğraflarında tutuldu. Orijinal dal/el logosu değiştirilmedi; büyük slogan imza bandında, alt bilgide aynı slogan küçük Inter yazısıyla kullanıldı. Şampanya altını dekoratif ayrıntıda, koyu altın okunabilir küçük yazıda; yeşil ana eylemlerde kullanıldı. Yerel Fraunces/Inter korundu.

### Bölüm bölüm farklar

- Açılış: müşterinin videosu, posterleri, metinleri ve eylemleri aynen korundu; videonun oynatma mantığı değiştirilmedi. Üst menü açık kâğıt yüzeyi, yeşil taban çizgisi ve belirgin mağaza eylemiyle yeni dile uyarlandı.
- Dört giriş: yuvarlak madalyonlar yerine masaüstünde iki çift, telefonda dört yatay fotoğraf/metin satırı. Başlıklar, alt bağlantı metinleri ve hedefler aynı.
- Ürünler: küçük üst yazı ve sağ üst düğme kalıbı yerine dar başlık alanı yanında 2×2 raf; Tüm Ürünler kartların sonunda. Öne çıkanlarda fotoğraf ve bilgisi yan yana duran daha yatay raf; iki bölümde de dört gerçek ürün ve önceki farklı seçim sırası korunur.
- Hikayemiz: metin solda, karşılıklı kavisli fotoğraf sağda; müşterinin istediği üç değer/ikon ayrı alt satırda. TOPRAKTAN SOFRAYA kaldırıldı.
- Üç banner: bir büyük tesis fotoğrafı ve iki küçük yatay fotoğraf/metin alanı; eşit dikey kartlar, 01–03 ve Keşfedin kaldırıldı. Üç başlık ve hedef aynı.
- Bereketin Hasat Vakti: açık zemin, dört numarasız/çerçevesiz metin grubu ve sağda müşteri fotoğrafı. TARLADAN SOFRAYA kaldırıldı; müşteri başlığı, açıklaması, dört madde ve Hikayemizi Keşfet hedefi aynen korundu.
- Şerit: küçük yaprak ayraçlı ince yeşil bant; aynı beş kelime, durdurma/devam ve azaltılmış harekette sabit içerik korunur.
- Toptan/Bayilik: müşteri isteğine uygun düz yüzeyli iki kutu ve mevcut ayrı sayfa hedefleri korunur; fotoğraf eklenmedi.
- Blog: Zeytin Defteri adı, büyük ilk yazı ve iki yatay yazı düzeni; dört özgün yazının metni/adresi değişmedi. Ayrı blog sayfası, yazıların koleksiyon bağlantısı ve llms başlığı tutarlı güncellendi.
- Alt imza/alt bilgi: güven maddeleri şeridi yerine orijinal marka ve mevcut slogan; dört eşit alt sütun yerine büyük kimlik alanı ve iki bağlantı kümesi. İletişim, yasal, hesap, sipariş ve ödeme bilgileri eksiltilmedi; bağlantı hedefleri en az 48 px.
- İç sayfalar: `/urunler`, kategori, `/urun/[slug]`, `/hakkimizda`, `/toptan-satis`, `/blog` ve yazılar aynı renk, yazı ve boşluk diline uyarlandı. Gerçek galeri, boy/adet, sepet, teklif seçimi, doğrulama ve gönderilmemiş e-posta taslağı davranışı korundu.

### Doğrulama ve sınırlar

- RED: yeni yasak ifade/blog kimliği testinde eski görünümde iki beklenen hata görüldü; müşteri birebir metin testi başarılıydı. Yeni görünüm sonrası yeşil. Eski ürün görseli ve alt bilgi testlerinin beş stil beklentisi yeni düzene uyarlandı; görsel için ayrılan boyutlar, kırpma, mobil boşluk, 64 px görsel seçicileri, odak ve 48 px dokunma sınırı korundu; test silinmedi veya gevşetilmedi.
- Ek RED/GREEN: normal telefon açılışında video düğmesinin Oynat → Duraklat değişimi 14,625 px kayma ve CLS 0,000218 üretiyordu. Kaynak öğe ölçümü `output/task196/video-control-before.json` içinde. Kalıcı video testine konum/genişlik kontrolü eklendi ve iki genişlikte önce başarısız oldu. Düğmeye yazıyla orantılı 9,5 em minimum genişlik ayrıldı; etiket ve oynatma davranışı korunarak kayma giderildi. CLS eşiği gevşetilmedi.
- Son yerel kod kapıları: `npm run lint`, `npm run typecheck`, `npm run build`, `git diff --check` başarılı. 162 dosyada 1.473 birim testi başarılı; önceden yapılandırılmamış yerel veritabanına ait 26 test/6 dosya atlandı. Canlı veritabanına bağlanılmadı.
- Son tarayıcı paketi: önceki 154 + yeni 6 = **160/160 başarılı**, atlanan veya tekrar sayesinde başarılı sayılan senaryo yok. Yasak ifadeler, birebir müşteri metinleri/sıra, 320/390/768/1440 ve %200 metin, menü/sepet/ürün/teklif, gerçek video zamanının ilerlemesi ve durdurulması, azaltılmış hareket/veri tasarrufu/hata yedeği, kaydırmaya bağlı hareket olmaması, renk karşıtlığı ve taşma kontrolleri geçti. Son rapor `output/task196/e2e-results.json`; günlükler aynı klasörde.
- Son görüntü/ölçüm: 320/375/768/1024/1280/1440/1920/2560 genişliklerinde yatay taşma ve yüklenmeyen görsel 0. 390/1440 normal modda üçer temiz açılışın altısında CLS 0; aynı genişliklerin renk karşıtlığı ihlali 0. Beş iç sayfanın 390/1440 görüntüleri ve ölçümleri de geçti. Son kayıt `output/task196/visual-report.json`.
- Karşılaştırma: `output/task196/karsilastirma/index.html`, 1440 ve 390 genişlikte 13'er bölüm/üst menü/alt bilgi, toplam 26 yan yana görüntü. Referansta olmayan Toptan/Bayilik bölümü solda açıkça belirtilir. Bunlar yerel görsel incelemedir; müşterinin ayrı tasarım onayı veya fiziksel cihaz kabulü değildir.
- Gerçek altı SKU, fiyat/stok, video dosyaları ve sunucu davranışı değişmedi. Push/yayın, canlı DB, ödeme veya ortam değişikliği yok. `AFINA-KAYNAK` Git dışında; `node_modules` ve `.next` korundu. Bu görevin dosyaları tek yerel kayıtta tutulur; yalnız bu görev belgesi `docs/` altında değiştirildi.

## Durum: TAMAMLANDI
