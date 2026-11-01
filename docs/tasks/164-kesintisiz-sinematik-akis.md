# Task164 — Referans projelerden kesintisiz sinematik akış

## Kullanıcı yönü
V11 görsel olarak reddedildi. Kullanıcı HTCOM, Villadent ve MLNEW projelerini
incelememizi; bütün sectionların Framer Motion scroll ile akmasını istedi.
Kaynak repolar salt okunur. V11 teknik sonuçları görsel kabul sayılmaz.

## Tasarım kararı
Referans: HTCOM aktif WindowJourney (tek kamera/sahne devri), Villa Lara aktif
landing-v7 (başrol görsel, farklı sahne fikirleri), MLNEW HeroScrub (nesnenin
dönüşümü ile bilginin birlikte açılması). Bu projelerin içerikleri kopyalanmaz.

AFİNA'nın hikâyesi: zeytinliğin içinden → Ellek'teki gerçek üretim → gerçek
ambalaj → sofranız/ürün seçimi → işletme ihtiyacı → teklif → iletişim.
İlk üç an ortak sticky sahnede, aşağı/yukarı scroll ile geri alınabilir.
Alt bölümlerde de scroll konumuna bağlı kompozisyon, fotoğraf ve metin devri.
Yalnız bir kez fade-in yapan bölüm dizisi kabul edilmez.

Görsel yön: aydınlık zeytinlik görüntüsü başrolde; yalnız metnin altında lokal
koyu perde. İnce koyu cam navigasyon. Ferah Fraunces, tracking en sık -.025em;
başlıkta seçili italik vurgu. Yeşil/sıcak taş/paper paleti. Büyük, gerçek
ambalajlar. Sert dikdörtgen bölüm renk kırılımları yerine örtüşen geçişler.

## Korunacaklar
Onaylı A→B filmi, gerçek tesis ve mevcut ambalaj görselleri. Yeni medya üretimi
ve kredi yok. Altı SKU/sıra/fiyat/stok, detail/cart/account, B2B seçimi ve
manuel mailto talep sözleşmesi korunur. AEO görünür içerikle tutarlı kalır.
Framer Motion tek hareket motoru; React Bits ve UIPro mevcut uyarlamaları sürer.

## Kabul
- Her sahnede scroll değişimi gözle anlamlı; geri scroll aynı hikâyeyi geri alır.
- Hızlı kaydırma, hash bağlantıları ve klavye odağı gizli sahneye sıkışmaz.
- Reduced-motion/JS kapalı/kısa ekran: bütün içerik, ürün ve eylemler erişilir.
- Mobilde kendi kompozisyonu, kısa mesafeli hareket ve doğal dokunmatik akış.
- Anlamlı timeline/odak/etkileşim testleri, lint/type/build.
- Çalışan hareketli önizleme; eski statik HTML bu deneyimin kabulü değildir.
- Görsel ve fiziksel cihaz doğrulaması yalnız gerçekten yapılırsa raporlanır.

## Kullanıcı kabulü ve devir — 1 Kasım 2026
Gerçek React bileşenlerinden üretilen hareketli yerel önizleme kullanıcı
tarafından “güzel beyendim” ile kabul edildi. `main` ve Vercel API yayını,
aynı yaklaşımın Codex/Claude için Emre Web Skill olarak kaydı istendi.
Sonraki bileşen ve Bazgold iletişim alanı talepleri Task165'te uygulanır.

Task164+165 birleşik yerel son kontrol: 108 dosya / 1284 unit PASS,
tam lint/typecheck ve varlık kapılarıyla webpack üretim build PASS.
Yerel önizleme statik kontrolünde 104 varlık, eksik dosya 0. Bu kayıt yeni
headless E2E, fiziksel telefon veya canlı dağıtım kabulü değildir.

Global skill doğrulanmış paket olarak hazır; global yazma reddedildi.
GitHub yazma erişimi engelli olduğu için main push/Vercel API yayını yapılmadı.
Güncel kanıt ve kalan kapılar: `docs/tasks/165-etkilesimli-bilesenler.md` ve
`docs/referans/qa-165-20261101.json`.

## Durum: TASARIM KABUL EDİLDİ — YAYIN BEKLİYOR
