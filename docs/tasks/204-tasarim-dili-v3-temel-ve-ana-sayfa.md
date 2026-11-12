# Task 204: Tasarım dili v3 "Altın Dal" — temel + ana sayfa

> **Uygulayan ajan için:** adımlar sırayla, her adım tek iş. Kutular (`- [ ]`) ilerleme takibidir. Sözleşme: `docs/DESIGN.md` (v3) + `docs/MASTER-PROMPT.md` (v2.0). Çelişkide müşteri BRIEF'i > MASTER-PROMPT > DESIGN.md > bu dosya.

**Amaç:** Müşterinin beğenmediği v2 görünümünü; yeni yazı çifti (Cormorant + Montserrat), altın madalyonlu hap düğme, adaçayı zeminli ürün kartı ve zengin fotoğraf yüzeyleriyle değiştirmek. Bu görev temeli ve **yalnız ana sayfayı** teslim eder; müşteri onayı (K5) sonrası 205–206 kalan sayfalara yayar.

**Yaklaşım:** Token ve font değişimi `app/globals.css` + `app/layout.tsx` içinde; düğme/etiket/mühür/madalyon/başlık parçaları `components/storefront/ui/` altında tek kaynaktır; ana sayfa bölümleri bu parçalarla yeniden giydirilir. İçerik, sıra, bağlantılar ve iş mantığı değişmez.

**Yığın:** Next.js 16 App Router, React 19, TypeScript strict, Tailwind 4 `@theme`, CSS Modules, `motion/react`, lucide-react, vitest, Playwright (repo içi).

## Tür
frontend

## Bağımlılık
`0dd0222` (canlıdaki v2). Tasarım araştırması ve karar kaydı: `docs/DESIGN.md` → "Neden değişti".

## Genel kısıtlar (her adım için geçerli)
- İçerik ve sıra BRIEF'teki gibi (MASTER-PROMPT §11.1); müşteri metinleri birebir (§10).
- Dokunulmaz: `lib/auth/*`, `lib/db/*`, `lib/cart/*`, `lib/checkout/*`, `lib/payments/*`, `lib/orders/*`, `app/api/*`, `app/admin` yetki mantığı, sayfa adresleri, CSP. `components/catalog/AddToCart` içinde **yalnız görünüm** (markup/sınıf) değişir; durum ve sepet çağrıları aynı kalır.
- Yeni paket yok. Yeni görsel/video üretimi yok (§3 varlıkları).
- Kaydırmaya bağlı hareket, sabitleme, sayfa düzeyinde snap, cam/bulanıklık, sürekli oynayan süs yok (§6, §8).
- Mühür yalnız Hasat "%100 Doğal ve Katkısız" maddesinde (ve 206'da Hakkımızda).
- Push, yayın, Vercel, canlı DB, `.env*` yok; `node_modules` / `.next` silinmez; `AFINA-KAYNAK/` ve `output/` git'e eklenmez (§15).
- Yüklenecek rehberler: `ui-ux-pro-max`, `frontend-design`, `better-typography`, `better-colors`, `better-layout`, `motion-framer`, `responsiveness-check`, `audit-ai-design-slop`. 21st MCP: `docs/DESIGN.md` → Agent Prompt Guide listesindeki 6 bileşen `search` → `get_component` ile incelenir, tokenlara uyarlanır; erişim yoksa Coder Notu'na yazılır.

## Denetimde özellikle bakılacaklar (testleri ilgili adımlara eklendi)
1. **Türkçe harf ve büyük harf:** üst etikette "İNCELEYİN / HİKAYEMİZ" doğru noktalı İ ile ve Cormorant/Montserrat glifleriyle çizilir (yedek fonta düşmez). → Adım 2 ve 9.
2. **Dar ekranda uzun etiket:** 320 px'te "Hakkında Bilgi Alın", "Hikayemizi Keşfet", "Bayilik Başvurusu" düğmeleri kırılmaz, taşmaz. → Adım 4 ve 9.
3. **Parlak video karesinde altın düğme ve fildişi başlık:** en açık karede de 4,5:1 (başlık 3:1). → Adım 9.
4. **Font yüklenmeden önce/sonra sıçrama:** CLS < 0,05; `next/font` ölçü eşlemesi açık. → Adım 2 ve 9.
5. **Stok yok + azaltılmış hareket + JS kapalı:** "Mevcut değil" düğmesi okunur ve madalyonsuz; hareket kapalıyken sepete ekleme geri bildirimi metinle görünür; JS'siz sayfada bütün içerik ve bağlantılar görünür. → Adım 5 ve 9.

---

## Dosya haritası

| Dosya | İş |
|---|---|
| `app/layout.tsx` (değişir) | Fontlar: Cormorant → `--font-cormorant`, Montserrat → `--font-montserrat`; Fraunces/Figtree kaldırılır |
| `app/globals.css` (değişir) | `--sf-*` tokenları DESIGN.md Quick Start ile birebir; eski yarıçap tokenları silinir; `@theme` font eşlemesi |
| `app/fonts/*` (silinir) | Fraunces, Figtree, Inter dosyaları + `scripts/optimize-fraunces.py` (başvuru kalmadığı `rg` ile kanıtlanır) |
| `components/storefront/ui/PillButton.tsx` + `.module.css` (yeni) | Hap düğme, 4 varyant, madalyon |
| `components/storefront/ui/Tag.tsx`, `Stamp.tsx`, `Medallion.tsx`, `SectionHeading.tsx`, `OliveBranch.tsx` + ortak `ui.module.css` (yeni) | Ortak parçalar |
| `components/catalog/AddToCart.tsx` (yalnız görünüm) | `PillButton` ile çizilir; "Eklendi" durumu |
| `components/storefront/ProductTile.tsx` + `.module.css` (değişir) | Adaçayı zeminli kart |
| `components/storefront/StoreHeader.tsx`, `StoreMenu.tsx`, `Navigation.module.css`, `StoreFooter.tsx` (değişir) | Menü, çekmece, alt bilgi |
| `components/storefront/HeroVideo.tsx`, `StoreHome.tsx`, `StoreHome.module.css` (değişir) | Ana sayfa bölümleri |
| `tests/unit/design-tokens-204.test.ts`, `tests/unit/pill-button-204.test.tsx`, `tests/unit/storefront-home-204.test.tsx` (yeni) | Sözleşme testleri |
| `tests/unit/bootstrap.test.ts`, `tests/e2e/fonts.spec.ts`, `tests/unit/storefront-home-198.test.tsx` ve kırılan diğerleri (güncellenir) | Eski font/sınıf beklentileri |
| `scripts/qa-design-v3.mjs` (yeni) | Tarayıcı ölçümü (adım 9) |

## Arayüzler (205–206 bunlara güvenir; adlar ve türler değişmez)

```ts
// components/storefront/ui/PillButton.tsx
export type PillVariant = "primary" | "gold" | "outline" | "quiet";
export type PillIcon = "arrow" | "cart" | "check" | "plus" | "none";
export type PillButtonProps = {
  variant?: PillVariant;      // varsayılan "primary"
  icon?: PillIcon;            // varsayılan "arrow"; quiet'te her zaman "none"
  size?: "md" | "lg";         // md 44 px (kompakt kart, panel), lg tokendaki yükseklik (varsayılan)
  href?: string;              // varsa next/link <a>, yoksa <button type="button">
  fullWidth?: boolean;
  busy?: boolean;             // aria-busy="true" + tıklanamaz + madalyonda dönen halka
  disabled?: boolean;         // madalyon çizilmez
  children: React.ReactNode;  // etiket; tek satır
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children">;
export function PillButton(props: PillButtonProps): React.JSX.Element;
// DOM sözleşmesi: kök öğede data-pill ve data-variant="<variant>"; madalyon <span data-coin aria-hidden="true">.

// components/storefront/ui/Tag.tsx
export function Tag(props: { tone?: "sage" | "gold"; icon?: LucideIcon; children: React.ReactNode }): React.JSX.Element;
// components/storefront/ui/Stamp.tsx — durağan SVG; role="img" aria-label={label}
export function Stamp(props: { label: string; tone?: "light" | "dark"; size?: number }): React.JSX.Element;
// components/storefront/ui/Medallion.tsx
export function Medallion(props: { icon: LucideIcon; tone?: "light" | "dark" }): React.JSX.Element;
// components/storefront/ui/SectionHeading.tsx
export function SectionHeading(props: { eyebrow?: string; title: string; lead?: string; tone?: "light" | "dark"; align?: "start" | "center"; as?: "h1" | "h2" }): React.JSX.Element;
// components/storefront/ui/OliveBranch.tsx — süs; aria-hidden
export function OliveBranch(props: { tone?: "olive" | "gold"; className?: string }): React.JSX.Element;
```

---

## Adımlar

### Adım 0 — Araç ve başlangıç doğrulaması
- [ ] `git status` temiz, HEAD `0dd0222` üstü; `npm run test` başlangıç sonucu `output/task204/baseline.log`.
- [ ] 21st erişimi (`21st/search "pill button"`), `motion` sürümü, Playwright chromium + webkit; sonuç `output/task204/PLAN.md` başına.
- [ ] `ui-ux-pro-max` aramaları (ham çıktı `output/task204/sources/`): `"olive oil food artisan ecommerce premium natural" --design-system --variance 6 --motion 3 --density 4` · `"product card mobile commerce" --domain ux` · `"add to cart feedback" --domain ux` · `"touch target spacing" --domain ux` · `"font loading swap" --stack nextjs`. DESIGN.md ile çelişen öneri uygulanmaz; PLAN.md'ye "reddedildi + neden".

### Adım 1 — Tokenlar (RED → GREEN)
- [ ] `tests/unit/design-tokens-204.test.ts` yaz:
```ts
const css = readFileSync("app/globals.css", "utf8");
for (const [name, value] of Object.entries({
  "--sf-green-deep": "#1A2B1E", "--sf-olive": "#5C6B3A", "--sf-sage": "#E7EBDD",
  "--sf-gold-deep": "#80602D", "--sf-radius-pill": "999px", "--sf-radius-card": "24px",
  "--sf-radius-field": "12px", "--sf-radius-hero": "32px",
})) expect(css).toMatch(new RegExp(`${name}:\\s*${value}`, "i"));
for (const dead of ["--sf-radius-action", "--sf-radius-button", "--sf-radius-harvest", "--sf-radius-cart-card", "--sf-radius-drawer", "--sf-radius-video"])
  expect(css).not.toContain(dead);
const used = execSync("rg -o --no-filename 'var\\(--sf-radius-[a-z-]+' app components").toString();
expect([...new Set(used.split("\n").filter(Boolean))].every(v => /pill|card|field|round|hero|arch/.test(v))).toBe(true);
```
- [ ] Çalıştır: `npx vitest run tests/unit/design-tokens-204.test.ts` → FAIL (çıktı `output/task204/red.log`).
- [ ] `app/globals.css` tokenlarını DESIGN.md Quick Start ile birebir yap; eski yarıçap tokenlarını kullanan her kuralı köşe tablosundaki karşılığına bağla (ölçü tabloya göre **değişir**).
- [ ] Aynı test → PASS.

### Adım 2 — Fontlar (RED → GREEN)
- [ ] Aynı test dosyasına ekle:
```ts
const layout = readFileSync("app/layout.tsx", "utf8");
expect(layout).toMatch(/Cormorant/); expect(layout).toMatch(/Montserrat/);
expect(layout).toMatch(/latin-ext/); expect(layout).not.toMatch(/Fraunces|Figtree|Inter-tr/);
expect(css).toMatch(/--font-display:\s*var\(--font-cormorant\)/);
expect(css).toMatch(/--font-body:\s*var\(--font-montserrat\)/);
```
- [ ] FAIL gör; `app/layout.tsx` içinde `next/font/google` ile `Cormorant({ weight: ["600","700"], style: ["normal","italic"], subsets: ["latin","latin-ext"], display: "swap", variable: "--font-cormorant" })` ve `Montserrat({ subsets: ["latin","latin-ext"], display: "swap", variable: "--font-montserrat" })`; `<html lang="tr">` korunur. Derlemede indirme hatası olursa DESIGN.md'deki yerel dosya yoluna geç ve Coder Notu'na yaz.
- [ ] Eski font dosyaları + `scripts/optimize-fraunces.py`: `rg -n "Fraunces|Figtree|Inter-tr|optimize-fraunces" app components lib scripts tests` → kalan başvuruları temizle, dosyaları sil; liste Coder Notu'na.
- [ ] `tests/unit/bootstrap.test.ts`, `tests/e2e/fonts.spec.ts` yeni fontlara göre güncelle (beklenti: `h1` ailesi Cormorant, `body` ailesi Montserrat, "İ ı ş ğ ç ö ü" için `document.fonts.check` true).
- [ ] PASS; `npm run build` PASS.

### Adım 3 — PillButton (RED → GREEN)
- [ ] `tests/unit/pill-button-204.test.tsx` yaz:
```tsx
render(<PillButton href="/urunler" variant="gold">Ürünleri İnceleyin</PillButton>);
const link = screen.getByRole("link", { name: "Ürünleri İnceleyin" });
expect(link).toHaveAttribute("data-pill"); expect(link).toHaveAttribute("data-variant", "gold");
expect(link.querySelector("[data-coin]")).toHaveAttribute("aria-hidden", "true");

render(<PillButton busy icon="cart">Sepete ekle</PillButton>);
const busy = screen.getByRole("button", { name: "Sepete ekle" });
expect(busy).toHaveAttribute("aria-busy", "true"); expect(busy).toBeDisabled();

render(<PillButton disabled>Mevcut değil</PillButton>);
expect(screen.getByRole("button", { name: "Mevcut değil" }).querySelector("[data-coin]")).toBeNull();

render(<PillButton variant="quiet" href="/blog">Tüm yazılar</PillButton>);
expect(screen.getByRole("link", { name: "Tüm yazılar" }).querySelector("[data-coin]")).toBeNull();
```
- [ ] FAIL gör; `PillButton.tsx` + `.module.css` yaz (ölçü, renk, durum, geçiş: DESIGN.md → PillButton tablosu). Hover/basış CSS ile; ek Motion bileşeni gerekmez.
- [ ] PASS.

### Adım 4 — Tag, Stamp, Medallion, SectionHeading, OliveBranch
- [ ] `tests/unit/pill-button-204.test.tsx` içine ekle: `Stamp` `role="img"` + `aria-label` taşır ve animasyon sınıfı içermez; `SectionHeading` `eyebrow` verildiğinde başlıktan önce gelir ve `as="h1"` tek h1 üretir; `OliveBranch` `aria-hidden="true"`.
- [ ] FAIL → parçaları yaz → PASS.

### Adım 5 — Sepete ekle görünümü + ürün kartı
- [ ] `tests/unit/storefront-home-204.test.tsx` yaz: ürün kartında `[data-pill][data-variant="primary"]` "Sepete ekle" ve `quiet` "Teklife ekle" (`/toptan-satis?teklif=<id>`); stok 0 ürününde "Mevcut değil" `disabled` ve madalyonsuz; boy etiketi `Tag`; mevcut sepet birim testleri (`cart-131`, `storefront-product-198`) değişmeden PASS.
- [ ] FAIL → `AddToCart` görünümünü `PillButton`'a taşı ("Eklendi" 1,6 sn; azaltılmış harekette yalnız metin değişir), `ProductTile` kartını DESIGN.md "Ürün kartı"na göre yeniden kur → PASS.

### Adım 6 — Üst menü, çekmece, alt bilgi
- [ ] Testi genişlet: menüde 5 bağlantı + hesap + sepet hapı (adet rozeti); çekmecede `gold` "Ürünleri İnceleyin"; alt bilgide `gold` "Teklif İste" (`/toptan-satis`) ve ödeme logoları. Mevcut `storefront-navigation-198/199` (Esc, odak dönüşü) PASS kalır.
- [ ] DESIGN.md "Üst menü" ve "Alt bilgi"ye göre uygula → PASS.

### Adım 7 — Ana sayfa bölümleri
- [ ] Testi genişlet: bölüm sırası §11.1 ile aynı (11 bölüm, `data-section` adları korunur); tek `h1`; hero'da tek `gold` düğme; "Öne Çıkan Ürünler" bölümünde `data-tone="dark"`; Hasat'ta tam 1 `Stamp` ve etiketi "%100 Doğal ve Katkısız"; sayfada başka `Stamp` yok; koyu bant sayısı (alt bilgi hariç) ≤ 2; müşteri metinleri §10 ile birebir (mevcut `customer-home-192` / `customer-originality-196` beklentileri PASS).
- [ ] DESIGN.md Components + Surfaces'a göre her bölümü uygula. `whileInView` yalnız Hikayemiz ve 3'lü banner'da (`once: true`).

### Adım 8 — Eski testlerin uyarlanması ve kod kapıları
- [ ] Kırılan eski beklentiler (sınıf adı, font, köşe) yeni sözleşmeye uyarlanır; davranış beklentileri silinmez. Liste Coder Notu'na.
- [ ] `npm run lint` · `npm run typecheck` · `npm run test` · `npm run build` · `git diff --check` → hepsi PASS; çıktılar `output/task204/`.

### Adım 9 — Tarayıcı ölçümü (`scripts/qa-design-v3.mjs`)
Yerel production sunucusu (`output/task201/run-clean.mjs` yolu; yalnız `afina_kontrol189`). Ana sayfa × 320×568, 390×844 (WebKit), 768×1024, 1024×768, 1440×900, 1920×1080:
- [ ] Her `[data-pill]`: yükseklik ≥ 44, `border-radius` ≥ yükseklik/2, etiket tek satır, kutu görünüm alanı içinde; `[data-variant="quiet"]` dokunma alanı ≥ 44.
- [ ] `getComputedStyle(h1).fontFamily` Cormorant, `body` Montserrat; `document.fonts.check('700 48px Cormorant', 'İıŞşĞğÇçÖöÜü')` true; büyük harfli üst etiket metninde "İ" var, "I" yok.
- [ ] Hero: video karelerinden en açık 3 örnekte başlık ≥ 3:1, açıklama ve düğme ≥ 4,5:1 (piksel örneklemesi; sonuç `KONTRAST.md`).
- [ ] Yatay taşma 0 · konsol hatası 0 · kırık görsel 0 · `scripts/qa-storefront-collisions.mjs` 0 · axe karşıtlık 0 · CLS < 0,05 · telefon LCP ≤ 2,5 sn (4G + CPU×4) · ilk JS mevcut değerin (telefon 244 KB) altında.
- [ ] Azaltılmış hareket ve JS kapalı: içerik ve düğmeler görünür; "Mevcut değil" okunur.
- [ ] Ekran görüntüleri `output/task204/ekran/ana-sayfa-{320,390,768,1440}-{ilk,tam}.png` + ürün kartı ve düğme durumları (`dugme-durumlari.png`: 4 varyant × duran/hover/odak/busy/disabled).

### Adım 10 — Teslim
- [ ] `output/task204/KANIT.md`: MASTER-PROMPT §14 maddeleri + §14.1 (v2.0) 12 madde PASS/FAIL + "Denetimde özellikle bakılacaklar" 5 madde kanıtı.
- [ ] Bu dosyaya `## Coder Notu (<ajan>)` + `## Durum: TAMAMLANDI (<ajan>) — K5 kullanıcı onayı bekliyor`.
- [ ] Tek kayıt: `feat: 204 tasarım dili v3 temeli ve ana sayfa`. Son satır: `204 BİTTİ`.

## Kabul kriterleri
- [ ] Adım 8 ve 9'daki bütün ölçümler PASS; kanıt dosyaları yerinde.
- [ ] `rg -n "Fraunces|Figtree" app components lib` → 0; `rg -n "border-radius:\s*[0-9]" components/storefront` → yalnız token kullanımı (ham piksel yarıçapı yok).
- [ ] `git diff 0dd0222 --name-only -- lib/auth lib/db lib/cart lib/checkout lib/payments lib/orders app/api` → boş.
- [ ] Ana sayfa dışındaki sayfalar bozulmadan açılır (token değişimi nedeniyle görünümleri kayabilir; 205–206 düzeltir): 36 rota 200/beklenen durum, konsol hatası 0.

## Yapılmaması gerekenler
Kalan sayfaların yeniden tasarımı (205–206) · yeni metin/iddia · önizleme PDF/video hazırlamak (kullanıcı istemiyor) · push/yayın.

## Coder Notu (fable)

Uygulama 12 Kasım 2026'da tamamlandı. Kanıt: `output/task204/KANIT.md`, ölçüm `output/task204/qa.log` + `olcum.json`, karşıtlık `output/task204/KONTRAST.md`, ekran görüntüleri `output/task204/ekran/`.

**Sonuçlar:** lint PASS · typecheck PASS · test 147 dosya / 1308 test PASS (6 dosya / 26 test başlangıçtaki gibi atlandı: yerel Postgres) · build PASS · `git diff --check` PASS · `scripts/qa-design-v3.mjs` hata listesi boş (6 görünüm) · çakışma testi 30 profil 0 çakışma · 36 rota 35×200 + 1×404 · telefon LCP 2,03 sn (DPR 1) / 2,06 sn (DPR 3), ilk JS 218,8 KB, CLS 0.

**Silinenler (başvuru kalmadığı `rg` ile doğrulandı):** `app/fonts/*` (Fraunces, Figtree, Inter + lisans metinleri), `scripts/optimize-fraunces.py`, `lib/media/pro-fonts.json` (yalnız silinen font dosyalarını anlatan, hiçbir yerden okunmayan kayıt), `components/catalog/PurchaseButton.tsx` (tek kullanıcısı `AddToCart` artık `PillButton` çiziyor).

**21st:** erişim vardı; `docs/DESIGN.md` listesindeki 6 bileşen `get_component` ile okundu, tokenlara uyarlandı (ayrıntı `output/task204/PLAN.md`). Yeni paket eklenmedi.

**Uyarlanan eski beklentiler (davranış silinmedi):**
- `bootstrap.test.ts`: `next/font` taklidi Cormorant + Montserrat.
- `product-detail-130`, `storefront-feedback-191` ve 4 e2e dosyası: "Eklendi ✓" → "Eklendi" (onay işareti artık madalyonda).
- `storefront-feedback-191`: stoksuz düğmede satır içi `transform: none` yerine "madalyon yok, satır içi hareket yok".
- `navbar-menu-174`: çekmecedeki son odaklanabilir öğe artık "Ürünleri İnceleyin".
- `footer-127`, `payment-logos-132`: alt bilgide ödeme logoları kâğıt hap içinde, bu yüzden koyu çizimler (`*-dark.svg`).
- `faq-contact-footer`: "Toptan Satış" bağlantısı `footer nav` içinde aranıyor (aynı adrese giden "Teklif İste" düğmesi eklendi).
- `tests/e2e/fonts.spec.ts`: yeni fontlar.
- `scripts/qa-storefront-collisions.mjs`: bütün yazısı fotoğraf üstü katmanda olan kartlar (4 kutu, üçlü banner) "ölçülecek yazı yok" diye düşmüyor; bu kartların okunurluğu `qa-design-v3.mjs` içinde piksel örneklemesiyle ölçülüyor.

**DESIGN.md / görev dosyasından sapmalar ve nedenleri:**
1. Font çağrısı görevdeki tek satır değil: Cormorant dik (600/700, ön yükleme yalnız latin) + ayrı italik 700 (ön yüklemesiz); Montserrat latin + latin-ext ön yüklü. Neden: tek çağrı 6 dosya / 239 KB ön yüklüyordu ve gerçek telefon yoğunluğunda LCP 5,1 sn çıktı. Bütün Türkçe glifler yine kendi alan adımızdan geliyor.
2. Telefon posteri her yoğunlukta 720 sürümü (`hero-poster.ts`); telefon zaten 720p video oynatıyor. Video öğesi posterden 1 px kısa: aynı kare olduğu için en büyük boyama poster olarak kalıyor (yoksa videonun ilk karesi 5–6. saniyede yeni LCP adayı oluyordu).
3. Token testi `rg` çalıştırmak yerine aynı taramayı Node ile yapıyor (CI'da `rg` olmayabilir).
4. `gold` düğmede odak halkası koyu altın değil fildişi: koyu zeminde koyu altın 2:1 kalıyordu.
5. `outline` hover'da yeşile dolar (DESIGN yalnız dolgulu varyantları tarif ediyordu).
6. Ürün kartında adaçayı alan kartın içinde 12 px köşeyle duruyor ve boy etiketi kâğıt zeminli: adaçayı etiket adaçayı zeminde görünmüyordu.
7. 4 kutu: 1100 px altında 2×2 (tablet 4:3, telefon 3:4, madalyon sağ üstte), 360 px altında tek sütun 16:10. Neden: "Hakkında Bilgi Alın" 320'de tek satır kalmalı.
8. Öne Çıkan: masaüstünde yatay kartlı 2×2 ızgara (mevcut `data-product-layout="paired"` sözleşmesi + ilk raftan farklı yerleşim); telefonda 2 sütun kompakt, 360 altında tek sütun.
9. Üçlü banner: telefonda 1 geniş + 2 yarım, 360 altında tek sütun (yarım kartta 3 satıra bölünen başlık koyulaştırmanın üstüne çıkıp 1,5:1'e düşüyordu).
10. Hasat: mühür dördüncü madde olarak üç adımın yanında; yanındaki görünen yazı `aria-hidden` (mühür aynı adı `role="img"` ile taşıyor, iki kez okunmasın).
11. Üst menü: sepet hapında "Sepet" yazısı yok (mevcut erişilebilirlik sözleşmesi: düğmenin tek metni rozet). Çekmecede `gold` düğme yeşil bir alt bloğun üstünde: kâğıt zeminde altın dolgu 2:1 kalıyordu.
12. Hero'ya tek satır açıklama olarak marka ikincil cümlesi eklendi ("Toprağın sunduğu lezzet, Afina'nın özeniyle."); başlığın ikinci satırı italik (DESIGN'ın izin verdiği tek italik).
13. Blog kartlarında "Yazıyı oku" kaldırıldı (kartın tamamı bağlantı, okuma süresi gösteriliyor).
14. Boşluklarda 12, 20 ve 40 px de kullanıldı (8 px ölçeğinin dışında, 4 px katı).
15. `AddToCart`: sepet hazır olmadan önce düğme `disabled` yerine `aria-disabled` taşıyor (görünüm sabit kalsın diye; tıklama eskisi gibi etkisiz). "Eklendi" süresi 2,4 → 1,6 sn (DESIGN).
16. Adım 0 başlangıcı `0dd0222` değil onun üstündeki belge kaydı `5fd5634`.

**Onay bekleyen yeni metin:** Hasat üst etiketi "Ellek zeytinlikleri" (DESIGN bu bölümde üst etiket istiyor, metnini vermiyor; sitedeki mevcut "Ellek zeytinliklerinden gelen" cümlesinden alındı). İstenmezse `StoreHome.tsx` içinde tek satır.

**Bekleyenler / yapılmayanlar:** Playwright e2e takımı çalıştırılmadı (yapılandırma kendi sunucusunu açıyor); WebKit'te CLS ölçülemiyor; Firefox ve gerçek cihaz 207'de. Ana sayfa dışındaki sayfalar yalnız "açılıyor, konsol hatası yok" düzeyinde doğrulandı; yeni tokenlar yüzünden görünümleri kısmen değişti (düğmeler hap, köşeler 12/24), asıl tasarımları 205–206'da.

## Durum: TAMAMLANDI (fable) — K5 kullanıcı onayı bekliyor


## K5 sonucu (Claude, 12 Kasım)
Kullanıcı ana sayfayı onayladı ("olur ok"). Higgsfield aday görselleri de onaylandı.

## Düzeltme 204-1 — onaylı Higgsfield görsellerinin yerleştirilmesi
Kaynak (git dışı): `AFINA-KAYNAK/higgsfield-2026-11-12/*.png` + `LISTE.md` (GPT Image 2.5 Flare, 2K; yazı/logo/yüz yok; temsili). Kullanıcı 12 Kasım'da onayladı; MASTER-PROMPT §3 buna göre güncellendi.

| Dosya | Nereye | Not |
|---|---|---|
| `hikaye-ana.png` (3:4) | Ana sayfa Hikayemiz büyük görsel | "Nesillerin Emeği" müşteri görseli gelene kadar; tek dosyadan değiştirilebilir kalsın |
| `hikaye-dal.png` (1:1) | Hikayemiz küçük bindirme görseli | |
| `zeytinyagi-dikey.png` (3:4) | Üçlü banner "Zeytinyağı" + 4 kutu "Zeytinyağı" | Aynı fotoğraf sayfada en çok 2 kez |
| `zeytin-kase.png` (3:4) | 4 kutu "Zeytin" | |
| `zeytinyagi-yatay.png` (16:9) | Blog "Natürel Sızma Zeytinyağı Nasıl Saklanmalı?" kapağı | 205'te zeytinyağı kategori başlığında da kullanılabilir |
| `blog-salamura.png` (3:2) | Blog "Salamura Zeytin Nasıl Hazırlanır?" kapağı | |
| `blog-kirma.png` (3:2) | Blog "Kırma Zeytin Nedir, Nasıl Saklanır?" kapağı | |
| `blog-sofra.png` (3:2) | Blog "Sofralık Zeytin Seçerken Nelere Dikkat Edilmeli?" kapağı | |

Yapılacak: PNG'ler projenin mevcut görsel hattıyla (AVIF + WebP, doğru genişlikler, `lib/media/*.json` kaydı, `V3Picture`, anlamlı Türkçe `alt`) `public/images/` altına işlenir; ham 4–6 MB PNG repoya girmez. Hedef orana kırpma odak noktası korunarak yapılır (eller, kase, şişe ağzı kadraj içinde). Yerleşim sonrası: aynı fotoğrafın ana sayfada 2'den fazla tekrarı kalmaz; `npm run check:assets` (varsa) + birim testleri + `scripts/qa-design-v3.mjs` ana sayfa ölçümleri (fotoğraf üstü yazı karşıtlığı, LCP ≤ 2,5 sn, CLS) yeniden PASS. Fotoğraf üstü yazı okunmuyorsa yalnız koyulaştırma ayarlanır. Kayıt: `feat: 204-1 onaylı Higgsfield görselleri`.
Ayrıca 204'te çalıştırılamayan Playwright e2e takımı: yerel sertifika/sunucu sorununu çöz ya da takımı `output/task201/run-clean.mjs` sunucusuna karşı çalıştır; güncellenen 5 e2e dosyası PASS olmalı (olmuyorsa nedeni Coder Notu'na).
