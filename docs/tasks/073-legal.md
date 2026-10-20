# Task 073: KVKK ve satış/iade sayfaları

## Tür
frontend

## Amaç
Kullanıcı tarafından onaylanacak hukuk metinlerini sayfala.

## Bağlam
`docs/PLAN.md`: Hedef, Teknoloji, Mimari kararlar ve ilgili kapsam bölümü. Bağımlı task’lar / addBlockedBy: 024 (shell). Komutlar 001 görevinde kurulacak araçlara dayanır; bağımlılıklar tamamlanmadan bu task çalıştırılmaz.

## Kullanılacak araçlar
- ECC skill: frontend-patterns, accessibility
- 21st MCP: evet — hukuk içerik düzeni
- find-skills ile bulunup kurulacak ek skill: yok; yeni ihtiyaç varsa önce `npx skills find <konu>`, kurulan skill Coder Notu’na yazılır.

## Dokunulacak dosyalar
- `app/kvkk/page.tsx` (oluştur / düzenle)
- `app/mesafeli-satis/page.tsx` (oluştur / düzenle)
- `app/iade/page.tsx` (oluştur / düzenle)
- `tests/e2e/legal.spec.ts` (oluştur / düzenle)

## Adımlar
1. PLAN, AGENTS ve bağımlı task’ları oku; gereken kullanıcı kararları/onayları yoksa başlamadan Coder Notu’na engeli kaydet.
2. Şirket unvan/adres/iletişim gerçek verilerle; toptan talep formu, sipariş ve pazarlama izni akışlarına uygun kullanıcı onaylı aydınlatma, mesafeli satış/iade içerikleri. Onay gelene kadar taslak, hukuki güvence iddiası yok. Footer/checkout/toptan formu KVKK bağlantıları erişilebilir; hukuk metni uydurma.
3. Uygulama görevinde ilgili davranış testini önce başarısız çalıştır, uygula ve geçir. Görsel görevinde model/kaynak/çıktı doğrulaması yap; key ve kişisel veri kaydetme.
4. Kabul komutlarını çalıştır, çıktıyı ve varsa kullanıcı onay kaydını Coder Notu’na ekle; yalnız bu task kapsamını commit et.

## Kabul kriterleri
- [ ] `npm run test:e2e -- tests/e2e/legal.spec.ts` başarılı; aşağıdaki davranışın normal, hata ve reduced-motion/klavye senaryoları doğrulanır.
- [ ] `npm run lint && npm run typecheck && npm run build` başarılı.

## Yapılmaması gerekenler
- Task dışına çıkma, ek iyileştirme yapma; diğer repolara yazma.
- Kullanıcı yerine açık karar verme; gizli bilgi commit etme; onaysız görseli yayınlama.
- Gerçek ödeme, üretim DB değişikliği, canlı e-posta veya domain mutasyonu için bu taslağı tek başına yetki sayma.

## Coder Notu

- Başlangıç kontrolü (20 Ekim 2026): `main`, temiz çalışma ağacı; bağımlı Task 024 `TAMAMLANDI`. PLAN açık karar 7 ve resmi `docs/referans/icerik.md` kontrol edildi. Tam şirket unvanı/adresi/iletişimi ve kullanıcı onaylı KVKK, mesafeli satış, iade metinleri repoda bulunmuyor. Bu engel uygulama başlamadan kaydedildi. Adım 2'nin izin verdiği açık taslak sayfalar hazırlanabilir; gerçek hukuk içerikleri uydurulamaz ve bu bilgiler gelmeden görev tamamlanmış sayılamaz.
- Checkout (`app/odeme`) ve toptan talep formu bu checkout'ta henüz uygulanmamış. Bu akışlardaki bağlantı kabulü 046/081 uygulamaları olmadan doğrulanamaz; task dışı form veya ödeme uygulaması eklenmez. Mevcut footer bağlantıları üç hukuk sayfası için doğrulanacaktır.
- Araçlar: `frontend-patterns`, `accessibility` ve AGENTS TDD kuralı için `tdd-workflow` okundu. Yerel Next.js 16.4.2 sayfa/layout ve metadata kılavuzları incelendi. 21st MCP `search` + `get_component` ile [Privacy Policy Collapsible Card](https://21st.dev/@cnippet-dev/components/v-collapsible-15) (24952) alındı; başlık ve bölümlere ayrılan kart düzeni AFİNA tokenlarına uyarlanacak. Örneğin hukuk metni kopyalanmaz; taslak içeriği sürekli görünür tutulur. Ek skill/paket/shadcn bileşeni gerekmedi.
- TDD / RED: `PLAYWRIGHT_BASE_URL=http://localhost:3073 PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/ms-playwright" npm run test:e2e -- tests/e2e/legal.spec.ts --project=chromium-320 --grep 'draft /kvkk' --output=.cache/task-073/red-results` → **exit 1; 1 test başarısız**, beklenen HTTP 200 yerine **404**. Test mevcut checkout'tan alınan production build üzerinde çalıştı. İlk macOS MachPort sandbox hatası süreç izniyle çözüldü; geçerli RED eksik sayfa davranışıdır. 3004 portundaki mevcut süreç korunarak ayrı 3073 portu kullanıldı.

### Uygulama / GREEN — 20 Ekim 2026

- `/kvkk`, `/mesafeli-satis` ve `/iade` Server Component olarak eklendi. Her sayfada tek H1/main, isimlendirilmiş içerik bölümleri, sürekli görünür **Taslak — onay bekleniyor** bilgisi, kapsam açıklaması, sayfalar arası navigasyon ve ana sayfaya dönüş bulunur. Başlık/açıklama taslak durumunu belirtir; metadata `noindex, nofollow` üretir.
- 21st içerik kartı düzeni mevcut zeytin yeşili/fildişi/kart/altın mürekkep tokenlarına uyarlandı. Metinler küçük ekranda sarılır; bağlantılar en az 44 px yüksekliğe ve görünür klavye odağına sahiptir. Yeni animasyon, paket veya UI bağımlılığı eklenmedi; içerik reduced-motion ve JavaScript kapalıyken de erişilebilir.
- Şirket bilgisi, hukuk maddesi, süre/ücret, iade istisnası, hukuki güvence veya onay tarihi uydurulmadı. Form/onay kutusu ya da izin kaydı eklenmedi. KVKK sayfası toptan talep, sipariş ve pazarlama iznini yalnız beklenen metnin kapsamı olarak belirtir; onaylı aydınlatma metni mevcut değildir.
- TDD eşlemesi: yeni sayfa HTTP 200/başlık/taslak beklentisi → `0e03e7d` RED commit'inde HTTP 404; aynı test, üç sayfanın tamamı ve diğer senaryolar uygulamadan sonra GREEN. Statik sayfaların davranışı E2E ile ölçüldü; bu koşum birim/satır kapsam yüzdesi veya hukuk içeriği onayı kanıtı değildir.

### Kabul komutları ve kanıt

| Komut / kontrol | Sonuç |
| --- | --- |
| `npm run lint && npm run typecheck && npm run build` | **exit 0**; production route listesinde `/kvkk`, `/mesafeli-satis`, `/iade` mevcut. Prebuild varlık denetimi **14/14 PASS**. |
| `PLAYWRIGHT_BASE_URL=http://localhost:3073 PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/ms-playwright" npm run test:e2e -- tests/e2e/legal.spec.ts --output=.cache/task-073/legal-results` | **exit 0; 72/72 başarılı, 63,6 sn**. Chromium/Firefox/WebKit × 320/390/768/1440; üç taslak sayfa, metadata, semantik başlıklar, normal/reduced-motion klavye navigasyonu ve ana sayfaya dönüş, 404'ten footer ile dönüş, JavaScript kapalı footer/link/içerik erişimi. |
| Playwright JSON raporuna Node assertion'ları | **PASS**: `localhost:3073`, **12 proje / 72 başarılı; 0 başarısız / 0 atlanan / 0 flaky**, her test tek deneme. |
| `git diff --check` | **exit 0**. |

Yerel JSON kanıtı `.cache/task-073/legal-results.json`; ekranlar `.cache/task-073/legal-results/` altında ve commit dışıdır. Chromium 320 mesafeli satış / 1440 KVKK ve WebKit 390 KVKK tam sayfa görüntüleri açılarak incelendi; taşma/kırpılma yok. Build'in otomatik değiştirdiği `next-env.d.ts` başlangıç içeriğine döndürüldü. PLAN, diğer task'lar, footer/checkout/form kodu, backend/DB/auth/ödeme, kaynaklar ve varlık kayıtları değiştirilmedi.

**Kalan engeller:** Tam şirket unvanı/adresi/iletişimi ve kullanıcı onaylı üç hukuk metni teslim edilmedi; checkout/toptan formu henüz olmadığı için bu yüzeylerdeki KVKK bağlantıları doğrulanamadı. Teknik kabul komutları başarılıdır; adım 2'nin bu gereksinimleri karşılanmadığından durum **BEKLİYOR** bırakıldı. Onaylı içeriklerle nihai hukuk sayfaları ve canlı yayın kabulü tamamlanmış sayılmaz.

## Durum: BEKLİYOR
