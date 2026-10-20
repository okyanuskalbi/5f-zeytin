# Task 005: Tesis görseli — 9:16

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
- `public/images/generated/factory-tall.png` (oluştur / düzenle)
- `public/images/generated/manifest.json` (oluştur / düzenle)
- `docs/gorsel-onay.md` (oluştur / düzenle)

## Adımlar
1. PLAN, AGENTS ve bağımlı task’ları oku; gereken kullanıcı kararları/onayları yoksa başlamadan Coder Notu’na engeli kaydet.
2. Kaynak bağlamı: **Osmaniye üretim tesisi**; docs/referans/icerik.md bölüm 04. Kullanıcının tesis fotoğrafı gelmeden başlama. İki katlı modern tesis; parlak zeytin-yeşili + mat siyah bloklar; siyah tabelada el yazısı yeşil Afina ve beyaz ZEYTİN; büyük cam, gri beton platform/basamak, saksıda zeytin, AFİNA bayrakları, kilitli parke avlu; Osmaniye/Çukurova, parçalı bulutlu mavi gök. Premium sinematik altın saat, tone mapping, temiz avlu, kişi/plaka yok; tabela doğru ve okunur. Atlas openai/gpt-image-2.5-flare uygunluğunu doğrula; yoksa model seçme, Coder Notu yaz. Oran 9:16. Çıktı aday kalır, kullanım/video yok.
3. Uygulama görevinde ilgili davranış testini önce başarısız çalıştır, uygula ve geçir. Görsel görevinde model/kaynak/çıktı doğrulaması yap; key ve kişisel veri kaydetme.
4. Kabul komutlarını çalıştır, çıktıyı ve varsa kullanıcı onay kaydını Coder Notu’na ekle; yalnız bu task kapsamını commit et.

## Kabul kriterleri
- [ ] `npm run check:assets -- --id factory-tall --candidate` dosya/hash/model/oran ve aday kaydını doğrular.
- [ ] `git diff --name-only` yalnız bu görselin dosyalarını ve ortak manifest/onay kaydını gösterir; `npm run test -- tests/unit/asset-registry.test.ts` onaysız kullanım korumasını geçirir.

## Yapılmaması gerekenler
- Task dışına çıkma, ek iyileştirme yapma; diğer repolara yazma.
- Kullanıcı yerine açık karar verme; gizli bilgi commit etme; onaysız görseli yayınlama.
- Gerçek ödeme, üretim DB değişikliği, canlı e-posta veya domain mutasyonu için bu taslağı tek başına yetki sayma.

## Düzeltme 005-a (Claude, 20 Eki)
Kaynak fotoğraf artık mevcut (kullanıcının sohbete yapıştırdığı tesis fotoğrafı): `~/PROJELER/AFINA-KAYNAK/fabrika/afina-zeytin-tesis-osmaniye.png` (1672×941, salt okunur). Yeşil-siyah cephe, "Afina ZEYTİN" tabelası, Osmaniye. Bu fotoğrafı referans alarak Atlas `openai/gpt-image-2.5-flare` (edit/referans) ile kimliği koruyan premium aday üret: altın saat ışığı, tone mapping, temiz avlu, plaka/kişi yok, tabela okunur ve doğru yazılı ("Afina ZEYTİN"). En az 2 aday, `docs/gorsel-onay.md`'de aday olarak kaydet; kullanıcı onayı Claude tarafından alınacak (onaysız public/'e koyma). Kaynak fotoğrafı repoya KOPYALAMA (plaka okunur, repo public); yalnız SHA-256'sını kaydet, yerel yoldan oku.

## Durum: BEKLİYOR
