# Task 192: Açık tema + yeni ana sayfa kurgusu (Köklü Zeytincilik referanslı)

## Tür
frontend

## Amaç
Müşteri revizesi (10 Kasım 2026): ana sayfa `https://www.kokluzeytincilik.com.tr/` yapısı örnek alınarak, **daha açık tonda** yeniden kurulur. Müşteri metni birebir: `AFINA-KAYNAK/musteri-2026-11-10/BRIEF.md` (önce bunu oku). Referans sitenin yapısı alınır; metinleri, ürünleri, logoları, görselleri, yorumları ve rakamları **kopyalanmaz**.

## Bağlam
- 188–191 tamam (yayında değil): `/urunler`, kategori sayfaları `/urunler/<grup>`, renk düzeni (C açık tema + koyu kapsamlar), hafif hareketler (kaydırmaya bağlı yok, `MotionConfig reducedMotion="user"`, `domAnimation`).
- Bu görev C ana sayfasını (`app/page.tsx`, `components/landing/ClassicHome*`, `ProductGroups`, `RenewalLanding` içindeki bölümler) yeni kurguyla değiştirir. Toptan teklif formu 194'te ayrı sayfaya taşınır; bu görevde ana sayfada formu KALDIRMA (194 yapacak), sadece yeni bölüm sırasının sonunda bırak ya da 194'e kadar geçici yerinde tut — 194 bitince ana sayfada form olmayacak.
- Gelen görseller (yazısız, 1086×1448 dikey): `AFINA-KAYNAK/musteri-2026-11-10/` → `fabrika.jpg`, `her-tanede-ayni-ozen-el.jpg`, `bereketin-hasat-vakti.jpg`; video `hero-video-zeytinlik.mp4` (1920×1080, 25 fps, 17 sn, 103 MB).
- Projede görsel türevleri `public/` + manifest + `scripts/check-*` desenleriyle yönetiliyor (`lib/media/classic-photos.json`, `check-classic-assets.mjs`, `sourcesAvailable` deseni: kaynak AFINA-KAYNAK'ta yoksa CI'da atlanır). Aynı deseni izle; **AFINA-KAYNAK git'e eklenmez**.

## Kullanılacak araçlar
- Fiilen yükle: `ui-ux-pro-max` (§1, §2, §3, §5, §7), `frontend-design`, `better-layout`, `better-colors`, `better-accessibility`, `motion-framer`, `responsiveness-check`, `web-perf`.
- ECC: `frontend-patterns`, `tdd-workflow`, `e2e-testing`.
- **Codex alt ajanları (multi_agent):** (a) medya hazırlığı (video/fotoğraf türevleri), (b) tema + üst menü + alt bilgi, (c) ana sayfa bölümleri, (d) testler.
- Referans sitesini tarayıcıyla aç ve bölümlerinin masaüstü/telefon görüntüsünü al (`output/task192/referans/`); yerleşim oranlarını oradan al.

## Renk ve genel görünüm (açık ton)
- Zemin beyaz / çok açık krem (`#FFFFFF`, `#FAF8F2`, `#F5F1E7`), yazı koyu zeytin-mürekkep (`#172B21`), ikincil yazı `#4F594B`, vurgu altın (`#88630B` düğme, `#B58933` çizgi) ve zeytin yeşili (`#243A29`) yalnız küçük vurgularda. Koyu bant/koyu kutu yok (hero videonun üstündeki okunurluk katmanı hariç).
- **Üst menü açık:** beyaz/krem zemin, koyu yazı, alt ince çizgi; logo açık zemine uygun sürüm (mevcut `BrandLogo` tonları). Menü: Ana Sayfa, Ürünler (`/urunler`, açılır alt: Zeytinyağı, Zeytin, Siyah/Yeşil/Kırma), Hakkımızda (`/hakkimizda`, 194), Toptan Satış (`/toptan-satis`, 194), Bayilik (`/bayilik`), Blog (`/blog`, 195), İletişim (alt bilgiye/iletişim bölümüne). Sağda "Online Mağaza", sepet, hesap. Telefon menüsü de açık temaya uyar.
- 189'daki `data-surface="dark"` kapsamları yeni açık tasarımda gereksiz kalanlar kaldırılır; renk testi (axe, 0 ihlal) ve alt bilgi testleri yeni tasarıma göre güncellenip geçer. `html` zemini alt bilgi rengine eşitlenir (açık alt bilgi → açık).

## Ana sayfa bölüm sırası (BRIEF'e birebir)
1. **Hero video:** `hero-video-zeytinlik.mp4` tam genişlik, otomatik, sessiz, döngü, `playsInline`; üstünde okunurluk katmanı + kısa başlık/alt yazı + 2 düğme ("Ürünleri İnceleyin" → `/urunler`, "Toptan Teklif Al" → `/toptan-satis`). Mevcut C hero başlığı "Doğal, Lezzetli, Güvenilir Zeytin" ve alt yazısı kullanılabilir. Web türevleri: 1920 ve 1280 genişlik H.264 MP4 (+ isteğe bağlı WebM), telefon için 720 ya da dikey kırpım; toplam her biri ≤ 6 MB hedef, ses kanalı yok; ilk kare poster (AVIF/WebP/JPEG). `prefers-reduced-motion` → yalnız poster. Video ilk boyamayı geciktirmez (poster LCP, video sonra).
2. **4 kutu** (referanstaki kategori kutuları gibi, yuvarlak/kare görsel + başlık + alt yazı):
   - "Zeytinyağı" – "Ürünleri İnceleyin" → `/urunler/zeytinyagi`
   - "Zeytin" – "Ürünleri İnceleyin" → `/urunler/zeytin` (193 bu üst kategoriyi ekler; bu görevde bağlantı 193'te çalışır hale gelir, testte 193 sonrası doğrulanır)
   - "Tesisimiz" – "Hakkında Bilgi Alın" → `/hakkimizda`
   - "Bayilik" – "Hakkında Bilgi Alın" → `/bayilik`
   Görseller: mevcut onaylı fotoğraflar (`zeytinyagi`, `siyah-zeytin`/`kirma-zeytin`, `fabrika.jpg` türevi, `zeytin-dali`).
3. Referanstaki 2 banner alanı **YOK**. Müşteri yorumları **YOK**.
4. **Ürünler bölümü** (referanstaki "Doğallığın En Güzel Halleri" yapısı): küçük üst yazı + başlık + kısa açıklama + "Tüm Ürünler" düğmesi (`/urunler`) + 4'lü ürün ızgarası (mevcut `ProductCard` ile; kart tıklanınca ürün sayfası 193). Başlık önerisi: üst yazı "ÜRÜNLERİMİZ", başlık "Sofranız İçin Seçtiklerimiz", açıklama "Kendi tesisimizde hazırlanan zeytin ve zeytinyağlarımız." "kişi inceliyor", yıldız, sahte indirim YOK.
5. **Hikayemiz:** solda görsel (müşterinin "Nesillerin Emeği Toprağın Bereketi" yazısız görseli henüz gelmedi → şimdilik mevcut onaylı bir zeytinlik/zeytin dalı fotoğrafı; görsel yolu tek yerde, değiştirilmesi kolay), sağda üst yazı "TOPRAKTAN SOFRAYA", başlık "Hikayemiz", alt başlık "Nesillerin Emeği, Toprağın Bereketi", açıklama (geçici, müşteri metni gelince değişecek): "AFİNA ZEYTİN, Osmaniye Düziçi'nin Ellek zeytinliklerinden gelen zeytinleri kendi tesisinde hazırlayıp sofralara ulaştırır." + "Hakkımızda" düğmesi (`/hakkimizda`) + sağda 3'lü ikon listesi: "Geleneksel Üretim – Nesilden nesile aktarılan bilgi ve tecrübe", "%100 Doğal – Katkı maddesi içermez", "Kendi Tesisimizde – Ayıklama, salamura ve paketleme tek çatı altında". Hafif hareket: görsel üzerinde yavaş tek seferlik yakınlaşma ya da açılışta değil **üzerine gelince** hafif hareket (kaydırmaya bağlı YOK).
6. **İkinci ürün ızgarası:** "Öne Çıkan Ürünler" (indirim verisi yok; "İndirimdeki" yazma) + "Tüm Ürünler" düğmesi; ilk ızgaradan farklı sıra/ürünler.
7. **3'lü banner** (referanstaki "01 Doğadan Keşfet / 02 En Güzel Keşfet / 03 Haliyle Keşfet" yapısı, dikey görseller): 01 "Tesisimiz" (`fabrika.jpg`) → `/hakkimizda`; 02 "Her Tanede Aynı Özen" (`her-tanede-ayni-ozen-el.jpg`) → `/urunler/zeytin`; 03 "Zeytinyağı" (zeytinyağı paylaşım görseli henüz gelmedi → şimdilik mevcut onaylı zeytinyağı fotoğrafı) → `/urunler/zeytinyagi`. Hafif hareket: üzerine gelince görsel 1.04 yakınlaşma + numara/ok kayması.
8. "Bahçeden kısa videolar" **YOK**.
9. **Bereketin Hasat Vakti** (referanstaki "Her Damlada Ayvalık'ın Emeği" yerine): sağda `bereketin-hasat-vakti.jpg`, solda üst yazı "TARLADAN SOFRAYA", başlık "Bereketin Hasat Vakti", açıklama birebir: "Afina Zeytin, her hasatta aynı özenle doğanın bereketini seçkin bir lezzete dönüştürür." ve 4 madde (numaralı 01–04): "Elle Hasat – Zeytinler olgunluk zamanında, dallar incitilmeden toplanır.", "Doğal Dinlendirme – Zeytinler salamurada acele edilmeden dinlendirilir.", "Özenli Paketleme – Kendi tesisimizde hijyenik koşullarda paketlenir.", "%100 Doğal ve Katkısız – Katkı maddesi eklenmez." Rakamlı 4 istatistik (500.000+ vb.) YOK. Altında "Hikayemizi Keşfet" → `/hakkimizda`.
10. **Kayan şerit:** sürekli kayan bant: "Zeytin · Zeytinyağı · Geleneksel Salamura · %100 Doğal · Katkısız" (tekrarlı). CSS animasyonu; `prefers-reduced-motion` → durur (statik). Ekran okuyucuya bir kez okunur (tekrarlar `aria-hidden`). Bu kaydırmaya bağlı değil, zamanla akar (müşteri açıkça istedi).
11. **Toptan Satış + Bayilik ikili kutu:** düz açık zemin, arka plan görseli YOK; iki kutu; "Toptan Satış" → `/toptan-satis`, "Bayilik Başvurusu" → `/bayilik`. Metinler mevcut C kutularındaki gibi.
12. **Blog önizleme:** üst yazı "BLOG", başlık "Zeytin Rehberi", kısa açıklama, "Tüm Yazıları Gör" → `/blog`, 3 yazı kartı (195'teki yazılar; bu görevde veri kaynağını 195 ile ortak kur: `lib/blog/` — 192 önce oluşturursa 195 genişletir).
13. **Güven şeridi** (referanstaki 5'li alt şerit gibi, alt bilgiden hemen önce, isteğe bağlı): "Kendi Tesisimizde Üretim", "Özenli Paketleme", "Güvenli Alışveriş" vb. — yalnız doğru bilgiler (hızlı kargo/aynı gün kargo gibi vaat YOK).
14. **Alt bilgi (açık tema):** logo + kısa tanıtım, sütunlar: Kurumsal (Hakkımızda, Toptan Satış, Bayilik, Blog, İletişim), Kategoriler (Zeytinyağı, Zeytin, Siyah/Yeşil/Kırma), Müşteri Hizmetleri (Hesabım, Sipariş Takip, Sepetim), Yasal (KVKK, Mesafeli Satış, İade ve İptal); iletişim (mevcut telefon/adres/e-posta), ödeme logoları, © satırı. Bülten formu YOK (e-posta servisi yok).

Kaldırılan eski ana sayfa bölümleri: C hero (fotoğraf), güven şeridi (yeni yapıyla değişir), Modern Üretim Tesisimiz bölümü (Hakkımızda'ya taşınır, 194), Ürün Gruplarımız 4 fotoğraf (yerine 2. madde), koyu fotoğraflı Toptan/Bayilik bandı, "Ellek'ten sofranıza", SSS ve iletişim bölümleri (SSS ve iletişim 194'te Hakkımızda sayfasının altına taşınır; ana sayfadaki `#iletisim`, `#toptan`, `#urunler`, `#hakkimizda`, `#tesisimiz` eski bağlantıları kırılmasın: uygun bölüme ya da sayfaya yönlensin).

## Kabul kriterleri
- [ ] Unit: bölüm sırası ve metinler BRIEF'e uygun (yukarıdaki 1–14); yasak içerik yok (yorum, rakamlı istatistik, "kişi inceliyor", sahte indirim, "İndirimdeki", "aynı gün kargo"). Referans sitenin metinleri birebir kopyalanmamış (ör. "Ayvalık", "Köklü", "Doğallığın En Güzel Halleri" geçmez).
- [ ] Video: türev dosyalar boyut sınırında, poster var, azaltılmış harekette video oynamaz; LCP poster.
- [ ] e2e: renk karşıtlığı (axe) 0 ihlal (ana sayfa, `/urunler`, kategori, bayilik; 390/1440; açık/koyu işletim sistemi modu aynı), alt bilgi altında farklı renkte boşluk yok, CLS < 0.05, kaydırmaya bağlı hareket yok (kayan şerit hariç; şerit azaltılmış harekette durur).
- [ ] Lighthouse benzeri yerel ölçüm: ana sayfa LCP (yerel, 4x CPU yavaşlatma yok) poster görseli; toplam ilk yükte video indirimi `preload="none"`/`metadata` ile sınırlı.
- [ ] `npm run lint`, `typecheck`, `test`, `build`, `git diff --check` yeşil; mevcut e2e'ler yeni tasarıma göre güncellenip geçer.
- [ ] Ekran görüntüleri `output/task192/` (390/768/1440, tam sayfa). Claude tarayıcı doğrulaması ayrı.

## Yapılmaması gerekenler
- Referans sitenin içeriğini/görsellerini/logosunu kopyalamak; sahte yorum/puan/istatistik/indirim.
- Ürün verisi/fiyat değişikliği; ödeme/üyelik akışı değişikliği.
- Yeni üretim bağımlılığı (video işleme için yerel `ffmpeg` kullanılabilir; pakete eklenmez).
- `AFINA-KAYNAK/` git'e eklenmez (`git add -f` YASAK); 103 MB ham video repoya girmez, yalnız web türevleri `public/` altına.
- **Push yok, yayın yok.** Her görevde tek kayıt (commit). `node_modules` ve `.next` SİLME.
- `docs/` altında yalnız görev dosyasına Coder Notu ve Durum.

## Durum: BEKLİYOR
