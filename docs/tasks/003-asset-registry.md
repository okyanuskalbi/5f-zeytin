# Task 003: Görsel aday ve onay kaydı

## Tür
frontend

## Amaç
Görsel üretimlerin kaynak, adaylık ve kullanıcı onayı kaydını kur.

## Bağlam
`docs/PLAN.md`: Hedef, Teknoloji, Mimari kararlar ve ilgili kapsam bölümü. Bağımlı task’lar / addBlockedBy: 001 (bootstrap). Komutlar 001 görevinde kurulacak araçlara dayanır; bağımlılıklar tamamlanmadan bu task çalıştırılmaz.

## Kullanılacak araçlar
- ECC skill: frontend-design-direction, verification-loop
- 21st MCP: hayır
- find-skills ile bulunup kurulacak ek skill: yok; yeni ihtiyaç varsa önce `npx skills find <konu>`, kurulan skill Coder Notu’na yazılır.

## Dokunulacak dosyalar
- `docs/gorsel-onay.md` (oluştur / düzenle)
- `public/images/generated/manifest.json` (oluştur / düzenle)
- `scripts/check-assets.mjs` (oluştur / düzenle)
- `tests/unit/asset-registry.test.ts` (oluştur / düzenle)
- `package.json` (oluştur / düzenle)

## Adımlar
1. PLAN, AGENTS ve bağımlı task’ları oku; gereken kullanıcı kararları/onayları yoksa başlamadan Coder Notu’na engeli kaydet.
2. npm run check:assets komutu --id, --candidate ve --approved parametrelerini desteklesin; hash, dosya, oran, model, prompt ID, temsili etiketi, referans, kullanıcı karar tarihi/kaydı doğrulansın. Kamuya açık manifest kişisel veri içermesin. Onaysız dosya uygulama importuna giremesin. Video bu planın kapsamında değil.
3. Uygulama görevinde ilgili davranış testini önce başarısız çalıştır, uygula ve geçir. Görsel görevinde model/kaynak/çıktı doğrulaması yap; key ve kişisel veri kaydetme.
4. Kabul komutlarını çalıştır, çıktıyı ve varsa kullanıcı onay kaydını Coder Notu’na ekle; yalnız bu task kapsamını commit et.

## Kabul kriterleri
- [ ] `npm run test -- tests/unit/asset-registry.test.ts` onaysız kullanım, eksik dosya ve sahte onay durumlarını reddeder.
- [ ] `npm run check:assets -- --candidate` boş ilk manifesti güvenle doğrular; üretim veya API çağrısı yapmaz.

## Yapılmaması gerekenler
- Task dışına çıkma, ek iyileştirme yapma; diğer repolara yazma.
- Kullanıcı yerine açık karar verme; gizli bilgi commit etme; onaysız görseli yayınlama.
- Gerçek ödeme, üretim DB değişikliği, canlı e-posta veya domain mutasyonu için bu taslağı tek başına yetki sayma.

## Durum: BEKLİYOR
