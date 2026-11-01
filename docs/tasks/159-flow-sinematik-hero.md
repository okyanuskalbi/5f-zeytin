# Task 159: Google Flow filmiyle belirgin sinematik açılış

## Kullanıcı düzeltmesi

“Hero hâlâ aynı görünüyor, Google Flow videolarını kullanıp MD’lerdeki gibi daha sinematik bir açılış yap.” Önceki Task 158 mikro etkileşimleri bu isteğin görsel kapsamını karşılamadı. Kullanıcının son isteği v6'nın split/çerçeveli sahne ve frame-only tercihinin yerini alır. Motion zaten kurulu; yeni animasyon importları `motion/react` üzerinden.

## Uygulama

- V7 Zeytinin İçinden: eski iki sütun/organik pencere/ürün kartı kaldırılır; kabul edilen Flow sahnesi tam genişlikte açılış filmi olur. Başlık sahne üzerinde solda, gerçek iki CTA ve açık orijinal menü korunur. Kısa film kendiliğinden sessiz bir kez ilerler, son karede durur; ayrı durdur/oynat/tekrar denetimi vardır. A ve B uçları farklı olduğundan yapay loop kullanılmaz.
- Envanterde yalnız kullanıcının kabul ettiği A→B klibi var. Diğer üç geçiş üretilmiş gibi sunulmaz. Aynı kabul edilmiş kaynaktan sessiz H264/faststart web MP4 türetilir; kaynak/output SHA, byte ve format kapısı eklenir. Yeni ücretli üretim yok.
- SSR poster/H1/CTA görünür. MP4 hydration ve görünürlük/tercih kontrolünden sonra istenir. Reduced-motion, saveData, hata veya engelli oynatma için poster ve anlamlı denetim; gizli sekme/görünüm dışında durma, kullanıcının durdurma kararını koruma. Video sahnesine yeni scroll seek motoru eklenmez; küçük Motion parallax doğal kaydırmaya bağlıdır.
- Sinematik/scroll kitlerinin görsel katman ilkeleri ve 21st 12200 PrismaHero kaynak kompozisyonu AFİNA'ya uyarlanır. Demo medya/metin/font/nav ve `framer-motion` taşınmaz. Yeni varsayılan UI/global kurulum yok; gerçek mağaza/üyelik/kurumsal akış değişmez.

## Kullanılacak araçlar

Proje yerel dört yeni nesil skill, 21st ui-build/search/get, mevcut Motion ve native video. Build medya kapıları; anlamlı film lifecycle RED/GREEN; unit/lint/typecheck/build; paketli headless Chromium ≤2 worker ile gerçek video zamanı/denetim/tercih değişimi/taşma/klavye/ürün/sepet/üyelik. Normal main push, CI ve Vercel REST API sonrası canlı tekrar. Browser/server düzgün kapatılır. Fiziksel cihaz ve gerçek servis mutasyonu bu kabul değildir.

## Coder Notu ve yerel kabul

- 21st search `cinematic fullscreen video hero editorial film controls` → **12200 PrismaHero** gerçek kaynak alındı. Yalnız tam geniş film/overlay içerik kompozisyonu uyarlandı. Yeni hero `motion`, `useScroll`, `useTransform` importlarını kullanıcının belirttiği **`motion/react`** üzerinden alır; paket kurulmadı. `npx @21st-dev/cli@latest review` dört değişen UI dosyasında **0 bulgu**.
- RED: film lifecycle testleri bileşen yokken, hero testi yeni responsive/sinematik sözleşme uygulanmadan başarısızdı. GREEN: görünürlük/policy kapısı, kullanıcı pause'unu koruma, ended/replay, autoplay reddi/manuel gesture, geç promise ve temizlik için **9 unit**; medya kaynağı/hash/bütçe/faststart için **12 unit**. Eski SSR/kare-penceresi beklentileri yeni film/poster preload sözleşmesine güncellendi; fiyat/üyelik/ödeme test beklentileri değişmedi.
- **88 dosya / 1197 test PASS**, lint/typecheck/production build ve tüm medya kapıları PASS. Tam kaynak 190 görüntü karesi korunuyor; AAC kuyruğu kaldırıldığı için 7,93 sn. container yerine 7,916667 sn. sessiz video var. H264/yuv420p, 1280×720, 24 fps; CRF27/slow/faststart, 2.537.380 bayt. Kaynak SHA `be77f66a…`, çıktı SHA `5ff03b1b…`; tam değerler `lib/media/cinematic-film.json` içinde. Yeni üretim/kredi 0.
- **44 yerel headless Chromium etkileşim kontrolü PASS**: dört genişlikte gerçek MP4 zaman ilerlemesi, pause/resume, doğal son kare/replay, reduced-motion ve saveData'da sıfır film isteği, film hatası/poster/retry; gerçek ürün/sepet/üyelik/KVKK/menü/odak akışları. Viewport testleri fiziksel telefon değildir.
- İlk ve son kadraj ayrıca incelendi. Mobil poster ve videoda aynı tam kaynak ve **%70 odak noktası**, dal/zeytinleri görünür tutar. Programatik görsel incelemedeki seek sonrası görüntü `seeked`/paint tamamlanarak alınır; gerçek tek geçiş kabulü ayrıca native8sn. oynatımla yapıldı. Normal görünümde taşma/pageerror/başarısız kaynak/axe ihlali 0; reduced-motion poster/H1 ve sıfır MP4/kare isteği. Ekranlar `.cache/task-159/local/`.
- V6 tasarım belgesi bayt düzeyinde değişmeden arşivlendi. DESIGN, 21st ve dört skill v7 yönünü izler. Alt site ve ticaret/kimlik/veritabanı mimarisi korunur; gerçek servis mutasyonu yapılmadı.

## Yayın

Normal main push, CI ve doğrudan REST API sonrasında yeni canlı sonuç/kanıt bu bölüme yazılacak. Önceki Task 158 dağıtımı yeni hero'nun yayın kanıtı değildir.

## Durum: UYGULANIYOR
