# Task 187: ONAY GEREKLİ — Neon canlı geçiş

> ONAY GEREKLİ: canlı veritabanı ve üyelik sistemini değiştirir. Son onay olmadan çalıştırılmaz.

## Tür
backend (yayın)

## Kararlar ve hazır olanlar (9 Kasım 2026)
- **Neon kuruldu:** Vercel afina1 → store `afina-zeytin-db` (Free, `fra1`), `afina-zeytin` projesine üç ortamda bağlı; `DATABASE_URL`, `DATABASE_URL_UNPOOLED` ve PG*/POSTGRES_* değişkenleri var.
- **Veri aktarımı YOK** (kullanıcı: "gerek yok"): Neon temiz başlar. Ürünler `db:seed` ile statik katalogdan yazılır; ilk yönetici `admin:grant` ile açılır. Supabase'teki eski üyeler (varsa) yeniden kayıt olur.
- Kod: 186 (+ Düzeltme 186-2), ayrı çalışma kopyası `AFINA-KAYNAK/wt/neon`, yama `AFINA-KAYNAK/neon-gecis/`.

## Ön koşullar
1. **SMTP**: e-posta doğrulaması, e-postayla giriş ve şifre sıfırlama için gerekli. Hazır değilse kullanıcı kararıyla geçici olarak `AUTH_REQUIRE_EMAIL_VERIFICATION=false`.
2. Son onay: "canlıya geçir".

## Adımlar (ayrıntı `docs/yayin/neon-gecis.md`)
1. 186 kodunu güncel main üzerine al (183–185 sonrası), çakışmaları çöz, tüm testler yeşil.
2. Vercel ortam değişkenleri: `BETTER_AUTH_SECRET` (yeni, güçlü), `BETTER_AUTH_URL`, gerekirse `AUTH_REQUIRE_EMAIL_VERIFICATION`, SMTP değişkenleri; Supabase değişkenleri yayın doğrulanana kadar silinmez.
3. Vercel fonksiyon bölgesi `iad1` → `fra1` (Neon ile aynı bölge).
4. Neon'da `db:migrate` + `db:seed -- --apply`; `/api/products` en az 1 ürün.
5. Preview yayını (https); Claude tarayıcıda: kayıt, giriş, çıkış, hesabım, adres, sepet, teklif, bayilik, admin; ilk yönetici `admin:grant`.
6. Production yayını (Vercel REST, kesin SHA); canlı doğrulama.
7. Supabase projesi ve değişkenleri, kullanıcı onayıyla kapatılır.

## Durum: BEKLİYOR
