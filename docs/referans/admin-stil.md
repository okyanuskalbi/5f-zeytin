# ZEYTİN admin — görsel stil referansı

Tarih: 2026-10-20. Görsel: [admin-paneli-referans.jpg](admin-paneli-referans.jpg). Kullanıcının kendi referansı kaynak JPG'den byte düzeyinde kopyalandı. Bu dosya uygulama/DB/auth onayı değildir; 062–069 görevlerinin **ONAY GEREKLİ** kapıları aynen geçerlidir.

## Görselde görülen dil

Açık gri dış/çalışma zemini; beyaz uygulama yüzeyleri; solda sabit, gruplu menü ve gruplar arasında ince ayraçlar. Üst bantta küçük breadcrumb/konum ve geniş arama alanı var. İçerik üçlü özet kartlarıyla başlıyor. Altında solda içgörü paneli, sağda çubuk grafik; en altta başlık hücrelerinde sıralama işareti olan veri tablosu görülüyor. Küçük outline ikonlar, yumuşak köşe, koyu nötr başlık ve gri yardımcı metin; geniş boşluk ve sınırlı renkli vurgu var. Görsel sağdan kırpılmıştır; görünmeyen ekran/akışlar bundan türetilmez.

Referanstaki Fincai adı, para/bakiye değerleri, AI finans/risk/öngörü ve abonelik menüleri ZEYTİN kapsamı değildir. Düzen dili alınır, içerik/özellikler kopyalanmaz.

## ZEYTİN uyarlaması

| Alan | Uygulama kararı |
|---|---|
| Zemin/yüzey | Admin'e özel açık gri zemin ve beyaz yüzey; nötr gri yardımcı metin. Bunlar önerilen admin yerel tokenlarıdır, mevcut CSS değiştirilmedi. Vitrinin fildişi zemini global olarak değiştirilmez. |
| Tek vurgu | Zeytin yeşili `#243A29`; aktif menü, birincil eylem, seçili grafik sütunu/seri. Altın yeni bir admin vurgu sistemi olmaz. Hata/uyarı/başarı renkleri yalnız anlamı gerektiğinde, metin/ikonla desteklenir. |
| Yazı | Başlık dahil Figtree 400/600; sayılar tabular-nums. Etiket/gövde 14–16px, bölüm başlığı 20–24px, özet sayısı 28–32px. Fraunces yalnız vitrin rolünde kalır. |
| Sidebar | Masaüstünde yaklaşık 240–256px sabit menü. Genel Bakış; Operasyon: Ürünler, Siparişler, Kargo; Pazarlama: Kupon/Kampanya, Terk Edilen Sepet; Müşteriler. Yalnız var olan yetkili sayfalara link. Mobilde odak kontrollü sheet/drawer. |
| Üst arama | Command/search; sayfa gezinmesi veya yetkili mevcut tablo araması. Müşteri verisini yetkisiz/genel indekse taşıma; yeni arama servisi kurma. |
| Üç özet kartı | Aktif ürün (x/6), ödeme bekleyen sipariş, kargoya hazır sipariş gibi mevcut veriyle doğrulanan operasyon özetleri. Gerçek veri yoksa açık TEST VERİSİ etiketi; uydurma ciro/büyüme yüzdesi yok. |
| İçgörü paneli | Stoku tükenen ürün, bekleyen işlem gibi mevcut deterministik kayıtlar; “AI önerisi/öngörü” özelliği ekleme. Eşik ve otomasyon kullanıcı kararı olmadan seçilmez. |
| Çubuk grafik | Yetkili mevcut veri varsa günlük sipariş adedi ve açık tarih aralığı; en fazla tek yeşil seri, metinsel özet/erişilebilir tablo. Veri yoksa dürüst boş durum; yeni analiz endpoint'i bu stil belgesinden çıkarılmaz. |
| Tablo | Semantik başlıklar, klavye ile sıralama, `aria-sort`; metinle durum Badge'i. Sunucu pagination/filtre/yetki sınırları ilgili task'a ait. Sıralama değişince sayfalama tutarlı; yalnız mevcut sayfayı sıralıyorsa açık ifade edilir. |

Boşluk ölçeği `DESIGN.md` ile 8/16/24/32/48; kart/düzen mesafeleri 16–24px. İnce menü/tablo ayraçları ve küçük özet ikonları bu kullanıcı referansına özgü **yalnız admin istisnasıdır**; vitrine dekoratif hairline/ikon kartı getirmez. Dekoratif gölge/glass/blur/gradyan yok; ayrım yüzey, boşluk ve işlevsel ayraçla kurulur.

## shadcn bileşen sözleşmesi

Ortak liste: **Sidebar, Card, Table + sıralama (Data Table yaklaşımı), Chart, Command/search, Badge**. Uygulama görevinde resmi CLI ile `npx shadcn@latest search/view/docs <bileşen>` akışını kullan; Table/Data Table sıralama desenini ve erişilebilirliğini incele, gerekenleri `add <bileşen>` ile ekle. `init --preset <kod>` / `apply <preset>` ancak mevcut proje temasını koruyacak açık kapsamda kullanılır. Bu plan görevi CLI çalıştırmaz/paket kurmaz.

shadcn için MCP yoktur. 21st referansı alınırsa yalnız yerleşim ilhamıdır; shadcn bileşeni resmi CLI'den gelir. Her bileşen ZEYTİN tokenları/Figtree/yoğunluk/odak ve durumlarına uyarlanır; varsayılan tema bırakılmaz. Genel grafiği veya aramayı her admin sayfasına zorla ekleme.

## 062–069 görevleriyle bağ

| Görev | Stilin uygulanacağı yüzey / sınır |
|---|---|
| 062 Admin yetki | Ortak referans; backend görevi yeni kart/grafik/arama UI'si yazmaz. Erişim/yetki kontrolü aynı kalır. |
| 063 Kabuk | Sidebar, üst arama, üç Card, yetkili veri varsa içgörü/Chart; mobil sheet ve klavye. |
| 064 Ürün | En fazla 6 ürün; sıralanabilir Table, stok/durum Badge, Figtree form. |
| 065 Sipariş | Filtre/pagination/sıralama, durum Badge, ayrıntı paneli; kart verisi ve doğrulanmamış paid işlemi yok. |
| 066 Kampanya | Table + form, geçerlilik Badge; kullanıcı kararı olmayan kampanya/indirim etkinleşmez. |
| 067 Sepet | Yetkili/izinli kayıt Table, kampanya durum Badge; manuel toplu e-posta eklenmez. |
| 068 Müşteri | Minimum kişisel veri, mevcut arama/pagination, sipariş özeti; parola/token yok. |
| 069 Kargo | Sipariş bağlamlı form/Table ve durum Badge; yalnız onaylı firma/takip URL'leri. |

## Uygulama kabulü

- [ ] 1440/1024/768/390/320px ekranları; dar ekranda menü aç/kapa/odak geri dönüşü, tablo erişilebilir yatay kaydırma, tüm eylemler erişilir.
- [ ] Arama/sıralama/filtre: klavye + anlaşılır etiketler; yanlış sıraya veya yetkisiz veriye geçiş yok. Yükleme/boş/hata/başarı durumları kayıtlı.
- [ ] Üç kart + içgörü/grafik gerçek veri veya açık test etiketiyle; grafik metinsel eşdeğeri var. Ürün sayısı ≤6.
- [ ] AA kontrast, görünür focus, 44px dokunma hedefi, reduced-motion; kişisel veri ekran/kabul kanıtlarında maskelenir.
- [ ] İlgili task'ın auth/DB onayı, testleri ve veri sınırları tamamlanmadan gerçek operasyon veya canlı kullanım yok.
