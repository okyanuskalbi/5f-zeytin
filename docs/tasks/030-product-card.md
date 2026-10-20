# Task 030: Ürün kartı bileşeni

## Tür
frontend

## Amaç
Her ürünün satın alma kartını kur.

## Bağlam
`docs/PLAN.md`: Hedef, Teknoloji, Mimari kararlar ve ilgili kapsam bölümü. Bağımlı task’lar / addBlockedBy: 002 (tokens). **Geçici veri kararı (Claude, 19 Eki):** 029 (Supabase katalog) kullanıcı kararı beklediği için kart `lib/catalog/static-products.ts` içindeki temsili ≤6 ürün sabit verisini, 029'un döneceği tipte (`types/catalog.ts`) okur; veri kaynağı tek bir `getProducts()` fonksiyonunun arkasında, 029 geldiğinde yalnız o fonksiyon değişir. Fiyatlar temsili ve UI'da "temsili" notu yok ama `static-products.ts` başında yorum + PLAN'da açık karar olarak kalır. Komutlar 001 görevinde kurulacak araçlara dayanır; bağımlılıklar tamamlanmadan bu task çalıştırılmaz.

## Kullanılacak araçlar
- ECC skill: frontend-patterns, accessibility
- 21st MCP: evet — product card
- find-skills ile bulunup kurulacak ek skill: yok; yeni ihtiyaç varsa önce `npx skills find <konu>`, kurulan skill Coder Notu’na yazılır.

## Dokunulacak dosyalar
- `components/catalog/ProductCard.tsx` (oluştur / düzenle)
- `tests/e2e/product-card.spec.ts` (oluştur / düzenle)

## Adımlar
1. PLAN, AGENTS ve bağımlı task’ları oku; gereken kullanıcı kararları/onayları yoksa başlamadan Coder Notu’na engeli kaydet.
2. Sofralık zeytin, salamura zeytin, zeytinyağı kapsamındaki gerçek ≤6 ürün: ağırlık, fiyat, stok, adet, sepete ekle; yükleniyor/boş/tükendi durumları. Ürün/fiyat kullanıcıdan, görseller yalnız onaylı manifest; testte temsili fixture. Resmi bölüm 04 kapsamı aşılmaz; “%100 organik / %100 doğal” iddiaları ve banner rozeti kullanılmaz.
3. Uygulama görevinde ilgili davranış testini önce başarısız çalıştır, uygula ve geçir. Görsel görevinde model/kaynak/çıktı doğrulaması yap; key ve kişisel veri kaydetme.
4. Kabul komutlarını çalıştır, çıktıyı ve varsa kullanıcı onay kaydını Coder Notu’na ekle; yalnız bu task kapsamını commit et.

## Kabul kriterleri
- [ ] `npm run test:e2e -- tests/e2e/product-card.spec.ts` başarılı; aşağıdaki davranışın normal, hata ve reduced-motion/klavye senaryoları doğrulanır.
- [ ] `npm run lint && npm run typecheck && npm run build` başarılı.

## Yapılmaması gerekenler
- Task dışına çıkma, ek iyileştirme yapma; diğer repolara yazma.
- Kullanıcı yerine açık karar verme; gizli bilgi commit etme; onaysız görseli yayınlama.
- Gerçek ödeme, üretim DB değişikliği, canlı e-posta veya domain mutasyonu için bu taslağı tek başına yetki sayma.

## Coder Notu

- Bağımlı 001 ve 002 görevleri `TAMAMLANDI`. Bu task'ın açık geçici veri kararı uygulandı: üç temsili ürün `lib/catalog/static-products.ts` içinde, en fazla altı ürün döndüren asenkron `getProducts()` arkasında; genel tip `types/catalog.ts` içinde. Fiyatlar tam sayı kuruş/TRY; gerçek katalog kararı alınmadı. Geçici veri açıklaması kaynak yorumunda tutuldu, UI'a "temsili" notu eklenmedi. PLAN ve diğer task dosyaları değiştirilmedi.
- `frontend-patterns` ve `accessibility` skill'leri kullanıldı; ek skill/bağımlılık kurulmadı. Yerel Next.js `use-client` ve Server/Client Components belgeleri okundu. 21st MCP arama + kaynak alma ile [Product Listing Card](https://21st.dev/@shadcnstore/components/product-card-1) (28227) incelendi; görsel/detay/eylem düzeni AFİNA tokenları, semantik article/başlık, mevcut özelleştirilmiş Button ve 44px kontrollerle uyarlandı. Resmi CLI `npx shadcn@latest docs card` ve `npx shadcn@latest view @shadcn/card` çalıştırıldı; yeni shadcn primitive'i gerekmedi.
- Kart: ağırlık/hacim, Türkçe TRY fiyatı, stok/tükendi, adet alanı ve artır/azalt, yükleniyor/boş durumları, alanla ilişkilendirilmiş hata ve canlı durum mesajları. Boş/sıfır/negatif/kesirli/stok üstü adet engellenir; işlem sürerken kontroller kapanır ve tekrar gönderim engellenir. Callback yalnız ürün ID + adet alır; fiyat göndermez. Hata halinde adet korunur ve tekrar denenebilir; ürün değişince eski adet/mesaj temizlenir. Ek animasyon eklenmedi; mevcut Button reduced-motion davranışı korunur (hareket Task 031).
- Sepet state'i Task 035, gerçek bağlantı Task 038 kapsamındadır. Bu task callback sözleşmesini hazırlar; ana sayfada callback yokken "Sepete ekle" pasif ve nedenini açıklayan metin görünür. Başarı/hata/pending davranışları test fixture'ındaki callback ile doğrulandı; sahte sepet başarısı, localStorage veya servis/DB/ödeme işlemi eklenmedi. Onaylı ürün görseli bulunmadığından düz placeholder kullanıldı; aday görsel yüklenmez, görsel yerleştirme Task 034'tedir. Yasak organik/doğal iddiaları kullanılmadı.
- Zorunlu destek değişiklikleri: veri/tip dosyaları, `app/page.tsx` içinde `getProducts()` ile kartları vitrine bağlama ve boş katalog dalı; async sayfaya uyum için mevcut bootstrap testinde `render(await Home())`. `tests/e2e/fixtures/product-card.html` / `.tsx`, mevcut token testindeki Vite bellek içi paketleme + Playwright route interception düzenini kullanır. Yeni uygulama test rotası veya sunucu yok; uzak `PLAYWRIGHT_BASE_URL` ile fixture testi açıkça reddedilir.

### Komutla doğrulama — 20 Ekim 2026

- RED: E2E fixture ve davranış testi önce yazıldı. İlk `npm run test:e2e -- tests/e2e/product-card.spec.ts --project=chromium-320` → **exit 1**, 3004 portu dolu olduğundan test başlamadı. Uygulama kodu yazılmadan aynı fixture Vite `build({configFile:false, root:process.cwd(), base:'/__product-card-fixture/', publicDir:false, logLevel:'error', resolve:{alias:{'@':process.cwd()}}, build:{write:false,rollupOptions:{input:'tests/e2e/fixtures/product-card.html'}}})` komutuyla derlendi → **exit 1, UNRESOLVED_IMPORT: components/catalog/ProductCard**; beklenen RED.
- `lsof` ile 3004'ü tutan PID 98203'ün çalışma dizini bu repo olarak doğrulandı. Kabul için geliştirme sunucusu geçici durduruldu. macOS sandboxındaki Chromium `MachPortRendezvousServer: Permission denied` engeli aynı komutun gerekli süreç izniyle çalıştırılmasıyla çözüldü. İlk GREEN dar ekran testi **1/1 başarılı**.
- Nihai kabul: `export PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/ms-playwright"` ve `export npm_config_cache="$PWD/.cache/npm"` ardından `npm run lint && npm run typecheck && npm run build && npm run test:e2e -- tests/e2e/product-card.spec.ts` → **exit 0; 12/12 başarılı (13,9 saniye)**. Build `/` sayfasını statik üretti; prebuild varlık kontrolü **14/14 PASS**.
- Chromium / Firefox / WebKit × 320 / 390 / 768 / 1440: gerçek ana sayfa HTTP 200 ve ZEYTİN işareti, üç katalog kartı/fiyat/ambalaj, bağlantısız CTA açıklaması, aday görsel isteği ve yasak iddia olmaması, yatay taşma kontrol edildi. Yerel gerçek bileşen fixture'ında normal işlem, bekleyen işlemde tekrar tıklama, hata/tekrar deneme, tüm adet sınırları, güncellenen stok, ürün değiştirme, tükendi/boş/yükleniyor, Tab/Option-Tab + Enter, görünür odak, 44px hedefler ve iki hareket tercihi doğrulandı. Sayfa JavaScript hatası yok.
- `npm run test -- tests/unit/bootstrap.test.ts` → **exit 0, 7/7 başarılı**. `test-results/results.json` Node assertion'ları → **localhost:3004; 12 proje; 12 başarılı; 0 başarısız/atlanan/flaky; 12 doğru target-host annotation'ı**. `git diff --check` başarılı. `test-results/` içindeki 320 ve 1440 katalog, 320 reduced-motion ekranları görsel olarak incelendi; raporlar/ekranlar git dışında.
- Kabul sonunda `npm run dev` yeniden açıldı; sandbox FSEvent izni gerekli süreç izniyle çözüldü. `curl` + Node assertion'ları `http://localhost:3004` üzerinde ZEYTİN işaretini ve üç katalog ürününü doğruladı. Next'in geçici `next-env.d.ts` üretim farkı dev açılışında eski haline döndü; commit kapsamına girmedi.
- Kabul kriterleri karşılandı; Task 030 kapsamında kalan engel yok. Gerçek katalog, görsel yerleştirme ve sepet entegrasyonu yukarıda belirtilen sonraki görevlerin kapsamındadır. Doğrulama yereldir; dağıtım veya canlı satış kabulü değildir.

## Durum: TAMAMLANDI
