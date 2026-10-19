# Task 034: Onaylı ZEYTİN görsellerini yerleştirme

## Tür
frontend

## Amaç
Kullanıcının seçtiği ve onayladığı görselleri runtime referanslarına bağla.

## Bağlam
`docs/PLAN.md`: Hedef, Teknoloji, Mimari kararlar ve ilgili kapsam bölümü. Bağımlı task’lar / addBlockedBy: 003 (asset-registry); 033 (facility); 030 (product-card). Komutlar 001 görevinde kurulacak araçlara dayanır; bağımlılıklar tamamlanmadan bu task çalıştırılmaz.

## Kullanılacak araçlar
- ECC skill: frontend-patterns, verification-loop
- 21st MCP: hayır
- find-skills ile bulunup kurulacak ek skill: yok; yeni ihtiyaç varsa önce `npx skills find <konu>`, kurulan skill Coder Notu’na yazılır.

## Dokunulacak dosyalar
- `public/images/generated/manifest.json` (oluştur / düzenle)
- `lib/assets/approved.ts` (oluştur / düzenle)
- `components/landing/Hero.tsx` (oluştur / düzenle)
- `components/landing/Facility.tsx` (oluştur / düzenle)
- `components/catalog/ProductCard.tsx` (oluştur / düzenle)
- `tests/unit/asset-handoff.test.ts` (oluştur / düzenle)

## Adımlar
1. PLAN, AGENTS ve bağımlı task’ları oku; gereken kullanıcı kararları/onayları yoksa başlamadan Coder Notu’na engeli kaydet.
2. Tesis 16:9/9:16, ürün ve P01–P12 kayıtlarından yalnız yayıma uygun onaylı dosyaları kullan; P08–P12 tasarım referansıdır. Eksik slot için ürün uydurma. Kaynak/model/prompt/hash ve kullanıcı onayını doğrula; responsive boyut ve alt metin. KURUMSAL için kaynak hash kaydı sun, başka repoya yazma.
3. Uygulama görevinde ilgili davranış testini önce başarısız çalıştır, uygula ve geçir. Görsel görevinde model/kaynak/çıktı doğrulaması yap; key ve kişisel veri kaydetme.
4. Kabul komutlarını çalıştır, çıktıyı ve varsa kullanıcı onay kaydını Coder Notu’na ekle; yalnız bu task kapsamını commit et.

## Kabul kriterleri
- [ ] `npm run test -- tests/unit/asset-handoff.test.ts && npm run check:assets -- --approved` başarılı.
- [ ] `npm run build` başarılı; onaysız aday importu yok, yayımlanan varlıkların onayı ve kaynak/hash kaydı tam.

## Yapılmaması gerekenler
- Task dışına çıkma, ek iyileştirme yapma; diğer repolara yazma.
- Kullanıcı yerine açık karar verme; gizli bilgi commit etme; onaysız görseli yayınlama.
- Gerçek ödeme, üretim DB değişikliği, canlı e-posta veya domain mutasyonu için bu taslağı tek başına yetki sayma.

## Durum: BEKLİYOR
