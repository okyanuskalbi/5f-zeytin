# Görsel aday ve kullanıcı karar kaydı

Henüz üretilmiş veya kullanıcı tarafından onaylanmış görsel yoktur. Bu kayıt,
görsel üretimi veya onayı yerine geçmez. `docs/visual-prompts.md` korunur.
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
alanların **tamamını** içerir; fazladan alan kabul edilmez:

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
| `approval` | Aday/reddedilende `null`; onaylıda yalnız `{ "recordId": "...", "decidedAt": "..." }`. |

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
5. Yalnız onaydan sonra Task 034 runtime yerleşimini yapar. Bu görev, yerleşim
   veya yayın yetkisi sağlamaz.

Doğrulayıcı yerel kayıtların tutarlılığını denetler; harici kullanıcı mesajının
gerçekliğini bağımsız olarak kanıtlayamaz. Mesaj referansını gerçek kullanıcı
kararından kaydetmek ve incelemek gerekir. Sırf `approved` yazmak yeterli değildir.

```json asset-decisions
{
  "version": 1,
  "decisions": []
}
```
