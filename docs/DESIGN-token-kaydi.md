# AFİNA ZEYTİN — tasarım sözleşmesi

Tarih: 2026-10-20. Kapsam: mevcut ZEYTİN kimliğini ve onaylı Z-A fontlarını, kitlerden uyumlu prensiplerle belgelemek. Bu dosyanın eklenmesi uygulama tasarımının denetlendiği/değiştirildiği anlamına gelmez.

## Kaynak ve öncelik

Kullanıcı kararları → `PLAN.md`, resmi `referans/icerik.md`, `tasks/085-fonts.md` ve `tasks/086-hero-zeytinlik.md` onayları → bu belge → genel kit önerileri. KURUMSAL'ın Colour chapters düzeni veya K-A fontları ZEYTİN'e taşınmaz. Ortak taste ev kuralları aşağıda ZEYTİN'e uyarlanmıştır; yeni tasarım yönü/föy seçilmez.

Marka: AFİNA ZEYTİN. Ana slogan **Kökü toprakta. Yeri sofrada.**; alt slogan **Toprağın sunduğu lezzet, Afina’nın özeniyle.** Ana CTA **Ürünlerimizi Keşfedin**; toptan CTA **Toptan Satış İçin İletişime Geçin**. Tek landing, gerçek en fazla 6 aktif ürün, toptan talep ve Osmaniye tesis anlatısı korunur.

## Mevcut token kaydı

Aşağıdaki değerler `app/globals.css` içindeki mevcut tokenlardır; bu doküman CSS'i değiştirmez. Kullanılan renk eşleşmeleri ayrıca AA kontrast kabulünden geçer.

| İşlev / CSS token | Değer | Kullanım |
|---|---|---|
| `--brand-olive` | `#243A29` | Ana marka, koyu mürekkep, birincil eylem |
| `--brand-ivory` | `#F5F1E7` | Vitrin ana zemini, koyu zeminde yazı |
| `--brand-gold` | `#D4B483` | Kontrollü vurgu; açık zeminde küçük metin rengi yapılmaz |
| `--card`, `--popover` | `#FFFCF5` | Sıcak açık yüzey |
| `--primary-hover` | `#354E3B` | Birincil eylem hover |
| `--secondary-hover` | `#C7A572` | Altın ikincil eylem hover |
| `--muted` / `--muted-foreground` | `#E9E3D6` / `#5B6558` | İkincil yüzey / okunaklı yardımcı yazı |
| `--accent` | `#E5E9DF` | Hafif aktif alan |
| `--gold-ink` | `#78603C` | Fildişi üzerinde altın tonlu okunaklı mürekkep |
| `--destructive` / hover | `#943B32` / `#7E3029` | Yalnız hata/yıkıcı eylem |
| `--border` / `--input` | `#D1CABB` / `#7B856E` | Mevcut işlevsel sınır/form tokenları; dekoratif çerçeve izni değildir |
| `--ring` / `--overlay` | `#243A29` / `#14261A` | Görünür odak / dialog katmanı |
| `--radius` | `0.5rem` | Kontrol/dialog; her bölümü yuvarlak kart yapma |
| `--duration-fast` | `150ms` (reduce: `0ms`) | Mevcut kontrol geri bildirimi |
| `--shadow-dialog` | `0 1.5rem 5rem rgb(20 38 26 / 20%)` | Mevcut dialog ayrımı; vitrine durağan dekoratif gölge yayılmaz |

`--background=ivory`, `--foreground=olive`, `--primary=olive`, `--primary-foreground=ivory`, `--secondary=gold`, `--secondary-foreground=olive`. Altın/açık zemin çifti dekoratif renk olabilir; bilgi taşıyan metinde ölçüm gerekir. Anlam yalnız renk ile verilmez.

## Tipografi — Z-A / Ege Zanaat

- Başlık ve ürün adı: **Fraunces 600**, `opsz` değişken ekseni, `SOFT 50`; alt slogan/uygun alıntı Fraunces 400 italic. Gövde, fiyat, etiket, buton: **Figtree 400/600**. Admin arayüzü başlıkları dahil Figtree'dir.
- `--font-display` ve `--font-body`, `next/font` ile self-host, latin + latin-ext, display swap; Georgia/Helvetica Neue/Arial yalnız mevcut fallback. Figtree'deki ₺ glifi fallback gerektirebilir; 085'te belgelenen davranış korunur, üçüncü tasarım fontu eklenmez.
- Mevcut ölçek: h1 `clamp(2rem, 1.5rem + 2vw, 3.5rem)`, h2 `clamp(1.5rem, 1.25rem + 1vw, 2.25rem)`, h3 `1.25rem`, gövde `1rem/1.6`, başlık satır yüksekliği `1.2`. 085'in rol/ağırlık kararları öncelikli.
- Başlık her genişlikte en fazla 2 satır; taşmayı fontu okunmaz küçülterek çözme. SSS sorusu uzunsa metni resmi anlamını koruyarak kısalt veya düzeni genişlet; yardımcı metin en az 14px. Fiyat/sayılar Figtree `tabular-nums`.
- Türkçe `İŞĞÜÖÇ ışğüöç` ve `₺1.250,00` glifleri gerçek tarayıcıda kontrol edilir.

## Hiyerarşi ve kompozisyon

Boşluk dizisi: **8/16/24/32/48/64/96px**; içerik boşlukları bu diziden responsive ölçeklenir. Tipografi, 44px dokunma hedefi, medya oranı ve onaylı hero geometrisi sırf 8'e bölünmek için değiştirilmez.

Her bölüm tek mesaj taşır: hero köken/ürün; vitrin gerçek ürün seçimi; hikâye Osmaniye tesisi; toptan alanı talep; SSS doğrulanmış soru. Medya/metin ağırlıkları amaca göre değişir; her bölüm ortalı başlık/aynı kart/iki buton şablonu olmaz. Mevcut resmi başlıklar ve onaylı hero kompozisyonu korunur. Ürün kartı satın alma işlevi taşır; ikonlu özellik kartı yığını eklenmez.

## Ev kuralları ve dar istisnalar

- Dekoratif gradyan, glass/blur, eyebrow üst etiketi, 01/02 dekoratif numara, hairline/çerçeve, harf aralıklı küçük BÜYÜK etiket ve durağan dekoratif gölge yok. İkonlu pazarlama kartları ve emoji ikon yok; işlevsel ikonlarda tek SVG ailesi.
- **086 onaylı okunurluk istisnası:** foto üzerinde soldan sağa nötr fildişi scrim, `%92 → %75 @32% → 0 @58%`, korunur. Dekoratif arka plan gradyanı değildir. Mobilde görsel üstte/metin fildişi altta; yeni görsel/video üretimi veya genel gradyan yasağı gerekçesiyle onaylı prova değiştirilmez.
- Form sınırı, görünür focus ring, dialog ayrımı ve veri tablosu ayracı işlevsel olabilir; dekoratif vitrin çerçevesi oluşturmaz.
- **Admin istisnası:** kullanıcının JPG referansı gereği gruplu menü/tablo için ince işlevsel ayraç ve küçük ikonlu özet kartları yalnız `/admin` içinde kullanılabilir. Beyaz yüzey/açık gri zemin/tek yeşil vurgu ayrıntısı `referans/admin-stil.md` içindedir. Admin istisnası vitrine ve KURUMSAL'a yayılmaz.

## Hareket ve medya

083/086'nın onaylı ScrollFrameSequence, küçük kare seti ve posterini koru. Kitlerin autoplay loop veya video.currentTime örneği için altyapıyı değiştirme. İçerik/CTA SSR ve JS yokluğunda erişilir; canvas tek bilgi kaynağı değildir. Gereksiz kütüphane, her bölüme animasyon, layout oynatan hover ve scroll kilidi eklenmez.

`prefers-reduced-motion`: statik poster, scrub/parallax/dekoratif giriş yok; görünür içerik/CTA tam. Mobilde küçük kaynak veya poster, ekran dışı gereksiz yükleme yok. MP4 teslimi gerekirse <5 MB hedefi; mevcut kare paketinin 086'daki 12 MiB tavanı ayrı ölçülür. Birleşik kabul `tasks/088-kit-hero-denetim.md` içindedir.

## İçerik ve etkileşim

Resmi pazarlama metni `referans/icerik.md` 01+04'ten birebir; yasal satıcı bilgileri 087'deki kamuya açık kaynaktan. Gerçek SKU/fiyat/stok kullanıcıdan gelir; fixture gerçek katalog değildir. “Tuna”, doğrulanmamış ciro/adet/sertifika/garanti/liderlik, `%100 organik / %100 doğal` iddiası veya rozeti kullanılmaz. SSS cevabı uydurulmaz; teyitsiz bilgi UI/schema/llms'e taşınmaz.

Kontrollerde hover/press/focus/disabled ve işlev gerektiriyorsa loading/empty/error/success tanımlanır. Sadece renk/hover ile bilgi verilmez; erişilebilir ad, klavye, dokunma, hata açıklaması ve odak geri dönüşü korunur. En az 44px dokunma hedefi; normal metin ≥4,5:1, büyük metin ve anlamlı kontrol/focus ≥3:1 ölçülür.

## Uygulama kabulü

- İlgili davranış testleri ve mevcut lint/typecheck/build; bu plan görevi bunları çalışmış kabul etmez.
- Üretim sunucusunda 320/390/768/1440px: normal, klavye, reduced-motion, hata/boş/yükleme durumları; ekran görüntüsü + token/font/boşluk eşlemesi ve kontrast ölçümü.
- Yeni tasarım görevi mevcut taste lint/inspect araçlarıyla incelenirse FAIL giderilir; admin işlevsel ayraç/ikon ve 086 scrim istisnası dosya/öğe düzeyinde raporlanır, bütün kural kapatılmaz.
- Her yeni bağımlılık/hareketin işlevi ve maliyeti açıklanır. Yerel görsel kabul, gerçek cihaz, deployment ve ödeme/yayın ayrı kapılardır.

İlgili görevler: 002 tokenlar, 085 fontlar, 086 hero, 087 AEO/GEO, 088 hero denetimi; 062–069 admin stil bağlantısı. Admin DB/auth onayları bu tasarım belgesiyle verilmiş olmaz.
