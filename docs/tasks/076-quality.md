# Task 076: Mobil erişilebilirlik ve hareket/performance kabulü

## Tür
frontend

## Amaç
Duyarlı vitrin ve alışveriş erişilebilirliğini doğrula.

## Bağlam
`docs/PLAN.md`: Hedef, Teknoloji, Mimari kararlar ve ilgili kapsam bölümü. Bağımlı task’lar / addBlockedBy: 074 (seo); 032 (scenes); 037 (cart-page); 075 (commerce-e2e); 034 (asset-handoff); 082 (wholesale-send); 087 (aeo-geo); 088 (kit-hero-denetim). Komutlar 001 görevinde kurulacak araçlara dayanır; bağımlılıklar tamamlanmadan bu task çalıştırılmaz.

## Kullanılacak araçlar
- ECC skill: accessibility, motion-advanced, e2e-testing, verification-loop
- 21st MCP: hayır
- find-skills ile bulunup kurulacak ek skill: yok; yeni ihtiyaç varsa önce `npx skills find <konu>`, kurulan skill Coder Notu’na yazılır.

## Dokunulacak dosyalar
- `tests/e2e/quality.spec.ts` (oluştur / düzenle)
- `docs/kabul/kalite.md` (oluştur / düzenle)

## Adımlar
1. PLAN, AGENTS ve bağımlı task’ları oku; gereken kullanıcı kararları/onayları yoksa başlamadan Coder Notu’na engeli kaydet.
2. 320/375/390/768/1024/1440/1920; Chromium/Firefox/WebKit, klavye/axe/reduced-motion; ürün ≤6, perakende satın alma + toptan CTA/form doğrulama/mocked gönderim, Tesisimiz/Osmaniye ve logo dark kontrastı. Taşma/odak/CTA, Lighthouse LCP/CLS ve JS bütçesi; resmi metin ve iddia kuralını doğrula, sonuçları kaydet.
3. Uygulama görevinde ilgili davranış testini önce başarısız çalıştır, uygula ve geçir. Görsel görevinde model/kaynak/çıktı doğrulaması yap; key ve kişisel veri kaydetme.
4. Kabul komutlarını çalıştır, çıktıyı ve varsa kullanıcı onay kaydını Coder Notu’na ekle; yalnız bu task kapsamını commit et.

## Kabul kriterleri
- [ ] `npm run test:e2e -- tests/e2e/quality.spec.ts` başarılı; aşağıdaki davranışın normal, hata ve reduced-motion/klavye senaryoları doğrulanır.
- [ ] `npm run lint && npm run typecheck && npm run build` başarılı.

- [ ] [087 AEO/GEO](087-aeo-geo.md) kaynak/şema/keşif kabulü ve [088 hero denetimi](088-kit-hero-denetim.md) poster/scrub/mobil/reduced-motion kanıtları tamam; açık gerçek cihaz/teyit/yayın kabul maddeleri ayrıca kaydedilmiş.

## Yapılmaması gerekenler
- Task dışına çıkma, ek iyileştirme yapma; diğer repolara yazma.
- Kullanıcı yerine açık karar verme; gizli bilgi commit etme; onaysız görseli yayınlama.
- Gerçek ödeme, üretim DB değişikliği, canlı e-posta veya domain mutasyonu için bu taslağı tek başına yetki sayma.

## Durum: BEKLİYOR
