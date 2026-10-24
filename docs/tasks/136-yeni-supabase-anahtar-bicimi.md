> ONAY VERİLDİ (kullanıcı, 24 Eki 2026): "eksikleri düzenle". Cihaz testinde bulunan eksikler.
> Not: Bu dosyanın önceki hâlindeki "yeni anahtar biçimi" teşhisi yanlıştı. Asıl neden Vercel'de NEXT_PUBLIC_* değişkenlerinin "sensitive" tipte olmasıydı (CI'da boş çekiliyordu). Claude bunu 22 Eki'de düzeltti. Görev aşağıdaki gerçek eksiklerle yeniden yazıldı.

# Task 136: Şifre kuralı 10, admin yapılandırma 503, güvenlik başlıkları, kararsız test

## Tür
fullstack (yerel)

## Kullanılacak araçlar
`tdd-workflow`, `security-review`, `backend-patterns`; UI kısmı için `ui-ux-pro-max`, `better-layout`. Coder Notu'na skill tablosu ekle.

## İstenen
1. **Kayıt şifre kuralı = canlı Supabase ayarı.** Canlıda: en az 10 karakter, en az bir **ASCII** küçük harf (a-z), bir ASCII büyük harf (A-Z) ve bir rakam (Supabase `password_required_characters` yalnız ASCII sınıflarını sayar; "Ş", "Ç" büyük harf sayılmaz).
   - `lib/auth/adapter.ts:28,35-36` ve kayıt formundaki ipucu/güç göstergesi bu kurala geçer. Mesaj: "Şifre en az 10 karakter olmalı; en az bir büyük harf (A-Z), bir küçük harf (a-z) ve bir rakam içermeli." Üst sınır 128 kalır.
   - `supabase/config.toml` `minimum_password_length = 10`, `password_requirements = "lower_upper_letters_digits"`.
   - Supabase'in kendi şifre hatası (weak_password vb.) gelirse kullanıcıya aynı Türkçe mesaj gösterilir, ham İngilizce hata gösterilmez.
2. **Admin yapılandırma hatası 503.** Supabase/env yapılandırması eksik veya geçersizse `/admin` ve `/api/admin/*` 500 yerine 503 ve sade bir Türkçe sayfa/JSON döner ("Yönetim paneli şu an yapılandırılıyor."). Gizli değer veya ham hata sızmaz.
3. **Güvenlik başlıkları** (`next.config.ts` `headers()`), tüm yollar:
   - `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`.
   - `Content-Security-Policy`: önce **Report-Only** olarak ekle (`default-src 'self'`; Supabase URL'si connect-src'ye; PayTR iframe/form alanları için ileride gereken kaynakları yorumla not et; Next inline script/style ihtiyacını nonce ya da gerekli en dar izinle karşıla). Site hiçbir sayfada kırılmamalı.
4. **Yapışkan sepet çubuğu** (telefonda alttaki "Ara toplam / Sepet" çubuğu) `/giris`, `/kayit`, `/hesabim`, `/odeme`, `/kvkk`, `/iade`, `/mesafeli-satis` sayfalarında gösterilmez; ana sayfa ve `/sepet` davranışı aynı kalır.
5. **Kararsız test:** `tests/unit/account-ui.test.tsx:86` (çıkış 429 sonrası odak) ara sıra düşüyor. Zamanlamaya bağlılığı gider (fake timers/`findBy`/`waitFor`), 20 ardışık koşuda yeşil kalmalı.
6. **Belge:** `docs/yayin/vercel-env.md`: production'da `NEXT_PUBLIC_*` değişkenleri "sensitive" değil "encrypted" tipte olmalı; sensitive olursa `vercel pull` boş getirir ve istemciye boş gömülür. Sunucu-yalnız sırlar sensitive kalabilir.

## Kabul kriterleri
- [ ] 9 karakterlik ya da yalnız "Ş" büyük harfli şifre istemcide ve sunucuda reddedilir; 10 karakter + A-Z + a-z + rakam kabul edilir.
- [ ] Yapılandırma eksikken `/admin` 503 (test).
- [ ] `curl -I` ile 5 başlık görünür; CSP Report-Only; ana sayfa, sepet, kayıt, admin konsolda CSP kaynaklı kırılma yok (headless WebKit + Chromium).
- [ ] Yapışkan çubuk listelenen sayfalarda yok, ana sayfada var (390 px).
- [ ] `account-ui` testi 20 koşu yeşil; `npm test`, lint, typecheck, build yeşil.

## Yapılmaması gerekenler
- Canlı Supabase/Vercel ayarına dokunma; `.env*` okuma/yazma.
- Ürün metinleri, fiyatlar, tasarım değişikliği (madde 4 hariç).
- `docs/tasks` içinde yalnız Coder Notu/Durum (`docs/yayin/vercel-env.md` bu görevin çıktısıdır).

## Coder Notu

24 Ekim 2026 — Yerel uygulama ve komutla doğrulama tamamlandı. Canlı Supabase/Vercel ayarları değiştirilmedi; `.env*` dosyalarına müdahale edilmedi. Son unit/lint/typecheck/build ve HTTP doğrulamalarında araçların `.env*` içeriklerini yüklemesi, Git dışındaki `.cache/task136-no-env.cjs` preload'u ile engellendi.

| Skill / araç | Kullanım |
| --- | --- |
| `tdd-workflow` (`.agents/skills/tdd-workflow/SKILL.md`) | Önce kabul testleri: RED'de 35 başarısız / 71 başarılı; düzeltmeden sonra aynı hedefler yeşil. RED checkpoint'i `929ecf1` yalnız yerelde tutuldu; push öncesinde GREEN kanıtı korunarak tek görev commit'inde birleştirildi. |
| `security-review` (`.agents/skills/security-review/SKILL.md`) | ASCII şifre sınırları, yapılandırma hatalarında güvenli 503, sunucu sırlarının yanıta/CSP'ye sızmaması ve mevcut admin/Origin kontrolleri. |
| `backend-patterns` (`.agents/skills/backend-patterns/SKILL.md`) | Ağ çağrısı yapmayan yapılandırma kontrolü; proxy'de stream başlamadan HTTP 503, doğrudan API/işlem katmanında aynı koruma. |
| `ui-ux-pro-max` (`/Users/emre/.codex/skills/ui-ux-pro-max/SKILL.md`) | Yerel `error clarity` UX araması; alanla ilişkili Türkçe ipucu/hata, mevcut parola görünürlük kontrolü ve erişilebilir güç göstergesi. Skill zaten kurulu, ek kurulum yapılmadı. |
| `better-layout` (`/Users/emre/.codex/skills/better-layout/SKILL.md`) | Hariç tutulan yollarda mini sepetle birlikte ayrılmış boşluğun da kaldırılması; mevcut marka tokenları ve düzen korundu. Görsel/tarayıcı kabulünü Claude doğrulayacak. |
| 21st MCP | `password strength input` araması yapıldı (29799 / 25113); mevcut 21st kökenli kayıt bileşeni ve proje tokenları korundu. Yeni UI bağımlılığı eklenmedi. |

Uygulama:

- Kayıt şifresi istemcide ve API'de 10–128 karakter, ASCII `A-Z`, `a-z`, `0-9`; `Ş`/`Ç` tek başına büyük harf koşulunu karşılamaz. İpucu, doğrulama ve Supabase `weak_password` yanıtı aynı istenen Türkçe mesajı kullanır. İsteğe bağlı sembol, geçersiz şifreyi güç göstergesinde geçerli göstermez. Giriş şifresinin mevcut davranışı korunur.
- `supabase/config.toml` içindeki mevcut 10 karakter sınırına `lower_upper_letters_digits` eklendi. Migration veya uzak DB işlemi yapılmadı.
- Eksik/geçersiz Supabase URL/public key/service key ya da production `SITE_ORIGIN`, `/admin` ve alt yollarında sade Türkçe HTML 503; `/api/admin/*` için güvenli JSON 503 üretir. Kontrol kimlik/yetki doğrulamasının yerini almaz; eski service_role JWT ve yeni secret biçimi desteklenir.
- Beş başlık bütün yollar için `next.config.ts` içine eklendi. CSP yalnız Report-Only; Supabase connect kaynağı doğrulanmış public URL'den türetilir. Next/RSC inline script, JSON-LD, inlineCss/Motion style gereksinimleri en dar mevcut izinlerle ve yorumla açıklandı; PayTR script/iframe/form kaynakları belirtildi. Auth/callback yanıtlarının mevcut daha sıkı `no-referrer` politikası korundu.
- Mini sepet `/giris`, `/kayit`, `/hesabim` ve alt yolları, `/odeme`, hukuk sayfalarında kaldırıldı. Ana sayfadaki ayrı `MobileBuyBar` davranışı ve `/sepet` davranışı korunur. Ana sayfada `MiniCart` zaten yoktur; kabuldeki ana sayfa çubuğu mevcut hızlı satın alma çubuğuyla karşılanır. Eski testlerde `/hesabim`/`/kvkk` üzerinde mini sepet bekleyen örnekler uygun `/siparis-takip` yoluna taşındı.
- Çıkış hatası testinde alert'in görünmesine ek olarak odağın ve yeniden etkinleşen düğmenin tamamlanması `findByRole` + `waitFor` ile beklenir.
- `docs/yayin/vercel-env.md` eklendi: bu CI akışında public değişkenler encrypted olmalı; sensitive/pull/istemci build ilişkisi ve sunucu sırlarının sınırı belgelendi.

| Kabul / komut | Sonuç |
| --- | --- |
| `npm test -- tests/unit/register.test.ts tests/unit/register-ui.test.tsx tests/unit/task136-security.test.ts tests/unit/mini-cart-routes.test.tsx --maxWorkers=2` | RED kaydı: 35 hata / 71 başarılı; düzeltmeden sonra aynı testlerin tamamı geçti. 9 karakter, Türkçe-only büyük harf, eksik ASCII sınıfları, 129 karakter reddi; 10 ve 128 karakter kabulü doğrulandı. |
| `npm test -- tests/unit/account-ui.test.tsx --maxWorkers=1 --reporter=dot` (20 ayrı, ardışık süreç) | **20/20 PASS**, her koşuda 13 test. |
| `npm test -- --maxWorkers=2` | **63 dosya, 1035 test PASS**. |
| İlgili 8 unit dosyasıyla `npm test -- ... --maxWorkers=2 --coverage`, değişen auth/register/mini sepet/proxy/header dosyalarına odaklı include | **290 test PASS**; statements %95,41, branches %93,31, functions %92,59, lines %98,40. Global uygulama/tarayıcı coverage'ı olarak sunulmaz. |
| `npm run lint` | PASS, sıfır uyarı. |
| `npm run typecheck` | PASS. |
| `npm run build` | PASS; asset kontrolleri ve production derlemesi geçti. |
| `curl --silent --show-error --head http://127.0.0.1:3036` | HTTP 200; istenen beş başlık mevcut, CSP Report-Only. |
| Aynı production build üzerinde yapılandırması boş yerel HTTP kontrolü | `/admin` ve `/admin/urunler`: GET/HEAD 503 HTML. `/api/admin/products` ve gelecekteki `/api/admin/future`: GET/POST/PATCH/DELETE 503 JSON; istenen Türkçe mesaj. Sepet/kayıt/giriş/hukuk yolları HEAD 200 + Report-Only CSP. Sunucu iş bitiminde SIGTERM ile düzgün kapatıldı. |
| `git diff --check` | PASS. |
| Chromium + WebKit konsol/CSP ve 390 px görsel kabul | **Claude doğrulayacak.** `tests/e2e/task136-security.spec.ts` ve `register.spec.ts` güncellendi/eklendi; tarayıcı testleri çalıştırılmadı. AGENTS.md uyarınca bu kabul görev durumunu engellemez. |

## Durum: TAMAMLANDI
