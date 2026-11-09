# Task 186: Neon + Better Auth geçiş kodu (ayrı çalışma kopyasında, main'e alınmaz)

## Tür
backend (fullstack dokunuşlu)

## Amaç
Kullanıcı kararı (9 Kas 2026: "Neon (Vercel üzerinden) ile devam et"): Supabase bağımlılığı kaldırılır; veritabanı erişimi düz Postgres (Neon) ile, üyelik Better Auth ile çalışır. Bu görev **yalnız kodu hazırlar ve yerel Postgres'te test eder**; canlı geçiş Task 187'dir.

## Çalışma yeri ve sınırlar (kesin)
- Bu görev ayrı bir git çalışma kopyasında yürür (yolu çalıştıran söyler). **Commit yapma, push yapma**; değişiklikleri çalışma ağacında bırak (Claude inceleyip kaydeder).
- Yerel test veritabanı çalıştıran tarafından açılır: `TEST_DATABASE_URL` ortam değişkeni verilir (yerel Postgres). Gerçek Neon/Supabase'e bağlanma, canlı veriye dokunma, Vercel ortam değişkeni değiştirme, yayın YOK.

## Mevcut durum
- Supabase kullanan dosyalar: `lib/supabase/public.ts`, `lib/supabase/server.ts`, `lib/auth/config.ts`, `lib/auth/server.ts`, `lib/auth/admin.ts`, `lib/catalog/read.ts`, `lib/account/customer-server.ts`, `app/api/auth/login/route.ts`, `app/api/auth/register/route.ts`, `app/api/admin/products/route.ts`, `proxy.ts`.
- Şema: `supabase/migrations/2026102200000{1,2,3}`, `20261023000004`, `20261101000005` (tablolar: products, admin_users, customer_addresses, orders, order_items, product_upsells; RPC: customer_save_address, customer_delete_address; RLS `auth.uid()` ile).
- Ortam: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.

## Kullanılacak araçlar
- ECC skill: `backend-patterns`, `api-design`, `tdd-workflow`, `database-migrations`, `postgres-patterns`, `security-review`.
- Better Auth ve Neon için güncel resmi belgeleri oku (sürüme özgü API'yi tahmin etme).
- **Codex alt ajanları (multi_agent):** şema/migration, üyelik, hesap/sipariş sorguları, admin ve testleri paralel alt ajanlara böl; birleştirme ve son güvenlik kontrolü sende.

## Adımlar
1. **Veri katmanı** `lib/db/`: `pg` Pool (`DATABASE_URL`, havuzlu bağlantı), Vercel Fluid için `@vercel/functions` `attachDatabasePool` (varsa); yalnız parametreli sorgular; işlem (transaction) yardımcısı; yalnız sunucu (`server-only`).
2. **Şema** `db/migrations/*.sql` (düz Postgres) + basit sıralı çalıştırıcı (`npm run db:migrate`, `schema_migrations` tablosu, `DATABASE_URL_UNPOOLED` tercih). Supabase'e özgü parçalar (auth şeması FK'leri, RLS politikaları, anon/authenticated grant'leri) kaldırılır; yetki sunucu kodunda zorlanır. Kullanıcı tablosu Better Auth'unki; mevcut UUID kimlikler korunabilecek biçimde (`text` id).
3. **Üyelik** Better Auth (güncel kararlı sürüm, pg Pool ile): e-posta + şifre (mevcut kurallar), e-posta bağlantısıyla giriş (magic link; mevcut e-posta adaptörü üzerinden; SMTP yapılandırılmamışsa açık hata ve arayüzde net mesaj, sessiz başarısızlık yok), Google girişi yalnız `GOOGLE_CLIENT_ID/SECRET` varsa görünür. Oturumlar DB'de; çerezler httpOnly + secure + sameSite=lax; `trustedOrigins` (afinazeytin.com, www); hız sınırı DB depolamalı. **Eski Supabase kullanıcıları için bcrypt (`$2a$/$2b$`) şifre doğrulaması** ve başarılı girişte yeni biçime yeniden özetleme.
4. **Mevcut arayüz ve API sözleşmeleri aynen:** giriş/kayıt penceresi (Bazgold referanslı), `/giris`, `/kayit`, `/hesabim` (siparişler, adresler, hesap bilgileri, şifre değiştirme, çıkış), admin ürün yönetimi, katalog okuma. `proxy.ts` oturum kontrolü Better Auth'a uyar (tam doğrulama sunucuda).
5. **Yetki:** her hesap sorgusu oturumdaki kullanıcı id'siyle filtrelenir; adres kaydet/sil işlemleri sunucuda işlemle (eski RPC davranışı aynen); admin yetkisi `admin_users` tablosundan sunucuda.
6. **Supabase'ten veri aktarım aracı** `scripts/migrate-from-supabase.mjs` (bu görevde ÇALIŞTIRILMAZ): kaynak Supabase (URL + service role; auth admin API ile kullanıcılar ve bcrypt özetleri), hedef Neon; varsayılan kuru çalıştırma (sayıları yazar), tekrar çalıştırılabilir (upsert); ürünler, admin_users, kullanıcılar, adresler, siparişler, sipariş kalemleri, upsell'ler.
7. `@supabase/*` paketleri ve Supabase ortam değişkenleri koddan kalkar; `.env.example` yeni adlarla (değer yok): `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, isteğe bağlı `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.
8. Belgeler: `docs/yayin/neon-gecis.md` — Task 187 için adım adım geçiş ve geri dönüş planı.

## Kabul kriterleri (yerel Postgres, `TEST_DATABASE_URL` ile)
- [ ] Boş veritabanında `npm run db:migrate` iki kez çalışır (ikincisi değişiklik yapmaz).
- [ ] Entegrasyon testleri: katalog okuma; kayıt → giriş → oturum → çıkış; yanlış şifre ve hız sınırı; **A kullanıcısı B'nin adres/sipariş verisini okuyamaz/değiştiremez**; admin olmayan ürün güncelleyemez; bcrypt eski şifreyle giriş + yeniden özetleme; adres kaydet/sil işlemleri.
- [ ] `rg "@supabase|SUPABASE_" app lib components proxy.ts` sonuç vermez (yalnız aktarım aracı ve belgeler hariç).
- [ ] Derleme çıktısında (`.next/static`) `DATABASE_URL`, `BETTER_AUTH_SECRET` ya da bağlantı dizesi yok.
- [ ] `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build` yeşil.

## Yapılmaması gerekenler
- Commit/push, canlı DB, Vercel env, yayın, Supabase projesini silme.
- Arayüz tasarımını değiştirme (yalnız üyelik akışının çalışması için gereken en küçük değişiklik).
- `docs/` altında yalnız `docs/yayin/neon-gecis.md`, Coder Notu ve Durum.

## Durum: BEKLİYOR
