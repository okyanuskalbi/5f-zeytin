# Task 187: Neon canlı geçiş

> Kullanıcı onayı (9 Kasım 2026): "Neon'a geçiş … ok gönder". E-posta doğrulaması kararı: **şimdilik kapalı** (`AUTH_REQUIRE_EMAIL_VERIFICATION=false`), SMTP gelince açılacak.
> **Bu görevde production yayını YAPILMAZ.** Codex A–D aşamalarını yapar ve doğrulanmış preview ile durur; production yayınını ve canlı doğrulamayı Claude yapar.

## Tür
backend (yayın hazırlığı)

## Durum özeti
- Canlıda (Supabase ile): C ana sayfa + bayilik + siyah teneke, deployment `dpl_HckKC2sMZ6CVuXEMED25fLufsR8w` (commit `f0ed4c7`). **Geri dönüş noktası budur.**
- Neon: Vercel afina1 → `afina-zeytin-db` (Free, `fra1`), `afina-zeytin` projesine üç ortamda bağlı (`DATABASE_URL`, `DATABASE_URL_UNPOOLED`, PG*/POSTGRES_*).
- Neon kodu: ayrı kopya `AFINA-KAYNAK/wt/neon`, yerel kayıtlar `cf62d06` (186) + `6732cf3` (186-2), taban `e24f190`; yamalar `AFINA-KAYNAK/neon-gecis/v2/`. Veri aktarımı YOK; `db:migrate`, `db:seed`, `admin:grant` var.

## Kullanılacak araçlar
- ECC skill: `deployment-patterns`, `database-migrations`, `security-review`, `verification-loop`, `tdd-workflow`.
- Codex alt ajanları (multi_agent): birleştirme/test ve Vercel ayarları paralel yürütülebilir; sırlarla ilgili adımlar tek elden.

## Aşamalar

### A. Kodu main'e al
1. Main (`f0ed4c7` ve sonrası) üzerine `AFINA-KAYNAK/wt/neon` kopyasındaki iki kaydı uygula (`git -C <main> cherry-pick` ya da yamalar). Çakışmaları 183–185'in arayüzünü koruyarak çöz (C menü, hesap simgesi, bayilik formu, telefon/il bileşenleri).
2. `.env.example`: yalnız değişken adları (boş değer) olduğunu doğrula, kaydet.
3. Yerel Postgres ile tam doğrulama: `initdb` geçici küme (port 54330), `TEST_DATABASE_URL` ile `npm run test`; ayrıca DB'siz `npm run test`; `npm run lint`, `npm run typecheck`, `npm run build`, `npm run check:assets`.
4. Commit + `origin main` push; GitHub CI yeşil olmalı. (Push yayın yapmaz.)

### B. Vercel ayarları (production + preview)
5. `BETTER_AUTH_SECRET`: güçlü rastgele değer üret, **hiçbir yere yazdırma/kaydetme**, Vercel API ile `encrypted` olarak ekle.
6. `BETTER_AUTH_URL=https://afinazeytin.com` (production). Preview için Better Auth'un istek kökenini/`trustedOrigins`'i preview adresiyle çalışacak biçimde ayarla (kod destekliyorsa env ile; desteklemiyorsa en küçük kod değişikliği + test, A'ya dön).
7. `AUTH_REQUIRE_EMAIL_VERIFICATION=false` (production + preview).
8. Proje fonksiyon bölgesi `iad1` → `fra1` (Neon ile aynı).
9. Supabase değişkenlerini SİLME (geri dönüş için kalır).

### C. Neon veritabanı
10. `DATABASE_URL_UNPOOLED` değerini Vercel API'den yalnız bellekte al (dosyaya/loga yazma); `npm run db:migrate` ve `npm run db:seed -- --apply`; ikinci çalıştırma değişiklik yapmaz; ürün sayısı 6.
11. Preview deployment'ların aynı Neon veritabanını mı yoksa ayrı branch'i mi kullandığını belirle ve Coder Notu'na yaz.

### D. Preview yayını ve doğrulama
12. Kesin SHA (CI yeşil) ile **preview** deployment (Vercel REST; `.cache/task-183-185-yayin/deploy.py` deseni, target yok). Preview koruması varsa "protection bypass for automation" ile eriş (bypass değerini yazdırma).
13. Preview'da Playwright ile: ana sayfa, ürün detayı, sepete ekle, `/sepet`, teklif formu, `/bayilik`; **kayıt → giriş → hesabım → adres ekle/sil → çıkış**; yanlış şifre; "şifremi unuttum" ve e-posta bağlantısı isteğinin SMTP yokken açık hata vermesi; admin sayfasına admin olmayanın erişememesi; `/api/products` 6 ürün.
14. Testte oluşturulan kullanıcı/oturum/adres verisini sil (preview ve production aynı DB'yi kullanıyorsa zorunlu).
15. Sonuçları `.cache/task-187/` altına (sırsız) yaz; ekran görüntüleri dahil.

## Kabul kriterleri
- [ ] Main'de Neon kodu, CI yeşil; `rg "@supabase|SUPABASE_" app lib components proxy.ts` boş.
- [ ] Vercel'de `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `AUTH_REQUIRE_EMAIL_VERIFICATION=false` var; bölge `fra1`; sırlar hiçbir dosyada/logda yok.
- [ ] Neon'da migration'lar tam, 6 ürün.
- [ ] Preview'da 13. maddedeki akışların hepsi geçti; test verisi temizlendi.
- [ ] Production yayını YAPILMADI; preview URL'si ve kesin SHA Coder Notu'nda.

## Yapılmaması gerekenler
- Production deployment/alias değişikliği, Supabase projesini veya değişkenlerini silme, SMTP ekleme.
- Arayüz tasarımını değiştirme.
- `docs/` altında yalnız bu dosyanın Coder Notu/Durum'u ve `docs/yayin/neon-gecis.md`.

## Durum: BEKLİYOR
