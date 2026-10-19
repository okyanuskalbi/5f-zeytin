# Task 080: Marka varlıkları

## Tür
frontend

## Amaç
Resmi altı logonun gerçekten kırpılmış, optimize normal/dark SVG setini ve favicon/OG varlıklarını hazırla.

## Bağlam
`docs/PLAN.md` ve resmi `docs/referans/icerik.md` içerik sözleşmesi. Bağımlı task’lar / addBlockedBy: 002 (tokens); 003 (asset-registry). Bağımlılıklar tamamlanmadan uygulanmaz.

Asıl Illustrator kaynağı docs/referans/logolar/AFİNA Logolar2.pdf; PNG görsel doğruluk referansı, mevcut SVG’ler tam sayfa vektörü + viewBox kırpması (~2,6 MB). Normal + dark setin her birinde topluluk, zeytin, borek, coffee, motors, insaat bulunur (6+6). Bu repoda başlangıçta yalnız zeytin/topluluk PNG/SVG vardır. Diğer dört markanın PNG/SVG referansını yalnız ~/PROJELER/AFINA-KAYNAK/logo/ klasöründen okuyup bu task kapsamında kendi docs/referans/logolar/ dizinine kopyala; kaynakta değişiklik yapma. Ortak set kabulü 6+6’dır; landing kullanımında zeytin/topluluk kimliği esas alınır.

## Kullanılacak araçlar
- ECC skill: design-system, verification-loop; ek yerel skill: image-processing
- 21st MCP: hayır — varlık işleme, yeni UI bileşeni yok
- find-skills ile bulunup kurulacak ek skill: yok; mevcut araçlar yeterli, yeni kurulum gerekirse Coder Notu’na yaz.

## Dokunulacak dosyalar
- `public/brand/afina-{topluluk,zeytin,borek,coffee,motors,insaat}.svg` (oluştur / düzenle)
- `public/brand/afina-{topluluk,zeytin,borek,coffee,motors,insaat}-dark.svg` (oluştur / düzenle)
- `public/brand/favicon.svg` (oluştur / düzenle)
- `public/brand/og.png` (oluştur / düzenle)
- `docs/referans/logolar/karsilastirma.png` (oluştur / düzenle)
- `docs/referans/logolar/` (eksik kaynak referanslarını kopyala)
- `docs/gorsel-onay.md` (oluştur / düzenle)
- `public/images/generated/manifest.json` (oluştur / düzenle)

## Adımlar
1. PLAN, AGENTS ve asıl PDF/PNG/SVG kaynaklarını oku; kaynak hash/ölçülerini kaydet. Bu task yalnız marka varlıklarını hazırlar, sayfalara runtime bağlantısı sonraki görevlerdedir.
2. SVG’de yalnız viewBox değiştirerek kırpma yapma: hedef logo dışındaki path/nesneleri çıkar, görünür alanı gerçek sınırlarıyla kırp; clip/defs referanslarını koruyarak gereksiz öğe/metadata’yı temizle, svgo ile optimize et. Raster image gömme veya PNG’yi SVG içine sarmalama yok; amblem/harf biçimi ve transparan arka plan korunur.
3. Altı normal afina-*.svg ve karşılık gelen altı -dark.svg oluştur. Siyah yazılı topluluk, zeytin ve motors wordmark’ları koyu zeminde okunur #F5F1E7 fildişi / marka altını yazıya dönüştür; amblem renklerini koru. Diğer üç dark sürümde de okunurluğu doğrula, gereksiz kimlik değişikliği yapma. Her logo dosyası kesinlikle < 60.000 byte.
4. Her normal SVG’yi PNG referansıyla aynı boyutta render edip yan yana görsel karşılaştır; kırpma/harf/renk kaybı olmamalı. Altı markanın PNG/normal SVG ve koyu zemin dark SVG render’larını docs/referans/logolar/karsilastirma.png kontrol şeridinde göster; dosyayı görsel olarak açıp doğrula ve sonucu Coder Notu’na yaz.
5. Zeytin ambleminden şeffaf favicon.svg ve 1200×630 OG PNG üret; favicon.svg public/brand/ içindeki 12 logo dışında ayrı dosyadır ve o da < 60.000 byte. Küçük boyutta amblem okunurluğunu kontrol et; logo/isim/slogan uydurma.
6. Manifest/onay kaydında kaynak hash’i, dönüşüm, boyut ve görsel kontrolü tut; kaynak logoları değiştirme. Kabul komutlarını çalıştırıp sonuçlarını task Coder Notu’na ekle.

## Kabul kriterleri
- [ ] `ls public/brand/*.svg` altı normal + altı -dark logoyu ve favicon SVG’yi gösterir.
- [ ] `python3 -c "from pathlib import Path; b=Path('public/brand'); names='topluluk zeytin borek coffee motors insaat'.split(); files=[b/f'afina-{n}{suffix}.svg' for n in names for suffix in ('','-dark')]; assert len(files)==12 and all(p.is_file() and 0<p.stat().st_size<60000 for p in files); assert 0<(b/'favicon.svg').stat().st_size<60000; print('PASS: 6+6 logo ve favicon boyutları')"` başarılı.
- [ ] `test -s docs/referans/logolar/karsilastirma.png && test -s public/brand/og.png && sips -g pixelWidth -g pixelHeight public/brand/og.png` başarılı; OG 1200×630.
- [ ] `rg -n "<(image|foreignObject)\b" public/brand/*.svg` sonuç vermez; SVG’lerde gömülü raster/HTML yok. Yalnız hedef logo path’leri kalmıştır.
- [ ] `python3 -c "from pathlib import Path; from xml.etree import ElementTree as E; files=list(Path('public/brand').glob('*.svg')); assert files; [E.parse(p) for p in files]; print('PASS: SVG XML')"` başarılı.
- [ ] Kontrol şeridi görsel olarak incelendi; PNG ile şekil/kırpma/renk uyumlu, koyu zeminde tüm wordmark’lar okunur. İnceleme ve render komutları Coder Notu’nda kayıtlıdır.

## Yapılmaması gerekenler
- Task dışına çıkma; diğer repolara ve salt okunur AFINA-KAYNAK klasörüne yazma.
- Resmi metinleri yeniden yazma, belgesiz iddia/ürün/fiyat/iletişim bilgisi üretme.
- Servis/hesap/kanal kararlarını kullanıcı yerine verme; gizli bilgi commit etme.
- Bu task kaynak dosyalarını veya uygulama sayfalarını değiştirmez; üretilmiş sahne/tesis görseli ve video üretmez.

## Durum: BEKLİYOR
