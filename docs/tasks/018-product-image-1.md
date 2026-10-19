# Task 018: Ürün 1 — temsili teneke/şişe görseli

## Tür
frontend

## Amaç
Onaylı gerçek ürün listesindeki 1. ürünün görsel adayını tek görevde üret.

## Bağlam
`docs/PLAN.md`: Hedef, Teknoloji, Mimari kararlar ve ilgili kapsam bölümü. Bağımlı task’lar / addBlockedBy: 003 (asset-registry). Komutlar 001 görevinde kurulacak araçlara dayanır; bağımlılıklar tamamlanmadan bu task çalıştırılmaz.

Koşullu slot 1: kullanıcı listesinde yoksa uygulanmaz, Coder Notu ile kapsam dışı olduğu kaydedilir; kendi kendine TAMAMLANDI işaretlenmez.

## Kullanılacak araçlar
- ECC skill: frontend-design-direction, verification-loop
- 21st MCP: hayır
- find-skills ile bulunup kurulacak ek skill: yok; yeni ihtiyaç varsa önce `npx skills find <konu>`, kurulan skill Coder Notu’na yazılır.

## Dokunulacak dosyalar
- `public/images/generated/product-image-1/` (oluştur / düzenle)
- `public/images/generated/manifest.json` (oluştur / düzenle)
- `docs/gorsel-onay.md` (oluştur / düzenle)

## Adımlar
1. PLAN, AGENTS ve bağımlı task’ları oku; gereken kullanıcı kararları/onayları yoksa başlamadan Coder Notu’na engeli kaydet.
2. Ürün adı, ambalaj, ağırlık/hacim ve orijinal logo kullanıcıdan gelmeden başlama. Referans: yeşil-beyaz AFİNA Doğal Kırma Yeşil Zeytin 10 KG teneke; örnek her ürüne kopyalanmaz. İstenen model Atlas openai/gpt-image-2.5-flare; uygunluğunu doğrula. En fazla 6 aktif ürün, eksik slot için hayali ürün/fiyat yaratma. Kullanıcı kararı kayda girene kadar yalnız TEMSİLİ ADAY; uygulamaya alma.
3. Uygulama görevinde ilgili davranış testini önce başarısız çalıştır, uygula ve geçir. Görsel görevinde model/kaynak/çıktı doğrulaması yap; key ve kişisel veri kaydetme.
4. Kabul komutlarını çalıştır, çıktıyı ve varsa kullanıcı onay kaydını Coder Notu’na ekle; yalnız bu task kapsamını commit et.

## Kabul kriterleri
- [ ] `npm run check:assets -- --id product-image-1 --candidate` dosya/hash/model/oran ve aday kaydını doğrular.
- [ ] `git diff --name-only` yalnız bu görselin dosyalarını ve ortak manifest/onay kaydını gösterir; `npm run test -- tests/unit/asset-registry.test.ts` onaysız kullanım korumasını geçirir.

## Yapılmaması gerekenler
- Task dışına çıkma, ek iyileştirme yapma; diğer repolara yazma.
- Kullanıcı yerine açık karar verme; gizli bilgi commit etme; onaysız görseli yayınlama.
- Gerçek ödeme, üretim DB değişikliği, canlı e-posta veya domain mutasyonu için bu taslağı tek başına yetki sayma.

## Durum: BEKLİYOR
