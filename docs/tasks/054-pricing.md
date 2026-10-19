> ONAY GEREKLİ (DB/ödeme/auth)

# Task 054: Kupon ve kademeli fiyat hesaplama

## Tür
backend

## Amaç
Checkout ve sepet için tek sunucu fiyat otoritesi kur.

## Bağlam
`docs/PLAN.md`: Hedef, Teknoloji, Mimari kararlar ve ilgili kapsam bölümü. Bağımlı task’lar / addBlockedBy: 053 (coupons-db); 045 (checkout-api). Komutlar 001 görevinde kurulacak araçlara dayanır; bağımlılıklar tamamlanmadan bu task çalıştırılmaz.

## Kullanılacak araçlar
- ECC skill: backend-patterns, api-design, tdd-workflow, security-review
- 21st MCP: hayır
- find-skills ile bulunup kurulacak ek skill: yok; yeni ihtiyaç varsa önce `npx skills find <konu>`, kurulan skill Coder Notu’na yazılır.

## Dokunulacak dosyalar
- `lib/pricing/calculate.ts` (oluştur / düzenle)
- `app/api/cart/quote/route.ts` (oluştur / düzenle)
- `tests/unit/pricing.test.ts` (oluştur / düzenle)
- `lib/orders/create.ts` (oluştur / düzenle)

## Adımlar
1. PLAN, AGENTS ve bağımlı task’ları oku; gereken kullanıcı kararları/onayları yoksa başlamadan Coder Notu’na engeli kaydet.
2. Yüzde/tutar kupon, süre/limit/UTM, adetle kademe; onaysız oran/threshold yok. İndirimlerin birleşme kuralını kullanıcıya bağla; kuruş yuvarlama, negatif toplam ve yarış testleri. CartSummary/checkout bu quote sözleşmesini tüketir. Sipariş oluşturma aynı calculate fonksiyonunu tüketir; istemci quote/kupon/UTM bilgisini yeniden doğrula, transaction içindeki nihai ücret sunucudan çıkar.
3. Uygulama görevinde ilgili davranış testini önce başarısız çalıştır, uygula ve geçir. Görsel görevinde model/kaynak/çıktı doğrulaması yap; key ve kişisel veri kaydetme.
4. Kabul komutlarını çalıştır, çıktıyı ve varsa kullanıcı onay kaydını Coder Notu’na ekle; yalnız bu task kapsamını commit et.

## Kabul kriterleri
- [ ] `npm run test -- tests/unit/pricing.test.ts` başarılı; görev davranışının olumlu/olumsuz sınır durumları doğrulanır.
- [ ] `npm run lint && npm run typecheck && npm run build` başarılı.

## Yapılmaması gerekenler
- Task dışına çıkma, ek iyileştirme yapma; diğer repolara yazma.
- Kullanıcı yerine açık karar verme; gizli bilgi commit etme; onaysız görseli yayınlama.
- Gerçek ödeme, üretim DB değişikliği, canlı e-posta veya domain mutasyonu için bu taslağı tek başına yetki sayma.

## Durum: BEKLİYOR
