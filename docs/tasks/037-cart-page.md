# Task 037: Sepet sayfası

## Tür
frontend

## Amaç
Sepet sayfasını drawer ile aynı veri kaynağına bağla.

## Bağlam
`docs/PLAN.md`: Hedef, Teknoloji, Mimari kararlar ve ilgili kapsam bölümü. Bağımlı task’lar / addBlockedBy: 035 (cart-state). Komutlar 001 görevinde kurulacak araçlara dayanır; bağımlılıklar tamamlanmadan bu task çalıştırılmaz.

## Kullanılacak araçlar
- ECC skill: frontend-patterns, accessibility
- 21st MCP: evet — cart page
- find-skills ile bulunup kurulacak ek skill: yok; yeni ihtiyaç varsa önce `npx skills find <konu>`, kurulan skill Coder Notu’na yazılır.

## Dokunulacak dosyalar
- `app/sepet/page.tsx` (oluştur / düzenle)
- `components/cart/CartSummary.tsx` (oluştur / düzenle)
- `tests/e2e/cart-page.spec.ts` (oluştur / düzenle)

## Adımlar
1. PLAN, AGENTS ve bağımlı task’ları oku; gereken kullanıcı kararları/onayları yoksa başlamadan Coder Notu’na engeli kaydet.
2. Boş/dolu/stok değişti durumları; gerçek fiyatın sunucudan yenilenmesi; kupon ve ödeme için erişilebilir alanlar.
3. Uygulama görevinde ilgili davranış testini önce başarısız çalıştır, uygula ve geçir. Görsel görevinde model/kaynak/çıktı doğrulaması yap; key ve kişisel veri kaydetme.
4. Kabul komutlarını çalıştır, çıktıyı ve varsa kullanıcı onay kaydını Coder Notu’na ekle; yalnız bu task kapsamını commit et.

## Kabul kriterleri
- [ ] `npm run test:e2e -- tests/e2e/cart-page.spec.ts` başarılı; aşağıdaki davranışın normal, hata ve reduced-motion/klavye senaryoları doğrulanır.
- [ ] `npm run lint && npm run typecheck && npm run build` başarılı.

## Yapılmaması gerekenler
- Task dışına çıkma, ek iyileştirme yapma; diğer repolara yazma.
- Kullanıcı yerine açık karar verme; gizli bilgi commit etme; onaysız görseli yayınlama.
- Gerçek ödeme, üretim DB değişikliği, canlı e-posta veya domain mutasyonu için bu taslağı tek başına yetki sayma.

## Coder Notu

- PLAN, AGENTS ve Task 035/036/055 okundu; 035 ve 036 tamamlanmış, başlangıçta `main` çalışma ağacı temizdir. Frontend, erişilebilirlik ve TDD skill'leri kullanılıyor. 21st MCP `Checkout Summary` (36084, astralyxdev) kodu incelendi; bilinmeyen ücretleri sıfır göstermeyen özet yapısı marka tokenlarına uyarlanacak.
- Başlamadan saptanan sınır: `getProducts()` halen Task 030'un temsili kataloğunu döndürüyor. Gerçek katalog Task 029, sunucu fiyat/kupon quote bağlantısı Task 054/055 ve ödeme alanı Task 046 kapsamındadır. Bu görev backend/DB/ödeme uygulamasına yetki vermez. Gerçek fiyat yenilemesi doğrulanamayacağı için uygulanabilen frontend ve testler teslim edilecek; durum BEKLİYOR kalacak.
- RED: üretim kodundan önce E2E ve test fixture'ları yazıldı. `PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/ms-playwright" npm run test:e2e -- tests/e2e/cart-page.spec.ts --config .cache/task-037/playwright.config.ts --project chromium-320 --grep 'route loads'` → **exit 1**, test gerçekten çalıştı; `/sepet` için beklenen 200 yerine **404** aldı. İlk tarayıcı başlatmasındaki macOS MachPort kısıtı süreç izniyle giderildi; bu ortam hatası RED sayılmadı. 3004 portundaki mevcut sürece dokunulmadı; kabul için ayrı 3037 portu kullanılıyor.

## Durum: BEKLİYOR
