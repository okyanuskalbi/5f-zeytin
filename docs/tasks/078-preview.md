# Task 078: Vercel önizleme dağıtımı

## Tür
fullstack

## Amaç
Kullanıcının belirlediği Vercel ekip/projeye önizleme hazırla.

## Bağlam
`docs/PLAN.md`: Hedef, Teknoloji, Mimari kararlar ve ilgili kapsam bölümü. Bağımlı task’lar / addBlockedBy: 076 (quality); 077 (supabase-target). Komutlar 001 görevinde kurulacak araçlara dayanır; bağımlılıklar tamamlanmadan bu task çalıştırılmaz.

## Kullanılacak araçlar
- ECC skill: deployment-patterns, security-review, verification-loop
- 21st MCP: hayır
- find-skills ile bulunup kurulacak ek skill: yok; yeni ihtiyaç varsa önce `npx skills find <konu>`, kurulan skill Coder Notu’na yazılır.

## Dokunulacak dosyalar
- `docs/yayin/preview.md` (oluştur / düzenle)
- `vercel.json` (oluştur / düzenle)

## Adımlar
1. PLAN, AGENTS ve bağımlı task’ları oku; gereken kullanıcı kararları/onayları yoksa başlamadan Coder Notu’na engeli kaydet.
2. Task 000’da Vercel kurma. Ekip/proje kararı ve güvenli env hazır olunca dağıt; cron planı ve sandbox callback URL’leri; noindex, secret sızıntısı yok; build ile canlı kabulü ayır.
3. Uygulama görevinde ilgili davranış testini önce başarısız çalıştır, uygula ve geçir. Görsel görevinde model/kaynak/çıktı doğrulaması yap; key ve kişisel veri kaydetme.
4. Kabul komutlarını çalıştır, çıktıyı ve varsa kullanıcı onay kaydını Coder Notu’na ekle; yalnız bu task kapsamını commit et.

## Kabul kriterleri
- [ ] `npm run lint && npm run typecheck && npm run build` başarılı.
- [ ] `curl -fsSI <ONAYLI_PREVIEW_URL>` ve `PLAYWRIGHT_BASE_URL=<ONAYLI_PREVIEW_URL> npm run test:e2e -- tests/e2e/commerce.spec.ts` başarılı; gerçek URL ve komut çıktısı docs/yayin/preview.md içinde.

## Yapılmaması gerekenler
- Task dışına çıkma, ek iyileştirme yapma; diğer repolara yazma.
- Kullanıcı yerine açık karar verme; gizli bilgi commit etme; onaysız görseli yayınlama.
- Gerçek ödeme, üretim DB değişikliği, canlı e-posta veya domain mutasyonu için bu taslağı tek başına yetki sayma.

## Durum: BEKLİYOR
