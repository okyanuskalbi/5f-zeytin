> ONAY VERİLDİ (kullanıcı, 27 Eki 2026): "düzenle sorun kalmasın" (canlı taramada bulunan küçük pürüzler; auth mantığı, DB, ödeme değişmez).

# Task 144: Yönetici 401/403 sayfası Türkçe, robots/sitemap, menü ön yükleme

## Tür
frontend (küçük; auth mantığına dokunulmaz)

## Amaç
Canlı taramada bulunan üç pürüzü kapatmak:
1. Giriş yapmadan `/admin` açılınca Next'in varsayılan İngilizce sayfası çıkıyor: "401: You're not authorized to access this page". Müşteri yakında admin kaydı yapacak, ilk göreceği ekran bu.
2. `robots.ts` `/giris`'i kapatıyor ama `/kayit` ve `/admin` açık. `sitemap.ts` yalnız `/` içeriyor, yasal sayfalar yok.
3. Mobil menü (`NavbarMenu`) `dynamic()` ile yalnız ilk tıklamada indiriliyor; yavaş ağda ilk açılış 1,5–3 sn gecikiyor (Claude ölçümü, WebKit SE).

## Bağlam
- `app/admin/layout.tsx` 401'de `unauthorized()`, 403'te `forbidden()` çağırıyor; `next.config.ts` içinde `authInterrupts: true` açık. Başka çağıran yok.
- `app/not-found.tsx` `EmptyState` bileşenini kullanıyor: aynı kalıp.
- `/giris?next=` destekli (`safeAuthRedirect`).
- `components/site/Navbar.tsx:16` `const NavbarMenu = dynamic(() => import("./NavbarMenu")...)`.

## Kullanılacak araçlar
- ECC skill: `frontend-patterns`, `tdd-workflow`, `seo`.

## Adımlar
1. `app/unauthorized.tsx`: `EmptyState`. Başlık "Giriş gerekli". Bir cümle: "Bu sayfayı görmek için yönetici hesabıyla giriş yapın." Düğme "Giriş yap" → `/giris?next=%2Fadmin`. `metadata`: başlık "Giriş gerekli | Afina Zeytin", `robots: { index: false, follow: false }`.
2. `app/forbidden.tsx`: `EmptyState`. Başlık "Yetkiniz yok". Bir cümle: "Bu hesabın yönetici yetkisi bulunmuyor." Düğme "Ana sayfaya dön" → `/`. Aynı noindex.
3. HTTP durum kodları aynı kalsın (401 ve 403). `requireAdmin` ve `admin/layout.tsx` mantığı değişmesin.
4. `app/robots.ts` disallow listesine `/kayit` ve `/admin` ekle.
5. `app/sitemap.ts`: `/` yanına `/kvkk`, `/iade`, `/mesafeli-satis` (changeFrequency `yearly`, priority 0.3). Bu sayfalar noindex ise ekleme ve Coder Notu'nda yaz.
6. `Navbar.tsx`: menü düğmesine `onPointerEnter`, `onFocus`, `onTouchStart` ile ve ayrıca sayfa yüklendikten sonra `requestIdleCallback` (yoksa `setTimeout` 2000 ms) ile `import("./NavbarMenu")` önceden tetiklensin (tek sefer). `dynamic()` kalsın; açılış davranışı, odak yönetimi, animasyon değişmesin.

## Kabul kriterleri
- [ ] Birim/kaynak testleri: unauthorized/forbidden sayfaları Türkçe metin + doğru bağlantı; robots `/kayit` ve `/admin` içeriyor; sitemap 4 URL (ya da noindex açıklaması); Navbar ön yükleme tek sefer çağrılıyor.
- [ ] Mevcut e2e: oturumsuz `/admin` 401 dönmeye devam ediyor (varsa test güncellensin, zayıflatılmasın).
- [ ] `npm test`, lint, typecheck, build yeşil.
- Tarayıcı kontrolü Claude'da.

## Yapılmaması gerekenler
- Auth, Supabase, RLS, ödeme, CSP başlığına dokunma.
- Yeni bağımlılık ekleme.
- Metinlerde "%100/organik/doğal" iddiası, uzun tire kullanma.

## Coder Notu

- `app/unauthorized.tsx` ve `app/forbidden.tsx`, mevcut marka tokenlarına uyarlanmış `EmptyState` ile eklendi. Türkçe başlık, açıklama, bağlantı ve `noindex, nofollow` metadata birim testleriyle doğrulandı.
- 21st MCP'de `empty state` araması yapıldı; yeni bileşen veya bağımlılık eklemek yerine görevin istediği mevcut `EmptyState` kullanıldı.
- Robots listesine `/kayit` ve `/admin` eklendi. `/kvkk`, `/iade`, `/mesafeli-satis` sayfalarının üçü de onay bekleyen taslak ve `robots: { index: false, follow: false }`; adım 5'teki istisna gereği sitemap'e eklenmedi. Sitemap yalnız ana sayfayı içeriyor; her taslağın noindex durumu ve sitemap dışında kalması test edildi.
- Navbar'da üç niyet olayı, sayfa yüklendikten sonraki idle callback ve 2000 ms yedek zamanlayıcı ortak yükleme Promise'ini kullanıyor. `dynamic()` korundu. Dokuz birim testi; tek yükleme, ön yüklemenin menüyü açmaması, sayfa yüklemesini bekleme ve unmount temizliğini doğruluyor.
- `requireAdmin`, `app/admin/layout.tsx`, auth, DB, ödeme, CSP ve bağımlılıklar değişmedi. Mevcut admin birim testlerinin 401/403 kesme kontrolleri de tüm test koşusunda geçti.

| Kabul / doğrulama | Komut ve sonuç |
| --- | --- |
| TDD RED | `npm test -- tests/unit/auth-interrupt-pages.test.tsx tests/unit/seo-routes.test.ts tests/unit/navbar-preload.test.tsx --maxWorkers=2`: uygulama öncesi eksik ekranlar, robots kuralları ve ön yükleme nedeniyle 10 başarısız, 6 başarılı test. |
| TDD GREEN | Aynı odaklı komut: 16/16 test başarılı. RED ve GREEN yerel checkpoint'leri push öncesi tek final commit'te birleştirildi; RED/ara commit push edilmedi. |
| Tüm unit testleri | `npm test -- --maxWorkers=2`: 69 dosya, 1079/1079 test başarılı. |
| Lint | `npm run lint`: başarılı, uyarı yok. |
| Typecheck | `npm run typecheck`: başarılı. |
| Production build | `npm run build`: başarılı; öncesindeki üç görsel doğrulama komutu da başarılı. |
| Odaklı route kapsamı | `npm test -- tests/unit/auth-interrupt-pages.test.tsx tests/unit/seo-routes.test.ts tests/unit/navbar-preload.test.tsx --maxWorkers=2 --coverage --coverage.include=app/unauthorized.tsx --coverage.include=app/forbidden.tsx --coverage.include=app/robots.ts --coverage.include=app/sitemap.ts`: 16/16 başarılı; bu dört dosyada satır, ifade, fonksiyon ve dal kapsamı %100. Bu sonuç global proje kapsamı değildir. |
| Build çıktıları | Node `assert` ile `.next/server/app/robots.txt.body` içindeki `/giris`, `/kayit`, `/admin` dışlamaları ve `.next/server/app/sitemap.xml.body` içindeki tek ana sayfa URL'si doğrulandı. |
| Tarayıcı kabulü | `tests/e2e/admin-shell.spec.ts` içindeki 401 beklentisi korundu; Türkçe başlık, açıklama ve giriş bağlantısı kontrolleri eklendi. E2E, Playwright, Lighthouse, inspect ve ekran görüntüsü çalıştırılmadı. HTTP 401/403, görsel görünüm, mobil menünün gerçek ağ hızı ve odak/animasyon kabulünü Claude doğrulayacak. |

## Durum: TAMAMLANDI
