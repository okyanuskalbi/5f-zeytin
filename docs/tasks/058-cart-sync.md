> ONAY GEREKLİ (DB/ödeme/auth)

# Task 058: İzinli sepet olaylarını snapshot API bağlantısı

## Tür
frontend

## Amaç
Sepet hareketleri ve ayrı pazarlama iznini snapshot API’ye bağla.

## Bağlam
`docs/PLAN.md`: Hedef, Teknoloji, Mimari kararlar ve ilgili kapsam bölümü. Bağımlı task’lar / addBlockedBy: 057 (cart-capture); 035 (cart-state); 046 (checkout-ui). Komutlar 001 görevinde kurulacak araçlara dayanır; bağımlılıklar tamamlanmadan bu task çalıştırılmaz.

## Kullanılacak araçlar
- ECC skill: frontend-patterns, accessibility, security-review
- 21st MCP: evet — pazarlama izni alanı
- find-skills ile bulunup kurulacak ek skill: yok; yeni ihtiyaç varsa önce `npx skills find <konu>`, kurulan skill Coder Notu’na yazılır.

## Dokunulacak dosyalar
- `lib/cart/sync.ts` (oluştur / düzenle)
- `components/checkout/MarketingConsent.tsx` (oluştur / düzenle)
- `components/checkout/CheckoutForm.tsx` (oluştur / düzenle)
- `tests/e2e/cart-sync.spec.ts` (oluştur / düzenle)

## Adımlar
1. PLAN, AGENTS ve bağımlı task’ları oku; gereken kullanıcı kararları/onayları yoksa başlamadan Coder Notu’na engeli kaydet.
2. İzin varsayılan kapalı; ürün/adet ve açık rıza durumu, doğrulanmış oturum bağlamı. Debounce/idempotency, boş/ödenmiş sepet ve izin geri çekme; kişisel veri localStorage/log içine yazılmaz.
3. Uygulama görevinde ilgili davranış testini önce başarısız çalıştır, uygula ve geçir. Görsel görevinde model/kaynak/çıktı doğrulaması yap; key ve kişisel veri kaydetme.
4. Kabul komutlarını çalıştır, çıktıyı ve varsa kullanıcı onay kaydını Coder Notu’na ekle; yalnız bu task kapsamını commit et.

## Kabul kriterleri
- [ ] `npm run test:e2e -- tests/e2e/cart-sync.spec.ts` başarılı; aşağıdaki davranışın normal, hata ve reduced-motion/klavye senaryoları doğrulanır.
- [ ] `npm run lint && npm run typecheck && npm run build` başarılı.

## Yapılmaması gerekenler
- Task dışına çıkma, ek iyileştirme yapma; diğer repolara yazma.
- Kullanıcı yerine açık karar verme; gizli bilgi commit etme; onaysız görseli yayınlama.
- Gerçek ödeme, üretim DB değişikliği, canlı e-posta veya domain mutasyonu için bu taslağı tek başına yetki sayma.

## Durum: BEKLİYOR
