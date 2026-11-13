# 207-1 Canlı site tüm cihaz kontrolü (yalnız kontrol + rapor)

Kaynak: kullanıcı (13 Kas): "kontrolleri sen yapacaktın zaten yap" + "codex'e yaptır". Görev 207'nin kontrol kısmının canlı site üzerinde koşulan hâli.

## Amaç
Yayındaki yeni tek sayfa siteyi (v3 "Altın Dal") telefon, tablet ve masaüstü genişliklerinde ve mümkün olan tüm tarayıcılarda baştan sona kontrol et, bulduğun her sorunu kanıtıyla raporla. **Kod yazma, düzeltme yapma. Yalnız kontrol ve rapor.** Düzeltmeleri ayrı görevle başka ajan yapacak.

## Neyi kontrol ediyoruz
- Canlı site: https://afinazeytin.com (commit `8f518fc`, dpl_5KkM9gCNW8wzUBQZNGBGmQJvd7Y7).
- Yerel ön izleme (aynı kod): https://localhost:3024 (kendinden imzalı sertifika; tarayıcıda sertifika hatasını yok say). Kapalıysa şu komutla aç, işin bitince **açık bırak**:
  `TEST_DATABASE_URL=postgresql://localhost:5432/afina_kontrol189 node output/task201/run-clean.mjs --local-auth node output/task206/serve.mjs`
  (Derleme eskiyse önce `npm run build`.) `output/task206/stop.sh` 3024–3027'yi kapatır.
- Form, sepet, ödeme ve giriş akışları **yalnız yerel ön izlemede** denenir. Canlıda yalnız sayfa açma, görüntüleme, kaydırma, menü/sekme tıklama.

## YASAKLAR (ihlal etme)
- Kod, CSS, test, ayar dosyası değiştirme. Commit yok, push yok, yayın yok, Vercel'e dokunma.
- Canlı sitede: sipariş verme, ödeme, kayıt olma, giriş, form gönderme (teklif/bayilik/iletişim/bülten) YOK. Gerçek e-posta ya da kayıt oluşturabilecek hiçbir şey yapma.
- `.env*` dosyalarını okuma; sır/anahtar yazdırma. Canlı veritabanına bağlanma. `AFINA-KAYNAK/` ve `output/` git'e eklenmez (`git add -f` yasak; zaten commit yok).
- `node_modules` ve `.next` silme; `git stash/reset/clean` yok.
- Port 3497 başka projeye ait, dokunma. iOS Simülatörde başka oturumların açık cihazlarına dokunma; kendi cihazını aç, işin bitince kapat, aynı anda birden fazla açma.
- Lighthouse/Playwright için canlıya aşırı istek atma (makul, sıralı).

## Cihaz ve tarayıcı matrisi
- Genişlikler (px): 320, 360, 375, 390, 412, 430 (telefon dikey) · 844×390 ve 932×430 (telefon yatay) · 768, 820 (tablet) · 1024, 1280, 1440, 1920, 2560 (masaüstü).
- Tarayıcılar: Chromium (zorunlu); WebKit (Playwright WebKit çalışırsa); Firefox (çalışırsa); iOS Simülatör Safari (`xcrun simctl`; iPhone ve iPad, mümkünse). Çalışmayan her biri için nedenini raporda yaz, "geçti" deme.

## Kontrol listesi
**A. Ana sayfa (her genişlikte)**
1. Bölüm sırası ve kimlikleri: `#baslangic`, `#urunler`, `#hikayemiz`, `#toptan-bayilik`, `#blog`, `#iletisim`; üst menü bağlantıları doğru bölüme iniyor, başlık sabit menünün altında kalmıyor.
2. Yatay taşma 0; yazı kesilmesi / üst üste binme / sığmayan düğme yok; konsol hatası ve başarısız ağ isteği 0; kırık görsel 0; görseller bulanık değil (gerçek piksel/çözünürlük).
3. Dokunma hedefleri ≥ 44 px (telefon); aralarında en az 8 px boşluk.
4. Ürünler: kategori sekmeleri çalışıyor, kart → `/urun/<slug>` bağlantısı, sepete ekle (yalnız yerel).
5. Hikâyemiz: telefonda (≤767) 3 fotoğraf kartı alt alta, ≥768'de yan yana; alt yazılar okunuyor.
6. Toptan & Bayilik: iki sekme çalışıyor (klavye ile de); form alanları ekrana sığıyor, klavye açılınca alan görünür kalıyor (simülatörde dene). Gönderme YOK.
7. Zeytin Defteri (blog) kartları, SSS aç/kapa, iletişim bağlantıları (tel/e-posta/WhatsApp) doğru hedefe gidiyor.
8. Hamburger menü: açma/kapama, odak yönetimi, Esc ile kapanma, arka plan kaydırması kilitleniyor mu; sepet rozeti ve sepet çekmecesi (yerel).
9. Cihazı yatay/dikey çevirince düzen bozuluyor mu; 200% yakınlaştırma / yazı boyutu büyütmede taşma var mı.

**B. Diğer sayfalar** (canlıda aç, yerelde etkileşim): `/urun/dogal-kirma-yesil-zeytin`, `/urun/naturel-sizma-zeytinyagi`, `/urun/salamura-siyah-zeytin`, `/urun/salamura-yesil-zeytin`, `/blog/salamura-zeytin-nasil-hazirlanir`, `/sepet`, `/odeme`, `/giris`, `/kayit`, `/hesabim` (girişsiz giriş sayfasına yönleniyor), `/siparis-takip`, `/kvkk`, `/iade`, `/mesafeli-satis`, bilinmeyen adres (404 sayfası). Eski adresler 308 ile doğru bölüme iniyor mu (hash kaydırması dahil): `/urunler`, `/urunler/zeytinyagi`, `/hakkimizda`, `/toptan-satis`, `/bayilik`, `/blog`.

**C. Erişilebilirlik**: axe taraması (ana sayfa, bir ürün, sepet, giriş; bilinen: `label-content-name-mismatch` teklif formu ürün seçici düğmesi ve telefonda ülke kodu düğmesi; yenisini ayrıca işaretle), klavye ile gezinti sırası ve görünür odak, `prefers-reduced-motion`, kontrast (≥ 4,5:1 metin).

**D. Performans (telefon profili)**: Lighthouse veya eşdeğeri; LCP, CLS, TBT, ilk JS boyutu (hedef ≤ 250 KB), en ağır görsel/video istekleri.

**E. Temel SEO/güvenlik**: başlık, açıklama, canonical, OG/Twitter görseli, `sitemap.xml`, `robots.txt`, `llms.txt`; güvenlik başlıkları (CSP, HSTS, X-Frame-Options...), `www` → apex yönlendirmesi.

## Çıktı
- `output/task207-1/RAPOR.md`: (1) en üstte 5 satırlık özet; (2) cihaz × sayfa tablosu (geçti / sorun / yapılamadı); (3) bulgular önem sırasıyla (Kritik / Yüksek / Orta / Düşük). Her bulgu: ne, nerede (genişlik, tarayıcı, sayfa), nasıl yeniden görülür (adım adım), kanıt (ekran görüntüsü tam yolu), önerilen düzeltme (hangi dosya/bileşen olabilir; kod yazma); (4) çalıştırılamayanlar ve nedeni; (5) çalıştırdığın komutlar.
- Ekran görüntüleri: `output/task207-1/ekran/` (dosya adı: `<sayfa>-<genislik>-<tarayici>.png`). Yalnız sorunlu ve temsilci görüntüler; yüzlerce dosya üretme.
- Son mesaj: sade Türkçe özet (jargonsuz): kaç sorun, en önemli 5'i, yapılamayanlar, rapor yolu.

## Durum: TAMAMLANDI
