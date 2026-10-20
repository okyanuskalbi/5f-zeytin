# Task 004: Tesis görseli — 16:9

## Tür
frontend

## Amaç
Tek tesis görselini aday olarak üret; kullanıcıya onaya sun.

## Bağlam
`docs/PLAN.md`: Hedef, Teknoloji, Mimari kararlar ve ilgili kapsam bölümü. Bağımlı task’lar / addBlockedBy: 003 (asset-registry); 080 (brand-assets). Komutlar 001 görevinde kurulacak araçlara dayanır; bağımlılıklar tamamlanmadan bu task çalıştırılmaz.

Resmi kaynak: docs/referans/icerik.md bölüm 04 — **Osmaniye üretim tesisi**. Kullanıcının temsili tesis fotoğrafı ve model erişimi beklenir; resmi metin fotoğraf yerine geçmez.

## Kullanılacak araçlar
- ECC skill: frontend-design-direction, verification-loop
- 21st MCP: hayır
- find-skills ile bulunup kurulacak ek skill: yok; yeni ihtiyaç varsa önce `npx skills find <konu>`, kurulan skill Coder Notu’na yazılır.

## Dokunulacak dosyalar
- `public/images/generated/factory-wide.png` (oluştur / düzenle)
- `public/images/generated/manifest.json` (oluştur / düzenle)
- `docs/gorsel-onay.md` (oluştur / düzenle)

## Adımlar
1. PLAN, AGENTS ve bağımlı task’ları oku; gereken kullanıcı kararları/onayları yoksa başlamadan Coder Notu’na engeli kaydet.
2. Kaynak bağlamı: **Osmaniye üretim tesisi**; docs/referans/icerik.md bölüm 04. Kullanıcının tesis fotoğrafı gelmeden başlama. İki katlı modern tesis; parlak zeytin-yeşili + mat siyah bloklar; siyah tabelada el yazısı yeşil Afina ve beyaz ZEYTİN; büyük cam, gri beton platform/basamak, saksıda zeytin, AFİNA bayrakları, kilitli parke avlu; Osmaniye/Çukurova, parçalı bulutlu mavi gök. Premium sinematik altın saat, tone mapping, temiz avlu, kişi/plaka yok; tabela doğru ve okunur. Atlas openai/gpt-image-2.5-flare uygunluğunu doğrula; yoksa model seçme, Coder Notu yaz. Oran 16:9. Çıktı aday kalır, kullanım/video yok.
3. Uygulama görevinde ilgili davranış testini önce başarısız çalıştır, uygula ve geçir. Görsel görevinde model/kaynak/çıktı doğrulaması yap; key ve kişisel veri kaydetme.
4. Kabul komutlarını çalıştır, çıktıyı ve varsa kullanıcı onay kaydını Coder Notu’na ekle; yalnız bu task kapsamını commit et.

## Kabul kriterleri
- [ ] `npm run check:assets -- --id factory-wide --candidate` dosya/hash/model/oran ve aday kaydını doğrular.
- [ ] `git diff --name-only` yalnız bu görselin dosyalarını ve ortak manifest/onay kaydını gösterir; `npm run test -- tests/unit/asset-registry.test.ts` onaysız kullanım korumasını geçirir.

## Yapılmaması gerekenler
- Task dışına çıkma, ek iyileştirme yapma; diğer repolara yazma.
- Kullanıcı yerine açık karar verme; gizli bilgi commit etme; onaysız görseli yayınlama.
- Gerçek ödeme, üretim DB değişikliği, canlı e-posta veya domain mutasyonu için bu taslağı tek başına yetki sayma.

## Coder Notu

### Önceki deneme — kaynak fotoğrafı sağlanmadan önce

- `AGENTS.md`, `docs/PLAN.md`, bu görev, bağımlı 003 ve 080 görevleri ile
  `docs/referans/icerik.md` bölüm 04 okundu. Bağımlı görevler `TAMAMLANDI`.
  `frontend-design-direction` ve `verification-loop` skill'leri kullanıldı;
  görev gereği 21st kullanılmadı, ek skill kurulmadı.
- **Kaynak engeli:** repoda kullanıcı tarafından sağlanmış tesis fotoğrafı yok.
  Gizli dosyalar dahil, bağımlılık/build/önbellek dizinleri dışında görsel
  dosyaları tarandı; yalnız logo/OG/kontrol şeridi ve `_legacy/` içindeki
  zeytinlik/ürün görselleri bulundu. Bunlar tesis fotoğrafı yerine kullanılamaz.
  Resmi metin de fotoğraf yerine geçmez. Adım 2'deki
  “Kullanıcının tesis fotoğrafı gelmeden başlama” şartı karşılanmadı.
- **Model doğrulaması:** Atlas MCP `atlas_get_model_info`, son eksiz
  `openai/gpt-image-2.5-flare` kimliği için `not found` döndürdü.
  Ardından `atlas_list_models({type: "Image", query: "gpt-image-2.5"})`, aynı
  Flare modelinin `/text-to-image` ve `/edit` uçlarını listeledi.
  `atlas_get_model_info({model: "openai/gpt-image-2.5-flare/edit"})` başarılı:
  referans fotoğrafı alan zorunlu `images` dizisi, `prompt`, PNG çıktısı ve
  tam 16:9 `2048x1152` boyutu şemada mevcut. Bu, aynı istenen modelin
  referansla düzenleme ucudur; alternatif model seçilmedi. Katalog/şema
  uygunluğu doğrulandı; başarılı bir üretim isteği henüz kanıtlanmış değil.
- Üretim veya medya yükleme çağrısı yapılmadı. `factory-wide.png` ve aday kaydı
  oluşturulmadı; ortak manifest, onay kaydı ve runtime değiştirilmedi.
  Kullanıcının kaynak tesis fotoğrafı sağlanınca görev sürdürülebilir.
  Görsel üretim görevi olduğu için adım 3 uyarınca davranış testi yazmak yerine
  kaynak/model/çıktı doğrulaması yapıldı; yeni UI olmadığı için rendered UI,
  viewport ve erişilebilirlik kontrolü uygulanabilir değil.

### Komutla doğrulama

| Komut / kontrol | Sonuç |
| --- | --- |
| `npm run check:assets -- --id factory-wide --candidate` | **FAIL / exit 1:** `Görsel bulunamadı: factory-wide (candidate).` Kaynak fotoğrafı olmadığı için çıktı/adayı üretilmedi; birinci kabul kriteri karşılanmadı. |
| `npm run test -- tests/unit/asset-registry.test.ts` | **PASS / exit 0:** 46/46 test; onaysız kullanım, eksik dosya ve sahte onay korumaları geçti. |
| `git diff --name-only` | Yalnız `docs/tasks/004-factory-wide.md`; kullanıcı talimatı ve AGENTS istisnası kapsamındaki Coder Notu/Durum kaydı. Görsel/manifest/onay dosyalarında değişiklik yok. İkinci kriterin test kısmı geçti, beklenen görsel teslimi oluşmadı. |
| `test ! -e public/images/generated/factory-wide.png` ve manifestte kimlik kontrolü | **PASS / exit 0:** çıktı ve `factory-wide` kaydı yok; mevcut 14 varlık korundu. |
| `npm run check:assets -- --candidate` | **PASS / exit 0:** mevcut 14 adayın kaynak/hash/onay/runtime kontrolü başarılı. Bu sonuç `factory-wide` adayının kabulü değildir. |
| `npm run build` | **PASS / exit 0:** prebuild 14 varlığı doğruladı, production build tamamlandı. |
| `npm run typecheck` | **PASS / exit 0:** route tipleri ve TypeScript kontrolü başarılı. |
| `npm run lint` | **PASS / exit 0:** hata/uyarı yok. |
| `git diff --check` | **PASS / exit 0:** boşluk hatası yok. |

Kaynak ön koşulu ve görsel teslimi tamamlanmadığından durum `BEKLİYOR`.
Kişisel veri, anahtar, kullanıcı onayı veya uydurma çıktı kaydedilmedi.

### 004-a devamı — 20 Ekim 2026, güncel sonuç

- PLAN, AGENTS, 003 ve 080 tekrar okundu; bağımlılıklar `TAMAMLANDI`.
  `frontend-design-direction` ve `verification-loop` kullanıldı. Yeni UI yok;
  21st ve ek skill kurulumu gerekmiyor. Görsel görevinin kaynak/model/çıktı
  doğrulama istisnası uygulandı; uygulama kodu veya davranış testi değiştirilmedi.
- Kaynak fotoğraf bulundu ve görsel olarak açıldı. İki katlı yeşil/siyah
  tesis, Afina ZEYTİN tabelası, cam cephe, platform/basamak ve avlu mevcut.
  Fotoğraf `docs/referans/tesis/afina-zeytin-tesis-osmaniye.png` yoluna
  birebir kopyalandı; kaynak dizinine yazılmadı. PNG, **1672×941**,
  **1.395.429 bayt**; kaynak ve kopyanın SHA-256 değeri:
  `2ab815d27aa8ef64f367feb49f0bb4923870644e534200c7f1716239106126a3`.
  Sharp ile tek durağan PNG olduğu ve EXIF/XMP/IPTC içermediği doğrulandı.
  Kaynak fotoğrafta araç/plaka bulunuyor; plaka metni kayıtlara çıkarılmadı.
- Atlas `atlas_get_model_info` ile **openai/gpt-image-2.5-flare/edit**
  yeniden doğrulandı: referans `images`, **2048×1152 / 16:9**, PNG ve en az
  iki çıktı için `n: 2` destekleniyor. Alternatif model seçilmedi.
- **Aktarım engeli:** bu kaynak dosyası için `atlas_upload_media` isteği
  otomatik onay incelemesinde reddedildi. Gerekçe: özel repo fotoğrafının
  Atlas Cloud'a aktarılması geçici, herkese açık bir URL oluşturuyor ve
  inceleme bu dış aktarım için ayrıca açık kullanıcı izni istiyor.
  Kullanıcıya kaynak dosyası, Atlas hedefi, URL'nin erişimi ve fotoğraftaki
  plaka belirtilerek izin soruldu; bu kayıt anında yanıt alınmadı.
  Ret başka araç, base64 veya dolaylı aktarım ile aşılmadı. Başarılı yükleme
  veya üretim yok; iki aday, çıktı hash'i ya da kullanıcı onayı uydurulmadı.
- **Kabul sözleşmesi çelişkisi:** 004-a, onaysız adayları `public/` altına
  koymayı yasaklıyor. Mevcut `scripts/check-assets.mjs`, manifestteki görselleri
  yalnız `public` altından okuyor; repo içi özel aday yolu desteklemiyor.
  Dolayısıyla istenen `--id factory-wide --candidate` komutu bu sınırla
  geçirilemiyor. Plan/doğrulayıcı kendiliğinden değiştirilmedi; ortak manifest,
  mevcut karar blokları ve runtime korundu. `docs/gorsel-onay.md`'ye yalnız
  kaynak doğrulaması ve üretimin beklediği kaydedildi.

#### Komutla doğrulama — 004-a

| Komut / kontrol | Sonuç |
| --- | --- |
| Node `assert.deepEqual` + Sharp metadata + SHA-256 | **PASS / exit 0:** kaynak/kopya baytları aynı; 1672×941 PNG ve yukarıdaki hash doğrulandı. |
| `npm run check:assets -- --id factory-wide --candidate` | **FAIL / exit 1:** `Görsel bulunamadı: factory-wide (candidate).` Üretim/aday kaydı yok; birinci kabul karşılanmadı. |
| `npm run test -- tests/unit/asset-registry.test.ts` | **PASS / exit 0:** **66/66** test; onaysız kullanım, eksik dosya ve sahte onay korumaları başarılı. |
| `npm run check:assets -- --candidate` | **PASS / exit 0:** **0 aday**; bütün kaydın hash/onay/runtime denetimi geçti. Factory-wide kabulü değildir. |
| Node manifest/dosya kontrolü | **PASS / exit 0:** mevcut **16** varlık korundu; `factory-wide` kaydı ve `public/images/generated/factory-wide.png` yok. |
| `npm run build` | **PASS / exit 0:** prebuild 16 varlığı doğruladı; production build tamamlandı. |
| `npm run typecheck` | **PASS / exit 0:** route tipleri ve TypeScript başarılı. |
| `npm run lint` | **PASS / exit 0:** hata/uyarı yok. |
| `npm run test -- --coverage` | **FAIL / exit 1:** **196/196 test geçti**, ancak mevcut global %80 kapsam eşiği sağlanmadı: statement %70,37, function %66,66, line %72,34; branch %96,15. Kapsamda çıkan hukuk/sepet sayfaları bu görev dışında; değiştirilmedi. |
| Kapsam ve gizli bilgi incelemesi; `git diff --check` | Yalnız görev notu, kaynak fotoğraf kopyası ve ortak onay dosyasındaki kaynak kaydı. Anahtar/harici yükleme URL'si/onay kararı eklenmedi. Build'in ürettiği `next-env.d.ts` farkı geri alındı. |

**Durum BEKLİYOR:** iki aday üretilemedi; Atlas'ın geçici herkese açık kaynak
aktarımı için açık izin ve özel aday saklamayla uyumlu kabul sözleşmesi eksik.
İkinci kabulün test kısmı geçti, görsel teslimi oluşmadı. İzin sonrası aynı
kaynakla kimliği koruyan altın saat/tone mapping, temiz avlu, kişi/plaka
olmayan ve doğru okunur Afina ZEYTİN tabelalı en az iki 16:9 aday üretilmeli;
adaylar kullanıcı onayı olmadan `public/` altına konmamalı.

## Düzeltme 004-a (Claude, 20 Eki)
Kaynak fotoğraf artık mevcut (kullanıcının sohbete yapıştırdığı tesis fotoğrafı): `~/PROJELER/AFINA-KAYNAK/fabrika/afina-zeytin-tesis-osmaniye.png` (1672×941, salt okunur). Yeşil-siyah cephe, "Afina ZEYTİN" tabelası, Osmaniye. Bu fotoğrafı referans alarak Atlas `openai/gpt-image-2.5-flare` (edit/referans) ile kimliği koruyan premium aday üret: altın saat ışığı, tone mapping, temiz avlu, plaka/kişi yok, tabela okunur ve doğru yazılı ("Afina ZEYTİN"). En az 2 aday, `docs/gorsel-onay.md`'de aday olarak kaydet; kullanıcı onayı Claude tarafından alınacak (onaysız public/'e koyma). Kaynak fotoğrafı `docs/referans/` altına kopyalayıp hash'le.

## Durum: BEKLİYOR
