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
- [x] `output/task196-kimi/karsilastirma/` yan yana görüntüler + Coder Notu'nda bölüm bölüm fark listesi.
- [x] e2e: mevcut 154 tarayıcı testi yeni tasarıma göre güncellenip geçer (renk karşıtlığı 0 ihlal, CLS < 0.05, taşma yok, video oynar, azaltılmış hareket, kaydırmaya bağlı hareket yok — kayan şerit hariç).
- [x] `npm run lint`, `typecheck`, `test`, `build`, `git diff --check` yeşil.

## Yapılmaması gerekenler
- Müşterinin istediği bölümleri/metinleri silmek ya da sırasını değiştirmek; yeni iddia (rakam, ödül, sertifika).
- Referans sitenin görsel/ikon/yazı tipini almak; yeni görsel üretimi (mevcut onaylı görseller + müşteri görselleri).
- Push/yayın yok; `node_modules`/`.next` SİLME; AFINA-KAYNAK git'e eklenmez. Tek kayıt.
- `docs/` altında yalnız bu dosyaya Coder Notu ve Durum.

## Coder Notu (Kimi)

- Önce `output/task196-kimi/PLAN.md` yazıldı. “Dal ve Etiket” yönü; #243A29/#F5F1E7/#D4B483, Fraunces/Inter ve logodaki ince dal çizgisi kullanıldı. Öz denetimde kemerli maskeler, her bölümde eyebrow, 3+1 ürün rafı ve fotoğraf üstünde yüzen hikâye kartı genel/kalıp bulunarak plandan çıkarıldı. Bu oturumda 21st MCP aracı yok; mevcut bileşenler ve Lucide kullanıldı, yeni paket/medya üretilmedi.
- Bölüm farkları:
  1. **Menü:** Ortalanmış referans menüsü yerine fildişi zemin, geniş AFİNA logosu, sağa yaslı bağlantılar, altın aktif işaret ve metin tipinde mağaza bağlantısı.
  2. **Hero:** Aynı video ve metinler; genel koyu kaplama yerine sol altta fildişi, kesik köşeli etiket paneli. Mobilde video ve içerik ayrı doğal akışta.
  3. **Dört kategori:** Yuvarlak/ortalanmış kartlar yerine iki sütunlu, kesik köşeli küçük fotoğraflı editoryal indeks; mobilde tek sütun. Dört başlık ve bağlantı metinleri aynı.
  4. **Ürünler ve öne çıkanlar:** Dört eşit kart yerine değişen genişlikli 2×2 katalog, açık etiket kartları ve mobil doğal yatay raf. “Tüm Ürünler” sağ üst kalıbından çıkarıldı; ürün sırası/verisi/sepet/teklif korundu.
  5. **Hikayemiz:** Sol fotoğraf + sağ metin/ikon sütunu yerine 5/7 metin-fotoğraf oranı ve üç değerin alt satırda yatay şeridi. “Hikayemizi Keşfet” `/hakkimizda`ya gidiyor.
  6. **Üçlü banner:** Eşit dikey kartlar, 01–03 ve “Keşfedin” kalktı; bir büyük tesis + iki küçük görsel mozaiği ve yeşil başlık etiketleri geldi.
  7. **Bereketin Hasat Vakti:** Numaralı liste yerine dört çizgisel simgeli 2×2 üretim defteri; koyu referans bloğu yerine açık zeytin yüzeyi. Fotoğraf sağda, bütün müşteri metinleri aynı.
  8. **Kayan şerit:** Büyük serif düz bant yerine ince yeşil bant ve yaprak ayraçları; kelimeler, duraklatma ve reduced-motion davranışı korundu.
  9. **Toptan/Bayilik:** Görselsiz iki kutu; ortak çerçeve ve bölücüyle düz zemin, gerçek sayfa bağlantıları korundu. Referansta bu ayrı bölüm yok; karşılaştırma dosyasında açıklandı.
  10. **Blog:** “Zeytin Rehberi” yerine “Zeytin Defteri”; eşit kartlar yerine küçük kapaklı editoryal yazı satırları. Liste/yazı sayfaları, llms.txt ve dört çalışan bağlantı aynı veriyle sürüyor.
  11. **İmza/footer:** Güven ikonu şeridi yerine logo + slogan + yöre imzası. Footer’da büyük slogan, gruplanmış bağlantılar, gerçek adres ve yüzeye uygun açık ödeme logoları var; kısa bağlantılar en az 44×48 px.
  12. **İç sayfalar:** `/urunler`, `/urun`, `/hakkimizda`, `/toptan-satis` ve `/blog` aynı kesik köşe, açık etiket, dal/altın çizgi ve tipografi diline uyarlandı; form ve ticari mantık değişmedi.
- TDD: Yeni özgünlük testleri başlangıçta 2/2 RED; uygulama sonrası GREEN. Blog adı, mozaik ana parçası ve llms metni ayrı RED→GREEN çalıştırıldı. Render incelemesinde mozaik seçici hatası ve mobil ok daralması bulunup düzeltildi; footer 44 px bulgusu da RED sonrası düzeltildi. Ayrıntı `output/task196-kimi/VERIFICATION.md`.
- Son komutlar: `npm run lint`, `npm run typecheck`, `npm run test` (**162 dosya/1473 PASS; 26 mevcut yerel-DB skip**), `npm run build` ve `git diff --check` PASS. Build için sembolik `node_modules` kullanan worktree'de Turbopack kökü ortak proje köküne çözülüyor; Node 24 JSON importları ve seed yükleyicisi uyumlu.
- Paketli headless Chromium, iki worker ve yalnız 3006: 189–195 kamu paketi **107/107 PASS**, ek renk paketi **48/48 PASS**, footer/logo/iç sayfa/bootstrap paketi **9 PASS / 3 mevcut proje-koşulu skip**; toplam **164 ilgili PASS**. Video gerçek decode/ilerleme/pause/resume, saveData, 404 poster, CLS < .05, taşma 0, kontrast 0, reduced-motion ve scroll-hareketsizlik PASS. Firefox/WebKit kurulu olmadığı için ayrı cross-browser kabulü yapılmadı; fiziksel cihaz yok.
- Kanıtlar: `output/task196-kimi/PLAN.md`, `evidence.json`, `render-report.json`, `VERIFICATION.md`, `afina/` ve 24 dosyalık `karsilastirma/`. 1440/390 full-page görüntüler gerçek production sunucusundan alındı ve incelendi. Masaüstü yakalamasında mevcut `/hesabim` prefetch'inin HTTPS-localhost SSL kaydı bulunuyor; sayfa renderını etkilemedi ve auth kodu değiştirilmedi.
- Genişletilmiş eski-suite denemesinde Task123 öncesi seçiciler güncel footer testlerine uyarlandı. İlişkisiz `legal.spec.ts` içindeki eski taslak metadata/ana-H1 beklentileri bu tasarım paketinin parçası değil; hukuk içeriği değiştirilmedi. Push, yayın, Vercel, canlı DB, ortam dosyası, dış klasör değişikliği veya yeni bağımlılık yok; `node_modules`/`.next` korundu.

## Durum: TAMAMLANDI

## Claude denetimi (10 Kasım 2026)

- Codex (3be6e3c) ve Kimi (96d2eaf) aynı görevi ayrı kopyalarda yaptı; yan yana karşılaştırma (`AFINA-KAYNAK/tasarim/uygulama-kontrol/AFINA-196-iki-tasarim-A-B.pdf`) sonrası kullanıcı **Kimi**yi seçti. Codex kaydı `dbf0aea` ile geri alındı, Kimi kaydı `e2f81c6` olarak alındı; Kimi'nin yalnız kendi kopyasına özel `next.config.ts` turbopack kökü değişikliği `139e072` ile çıkarıldı.
- Claude düzeltmesi `fab1fb6`: masaüstünde ana sayfa ürün kartı görsel alanı 320→236 px (kart 583→499 px); ana sayfa imza bandındaki slogan alt bilgide tekrarlandığı için marka cümlesi "Toprağın sunduğu lezzet, Afina’nın özeniyle." ile değiştirildi.
- Kapılar: lint, typecheck, `git diff --check` PASS; birim 1.473 PASS; yerel DB ile build + start 3004; 189–195/196 ilgili tarayıcı paketi chromium-390 + chromium-1440 **165 PASS**. BRIEF taraması: tek fark blog bölüm başlığının "Zeytin Defteri" olması (bölüm ve /blog bağlantıları yerinde, kabul edildi). Hero video gerçek Chrome/Chromium 1440 ve 390'da oynuyor; azaltılmış harekette video yok.
- Bilinen eski test: `tests/e2e/hero-performance.spec.ts` (Task125–149 v4 hero kartı) 192'de kaldırılan eski kahramanı arıyor ve 22 senaryoda kırmızı; 196 ile ilgisiz. Ayrı görevde kaldırılmalı/yeni videolu kahramana uyarlanmalı.
- Önizleme: `AFINA-KAYNAK/tasarim/uygulama-kontrol/AFINA-yeni-site-onizleme-3.pdf` + `AFINA-yeni-anasayfa-gezinti-3.mp4`. Yayın kullanıcı onayı bekliyor.
