# Task 158: Dört yeni nesil Markdown rehberini projeye uygulama

## İstek
Kullanıcı dört yerel MD'yi bu projede uygulamamı istedi: profesyonel web sitesi, scroll hero video, sinematik siteler ve UI/UX Pro Max. Belgeler tasarım/iş akışı girdisidir; örnek global kurulum, anahtar yenileme veya ücretli üretim komutları ayrı yetki değildir.

## Uygulama
- Dört rehber, `.agents/skills/` altında projeye özel uyarlanmış skill olarak eklenir; kaynak dosya/hash ve uyarlama eşlemesi kaydedilir. Mevcut AGENTS/21st/Motion yapılandırması üzerine yazılmaz.
- AFİNA v6, gerçek logo/font/renk/içerik ve mevcut akışlar korunur. Belgelerin kendi içindeki autoplay/reduced-motion oynatma, blur animasyonu, siyah/glass şablon, 300–400vh pin ve yeni font/sağlayıcı örnekleri güncel sözleşmeyle uyumlu hale getirilir.
- Tek, kısa açılış sekansı ve ölçülü buton/bağlantı tepkisi ortak Motion token/spring'lerinden gelir. Animasyon yalnız transform/opacity; SSR metin/CTA görünür, reduced-motion değişiminde hareket durur ve son durum korunur. Video scrub doğrusal kalır.
- Ürünlerin görünümde tekrarsız giriş gecikmesi sınırlandırılır; temel bölüm aralıkları 8 px ölçeğine bağlanır. Anlık renk durumları filtre/renk animasyonuna dönüştürülmez.
- Omni Chrome Use belge içinde tarayıcı otomasyonu yaklaşımıdır; Omni 1.1 Flash video modeliyle aynı kavram sayılmaz. Bu görev yeni ücretli medya üretimi başlatmaz.

## Araçlar ve kabul
Yeni dört yerel skill; mevcut frontend-patterns, tdd-workflow, motion-foundations, motion-patterns, accessibility, browser-qa ve 21st ui-build. Yeni standart UI eklenirse önce 21st search/get; mevcut primitive'ler uyarlanır. Global MCP/anahtar/model ayarı değiştirilmez.

Anlamlı giriş yaşam döngüsü RED/GREEN, mevcut ürün/sepet/üyelik davranış testleri; lint/typecheck/build; paketli headless Chromium ≤2 worker ile mobil/masaüstü, reduced-motion, klavye ve görsel kabulü. Düzgün browser/server kapanışı, normal main push + CI + mevcut Vercel REST API yayını ve canlı tekrar kabulü. Fiziksel telefon, gerçek ödeme/hesap/teklif yazımı ayrı kabul olarak kalır.

## Coder Notu ve yerel kabul

- Dört kaynak bayt/hash envanteri, normalize skill'ler, v6 istisnaları ve Omni Chrome Use ayrımı [uyarlama kaydında](../referans/yeni-nesil-md-uyarlamalari-20261101.md). AGENTS, DESIGN, PLAN, afina-codex ve 21st bağlamı bu kayıtları gösterir. Yeni bağımlılık/global yapılandırma yok.
- 21st `motion spring button hover tap` → gerçek **26725 Magnetic Button** kaynağı okundu. Mevcut eylemlere reduced-motion ile korunan küçük spring hover/tap uygulandı; demo magnetism/stil alınmadı. Önceki v6 hero kaynağı 19074 korunur.
- RED `fb66b61`: giriş yaşam döngüsünü doğrulayan beş test henüz bulunmayan hook nedeniyle başarısızdı. GREEN: `useEditorialEntrance` tek giriş, görünür SSR, offscreen/düşük donanımda atlama, tercih değişiminde durdurma ve optional API hatasında içerik koruma sağlıyor. Tasarruf/gizli sekme de hareketsiz kalır.
- `npm test -- --maxWorkers=2 --testTimeout=30000`: **86 dosya / 1176 test PASS**. Lint, typecheck, production build ve 195 sinematik medya çıktısı dahil bütün asset kapıları PASS.
- Paketli headless Chromium ile **28 yerel etkileşim testi PASS**. 1440/768/390/320 px'te menü, ürün detayı, izole sepet, üyelik/KVKK, klavye/odak ve taşma kontrol edildi. Görsel/axe denetiminde taşma, pageerror, başarısız kaynak ve WCAG ihlali 0. Reduced-motion: canvas 0, kare isteği 0, H1 görünür.
- Ek gerçek browser kontrolü: hover/pressed durumundayken reduced-motion'a geçiş transformu sıfırladı; gerçek ürün anchor'ı çalıştı. JavaScript kapalı 390 px'te H1/CTA görünür ve ürün anchor'ı çalışır. Ekranlar `.cache/task-158/local/`, ayrıntılar `.cache/task-158/local-motion.json`.
- Başlatılan browser/server süreçleri düzgün kapatıldı. Ek medya/kredi kullanımı 0; onaylı A→B klibi ve mevcut üretim bütçesi değişmedi. Fiziksel telefon veya gerçek sipariş/hesap/ödeme/talep gönderimi yapılmadı.

## Yayın kabulü

Yerel kabul tamam. Normal main push, CI ve API dağıtımı sonrası canlı sonuç buraya eklenecek; şu aşamada yeni runtime'ın canlıya çıktığı iddia edilmez.

## Durum: UYGULANIYOR
