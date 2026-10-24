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
