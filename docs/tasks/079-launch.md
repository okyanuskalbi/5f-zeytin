# Task 079: Domain ve canlı yayın kabulü

## Tür
fullstack

## Amaç
Kullanıcının onayladığı zamanda afinazeytin.com alan adını yayına bağla.

## Bağlam
`docs/PLAN.md`: Hedef, Teknoloji, Mimari kararlar ve ilgili kapsam bölümü. Bağımlı task’lar / addBlockedBy: 078 (preview). Komutlar 001 görevinde kurulacak araçlara dayanır; bağımlılıklar tamamlanmadan bu task çalıştırılmaz.

## Kullanılacak araçlar
- ECC skill: deployment-patterns, verification-loop, security-review
- 21st MCP: hayır
- find-skills ile bulunup kurulacak ek skill: yok; yeni ihtiyaç varsa önce `npx skills find <konu>`, kurulan skill Coder Notu’na yazılır.

## Dokunulacak dosyalar
- `docs/yayin/canli-kabul.md` (oluştur / düzenle)

## Adımlar
1. PLAN, AGENTS ve bağımlı task’ları oku; gereken kullanıcı kararları/onayları yoksa başlamadan Coder Notu’na engeli kaydet.
2. Toptan CTA/form ve onaylı alıcı/servis hazırlığını, resmi slogan/SEO, Tesisimiz/Osmaniye ve optimize logoları kontrol et; gerçek talep e-postası ayrıca yetkili test alıcısıyla doğrulanır. Vercel/Cloudflare hedef kayıtlarını mevcut durumdan doğrula; görseller/logolar, hukuki metin ve gerçek katalog onayları; ödeme/mail sandbox ve canlı kabulünü ayır. Gerçek çekim veya kişiye e-posta testi ayrıca açık yetki olmadan yapılmaz.
3. Uygulama görevinde ilgili davranış testini önce başarısız çalıştır, uygula ve geçir. Görsel görevinde model/kaynak/çıktı doğrulaması yap; key ve kişisel veri kaydetme.
4. Kabul komutlarını çalıştır, çıktıyı ve varsa kullanıcı onay kaydını Coder Notu’na ekle; yalnız bu task kapsamını commit et.

## Kabul kriterleri
- [ ] `dig +short afinazeytin.com && curl -fsSI https://afinazeytin.com` doğru DNS/HTTPS hedefini gösterir.
- [ ] `PLAYWRIGHT_BASE_URL=https://afinazeytin.com npm run test:e2e -- tests/e2e/quality.spec.ts` başarılı; canlı ödeme/mail onay kapıları ve kanıtları docs/yayin/canli-kabul.md içinde ayrı raporlanır.

## Yapılmaması gerekenler
- Task dışına çıkma, ek iyileştirme yapma; diğer repolara yazma.
- Kullanıcı yerine açık karar verme; gizli bilgi commit etme; onaysız görseli yayınlama.
- Gerçek ödeme, üretim DB değişikliği, canlı e-posta veya domain mutasyonu için bu taslağı tek başına yetki sayma.

## Durum: BEKLİYOR
