# Task 108: Üyelik arayüzü: Google ile giriş + e-posta, hesabım

## Tür
frontend

## Amaç
Giriş/kayıt sayfası (önce 'Google ile devam et'), e-posta ile kayıt/giriş, şifre sıfırlama, hesabım (profil, adresler, siparişlerim).

## Bağlam
ZEYTİN v2 (`docs/DESIGN.md` "Topraktan sofraya" — krem 'sofra' dili, Fraunces/Figtree, ev kuralları). Kullanıcı (20 Eki): "21st.dev … MEMBERS ÜYELİK VS SİPARİŞ TAKİP KARGO VS ONLARIDA" + "GMAİL İLE GİRİŞ". **Bu görev yalnız arayüz + akış katmanıdır:** gerçek kimlik doğrulama, veritabanı ve kargo API'si YOK. Veriler bir **adaptör arayüzünün** arkasında (`lib/<alan>/adapter.ts`: `mock` uygulaması dev/test için; gerçek uygulama 040–050/069–072 ONAY GEREKLİ görevlerinde Supabase ile). Production build'de mock adaptör yalnız `NEXT_PUBLIC_DEMO=1` iken; aksi hâlde sayfalar "Yakında" durumunu gösterir (sahte başarı yok).

## Kullanılacak araçlar
- ECC skill: frontend-patterns, accessibility, security-review (form güvenliği), verification-loop; skill `motion-framer`, `ui-ux-pro-max`
- 21st MCP: Split Sign In Form 39096 (diarmuradi), Sign Up Form 28332 (diarmuradi), Order History 7710 (kavikatiyar) (kodu `mcp__21st__get_component` ile al, v2 tokenlarına uyarla; ikonlu kart ızgarası ev kuralı gereği YOK)

## Adımlar
1. `/giris` (tek sayfa, sekme: Giriş / Üye ol): en üstte tam genişlik **'Google ile devam et'** düğmesi (resmi Google marka kuralları: G logosu, 'Google ile devam et' metni, beyaz/koyu varyant), altında 'veya' ve e-posta + şifre (göster/gizle), 'Şifremi unuttum'. Kayıtta ad, e-posta, şifre (güç göstergesi), KVKK aydınlatma + açık rıza onayı (ayrı kutular), ticari ileti izni (isteğe bağlı, ayrı kutu).
2. Sol/sağ bölünmüş düzen (21st 39096 uyarlaması): bir tarafta form, diğer tarafta zeytinlik görseli + 'Kökü toprakta. Yeri sofrada.' (testimonial YOK — uydurma yorum yasak).
3. `/hesabim`: Profil (ad, e-posta, telefon), Adreslerim (ekle/düzenle/sil, varsayılan), Siparişlerim (21st 7710 uyarlaması: sipariş no, tarih, tutar, durum rozeti, 'Takip et' → `/siparis-takip?no=`), Çıkış. Mobilde sekmeler üstte kaydırılabilir.
4. Adaptör: `lib/auth/adapter.ts` (`signInWithGoogle`, `signInWithEmail`, `signUp`, `resetPassword`, `getSession`, `signOut`) + `lib/account/adapter.ts`; mock uygulama. Gerçek: Supabase Auth Google OAuth (043/040–042'de, ONAY GEREKLİ).
5. Sepet/ödeme akışında misafir alışverişi korunur; ödeme adımında 'Google ile hızlı giriş' önerisi (zorunlu değil).

## Kabul kriterleri
- [ ] e2e (mock): Google düğmesi adaptörü çağırır, e-posta kayıt/giriş/doğrulama hataları, KVKK onayı zorunlu, hesabım sekmeleri, adres CRUD
- [ ] Erişilebilirlik: form etiketleri, hata mesajları aria-live, şifre alanı autocomplete
- [ ] `lint.mjs app components` 0 FAIL; production `inspect.mjs` (iç sayfa istisnasıyla) FAIL 0; 1440/390 + iPhone 14 ekran görüntüleri `test-results/108/`
- [ ] lint/typecheck/build; e2e (mock adaptörle) + reduced-motion

## Coder Notu

### Uygulama (21 Ekim 2026)
- `/giris`: Giriş/Üye ol sekmeleri, önce Google düğmesi, e-posta akışları, şifre göster/gizle ve güç göstergesi, ayrı zorunlu KVKK/açık rıza ve isteğe bağlı ticari ileti kutuları, şifre sıfırlama demo sonucu. Onaylı zeytinlik ve resmi sloganla bölünmüş düzen.
- `/hesabim`: profil, mobilde kaydırılabilir ve klavyeyle gezilebilir sekmeler, kullanıcıya göre ayrılmış adres ekleme/düzenleme/silme/varsayılan seçimi, örnek siparişler ve `/siparis-takip?no=` bağlantıları, çıkış ve oturumsuz görünüm.
- `lib/auth/adapter.ts` ve `lib/account/adapter.ts` sözleşmeleri ile mock uygulamaları eklendi. Gerçek OAuth, Supabase, e-posta veya kargo API çağrısı yok. Demo profili/adresleri yalnız sekmenin `sessionStorage` alanında; şifreler yalnız bellekte, yenilemede sıfırlanır. Depolama engellenirse bellek yedeği kullanılır. Mock kimliği ödeme/sunucu yetkisi olarak kullanılmaz.
- Production'da yalnız `NEXT_PUBLIC_DEMO=1` mock ekranını açar; varsayılan ve `0` değeri “Yakında” gösterir. Son yerel production build demo kapalı bırakıldı. Gerçek auth bağlantısı ve hukuki metin onayı ilgili ONAY GEREKLİ görevlerindedir.
- Mevcut ödeme yüzeyi `PaymentPreview` içine isteğe bağlı “Google ile hızlı giriş” bağlantısı eklendi. Misafir sepeti ve ödeme yolu korunur; production PayTR önizlemesinin 404 kapısı değişmedi.
- 21st MCP kaynakları: diarmuradi `39096`, `28332`; kavikatiyar `7710`. Sonuncunun kaynak kodu `TrackingTimeline` döndürüyor; semantik tarih/durum listesi yaklaşımı görevdeki sipariş no/tutar/takip satırlarına uyarlandı. Testimonial ve ikonlu kart ızgarası kullanılmadı.
- shadcn resmi CLI: `view tabs`, `docs tabs`, `add tabs --yes`; sekmeler mevcut Radix bağımlılığıyla krem/zeytin tokenlarına, 44 px hedeflere ve görünür odağa uyarlandı. npm'nin global cache yazma engeli için repo içi `.cache/npm` kullanıldı; global ayarlar değiştirilmedi.
- İstenen ECC skill'leri, `motion-framer`, mevcut yerel `ui-ux-pro-max` ve TDD kullanıldı. Google basma geri bildirimi `motion/react`, ortak token ve reduced-motion kapısıyla çalışır.
- Google G dosyası ve yalnız düğme metnine ait Google Sans alt kümesi [resmi marka rehberinden](https://developers.google.com/identity/branding-guidelines) alındı; fontun OFL dosyası eklendi. Sitenin Fraunces/Figtree tipografisi korunur; Google'ın zorunlu düğme yazı tipi bu tek kontrolde istisnadır.

### Komutla doğrulama

Kanıtlar ve ekran görüntüleri `test-results/108/` altında (repo'nun mevcut ignore kuralına uygun, commit dışı).

| Kontrol | Sonuç / kanıt |
|---|---|
| TDD RED → GREEN | `npm test -- tests/unit/membership-adapters.test.ts`: önce eksik adaptör nedeniyle FAIL (`red.log`), sonra PASS. Yalnız işaretlerden oluşan telefon için ek RED/GREEN: `red-phone.log`. |
| `npm test -- --coverage` | **21 dosya, 266 test PASS**. Mevcut `app/` coverage kapsamı: statements %80.64, branches %83.33, functions %86.66, lines %86.79 (`unit-coverage.log`). Eski hesabım boş durum testi production/demo kapalı koşuluna uyarlandı. |
| `npm run lint` / `npm run typecheck` | **PASS**, 0 hata (`lint.log`, `typecheck.log`). |
| `NEXT_PUBLIC_DEMO=1 npm run build` | **PASS**, varlık/onay denetimi dahil (`build-demo.log`). |
| Demo üyelik e2e | **25 PASS / 5 koşullu skip**: Chromium 390/768/1440, Firefox 390, iPhone 14 WebKit. Google adaptörü, kayıt/giriş/hatalar, ayrı onaylar, aria-live/aria-describedby/autocomplete, profil kalıcılığı, sekme klavyesi, adres CRUD/varsayılan/silme iptali, çıkış, misafir sepeti ve isteğe bağlı ödeme girişi (`e2e-demo.log`). Skip edilenler demo kapalı build'e ait testlerdir; aşağıda ayrıca çalıştırıldı. |
| Reduced-motion + görseller | Aynı e2e içinde `reducedMotion: "reduce"`, taşma ve sayfa/varlık hataları kontrolü PASS. `giris-*`, `kayit-*`, `profil-*`, `adres-*`, `hesabim-*` PNG'leri; 1440/768/390 ve iPhone 14 WebKit dahil. Gerçek fiziksel cihaz testi değildir. |
| `lint.mjs app components` | **0 FAIL / 3 WARN** (`taste-lint.log`). Mevcut demo `h-screen`, genel uzun tireler ve Google'ın resmi 1 px düğme çerçevesi. |
| Production demo `inspect.mjs` | 1440/768/390: **giriş, kayıt, profil, adres formu ve siparişler: her biri 0 FAIL**. `inspect-{giris,register,profile,addresses,orders}/report.json`. Durum harness'i yalnız demo oturumu yükler/sekme açar ve etkin sekmeyi doğrular; orijinal probe/judge ve eşikler değiştirilmez. Yalnız DESIGN.md iç sayfa istisnaları: `few-pictures,focal-point,still-page`. Renderler görsel olarak incelendi. |
| `NEXT_PUBLIC_DEMO=0 npm run build` | **PASS** (`build-production.log`). |
| Demo kapalı production e2e | **20 PASS / 25 koşullu skip**, aynı beş tarayıcı/ekran projesi (`e2e-production.log`). `/giris` ve `/hesabim` Yakında, form/Google kontrolü yok; sepet, 404/kurtarma, reduced-motion, PayTR sayfaları ve token endpoint 404 doğrulandı. Demo testleri bu build'de bilinçli atlanır. |
| Demo kapalı production inspect | `/giris` ve `/hesabim`: **0 FAIL / 2 WARN**, 1440/768/390 (`inspect-production-{giris,hesabim}/report.json`). `production-*.png` ekranları da alındı. |
| PayTR + toptan form regresyonu | **32 PASS**, Chromium 390 ve iPhone 14 WebKit (`e2e-regression-local.log`). İlk denemedeki sandbox/tarayıcı, yanlış host origin ve fixture'ın dış baseURL kısıtları doğru yerel komutla giderildi; uygulama güvenlik kontrolleri gevşetilmedi. |
| Diff/güvenlik incelemesi | `git diff --check` PASS. Yeni UI'da gerçek servis çağrısı, secret, HTML enjeksiyonu veya kalıcı şifre yok; env dosyası eklenmedi. |

Tekrarlanabilir ana e2e komutları (önce karşılık gelen build ve `next start --hostname 127.0.0.1 --port 3108`; mevcut dev sunucusu `localhost:3004`):

```sh
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3108 FRAME_SEQUENCE_DEV_URL=http://localhost:3004 NEXT_PUBLIC_DEMO=1 npx playwright test tests/e2e/membership.spec.ts --project=chromium-390 --project=chromium-768 --project=chromium-1440 --project=webkit-iphone14 --project=firefox-390 --output=test-results/108/demo-traces
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3108 NEXT_PUBLIC_DEMO=0 npx playwright test tests/e2e/membership.spec.ts tests/e2e/interior-pages.spec.ts --project=chromium-390 --project=chromium-768 --project=chromium-1440 --project=webkit-iphone14 --project=firefox-390 --output=test-results/108/production-traces
PLAYWRIGHT_PORT=3110 FRAME_SEQUENCE_DEV_URL=http://localhost:3004 npx playwright test tests/e2e/payment-preview.spec.ts tests/e2e/wholesale-form.spec.ts --project=chromium-390 --project=webkit-iphone14 --output=test-results/108/regression-traces
node /Users/emre/.claude/skills/design-taste-frontend/scripts/lint.mjs app components
node /Users/emre/.claude/skills/design-taste-frontend/scripts/inspect.mjs http://127.0.0.1:3108/giris --allow few-pictures,focal-point,still-page --out test-results/108/inspect-giris
MEMBERSHIP_INSPECT_STATE=addresses node test-results/108/inspect-state.mjs http://127.0.0.1:3108/hesabim --allow few-pictures,focal-point,still-page --out test-results/108/inspect-addresses
```

Inspect WARN'ları: onaylı krem palet, iç sayfada video bulunmaması; giriş/kayıtta resmi Google düğmesine özgü üçüncü font, ikincil metin rengi ve uzun form yanındaki sabit zeytinlik alanı. Kabulde FAIL yoktur. Görev kapsamındaki uygulanamayan adım yoktur; gerçek üyelik/teslimat/yayın kabulü bu frontend demosunun sonucu değildir.

## Durum: TAMAMLANDI
