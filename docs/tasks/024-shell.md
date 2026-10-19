# Task 024: Landing navigasyon ve footer

## Tür
frontend

## Amaç
Tek landing navigasyonunu ve footer bağlantılarını kur.

## Bağlam
`docs/PLAN.md`: Hedef, Teknoloji, Mimari kararlar ve ilgili kapsam bölümü. Bağımlı task’lar / addBlockedBy: 002 (tokens); 080 (brand-assets). Komutlar 001 görevinde kurulacak araçlara dayanır; bağımlılıklar tamamlanmadan bu task çalıştırılmaz.

## Kullanılacak araçlar
- ECC skill: frontend-patterns, accessibility
- 21st MCP: evet — navbar/footer
- find-skills ile bulunup kurulacak ek skill: yok; yeni ihtiyaç varsa önce `npx skills find <konu>`, kurulan skill Coder Notu’na yazılır.

## Dokunulacak dosyalar
- `components/site/Navbar.tsx` (oluştur / düzenle)
- `components/site/Footer.tsx` (oluştur / düzenle)
- `app/layout.tsx` (oluştur / düzenle)
- `tests/e2e/shell.spec.ts` (oluştur / düzenle)

## Adımlar
1. PLAN, AGENTS ve bağımlı task’ları oku; gereken kullanıcı kararları/onayları yoksa başlamadan Coder Notu’na engeli kaydet.
2. Klavye, mobil menü, sepet ve hesap bağlantıları; public/brand/ optimize zeytin/topluluk logoları. Ana slogan “Kökü toprakta. Yeri sofrada.”; Tesisimiz, ürünler, toptan talep ve hukuk hash/link hedefleri. Nihai ürün/fiyat uydurma; resmi metin kaynağı docs/referans/icerik.md bölüm 01 + 04.
3. Uygulama görevinde ilgili davranış testini önce başarısız çalıştır, uygula ve geçir. Görsel görevinde model/kaynak/çıktı doğrulaması yap; key ve kişisel veri kaydetme.
4. Kabul komutlarını çalıştır, çıktıyı ve varsa kullanıcı onay kaydını Coder Notu’na ekle; yalnız bu task kapsamını commit et.

## Kabul kriterleri
- [ ] `npm run test:e2e -- tests/e2e/shell.spec.ts` başarılı; aşağıdaki davranışın normal, hata ve reduced-motion/klavye senaryoları doğrulanır.
- [ ] `npm run lint && npm run typecheck && npm run build` başarılı.

## Yapılmaması gerekenler
- Task dışına çıkma, ek iyileştirme yapma; diğer repolara yazma.
- Kullanıcı yerine açık karar verme; gizli bilgi commit etme; onaysız görseli yayınlama.
- Gerçek ödeme, üretim DB değişikliği, canlı e-posta veya domain mutasyonu için bu taslağı tek başına yetki sayma.

## Coder Notu

- Başlangıç kontrolü: 002 ve 080 `TAMAMLANDI`, çalışma ağacı temiz ve dal `main`. Ancak 080 çıktıları manifestte `candidate`, `approval: null`; kullanıcı görsel onayı bulunmuyor. AGENTS/PLAN uyarınca zeytin/topluluk logoları onay gelmeden runtime'a bağlanamaz. Bu engel uygulama öncesinde kaydedildi; görsel onay kayıtları değiştirilmeyecek. Yapılabilen metin tabanlı kabuk uygulanacak, logo yerleşimi eksik kaldığı için durum `BEKLİYOR` kalacak.
- TDD / RED (20 Ekim 2026): `PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/ms-playwright" npm run test:e2e -- tests/e2e/shell.spec.ts --project=chromium-320 --grep 'shell exposes'` → **exit 1**, uygulama henüz header içermediği için `getByRole('banner')` bulunamadı. İlk denemedeki Chromium `MachPortRendezvousServer: Permission denied` ortam hatası süreç izniyle çözüldü; geçerli RED doğrudan eksik uygulama davranışıdır.

## Durum: BEKLİYOR
