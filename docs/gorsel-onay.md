# Görsel aday ve kullanıcı karar kaydı

Task 080 ile resmi kaynaklardan dönüştürülmüş 14 marka varlığı, Task 024-a
içindeki 20 Ekim 2026 tarihli kullanıcı kararıyla onaylandı. Kaynak ve çıktı
hash’lerine bağlı kararlar aşağıdaki `asset-approvals` bloğundadır. `docs/visual-prompts.md` korunur.
Video bu planın kapsamında değildir.

Kamuya açık kayıt `public/images/generated/manifest.json` dosyasıdır. Yalnız
aşağıdaki teknik alanlar kullanılabilir; ad, e-posta, telefon, hesap bilgisi,
ham kullanıcı mesajı, anahtar veya imzalı URL eklenmez. Kaynak dosyalarına da
kişisel veri içermeyen adlar verilir. Asıl kullanıcı mesajı bu repoya kopyalanmaz.

## Komutlar

```sh
npm run check:assets
npm run check:assets -- --candidate
npm run check:assets -- --id p01 --candidate
npm run check:assets -- --approved
npm run check:assets -- --id p01 --approved
```

`--id` tam ve benzersiz kimliği seçer; `--candidate` ile `--approved` birlikte
kullanılamaz. Kimlik belirtilmediyse boş seçim geçerlidir ve üretim başlatmaz.
İstenen kimlik/mod yoksa komut başarısız olur. Seçim yapılsa da bütün manifest,
kaynaklar ve uygulama kullanımı denetlenir. Komutlar yalnız yerel dosyaları okur;
API çağırmaz, üretim yapmaz, dosya veya kullanıcı kararı değiştirmez.

`predev` ve `prebuild`, aynı kontrolü uygulama başlamadan/derlenmeden çalıştırır.
Onaysız, kayıtsız veya dinamik görsel yolları hatadır. Onaylı görselleri sabit
dosya yollarıyla kullanın. Manifesti runtime'a import etmeyin. P08–P12 kullanıcı
onaylasa da yalnız tasarım referansıdır; uygulama görseli olarak kullanılamaz.

## Manifest sözleşmesi

Kök nesne `{ "version": 1, "assets": [] }` biçimindedir. Her görsel aşağıdaki
zorunlu alanların **tamamını** içerir. Task 024-a ile yalnız `runtime` boolean
alanı isteğe bağlı eklenebilir; başka fazladan alan kabul edilmez:

| Alan | Kural |
| --- | --- |
| `id` | Benzersiz küçük harf/rakam, tire veya nokta; ör. `p01`, `p01-wide-v2`, `factory-wide`. |
| `file` | `/images/generated/` veya `/brand/` altında sabit PNG/JPEG/WebP/AVIF/SVG yolu; benzersiz, symlink ve `..` yok. |
| `sha256` | Dosyanın gerçek baytlarının 64 karakterli küçük harf SHA-256 değeri. |
| `width`, `height` | Görselden okunan pozitif tam sayı piksel ölçüleri. |
| `aspectRatio` | Gerçek ölçüyle birebir eşleşen `16:9`, `9:16` vb. oran. |
| `model` | Üretim görevinde erişimi doğrulanmış model kimliği; ör. istenen `openai/gpt-image-2.5-flare`. Marka dönüşümünde kullanılan araç kimliği yazılır. Bu kayıt model erişimini doğrulamaz veya alternatif model seçmez. |
| `promptId` | `P01`–`P12` veya üretim/dönüşüm görevi için `TASK-004`, `TASK-080` gibi kimlik. Özgün prompt kaynak referansıyla bağlanır. |
| `representative` | Boolean temsili etiketi; üretilen görsellerde zorunlu `true`. Gerçek marka varlığında `false` olabilir. |
| `references` | En az bir `{ "file": "docs/...", "sha256": "..." }`; prompt, tesis/ürün fotoğrafı veya özgün logo kaynağı ve gerçek hash'i. Dosya ve hash kontrol edilir. |
| `status` | `candidate`, `approved` veya `rejected`. |
| `approval` | Aday/reddedilende `null`; onaylıda yalnız `{ "recordId": "...", "decidedAt": "..." }`. Karar bloğundaki tarih hassasiyeti korunur. |
| `runtime` | İsteğe bağlı boolean. `true` yalnız onaylı ve P08–P12 dışındaki varlıklarda geçerlidir; `false` runtime kullanımını kapatır. Eski, alanı bulunmayan kayıtlar mevcut onay denetimini korur. |

Üretilmiş dizindeki manifest dışındaki her dosya kayıtlı olmalıdır. Hareketli
görsel/video kabul edilmez. Kaynak veya çıktı değişirse hash değişir; eski onay
yeni dosyaya taşınmaz. Yeni aday/onay kaydı gerekir.

Ölçü denetimi mevcut Sharp ile yapılır; SHA-256 için Node `crypto` kullanılır.
Kaynaklar: [Sharp metadata](https://sharp.pixelplumbing.com/api-input/),
[Node crypto](https://nodejs.org/docs/latest-v24.x/api/crypto.html),
[npm lifecycle](https://docs.npmjs.com/cli/v11/using-npm/scripts/).

## Onay süreci

1. İlgili üretim görevi kaynak/model/prompt/oran/çıktıyı doğrular; görseli
   `candidate`, onayı `null` olarak kaydeder. Siteye bağlamaz.
2. Kullanıcıya görsel ve kimliği gösterilir. Açık kullanıcı kararı gelmeden onay
   kaydı yazılmaz; ajan kendi ürettiği sonucu kullanıcı adına onaylayamaz.
3. Karar aşağıdaki tek JSON bloğuna eklenir. Her karar tam olarak `recordId`,
   `assetId`, `sha256`, `decision`, `decidedAt`, `evidenceRef` içerir.
   `decision`, `approved` veya `rejected`; `decidedAt`, gerçek karar anının
   gelecekte olmayan UTC ISO tarihi (`YYYY-MM-DDTHH:mm:ss.sssZ`) olmalıdır.
   `evidenceRef`, asıl kullanıcı mesajının izlenebilir fakat kişisel veri
   içermeyen `user-message-...` biçimindeki referansıdır. Ham mesaj eklenmez.
4. Onaylı manifest kaydı, bu karara `recordId`/`decidedAt` ile bağlanır.
   Kimlik/hash/tarih/karar ve kanıt referansı uyuşmadan doğrulama geçmez.
   Reddedilmiş dosya kullanılmaz; yeni üretim yeni adaydır.
5. Yalnız onaydan sonra Task 034 runtime yerleşimini yapar. Task 024-a ayrıca
   onaylı marka setinin shell/favicon/OG yerleşimine yetki verir. Karar kaydı
   tek başına diğer görselleri yerleştirme veya canlı yayın yetkisi sağlamaz.

Doğrulayıcı yerel kayıtların tutarlılığını denetler; harici kullanıcı mesajının
gerçekliğini bağımsız olarak kanıtlayamaz. Mesaj referansını gerçek kullanıcı
kararından kaydetmek ve incelemek gerekir. Sırf `approved` yazmak yeterli değildir.

```json asset-decisions
{
  "version": 1,
  "decisions": []
}
```

## TASK-080 — Marka varlıkları teknik kontrol kaydı

Resmi altı logo kaynağı Illustrator PDF’sidir; PNG dosyaları görsel referanstır.
Börek, coffee, motors ve inşaat PNG/SVG dosyaları yalnız
`~/PROJELER/AFINA-KAYNAK/logo/` kaynağından baytları korunarak kopyalandı.
Kaynak PDF/PNG/SVG değiştirilmedi.

### Kaynaklar

| Dosya | Bayt | Ölçü / kaynak viewBox | SHA-256 |
| --- | ---: | --- | --- |
| AFİNA Logolar2.pdf | 580429 | 1920×1080 pt, 1 sayfa | `a45eeea7abdad50f043cb8d2c9dc24228f8481086c9d43df8745c4700a65a9ab` |
| afina-topluluk.png | 151858 | 3366×2000 px | `e17a97ca61e968fca161d9e6f6ef4e089f0f924b218eb961fda08835632d3f19` |
| afina-topluluk.svg | 2673871 | viewBox 836 176 404 240 | `0ae7decd5b10d084037a507cb6a86444352772ab759bc612bd94fc62314c45bb` |
| afina-zeytin.png | 218775 | 1350×1533 px | `845182fa8c976af093485a12b3fe109b5d19da9455313e380227ada69f288aed` |
| afina-zeytin.svg | 2673871 | viewBox 484 508 162 184 | `0350812d1ca7b69b572116e5902262eb68f20a88888fc8e06a3ede23ceb05685` |
| afina-borek.png | 95494 | 1050×1533 px | `78fb547e5389e2f9c5f88e1a1847199320a91cf593ecc2fe7f554add641af74b` |
| afina-borek.svg | 2673871 | viewBox 718 508 126 184 | `253d2dcf7256fbf4bf0194dee4bf0a59adbbc42dffb695452b62d1a7f5d28c88` |
| afina-coffee.png | 134676 | 1700×1533 px | `100b2280ce4bbf433858b6c561d394144d176a897f0b23acaa8f5be38c7c7bcf` |
| afina-coffee.svg | 2673871 | viewBox 918 508 204 184 | `9693a6070a4ce6219c0f014a0a37dd6ba04e32d504d78249cb85f23459d38e7a` |
| afina-motors.png | 119497 | 2050×1533 px | `a3855ae26c4e860edfeb0993db4b164b101a95fba07a2cd8913f8b09c50cd520` |
| afina-motors.svg | 2673872 | viewBox 1196 508 246 184 | `ef2e273ff95bda10cc14dc3a5fafe067903090d46a453f8363c416a818450ec5` |
| afina-insaat.png | 74386 | 1633×1533 px | `e58290af9d62d53a3fd64d6085586c248b35554decf86b82c27721b2f9dc0ee2` |
| afina-insaat.svg | 2673872 | viewBox 1514 508 196 184 | `b6db023cfba9aa7a69e7835e8ff68b211b67ceb51478c12681f26fa389b18a37` |

### Dönüşüm ve görsel inceleme

- Her SVG’nin 985 üst düzey nesnesinden yalnız ilgili markanın gerçek sınırlarıyla kesişen nesneler seçildi; diğer marka nesneleri fiziksel olarak çıkarıldı. Kullanılan clip/gradient bağımlılıkları korunup kullanılmayan defs, metadata ve yinelenen tanımlar temizlendi. Yalnız viewBox değiştirilmedi.
- Zeytin ambleminin renk şeritleri aynı kaynak konturlarında yerel linear/radial gradientlere birleştirildi. Gradient renk örnekleri kaynak dilimlerinden alındı; konturlar yeniden çizilmedi. Gradient stop sadeleştirme toleransı 0–255 RGB kanalında 0,55; SVGO 4.1.0 multipass ve 3 basamak koordinat hassasiyeti uygulandı. Raster/HTML gömülmedi.
- Topluluk, zeytin ve motors siyah yazıları #F5F1E7; topluluk/motors küçük alt yazıları #D4B483 yapıldı. Coffee koyu kahverengi yazıları ve inşaat koyu mavi ana yazısı koyu zeminde #F5F1E7 oldu. Amblem renkleri, börek turuncu yazısı ve inşaat kırmızı alt yazısı korundu. Tüm çıktılar transparan; dark zemin yalnız kontrol şeridi/OG kompozisyonundadır.
- Favicon yalnız resmi zeytin dalı/el amblemidir; yazı eklenmedi. 16/32/48/128 px renderlar açık ve #243A29 koyu zeminde incelendi; küçük boyutta dairesel amblem/el silüeti korunuyor.
- OG 1200×630 PNG: #243A29 zemin, resmi zeytin dark logosu ve `icerik.md` içindeki birebir “Kökü toprakta. Yeri sofrada.” sloganı. Logo/isim/slogan veya ticari iddia üretilmedi.
- `karsilastirma.png` dosyası açılarak altı PNG / normal SVG / koyu zemin dark SVG satırı görsel olarak incelendi. Harfler, amblem konturları ve renkler uyumlu; kesilmiş harf veya başka marka parçası yok; tüm wordmark’lar okunur. Coffee/börek/inşaat amblemlerinin özgün koyu renkleri korunmuştur. Bu teknik inceleme kullanıcı görsel onayı değildir.
- Normal SVG’ler PNG kaynaklarıyla aynı piksel boyutunda, kaynak viewBox’ına geri yerleştirilerek Sharp 0.35.5 ile render edildi. Kaynak SVG → optimize SVG görünür alan ortalama mutlak RGB farkı aşağıdadır; rasterizer/kenar yumuşatma farkı nedeniyle piksel eşitliği iddia edilmez.

| Marka | PNG karşılaştırma renderı | Kaynak SVG → optimize SVG ort. RGB farkı / 255 |
| --- | --- | ---: |
| topluluk | 3366×2000 | 0.199 |
| zeytin | 1350×1533 | 1.456 |
| borek | 1050×1533 | 0.027 |
| coffee | 1700×1533 | 0.054 |
| motors | 2050×1533 | 0.195 |
| insaat | 1633×1533 | 0.027 |

### Çıktılar (Task 080 anındaki aday kaydı)

Hash, kaynak referansları, araç, piksel ölçüsü ve oran manifestte tutulur.

| Aday kimliği | Bayt | Piksel ölçüsü | Durum |
| --- | ---: | --- | --- |
| brand-afina-topluluk | 22218 | 381×225 | candidate / approval: null |
| brand-afina-topluluk-dark | 14757 | 381×225 | candidate / approval: null |
| brand-afina-zeytin | 54683 | 145×167 | candidate / approval: null |
| brand-afina-zeytin-dark | 54713 | 145×167 | candidate / approval: null |
| brand-afina-borek | 4356 | 108×166 | candidate / approval: null |
| brand-afina-borek-dark | 4356 | 108×166 | candidate / approval: null |
| brand-afina-coffee | 12504 | 187×167 | candidate / approval: null |
| brand-afina-coffee-dark | 12531 | 187×167 | candidate / approval: null |
| brand-afina-motors | 14236 | 228×167 | candidate / approval: null |
| brand-afina-motors-dark | 12813 | 228×167 | candidate / approval: null |
| brand-afina-insaat | 1691 | 175×167 | candidate / approval: null |
| brand-afina-insaat-dark | 1691 | 175×167 | candidate / approval: null |
| brand-favicon | 52353 | 113×113 | candidate / approval: null |
| brand-og | 63975 | 1200×630 | candidate / approval: null |

Kontrol şeridi: 1440×2100 PNG, SHA-256 `5810a02c88ea1eadf8fd661a1a3fb448e177bcbf2e4126daed579e0218ce26c3`.

Task 080 tamamlandığında 14 varlığın tamamı adaydı; kullanıcı karar bloğu
boştu ve runtime bağlantısı yoktu. Güncel onay kararı Task 024-a kaydındadır.


## TASK-024-a — Kullanıcının resmi marka seti onayı

Karar kaynağı: [Task 024-a kullanıcı onay kaydı](tasks/024-shell.md#düzeltme-024-a-claude-20-eki).
Kullanıcının resmi Illustrator PDF’sinden çıkarılan 6 normal + 6 dark logo,
favicon ve OG seti onaylıdır. Bu kayıt yeni görsel üretimi veya diğer adaylar
için onay vermez. Karşılaştırma şeridi yeniden açılıp incelendi; kaynak ve
çıktı baytlarının SHA-256 değerleri tekrar doğrulandı.

`asset-decisions` eski karar sözleşmesini korur. Task 024-a için eklenen tek
`asset-approvals` bloğu `{ "version": 1, "approvals": [] }` biçimindedir. Her
kayıt tam olarak `recordId`, `assetId`, `sha256`, `references`, `approvedBy`,
`approvedAt`, `evidence` alanlarını taşır. `approvedBy` yalnız `"user"`;
`approvedAt` gelecekte olmayan gerçek karar günü (`YYYY-MM-DD`); `evidence`
kişisel veri içermeyen `user-message-...` referansıdır. Saat bilinmediği için
saat üretilmez. `references` manifestteki kaynak yolları ve hash’leriyle birebir
eşleşir. İki blok arasında `recordId` benzersizdir. Manifest onayı aynı
`recordId` ve gün hassasiyetindeki `decidedAt` ile bağlanır.

14 kaydın `status` değeri `approved`, `runtime` değeri `true` yapıldı. Shell
yalnız zeytin normal/dark ve topluluk dark logolarını kullanır; favicon ve OG
metadata’ya bağlanır. Diğer onaylı markalar bu landing’e eklenmez. Bu yerel
yerleşim canlı yayın veya domain bağlama işlemi değildir.

```json asset-approvals
{
  "version": 1,
  "approvals": [
    {
      "recordId": "user-2026-10-20-brand-afina-topluluk",
      "assetId": "brand-afina-topluluk",
      "sha256": "7efeb22761952652542bb7b9c7722e0076abcd6a27585b5b043dd095652e6845",
      "references": [
        {
          "file": "docs/referans/logolar/AFİNA Logolar2.pdf",
          "sha256": "a45eeea7abdad50f043cb8d2c9dc24228f8481086c9d43df8745c4700a65a9ab"
        },
        {
          "file": "docs/referans/logolar/afina-topluluk.svg",
          "sha256": "0ae7decd5b10d084037a507cb6a86444352772ab759bc612bd94fc62314c45bb"
        },
        {
          "file": "docs/referans/logolar/afina-topluluk.png",
          "sha256": "e17a97ca61e968fca161d9e6f6ef4e089f0f924b218eb961fda08835632d3f19"
        }
      ],
      "approvedBy": "user",
      "approvedAt": "2026-10-20",
      "evidence": "user-message-2026-10-20-task-024-a-brand-set"
    },
    {
      "recordId": "user-2026-10-20-brand-afina-topluluk-dark",
      "assetId": "brand-afina-topluluk-dark",
      "sha256": "f2a640f761a9f1abc5f510d187552a3d6cc3dc2b18b1669072129d731d33dbcc",
      "references": [
        {
          "file": "docs/referans/logolar/AFİNA Logolar2.pdf",
          "sha256": "a45eeea7abdad50f043cb8d2c9dc24228f8481086c9d43df8745c4700a65a9ab"
        },
        {
          "file": "docs/referans/logolar/afina-topluluk.svg",
          "sha256": "0ae7decd5b10d084037a507cb6a86444352772ab759bc612bd94fc62314c45bb"
        },
        {
          "file": "docs/referans/logolar/afina-topluluk.png",
          "sha256": "e17a97ca61e968fca161d9e6f6ef4e089f0f924b218eb961fda08835632d3f19"
        }
      ],
      "approvedBy": "user",
      "approvedAt": "2026-10-20",
      "evidence": "user-message-2026-10-20-task-024-a-brand-set"
    },
    {
      "recordId": "user-2026-10-20-brand-afina-zeytin",
      "assetId": "brand-afina-zeytin",
      "sha256": "49afab6fbfb1b9c1b7c6c4ce6f8e1b90db8922eb6383792acdf7793144278f6f",
      "references": [
        {
          "file": "docs/referans/logolar/AFİNA Logolar2.pdf",
          "sha256": "a45eeea7abdad50f043cb8d2c9dc24228f8481086c9d43df8745c4700a65a9ab"
        },
        {
          "file": "docs/referans/logolar/afina-zeytin.svg",
          "sha256": "0350812d1ca7b69b572116e5902262eb68f20a88888fc8e06a3ede23ceb05685"
        },
        {
          "file": "docs/referans/logolar/afina-zeytin.png",
          "sha256": "845182fa8c976af093485a12b3fe109b5d19da9455313e380227ada69f288aed"
        }
      ],
      "approvedBy": "user",
      "approvedAt": "2026-10-20",
      "evidence": "user-message-2026-10-20-task-024-a-brand-set"
    },
    {
      "recordId": "user-2026-10-20-brand-afina-zeytin-dark",
      "assetId": "brand-afina-zeytin-dark",
      "sha256": "a5626b9dfd14b1cdd6bcbe2bdff5579f9d99cc338632298ddb3c14e0f0b6dfe3",
      "references": [
        {
          "file": "docs/referans/logolar/AFİNA Logolar2.pdf",
          "sha256": "a45eeea7abdad50f043cb8d2c9dc24228f8481086c9d43df8745c4700a65a9ab"
        },
        {
          "file": "docs/referans/logolar/afina-zeytin.svg",
          "sha256": "0350812d1ca7b69b572116e5902262eb68f20a88888fc8e06a3ede23ceb05685"
        },
        {
          "file": "docs/referans/logolar/afina-zeytin.png",
          "sha256": "845182fa8c976af093485a12b3fe109b5d19da9455313e380227ada69f288aed"
        }
      ],
      "approvedBy": "user",
      "approvedAt": "2026-10-20",
      "evidence": "user-message-2026-10-20-task-024-a-brand-set"
    },
    {
      "recordId": "user-2026-10-20-brand-afina-borek",
      "assetId": "brand-afina-borek",
      "sha256": "02cf3447fdcbf959c41b04d92385cf7f7be794c1ce064849ea3e47eeb3801938",
      "references": [
        {
          "file": "docs/referans/logolar/AFİNA Logolar2.pdf",
          "sha256": "a45eeea7abdad50f043cb8d2c9dc24228f8481086c9d43df8745c4700a65a9ab"
        },
        {
          "file": "docs/referans/logolar/afina-borek.svg",
          "sha256": "253d2dcf7256fbf4bf0194dee4bf0a59adbbc42dffb695452b62d1a7f5d28c88"
        },
        {
          "file": "docs/referans/logolar/afina-borek.png",
          "sha256": "78fb547e5389e2f9c5f88e1a1847199320a91cf593ecc2fe7f554add641af74b"
        }
      ],
      "approvedBy": "user",
      "approvedAt": "2026-10-20",
      "evidence": "user-message-2026-10-20-task-024-a-brand-set"
    },
    {
      "recordId": "user-2026-10-20-brand-afina-borek-dark",
      "assetId": "brand-afina-borek-dark",
      "sha256": "02cf3447fdcbf959c41b04d92385cf7f7be794c1ce064849ea3e47eeb3801938",
      "references": [
        {
          "file": "docs/referans/logolar/AFİNA Logolar2.pdf",
          "sha256": "a45eeea7abdad50f043cb8d2c9dc24228f8481086c9d43df8745c4700a65a9ab"
        },
        {
          "file": "docs/referans/logolar/afina-borek.svg",
          "sha256": "253d2dcf7256fbf4bf0194dee4bf0a59adbbc42dffb695452b62d1a7f5d28c88"
        },
        {
          "file": "docs/referans/logolar/afina-borek.png",
          "sha256": "78fb547e5389e2f9c5f88e1a1847199320a91cf593ecc2fe7f554add641af74b"
        }
      ],
      "approvedBy": "user",
      "approvedAt": "2026-10-20",
      "evidence": "user-message-2026-10-20-task-024-a-brand-set"
    },
    {
      "recordId": "user-2026-10-20-brand-afina-coffee",
      "assetId": "brand-afina-coffee",
      "sha256": "5cd2732fef1be0e814463cb8482e5cb15167a05c899b4a51491c13cb813a4532",
      "references": [
        {
          "file": "docs/referans/logolar/AFİNA Logolar2.pdf",
          "sha256": "a45eeea7abdad50f043cb8d2c9dc24228f8481086c9d43df8745c4700a65a9ab"
        },
        {
          "file": "docs/referans/logolar/afina-coffee.svg",
          "sha256": "9693a6070a4ce6219c0f014a0a37dd6ba04e32d504d78249cb85f23459d38e7a"
        },
        {
          "file": "docs/referans/logolar/afina-coffee.png",
          "sha256": "100b2280ce4bbf433858b6c561d394144d176a897f0b23acaa8f5be38c7c7bcf"
        }
      ],
      "approvedBy": "user",
      "approvedAt": "2026-10-20",
      "evidence": "user-message-2026-10-20-task-024-a-brand-set"
    },
    {
      "recordId": "user-2026-10-20-brand-afina-coffee-dark",
      "assetId": "brand-afina-coffee-dark",
      "sha256": "f756e62e5552507483c5560b4150c5ef94d99ff9bba1a4571583b7bf4ce263be",
      "references": [
        {
          "file": "docs/referans/logolar/AFİNA Logolar2.pdf",
          "sha256": "a45eeea7abdad50f043cb8d2c9dc24228f8481086c9d43df8745c4700a65a9ab"
        },
        {
          "file": "docs/referans/logolar/afina-coffee.svg",
          "sha256": "9693a6070a4ce6219c0f014a0a37dd6ba04e32d504d78249cb85f23459d38e7a"
        },
        {
          "file": "docs/referans/logolar/afina-coffee.png",
          "sha256": "100b2280ce4bbf433858b6c561d394144d176a897f0b23acaa8f5be38c7c7bcf"
        }
      ],
      "approvedBy": "user",
      "approvedAt": "2026-10-20",
      "evidence": "user-message-2026-10-20-task-024-a-brand-set"
    },
    {
      "recordId": "user-2026-10-20-brand-afina-motors",
      "assetId": "brand-afina-motors",
      "sha256": "47440adbdbfd8b02751799d7bfe873d7640ebab672b25a1caae72a877166ed25",
      "references": [
        {
          "file": "docs/referans/logolar/AFİNA Logolar2.pdf",
          "sha256": "a45eeea7abdad50f043cb8d2c9dc24228f8481086c9d43df8745c4700a65a9ab"
        },
        {
          "file": "docs/referans/logolar/afina-motors.svg",
          "sha256": "ef2e273ff95bda10cc14dc3a5fafe067903090d46a453f8363c416a818450ec5"
        },
        {
          "file": "docs/referans/logolar/afina-motors.png",
          "sha256": "a3855ae26c4e860edfeb0993db4b164b101a95fba07a2cd8913f8b09c50cd520"
        }
      ],
      "approvedBy": "user",
      "approvedAt": "2026-10-20",
      "evidence": "user-message-2026-10-20-task-024-a-brand-set"
    },
    {
      "recordId": "user-2026-10-20-brand-afina-motors-dark",
      "assetId": "brand-afina-motors-dark",
      "sha256": "6033e0819d35d753ca804e1d2e4a2587246bd409288a44479f23225e16055929",
      "references": [
        {
          "file": "docs/referans/logolar/AFİNA Logolar2.pdf",
          "sha256": "a45eeea7abdad50f043cb8d2c9dc24228f8481086c9d43df8745c4700a65a9ab"
        },
        {
          "file": "docs/referans/logolar/afina-motors.svg",
          "sha256": "ef2e273ff95bda10cc14dc3a5fafe067903090d46a453f8363c416a818450ec5"
        },
        {
          "file": "docs/referans/logolar/afina-motors.png",
          "sha256": "a3855ae26c4e860edfeb0993db4b164b101a95fba07a2cd8913f8b09c50cd520"
        }
      ],
      "approvedBy": "user",
      "approvedAt": "2026-10-20",
      "evidence": "user-message-2026-10-20-task-024-a-brand-set"
    },
    {
      "recordId": "user-2026-10-20-brand-afina-insaat",
      "assetId": "brand-afina-insaat",
      "sha256": "3a118e447c67ffd3a92920cfc98eff328332990dfcc80e9d8687d0ed5dce955b",
      "references": [
        {
          "file": "docs/referans/logolar/AFİNA Logolar2.pdf",
          "sha256": "a45eeea7abdad50f043cb8d2c9dc24228f8481086c9d43df8745c4700a65a9ab"
        },
        {
          "file": "docs/referans/logolar/afina-insaat.svg",
          "sha256": "b6db023cfba9aa7a69e7835e8ff68b211b67ceb51478c12681f26fa389b18a37"
        },
        {
          "file": "docs/referans/logolar/afina-insaat.png",
          "sha256": "e58290af9d62d53a3fd64d6085586c248b35554decf86b82c27721b2f9dc0ee2"
        }
      ],
      "approvedBy": "user",
      "approvedAt": "2026-10-20",
      "evidence": "user-message-2026-10-20-task-024-a-brand-set"
    },
    {
      "recordId": "user-2026-10-20-brand-afina-insaat-dark",
      "assetId": "brand-afina-insaat-dark",
      "sha256": "103965f6fab2ccc3318226077cc7536948a28f678aa2e0818369ca19e9222f02",
      "references": [
        {
          "file": "docs/referans/logolar/AFİNA Logolar2.pdf",
          "sha256": "a45eeea7abdad50f043cb8d2c9dc24228f8481086c9d43df8745c4700a65a9ab"
        },
        {
          "file": "docs/referans/logolar/afina-insaat.svg",
          "sha256": "b6db023cfba9aa7a69e7835e8ff68b211b67ceb51478c12681f26fa389b18a37"
        },
        {
          "file": "docs/referans/logolar/afina-insaat.png",
          "sha256": "e58290af9d62d53a3fd64d6085586c248b35554decf86b82c27721b2f9dc0ee2"
        }
      ],
      "approvedBy": "user",
      "approvedAt": "2026-10-20",
      "evidence": "user-message-2026-10-20-task-024-a-brand-set"
    },
    {
      "recordId": "user-2026-10-20-brand-favicon",
      "assetId": "brand-favicon",
      "sha256": "c8cad56a558493832ab9ed75ba89dffba66503ee00c3837625b0d325b2b303e5",
      "references": [
        {
          "file": "docs/referans/logolar/AFİNA Logolar2.pdf",
          "sha256": "a45eeea7abdad50f043cb8d2c9dc24228f8481086c9d43df8745c4700a65a9ab"
        },
        {
          "file": "docs/referans/logolar/afina-zeytin.svg",
          "sha256": "0350812d1ca7b69b572116e5902262eb68f20a88888fc8e06a3ede23ceb05685"
        },
        {
          "file": "docs/referans/logolar/afina-zeytin.png",
          "sha256": "845182fa8c976af093485a12b3fe109b5d19da9455313e380227ada69f288aed"
        }
      ],
      "approvedBy": "user",
      "approvedAt": "2026-10-20",
      "evidence": "user-message-2026-10-20-task-024-a-brand-set"
    },
    {
      "recordId": "user-2026-10-20-brand-og",
      "assetId": "brand-og",
      "sha256": "8e4349835bacca4db9a31b3c605bc6a58601a1b342fbc350eded2cdfec6ac640",
      "references": [
        {
          "file": "docs/referans/logolar/AFİNA Logolar2.pdf",
          "sha256": "a45eeea7abdad50f043cb8d2c9dc24228f8481086c9d43df8745c4700a65a9ab"
        },
        {
          "file": "docs/referans/logolar/afina-zeytin.svg",
          "sha256": "0350812d1ca7b69b572116e5902262eb68f20a88888fc8e06a3ede23ceb05685"
        },
        {
          "file": "docs/referans/logolar/afina-zeytin.png",
          "sha256": "845182fa8c976af093485a12b3fe109b5d19da9455313e380227ada69f288aed"
        },
        {
          "file": "docs/referans/icerik.md",
          "sha256": "c4b118f9786830b272dd0a407187cada123ae31a427a6da350096453eaa79f42"
        }
      ],
      "approvedBy": "user",
      "approvedAt": "2026-10-20",
      "evidence": "user-message-2026-10-20-task-024-a-brand-set"
    },
    {
      "recordId": "user-2026-10-20-hero-zeytinlik-2400",
      "assetId": "hero-zeytinlik-2400",
      "sha256": "f6d490617df356087f6fbbf88e761ed6d233e35d47f63b1f012cd1a3ededa3ff",
      "references": [
        {
          "file": "docs/tasks/086-hero-zeytinlik.md",
          "sha256": "6367eef7fb8ef6d6cf66f0f41768bcb63cf93f110e80d0b4d8f0f7725a989cbe"
        }
      ],
      "approvedBy": "user",
      "approvedAt": "2026-10-20",
      "evidence": "user-message-2026-10-20-task-086-hero-ok"
    },
    {
      "recordId": "user-2026-10-20-hero-zeytinlik-1200",
      "assetId": "hero-zeytinlik-1200",
      "sha256": "96bad3c9018135bd27e907e3e6eca6771b447c0b682c5faca05f775a3ec78ce4",
      "references": [
        {
          "file": "docs/tasks/086-hero-zeytinlik.md",
          "sha256": "6367eef7fb8ef6d6cf66f0f41768bcb63cf93f110e80d0b4d8f0f7725a989cbe"
        }
      ],
      "approvedBy": "user",
      "approvedAt": "2026-10-20",
      "evidence": "user-message-2026-10-20-task-086-hero-ok"
    },
    {
      "recordId": "user-2026-10-20-hero-zeytin-sequence",
      "assetId": "hero-zeytin-sequence",
      "sha256": "993ccb9e67decc74105534c7bc261e92fe0a030d96dec2721185f8f9d5248794",
      "references": [
        {
          "file": "docs/tasks/086-hero-zeytinlik.md",
          "sha256": "6367eef7fb8ef6d6cf66f0f41768bcb63cf93f110e80d0b4d8f0f7725a989cbe"
        }
      ],
      "approvedBy": "user",
      "approvedAt": "2026-10-20",
      "evidence": "user-message-2026-10-20-task-086-videolar-ok"
    }
  ]
}
```

## TASK-086 — Onaylı zeytinlik hero ve scroll videosu

Task 086’nın açık varlık kayıt talebiyle bu onay kaydı eklendi. Görsel ve video
onayı [Task 086](tasks/086-hero-zeytinlik.md) bağlamındadır; dış kaynaklar salt
okunur doğrulandı. Kaynak görsel SHA-256: `a5e9683e842478222e73a08631d96892cdbe0e4cc2812ce7cac1b870bec76b79`;
kaynak video SHA-256: `a326b19c0ee6e830d987113359992a63da4ef20e8c64bf9196d0f67ce6d981b8`. Bu sahne temsili olup gerçek ürün veya tesis fotoğrafı iddiası taşımaz.

İki WebP poster `approved`, `runtime=true` olarak görsel manifestindedir.
Kare dizisi onayı `public/frames/hero-zeytin/approval.json` baytlarının hash’ine
bağlıdır; bu dosya 24 fps, 1920/960 px, 121’er kare, poster ve manifest hash’lerini
kapsar. `check:assets` bütün dosyaları, ölçüleri, onay bağını ve toplam 12 MB
sınırını denetler. MP4 runtime’a eklenmedi. Önceki video kapsam sınırı bu
görevde açıkça onaylanan hero kare dizisini kapsamaz; diğer sahnelere onay vermez.

## TASK-004-a — Tesis kaynağı doğrulandı, üretim bekliyor

Kaynak: `docs/referans/tesis/afina-zeytin-tesis-osmaniye.png`.
Task 004-a'da belirtilen salt okunur tesis fotoğrafının birebir kopyasıdır;
PNG **1672×941**, **1.395.429 bayt**, tek durağan görsel, EXIF/XMP/IPTC yok.
SHA-256: `2ab815d27aa8ef64f367feb49f0bb4923870644e534200c7f1716239106126a3`.
Kaynak fotoğraf temsili referanstır; kullanıcı görsel onayı değildir.

Atlas katalog/şeması `openai/gpt-image-2.5-flare/edit` için referans fotoğrafı,
2048×1152 (16:9), PNG ve `n: 2` desteğini doğruladı. Kaynak yükleme isteği,
geçici herkese açık URL oluşturacak dış aktarım için ayrıca kullanıcı izni
gerektiği gerekçesiyle otomatik onay incelemesinde reddedildi. Aktarım izni
soruldu; bu kayıt anında yanıt yok. Başarılı yükleme veya üretim yapılmadı.

**Üretilmiş aday sayısı: 0.** Çıktı/hash/onay/karar kaydı oluşturulmadı;
mevcut karar blokları ve public manifest değiştirilmedi. 004-a gereğince
onaysız adaylar `public/` altında saklanamaz; mevcut doğrulayıcı yalnız bu
dizindeki görselleri kabul ettiğinden kabul sözleşmesi ayrıca çözülmelidir.
Ayrıntı ve komut sonuçları [Task 004 Coder Notu](tasks/004-factory-wide.md)'ndadır.
