# Task 035: Yerel sepet durumu

## Tür
frontend

## Amaç
Sepet ekleme/çıkarma ve adet yönetimini kur.

## Bağlam
`docs/PLAN.md`: Hedef, Teknoloji, Mimari kararlar ve ilgili kapsam bölümü. Bağımlı task’lar / addBlockedBy: 030 (product-card). Komutlar 001 görevinde kurulacak araçlara dayanır; bağımlılıklar tamamlanmadan bu task çalıştırılmaz.

## Kullanılacak araçlar
- ECC skill: frontend-patterns, tdd-workflow
- 21st MCP: hayır
- find-skills ile bulunup kurulacak ek skill: yok; yeni ihtiyaç varsa önce `npx skills find <konu>`, kurulan skill Coder Notu’na yazılır.

## Dokunulacak dosyalar
- `lib/cart/store.ts` (oluştur / düzenle)
- `lib/cart/types.ts` (oluştur / düzenle)
- `tests/unit/cart-state.test.ts` (oluştur / düzenle)

## Adımlar
1. PLAN, AGENTS ve bağımlı task’ları oku; gereken kullanıcı kararları/onayları yoksa başlamadan Coder Notu’na engeli kaydet.
2. Ürün ID ve adet sakla; fiyat sunucu otoritesinde. Yenileme, stok sınırı, sıfır/negatif adet ve bozuk localStorage senaryoları; kişisel/ödeme verisi saklama.
3. Uygulama görevinde ilgili davranış testini önce başarısız çalıştır, uygula ve geçir. Görsel görevinde model/kaynak/çıktı doğrulaması yap; key ve kişisel veri kaydetme.
4. Kabul komutlarını çalıştır, çıktıyı ve varsa kullanıcı onay kaydını Coder Notu’na ekle; yalnız bu task kapsamını commit et.

## Kabul kriterleri
- [ ] `npm run test -- tests/unit/cart-state.test.ts` başarılı; görev davranışının olumlu/olumsuz sınır durumları doğrulanır.
- [ ] `npm run lint && npm run typecheck && npm run build` başarılı.

## Yapılmaması gerekenler
- Task dışına çıkma, ek iyileştirme yapma; diğer repolara yazma.
- Kullanıcı yerine açık karar verme; gizli bilgi commit etme; onaysız görseli yayınlama.
- Gerçek ödeme, üretim DB değişikliği, canlı e-posta veya domain mutasyonu için bu taslağı tek başına yetki sayma.

## Coder Notu

- PLAN, AGENTS ve bağımlı Task 030 okundu; Task 030 `TAMAMLANDI`. Bu görevde DB/auth/ödeme işlemi veya açık kullanıcı kararı gerekmiyor. `frontend-patterns` ve `tdd-workflow` skill'leri ile yerel Next.js Server/Client Components ve `use-client` belgeleri kullanıldı. UI/animasyon eklenmedi; görevde belirtildiği gibi 21st MCP kullanılmadı. Ek skill veya bağımlılık kurulmadı.
- `lib/cart/types.ts` ve `lib/cart/store.ts`: her sepet sahibi için ayrı oluşturulan store; ürün ekleme/birleştirme, adet değiştirme, ID ile kaldırma, temizleme ve güncel katalog stoklarıyla uzlaştırma. Sıfır adet satırı kaldırır; negatif, kesirli, sayısal olmayan, güvenli tam sayı dışındaki ve toplam stok sınırını aşan adetler `RangeError` ile reddedilir. Eksik/tükenmiş ürün eklenmez; stok azalınca adet sınırlanır, kaldırılan/tükenen ürün sepetten çıkarılır. Yerel stok kontrolü sunucu checkout doğrulamasının yerini almaz.
- localStorage `afina-zeytin:cart` anahtarında yalnız `{ productId, quantity }[]` saklanır; fiyat, katalog nesnesi, kişisel veya ödeme verisi yazılmaz. Yenilemede veriler mevcut stokla doğrulanır; bozuk JSON/şekil ve geçersiz satırlar temizlenir, tekrar eden ID'ler stok sınırında birleştirilir. Diğer localStorage anahtarları korunur. Engellenen erişim/okuma/yazma halinde sepet bellekte çalışır; `storageError` durumu okunabilir, başarılı sonraki yazma hatayı temizler. Başarısız ilk okuma okunamayan kaydı boş sepetle ezmez.
- Snapshot'lar değişmez ve okumalar arasında sabittir; abonelik/abonelikten çıkma desteklenir. Oluşturma ve snapshot okuma tarayıcı yan etkisi oluşturmaz. `hydrate()` mount sonrasında çağrılır; erken değişiklikler önce mevcut kaydı yükler. `getServerSnapshot()` boş/sabit kalır; SSR'da `window` gerekmiyor ve store örnekleri arasında sepet verisi paylaşılmıyor. Drawer, sepet sayfası ve ürün/navigasyon bağlantısı 036–038 kapsamındadır; bu görev mevcut UI'ı bağlamaz.

### Komutla doğrulama — 20 Ekim 2026

- RED: üretim kodundan önce `tests/unit/cart-state.test.ts` yazıldı. `npm run test -- tests/unit/cart-state.test.ts` → **exit 1**, beklenen eksik uygulama hatası: `Failed to resolve import "@/lib/cart/store"`. RED test checkpoint'i aktif `main` dalında `95e3777` commit'iyle korundu.
- GREEN: `npm run test -- tests/unit/cart-state.test.ts` → **exit 0; 55/55 başarılı**. Ekleme/birleştirme, düzenleme/kaldırma/temizleme, sıfır/negatif/kesirli/geçersiz adet, birikimli stok sınırı, güncel stok, yenileme, erken işlem öncesi hydration, bozuk/kötü biçimli localStorage, yalnız izinli alanları saklama, erişim/okuma/yazma hataları ve yazma sonrası toparlanma, snapshot değişmezliği, abonelik ve SSR izolasyonu doğrulandı.
- `npm run test -- tests/unit/cart-state.test.ts --coverage --coverage.include=lib/cart/store.ts --coverage.reporter=text --coverage.reporter=json-summary` → **exit 0; 55/55 başarılı**. Store kapsamı: **statements %97,61; branches %98,27; functions %100; lines %97,18**. Kapsam ölçümü bu görevin store dosyasına özeldir; henüz UI bağlantısı olmayan store için tarayıcı E2E kabulü iddia edilmez.
- `npm run lint && npm run typecheck && npm run build` → **exit 0**. ESLint sıfır uyarı, route typegen/TypeScript başarılı, Next.js 16.4.2 production build başarılı; `/` ve `/_not-found` statik üretildi. Prebuild varlık kontrolü **14/14 PASS**. Build'in ürettiği kapsam dışı `next-env.d.ts` yol farkı geri alındı.
- `git diff --check` başarılı. Değişiklikler yalnız üç görev kod/test dosyası ve bu task'ın Coder Notu/Durum alanlarıyla sınırlı. Yerel kabul kriterleri karşılandı; görev kapsamında engel yok. Dağıtım veya canlı satış doğrulaması yapılmadı.

## Durum: TAMAMLANDI
