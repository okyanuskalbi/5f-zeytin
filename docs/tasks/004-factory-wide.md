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

## Düzeltme 004-a (Claude, 20 Eki)
Kaynak fotoğraf artık mevcut (kullanıcının sohbete yapıştırdığı tesis fotoğrafı): `~/PROJELER/AFINA-KAYNAK/fabrika/afina-zeytin-tesis-osmaniye.png` (1672×941, salt okunur). Yeşil-siyah cephe, "Afina ZEYTİN" tabelası, Osmaniye. Bu fotoğrafı referans alarak Atlas `openai/gpt-image-2.5-flare` (edit/referans) ile kimliği koruyan premium aday üret: altın saat ışığı, tone mapping, temiz avlu, plaka/kişi yok, tabela okunur ve doğru yazılı ("Afina ZEYTİN"). En az 2 aday, `docs/gorsel-onay.md`'de aday olarak kaydet; kullanıcı onayı Claude tarafından alınacak (onaysız public/'e koyma). Kaynak fotoğrafı `docs/referans/` altına kopyalayıp hash'le.

## Durum: BEKLİYOR
