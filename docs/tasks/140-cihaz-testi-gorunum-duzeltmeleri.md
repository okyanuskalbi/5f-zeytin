> ONAY VERİLDİ (kullanıcı, 25 Eki 2026): "düzenlemeleri vs yap" (cihaz testi raporundaki 4 madde).

# Task 140: Cihaz testi görünüm düzeltmeleri (odak çerçevesi, Menü, şifre alanı, mobil başlık)

## Tür
frontend (yalnız CSS + iki küçük JSX düzenlemesi, yerel)

## Amaç
25 Eki tam cihaz testinde (Playwright 15 profil + gerçek iOS Safari simülatörleri) 4 görünüm sorunu çıktı. İşlev bozuk değil; hepsi görsel.

## Kullanılacak araçlar
- `ui-ux-pro-max`, `frontend-design`, `better-layout`, `shadcn-ui` (Button varyantı), `ai-tool-prompts` (son kontrol). 21st MCP gerekmiyor. Coder Notu'na kısa skill tablosu.

## İstenen

1. **Programatik odak hedeflerinde altın çerçeve (en önemli).** `/#toptan-iletisim` gibi bağlantılarla `tabIndex={-1}` olan bölüme odak gidince iOS Safari/WebKit global `:focus-visible` altın çerçevesini yazıya yapışık çiziyor (`app/globals.css` ~170).
   - `app/globals.css` içinde global kuralın hemen altına: `[tabindex="-1"]:focus, [tabindex="-1"]:focus-visible { outline: none; }`
   - Gerçek etkileşimli öğelerin (a, button, input, summary, `tabindex="0"`) odak çerçevesi aynen kalmalı.

2. **Mobil "Menü" düğmesi okunmuyor.** Hero'da (`data-tone="hero"`) "Menü" yazısı parlak yaprakların üstüne düşüyor; Sepet'in pill zemini var, Menü'nün yok. `components/site/Navbar.module.css`:
   - `.trigger` mobilde `.cart` ile aynı pill görünümünü alsın (`min-height: 44px; border: 1px solid rgba(255,255,255,.25); border-radius: 999px; padding: 8px 14px; font-weight: 600;`).
   - Yalnız hero tonunda iki pill'e okunurluk zemini: `.bar[data-tone="hero"] .cart, .bar[data-tone="hero"] .trigger { background: rgba(14,21,16,.42); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }`. `.control:hover/active` kurallarının bu zemini `transparent` ile ezmemesine dikkat et (özgüllük).
   - ≤ 359 px kuralında `.trigger` için de `padding-inline: 8px`.

3. **Şifre alanı dar, göz simgesi kutunun dışında.** `components/account/SignIn.tsx` (~79-82) ve `components/account/Register.tsx` (~68-71) + `components/account/Membership.module.css` `.password`:
   - Input diğer alanlarla aynı tam genişlikte olsun; göster/gizle düğmesi input'un **içinde** sağda dursun: `.password { position: relative; display: block; }`, `.password input { width: 100%; padding-right: 48px; }`, `.password button { position: absolute; top: 50%; right: 4px; transform: translateY(-50%); width: 40px; height: 40px; }`.
   - İki dosyada düğme `variant="outline"` → `variant="ghost"` (çerçevesiz). `aria-label`, `aria-pressed`, ikonlar ve davranış aynı kalsın. `CheckoutSignIn.tsx` veya başka yerde aynı `.password` kalıbı varsa aynı düzeltme.

4. **Mobilde kaydırınca başlık yarı saydam, arkadaki yazı okunuyor.** `Navbar.module.css` `@media (max-width: 900px)` içine: `.bar[data-tone="solid"] { background: rgba(14,21,16,.94); }`. Masaüstü değeri (`.72` + blur) değişmez.

## Kabul kriterleri
- [ ] Yalnız yukarıdaki dosyalar/değerler değişti; hero, hareket, sepet, menü davranışı aynı.
- [ ] Hesap formu testleri (şifre göster/gizle, aria-pressed) yeşil; gerekiyorsa sınıf/varyant beklentisini güncelle, davranış testini zayıflatma.
- [ ] `npm test`, lint, typecheck, build, `check:assets` yeşil.
- Tarayıcı ekran testi Claude'da (iOS simülatör + Playwright matrisi).

## Yapılmaması gerekenler
- Görsel dosyalarına, metinlere, renk token'larına, hero CSS'ine dokunma.
- Yatay telefonda sepet yüksekliği bu görevin kapsamı dışında.
- `docs/tasks` içinde yalnız Coder Notu/Durum.

## Coder Notu

| Skill | Uygulama |
| --- | --- |
| `ui-ux-pro-max` | Yerel UX araması: etkileşimli kontrollerin odak görünürlüğü; shadcn düğme varyantları. |
| `frontend-design` | Mevcut marka ve bileşen görünümü korunarak dört yerel düzeltme. |
| `better-layout` | Tam genişlikte şifre alanı, içeride sağa hizalı göz düğmesi ve dar ekran Menü boşluğu. |
| `shadcn-ui` | Resmi `npx shadcn@latest docs button` ve Button belgesi incelendi; mevcut özelleştirilmiş `ghost` varyantı kullanıldı. |
| `ai-tool-prompts` | Son kontrolde kapsam, hizalama, erişilebilir adlar ve mevcut tasarım sistemi denetlendi. |
| `tdd-workflow` | Kaynak kabul denetiminde RED → GREEN; mevcut davranış testleri değiştirilmeden çalıştırıldı. |

- Uygulama değişiklikleri yalnız `app/globals.css`, `components/site/Navbar.module.css`, `components/account/Membership.module.css`, `components/account/SignIn.tsx` ve `components/account/Register.tsx` içindedir. Diğer tek değişiklik bu dosyanın Coder Notu/Durum bölümüdür.
- `CheckoutSignIn.tsx` ve diğer bileşenler tarandı; aynı `.password` kalıbı yalnız giriş/kayıt formlarında bulunuyor. Ek JSX değişikliği gerekmedi.
- `node --input-type=module` ile PostCSS üzerinden dört CSS/JSX kabul grubu denetlendi: değişiklik öncesi **4 FAIL (RED)**, sonrası **4 PASS (GREEN)**. Etkileşimli öğelerin global odak kuralı ve masaüstü `.72`/blur değeri korundu. Hero pill seçicileri `.control:hover/active` kurallarından daha özgüldür. Bu denetim kaynak değerlerini doğrular; tarayıcı görünümünü doğrulamaz.
- `npm test -- tests/unit/login-ui.test.tsx tests/unit/register-ui.test.tsx tests/unit/navbar-scroll.test.tsx --maxWorkers=2`: başlangıçta **37/37 PASS**.
- Düzeltmelerden sonra `npm test -- --maxWorkers=2`: **66 dosya, 1046/1046 PASS**. Şifre göster/gizle, `aria-pressed`, odak ve gönderim davranışı testleri zayıflatılmadı; test dosyaları değiştirilmedi.
- `npm run lint`, `npm run typecheck`, `npm run build`, `npm run check:assets` ve `git diff --check`: **PASS**. Varlık kontrolü: 18 kayıt, 112 v3 çıktı ve 20 hero katmanı doğrulandı.
- Tarayıcı ekran testi **Claude doğrulayacak**: iOS Safari programatik odak çerçevesi, hero üzerindeki Menü/Sepet pill okunurluğu (≤359 px dahil), giriş/kayıt şifre alanının gerçek yerleşimi ve kaydırma sonrası mobil başlığın örtücülüğü. AGENTS.md gereği Playwright, Lighthouse, inspect ve simülatör çalıştırılmadı.
- Uygulanamayan kod adımı yok. Task 140 açıkça 21st MCP gerektirmediğinden kullanılmadı; yeni bileşen veya bağımlılık eklenmedi.

## Düzeltme 140-1

Canlı ekran testi (WebKit iPhone 15 Pro + SE, 26 Eki): madde 1, 2, 4 tamam; Menü/Sepet pill'leri okunuyor, mobil başlık örtücü, toptan odak çerçevesi yok (`outline: none` ölçüldü).

**Madde 3 eksik:** göz düğmesi input'un içinde ama `ghost` varyantı `bg-background` (rgb(14,21,16)) ve `size-11`/`min-h-11` (44×44) getiriyor. Input da 44 px yüksek; düğme input'un sağ ~50 px'lik kısmının dolgusunu ve üst/alt kenarlığını tamamen örtüyor. Görünüm: kutu yine "kısa", sağda kopuk bir kenarlık parçası.

İstenen (yalnız `components/account/Membership.module.css` `.password button`):
- `background: transparent;` ve hover/active/focus'ta da şeffaf kalsın (Tailwind `hover:bg-accent`'i ezecek özgüllükle, ör. `.password button, .password button:hover, .password button:active { background: transparent; }`).
- `min-height: 0; min-width: 0; width: 36px; height: 36px; right: 4px;` (input kenarlığının içinde kalsın; 44 px input'ta üst/alt 4 px boşluk).
- Simge rengi `var(--sut)` / mevcut foreground; focus-visible çerçevesi korunur.
- JSX'e dokunma. Testler yeşil kalsın.

## Durum: BEKLİYOR (Düzeltme 140-1)
