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

## Coder Notu

Task 002 ve 003 dosyalarının `TAMAMLANDI` durumu doğrulandı. Görevdeki
`design-system`, `verification-loop` ve `image-processing` skill'leri kullanıldı.
21st MCP bu görevde istenmediği için kullanılmadı; yeni UI/runtime bağlantısı yok.

### Uygulama

- Altı markanın yalnız kendi nesnelerini içeren 6 normal + 6 dark SVG'si,
  zeytin ambleminden transparan favicon ve 1200×630 OG PNG hazırlandı.
  SVG boyutları 1.691–54.713 bayt; favicon 52.353 bayt. Hepsi 60.000 bayttan küçük.
- Her kaynak SVG'deki 985 üst düzey nesneden yalnız ilgili logo seçildi;
  diğer logolar fiziksel olarak çıkarıldı. Kullanılan clip/defs bağımlılıkları
  korundu, gereksiz tanımlar temizlendi ve gerçek görünür sınırlara kırpıldı.
  Zeytin renk dilimleri, kaynak konturları korunarak yerel linear/radial
  gradientlere birleştirildi; kaynak renklerinden alınan stop'lar sadeleştirildi.
  SVGO 4.1.0, multipass, 3 basamak koordinat hassasiyeti kullanıldı.
- Koyu sürümlerde siyah/koyu wordmark'lar fildişine, topluluk/motors alt yazıları
  marka altınına uyarlandı; amblem renkleri korundu. Coffee ve inşaat yazıları
  da koyu zeminde okunur. Börek turuncu kimliği ve inşaat kırmızı alt yazısı korundu.
- Eksik dört markanın sekiz PNG/SVG kaynağı AFINA-KAYNAK'tan birebir kopyalandı.
  Kaynak klasöre yazılmadı. Mevcut PDF, zeytin/topluluk PNG ve SVG'lerinin
  `git show HEAD:<dosya>` baytlarıyla eşitliği ayrıca doğrulandı.
- Kaynak SHA-256/bayt/ölçü, dönüşüm, çıktı ölçüsü/hash ve görsel inceleme
  `docs/gorsel-onay.md` ile manifestte kayıtlı. 14 varlık `candidate`,
  `approval: null`; kullanıcı kararı yazılmadı, sayfalara bağlanmadı.
- SVGO yalnız repo içi `.cache/npm` önbelleğiyle çalıştırıldı. PDF yapısını
  incelemek için pypdf 6.1.1 yalnız `.cache/task-080/python` içine kuruldu.
  Proje bağımlılıkları/lockfile değişmedi; ara betikler ve renderlar `.cache/`
  altında, commit dışında tutuldu. Mevcut Sharp 0.35.5, Pillow ve NumPy kullanıldı.

### Görsel inceleme ve render komutları

Çalıştırılan hazırlama/render komutları:

```sh
pdftocairo -f 1 -l 1 -scale-to 1800 -png -singlefile 'docs/referans/logolar/AFİNA Logolar2.pdf' .cache/task-080/pdf-source
node .cache/task-080/inspect.mjs
python3 .cache/task-080/extract.py
python3 .cache/task-080/compact.py
npm_config_cache="$PWD/.cache/npm" npx --yes svgo@4.1.0 --config .cache/task-080/svgo.config.mjs -f .cache/task-080/compact -o public/brand
node .cache/task-080/render.mjs
python3 .cache/task-080/compare.py
```

Yerel Chromium `getBBox()` ile kaynak nesne ve clip sınırları ölçüldü.
macOS sandbox tarayıcıyı engellediği için ölçüm komutu izinli sandbox dışı
çalıştırmayla tamamlandı. Üretim/render işlemleri yereldir; görsel üretim API'si yok.

Commit içindeki kaynak ve sonuçlardan PNG ile aynı boyutta normal/dark renderları
yeniden almak için ara betik gerektirmeyen komut:

```sh
mkdir -p .cache/task-080
node --input-type=module <<'JS'
import sharp from 'sharp';
import { readFile } from 'node:fs/promises';
for (const name of 'topluluk zeytin borek coffee motors insaat'.split(' ')) {
  const source = await readFile(`docs/referans/logolar/afina-${name}.svg`, 'utf8');
  const viewBox = source.match(/viewBox="([^"]+)"/)[1];
  const { width, height } = await sharp(`docs/referans/logolar/afina-${name}.png`).metadata();
  for (const suffix of ['', '-dark']) {
    const svg = await readFile(`public/brand/afina-${name}${suffix}.svg`, 'utf8');
    const aligned = svg.replace(/<svg\b[^>]*>/,
      `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${viewBox}">`);
    await sharp(Buffer.from(aligned)).png().toFile(`.cache/task-080/${name}${suffix}-aligned.png`);
  }
}
for (const size of [16, 32, 48, 128]) {
  await sharp('public/brand/favicon.svg').resize(size, size).png()
    .toFile(`.cache/task-080/favicon-${size}.png`);
}
JS
```

`docs/referans/logolar/karsilastirma.png` (1440×2100) ve `public/brand/og.png`
dosyaları görsel olarak açılıp incelendi. Altı PNG/normal SVG çifti şekil,
harf, renk ve kırpma bakımından uyumlu; başka logodan kalan parça yok.
Koyu zemindeki altı wordmark okunur. Coffee/börek/inşaat amblemlerindeki özgün
koyu renkler korunmuştur. Favicon 16/32/48/128 px, açık ve koyu zeminde
kontrol edildi; küçük boyutta dairesel amblem/el silüeti seçiliyor.
OG'de resmi logo ve birebir resmi slogan kullanıldı.

Kaynak SVG → optimize SVG görünür alanda ortalama mutlak RGB farkı 0–255
ölçeğinde 0,027–1,456; rasterizer/kenar yumuşatma nedeniyle piksel eşitliği
iddia edilmez. Ayrıntılı marka ölçümleri görsel onay dosyasındadır.
Bu inceleme teknik kontroldür; kullanıcı görsel onayı yerine geçmez.

### Kabul ve doğrulama sonuçları

| Komut / kontrol | Sonuç |
| --- | --- |
| İlk çalıştırılan görevdeki Python boyut kontrolü (RED) | Beklenen `AssertionError`: 12 logo ve favicon henüz yoktu. |
| `ls public/brand/*.svg` | PASS: 6 normal + 6 dark + 1 favicon, toplam 13 SVG. |
| Kabul kriterindeki Python dosya/boyut komutu | PASS: `6+6 logo ve favicon boyutları`; her biri `<60000`. |
| `test -s docs/referans/logolar/karsilastirma.png && test -s public/brand/og.png && sips -g pixelWidth -g pixelHeight public/brand/og.png` | PASS: iki PNG mevcut; OG 1200×630. |
| `rg -n '<(image|foreignObject)\b' public/brand/*.svg` | PASS: eşleşme yok (beklenen çıkış 1); raster/HTML yok. |
| Kabul kriterindeki Python `ElementTree.parse` komutu | PASS: `SVG XML`, 13 dosya ayrıştırıldı. |
| SVG izinli eleman ve `url(#id)` bağımlılık kontrolü | PASS: yalnız SVG/defs/path/g/clipPath/linearGradient/radialGradient/stop; eksik referans, harici href ve event handler yok. |
| Kaynak bayt karşılaştırması | PASS: 12 PNG/SVG AFINA-KAYNAK ile birebir; mevcut PDF/PNG/SVG HEAD ile aynı. |
| Kontrol şeridi ve OG'nin görsel olarak açılması | PASS: altı marka, üç sütun ve dört favicon boyutu incelendi. |
| `npm run build` | PASS: prebuild 14 varlığı doğruladı; production build başarılı. |
| `npm run typecheck` | PASS: hata yok. |
| `npm run lint` | PASS: hata/uyarı yok. |
| `npm run test -- --coverage` | PASS: 2 dosya, 53/53 test. Mevcut kapsam ayarı 2 dosyada %100 raporladı; bu oran görsel/piksel kapsamı değildir. |
| `npm run check:assets -- --candidate` | PASS: 14 aday; kaynak/hash/ölçü/onay/runtime denetimi başarılı. |
| `npm run check:assets -- --approved` | PASS: 0 onaylı varlık; kullanıcı kararları boş. |
| Gizli anahtar deseni taraması ve `git diff --check` | PASS: bulgu/boşluk hatası yok. |

Altı kabul kriteri tamamlandı. Uygulanamayan adım veya kalan görev engeli yok.
Runtime yerleşimi, kullanıcı görsel onayı ve yayın bu görevin sonraki kapılarıdır.

## Durum: TAMAMLANDI
