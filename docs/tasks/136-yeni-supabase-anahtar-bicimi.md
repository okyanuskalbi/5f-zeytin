> ONAY VERİLDİ (kullanıcı, 22 Eki 2026) — 1. aşama auth düzeltmesi

# Task 136: Yeni Supabase anahtar biçimini (sb_publishable_ / sb_secret_) kabul et; admin sayfası 500 vermesin

## Tür
backend

## Amaç
Claude canlıda (`191e14b` sonrası) test etti:
- `/admin` ve `/admin/urunler` → **500**.
- `POST /api/auth/register` (Origin'siz) → **503**.
- `/`, `/giris`, `/kayit`, `/hesabim`, `/sepet` → 200, katalog statik yedekten geliyor.

**Kök neden:** `lib/auth/config.ts` (≈ satır 16) publishable anahtarı yalnız **eski JWT biçiminde** kabul ediyor (3 parça, payload `role: "anon"`). Vercel'deki `NEXT_PUBLIC_SUPABASE_ANON_KEY` Supabase'in **yeni biçimi** (`sb_publishable_…`, JWT değil). `getAuthConfig` "Auth configuration unavailable" fırlatıyor; admin layout (`app/admin/layout.tsx:12-16`) bunu yeniden fırlatıp 500 veriyor; auth route'ları 503 dönüyor.

## Kullanılacak araçlar
- `tdd-workflow`, `security-review`, `backend-patterns`.

## İstenen
1. **Publishable anahtar doğrulaması** (`lib/auth/config.ts` ve aynı mantığı kullanan her yer):
   - Kabul: `sb_publishable_` önekli anahtar (yeni biçim) **veya** eski JWT ve payload `role === "anon"`.
   - Red: `sb_secret_` önekli anahtar ve payload `role === "service_role"` JWT (gizli anahtarın yanlışlıkla public değişkene konmasını engelleme kuralı korunur).
   - Boş/kısa/boşluk içeren değer reddedilir.
2. **Service role / secret anahtar** (sunucu, `lib/supabase/server.ts`): `sb_secret_` önekli anahtar **veya** eski `service_role` JWT kabul edilir. `sb_publishable_` reddedilir (sunucuda yanlış anahtar kullanımını yakala).
3. **Admin sayfası hata vermesin:** `app/admin/layout.tsx` yapılandırma ya da Supabase erişim hatasında 500 yerine kontrollü sonuç verir: oturum yoksa `/giris?next=/admin` yönlendirmesi; yapılandırma/DB hatasında 503 durumlu sade bir "Yönetim paneli şu an kullanılamıyor" sayfası (hata ayrıntısı/anahtar sızdırmadan). Yetkisiz oturum → 404 ya da `/` (mevcut kararı koru).
4. Auth API route'ları: Origin'siz/uyuşmayan istek **403** (`csrf_rejected`); yapılandırma eksikse 503. (Sıra: önce origin kontrolü, sonra yapılandırma.)

## Kabul kriterleri
- [ ] Unit: `sb_publishable_…` kabul, eski anon JWT kabul, `sb_secret_…` ve service_role JWT public tarafta red.
- [ ] Unit: sunucu tarafında `sb_secret_…` kabul, `sb_publishable_…` red.
- [ ] Unit: admin layout, config hatasında 503 sayfası; oturumsuz istekte `/giris?next=/admin` yönlendirmesi; 500 yok.
- [ ] Unit: register/login route'u Origin'siz istekte 403.
- [ ] `npm test`, lint, typecheck, build yeşil; 135 testleri korunur.
- [ ] Canlı doğrulama Claude'da (`/admin` → yönlendirme, register Origin'siz → 403).

## Yapılmaması gerekenler
- `.env*` okuma/yazma; anahtar değerlerini loglama.
- Canlı Supabase'e bağlanma/migration.
- `docs/` değiştirme (yalnız Coder Notu/Durum).

## Durum: BEKLİYOR
