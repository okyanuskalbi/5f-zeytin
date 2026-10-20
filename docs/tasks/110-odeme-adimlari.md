# Task 110: Ödeme adımları: adres → kargo → PayTR

## Tür
frontend

## Amaç
Çok adımlı ödeme: iletişim/adres, teslimat seçimi, sipariş özeti + kupon, PayTR iframe adımı.

## Bağlam
ZEYTİN v2 (`docs/DESIGN.md` "Topraktan sofraya" — krem 'sofra' dili, Fraunces/Figtree, ev kuralları). Kullanıcı (20 Eki): "21st.dev … MEMBERS ÜYELİK VS SİPARİŞ TAKİP KARGO VS ONLARIDA" + "GMAİL İLE GİRİŞ". **Bu görev yalnız arayüz + akış katmanıdır:** gerçek kimlik doğrulama, veritabanı ve kargo API'si YOK. Veriler bir **adaptör arayüzünün** arkasında (`lib/<alan>/adapter.ts`: `mock` uygulaması dev/test için; gerçek uygulama 040–050/069–072 ONAY GEREKLİ görevlerinde Supabase ile). Production build'de mock adaptör yalnız `NEXT_PUBLIC_DEMO=1` iken; aksi hâlde sayfalar "Yakında" durumunu gösterir (sahte başarı yok).

## Kullanılacak araçlar
- ECC skill: frontend-patterns, accessibility, security-review (form güvenliği), verification-loop; skill `motion-framer`, `ui-ux-pro-max`
- 21st MCP: Checkout Block 8339 (preetsuthar17), Shipping Address Fieldset 26538 (shadcnspace), Checkout Form 7053 (kodu `mcp__21st__get_component` ile al, v2 tokenlarına uyarla; ikonlu kart ızgarası ev kuralı gereği YOK)

## Adımlar
1. `/odeme`: adım çubuğu (1 Bilgiler · 2 Teslimat · 3 Ödeme), mobilde tek kolon; sağda (masaüstü) yapışkan sipariş özeti + upsell yok (sepette kaldı) + kupon alanı (054 gelene kadar devre dışı 'yakında').
2. Bilgiler: misafir veya 'Google ile hızlı giriş'; ad, e-posta, telefon (TR maske), adres (il/ilçe seçimi Türkiye listesi, mahalle, açık adres, posta kodu — 26538 uyarlaması); fatura bilgisi (bireysel/kurumsal: VKN/vergi dairesi).
3. Teslimat: kargo seçeneği(leri) (firma kararı gelene kadar 'Standart kargo — ücret ödeme adımında' temsili, fiyat uydurma YOK).
4. Ödeme: mesafeli satış + ön bilgilendirme onay kutuları (073 taslak linkleri), PayTR iframe (001b bileşeni; anahtarsız uyarı modu); 'Siparişi tamamla' yalnız PayTR akışında.
5. Durum yalnız URL'de değil sunucu tarafında doğrulanır (049); sonuç sayfaları 050.

## Kabul kriterleri
- [ ] e2e: adım ileri/geri, doğrulama, il/ilçe, fatura türü, onay kutuları zorunlu, PayTR adımı anahtarsız uyarı; mobil
- [ ] `lint.mjs app components` 0 FAIL; production `inspect.mjs` (iç sayfa istisnasıyla) FAIL 0; 1440/390 + iPhone 14 ekran görüntüleri `test-results/110/`
- [ ] lint/typecheck/build; e2e (mock adaptörle) + reduced-motion


## Coder Notu

21 Ekim 2026. Görevin frontend/demo kapsamı uygulandı; gerçek DB, kimlik doğrulama, kargo veya satış entegrasyonu eklenmedi.

- `/odeme`: Bilgiler → Teslimat → Ödeme adımları; ileri/geri ve önceki adıma dönüş, adım başlığına odak, hatalarda bağlantılı/odaklanan `aria-live` özeti ve alan bazlı açıklamalar. Masaüstünde yapışkan sipariş özeti, mobilde tek kolon; sepet drawer ve sayfasının ödeme bağlantısı bu akışa yönlenir.
- Misafir yolu ve isteğe bağlı mevcut Google **demo** adaptörü; TR telefon maskesi, 81 il / 973 ilçelik çevrimdışı bağlı seçim, mahalle/adres/posta kodu, bireysel/kurumsal fatura ve zorunlu unvan/VKN/vergi dairesi. İl değişiminde ilçe temizlenir. İletişim, adres ve onaylar React belleğindedir; URL, log veya storage'a yazılmaz. Google seçimi yalnız mevcut örnek profil oturumunu saklar.
- Veri sınırı `lib/checkout/adapter.ts`. Kargo firması/bedeli seçilmedi; standart kargo temsilidir, kesin toplam `null` kalır. Kupon alanı/eylemi devre dışıdır. Sepet satırları mevcut ürünlerden hesaplanan **tahminlerdir**; boş/geçersiz sepet ve katalog okuma hatası ödeme formunu açmaz.
- İki ayrı zorunlu onay PayTR alanını açar; onay kaldırılınca veya önceki adıma dönülünce alan kapanır. Hukuk bağlantıları mevcut 073 satış taslağına gider; ön bilgilendirme bağlantısı mevcut `#taslak-basligi` bölümüne yönelir. Onaylı hukuk metni üretilmedi.
- 001b'nin mevcut PayTR kontrolü `PaytrPreviewControl` olarak tekrar kullanıldı. Production'da yerel token/önizleme kapısı kapalıdır ve anahtarsız/bağlantı hazır değil uyarısı gösterilir. Development'ta anahtar varsa yalnız 001b'nin sabit test siparişi açılabilir; müşteri adresi/sepeti bu endpoint'e gönderilmez. Kart alanı, sahte ödeme sonucu veya uygulamada “Siparişi tamamla” eylemi eklenmedi. Gerçek sunucu ödeme teyidi/callback ve sonuç ekranları 049/050 ONAY GEREKLİ görevlerindedir; bu arayüz onların tamamlandığını ileri sürmez.
- Production'da mock yalnız `NEXT_PUBLIC_DEMO=1` ile açılır. Varsayılan/`0` değeri “Yakında” gösterir; `step`, `status`, `paid` URL parametreleri bir adım veya ödeme sonucu açmaz. Son yerel production build demo kapalı bırakıldı.
- 21st MCP bu oturumun araçlarında yoktu. AGENTS.md erişimsizlik istisnası kaydedildi; **resmi `@21st-dev/cli get <id> --json`** ile aynı katalog kaynakları 8339 (preetsuthar17), 26538 (shadcnspace), 7053 alınıp incelendi. Adım/özet, fieldset ve kupon/tutar grupları krem/zeytin tokenlarına, Fraunces/Figtree'ye, düz yüzeye ve yerel erişilebilir form kontrollerine uyarlandı; kaynakların kart/ikon ızgarası ve kart numarası alanları taşınmadı. Kaynaklar `test-results/110/21st-*.json` içinde, uyarlama notları bileşenlerde.
- ECC frontend-patterns/accessibility/security-review/verification-loop/TDD, motion-framer, ui-ux-pro-max, üç motion skill'i ve CLI alternatifi için 21st-cli-use okundu/kullanıldı. Mevcut motion tokenları ve `useReducedMotion` kullanıldı. Genel skill tasarım önerileri DESIGN.md'nin yerine geçirilmedi. shadcn resmi CLI `view input button checkbox native-select` çalıştırıldı; mevcut özelleştirilmiş Button/Input ve yerel form kontrolleri kullanıldı, yeni bağımlılık/skill kurulmadı.
- İl/ilçe verisi MIT lisanslı [turkiye-api kaynağından](https://github.com/ubeydeozdmr/turkiye-api/tree/a0ad8351cb52153e7a92aa7ba9a5bc1e3294da8d/datasets) yalnız adlar ve il ilişkileri alınarak sabitlendi. Lisans/kaynak `lib/checkout/turkey-locations.LICENSE.txt` içinde korunur; bu liste kargo hizmeti/teslimat kapsamı iddiası değildir.

### Komutla doğrulama

Kanıtlar, **30 PNG** ve inspect renderleri `test-results/110/` altında; mevcut ignore kuralı gereği commit dışındadır. Görüntüler görsel olarak incelendi. iPhone 14 WebKit tarayıcı emülasyonudur; fiziksel cihaz kabulü değildir.

| Kontrol | Sonuç / kanıt |
|---|---|
| TDD RED → GREEN | Önce eksik checkout adaptörü testi FAIL (`red.log`); ardından görev adaptörü + mevcut PayTR testleri **28 PASS** (`green.log`). |
| `npm test -- --coverage` | **26 dosya, 288 test PASS**; mevcut `app/` kapsamı statements %82.35, branches %86.11, functions %87.50, lines %87.71 (`unit-coverage.log`). |
| `npm run lint` / `npm run typecheck` | **PASS**, 0 hata/uyarı (`lint.log`, `typecheck.log`). |
| `NEXT_PUBLIC_DEMO=1 npm run build` | **PASS**, varlık denetimi dahil (`build-demo.log`). Yeni production sunucusunda demo akışı doğrulandı. |
| Checkout demo e2e | **20 PASS / 5 koşullu skip**, Chromium 390/768/1440, Firefox 390, iPhone 14 WebKit (`e2e-demo.log`). İleri/geri, doğrulama, il/ilçe temizleme, kurumsal/bireysel fatura, iki zorunlu onay, anahtarsız PayTR, sepet özeti/bağlantısı, Google demo, boş sepet, verilerin depolanmaması, klavye/odak, taşma ve reduced-motion. Atlanan demo kapalı testler ayrıca aşağıda geçti. |
| PayTR iframe regresyonu | **10 PASS**, Chromium 390 ve iPhone 14 WebKit (`e2e-paytr.log`): token/URL, resizer, hata/tekrar deneme, klavye/reduced-motion, zaman aşımı, dinleyici temizliği ve beklenmeyen origin'in reddi. Gerçek sağlayıcı isteği yerine mevcut tarayıcı fixture'ı kullanıldı. |
| Development regresyonu | **4 PASS**, aynı iki proje (`e2e-dev-preview.log`): sepetten `/odeme` girişi ve mevcut `/odeme-onizleme` anahtarsız modu. Dev sürecinin aynı checkout dizinine ait olduğu doğrulandı. |
| `lint.mjs app components` | **0 FAIL / 4 WARN** (`taste-lint.log`): mevcut demo `h-screen`, Google düğmesi çerçevesi, form kontrollerinin işlevsel sınırı ve mevcut uzun tireler. |
| Production demo `inspect.mjs` | Bilgiler, kurumsal fatura, teslimat ve ödeme durumları: her birinde 1440/768/390 **0 FAIL** (`inspect-{details,corporate,delivery,payment}/report.json`). Harness yalnız sepeti örnek niyetle doldurup gerçek form kontrolleriyle ilgili adıma geçer; orijinal probe/judge/eşikler korunur. İzinler yalnız DESIGN.md iç sayfa istisnalarıdır: `few-pictures,focal-point,still-page`. |
| `NEXT_PUBLIC_DEMO=0 npm run build` | **PASS**, son build (`build-production.log`). |
| Demo kapalı production e2e | **20 PASS / 20 koşullu skip**, aynı beş proje (`e2e-production.log`). URL'de sahte sonuçla da Yakında, form/iframe yok; iç sayfalar, sepet, 404/kurtarma ve PayTR sayfa/token endpoint 404 kapıları PASS. Bu build'de demo senaryoları bilinçli atlanır. |
| Demo kapalı production inspect | 1440/768/390 **0 FAIL / 2 WARN** (`inspect-production/report.json`). Beş projenin `production-*.png` görüntüleri alındı. |
| Güvenlik / diff | Yeni akış dosyalarında HTML enjeksiyonu, debug log, müşteri localStorage/cookie kaydı veya doğrudan fetch/secret env referansı yok (`security-review.json`). PayTR mevcut kontrolünde token/iframe origin doğrulaması korunur. `git diff --check` PASS; env dosyası eklenmedi. |

Inspect WARN'ları onaylı krem palet, işlevsel iç sayfada video olmaması ve ilk üç durumda uzun demo açıklama satırıdır; FAIL yoktur. İlk tarayıcı başlatma sandbox engeli izinli çalıştırmayla çözüldü. İndirilen referans kaynakları TypeScript kapsamına girmemeleri için kanıt klasöründe `.txt` uzantısıyla saklandı; son typecheck PASS. Görev kapsamında açık kalan frontend kabul maddesi yoktur; gerçek servis/canlı yayın kabulü bu görevin kapsamı değildir.

Tekrarlanabilir ana komutlar (her build'den sonra önceki production süreci kapatılıp yeni `npm run start -- --hostname 127.0.0.1 --port 3120`):

```sh
NEXT_PUBLIC_DEMO=1 npm run build
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3120 NEXT_PUBLIC_DEMO=1 npm run test:e2e -- tests/e2e/checkout.spec.ts --project=chromium-390 --project=chromium-768 --project=chromium-1440 --project=firefox-390 --project=webkit-iphone14
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3120 NEXT_PUBLIC_DEMO=1 npm run test:e2e -- tests/e2e/payment-preview.spec.ts --grep 'mock PayTR component' --project=chromium-390 --project=webkit-iphone14
node /Users/emre/.claude/skills/design-taste-frontend/scripts/lint.mjs app components
CHECKOUT_INSPECT_STEP=payment node test-results/110/inspect-state.mjs http://127.0.0.1:3120/odeme --allow few-pictures,focal-point,still-page --out test-results/110/inspect-payment
NEXT_PUBLIC_DEMO=0 npm run build
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3120 NEXT_PUBLIC_DEMO=0 npm run test:e2e -- tests/e2e/checkout.spec.ts tests/e2e/interior-pages.spec.ts --project=chromium-390 --project=chromium-768 --project=chromium-1440 --project=firefox-390 --project=webkit-iphone14
node /Users/emre/.claude/skills/design-taste-frontend/scripts/inspect.mjs http://127.0.0.1:3120/odeme --allow few-pictures,focal-point,still-page --out test-results/110/inspect-production
npm test -- --coverage
npm run lint
npm run typecheck
```

## Durum: TAMAMLANDI
