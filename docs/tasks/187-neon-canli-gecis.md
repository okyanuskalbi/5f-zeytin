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

## Coder Notu

9 Kasım 2026 — A–D aşamaları tamamlandı. Production yayını yapılmadı.
Kod birleştirme ve bağımsız güvenlik incelemesi iki Codex alt ajanıyla yürütüldü;
gizli değerler ve uzak veritabanı işlemleri tek elden yapıldı.

- **Kesin önizleme kaynağı:** `977dc9d872c5f99e668e05009ae067eaf475170a`.
- **Önizleme:** https://afina-zeytin-5324gem0v-afina1.vercel.app
- **READY dağıtım:** `dpl_AS4i7wsp5zUw6VynPB3MjsY7ASfn`; REST isteğinde
  target/alias yok; dağıtımın target değeri null, bölgesi fra1.
- **Kaynağa ait GitHub doğrulaması:** [42692971572 SUCCESS](https://github.com/okyanuskalbi/5f-zeytin/actions/runs/42692971572).
  Main gönderildi. Son görev belgesi kaydı yalnız iki belgeyi değiştirir;
  uygulama kodu bu doğrulanmış kaynakla aynıdır.

### A — Kod ve yerel kabul

`cf62d06` ve `6732cf3` yamaları main'e alındı. C ana sayfa, menü/hesap simgesi,
bayilik, telefon/il bileşenleri ve altı ürün korundu. Runtime Supabase taraması
boş; ortam örneğindeki 17 değişkenin tamamı boş değerli. Linux kurulumu için
iki eksik isteğe bağlı paket kaydı özgün kilit dosyasından geri kondu.

Önizleme kökeni yalnız Vercel'in verdiği kesin adresten seçilir; kötü/eksik
adreslerde üyelik kapalı kalır. Önce 16 testte 11 hata, düzeltme sonrası hedefli
124 PASS görüldü. İlk önizlemede giriş 200 ve oturum geçerli olmasına rağmen
hesaba otomatik geçiş eski anonim yönlendirmede kaldı. Aynı oturumla yeni hesap
sayfası açılışı çalıştı. Başarılı girişin izinli hedefi yeni sayfa olarak açmasıyla
çözüldü: önce 11 başarısız test, ardından gömülü pencere dahil 40/40 PASS;
son önizlemede otomatik hesap geçişi de PASS. Tasarım değişmedi.

| Kontrol | Sonuç | Kanıt (.cache/task-187 altında) |
|---|---|---|
| Yerel PostgreSQL 54330, tam test ve kapsam | 138 dosya / 1.363 PASS | coverage.txt, local-verification.json |
| Veritabanı olmadan tam test | 1.337 PASS / 26 beklenen skip | without-db.txt |
| Lint / tür kontrolü / Turbopack derleme / görsel dosyalar | PASS | lint.txt, typecheck.txt, build.txt, assets.txt |
| Kapsam (ifade / dal / fonksiyon / satır) | %85,52 / %85,98 / %82,50 / %87,98 | coverage.txt |
| Uygulama paketleri güvenlik denetimi | 0 açık | dependency-audit.json |

### B–C — Ayarlar ve Neon

Güçlü rastgele BETTER_AUTH_SECRET Vercel'de encrypted olarak production+preview
ortamlarına eklendi. Production BETTER_AUTH_URL resmi alan adı; önizleme kendi
VERCEL_URL kökenini kullanır. AUTH_REQUIRE_EMAIL_VERIFICATION iki ortamda false.
Proje ve gerçek önizleme fonksiyon bölgesi fra1 olarak geri okundu. Supabase
ortam değişkenleri korundu; SMTP eklenmedi.

Üç migration uygulandı; tekrarında bekleyen değişiklik yok. Altı ürün eklendi;
ikinci seed ürün/öneri değişiklik sayısı 0/0. Preview ile production aynı Neon
veritabanını kullanır; ayrı preview branch'i yoktur. Hem ortak ortam kaydıyla
hem önizlemede açılan hesabın aynı doğrudan bağlantıda okunup silinmesiyle
paylaşım doğrulandı. Kanıt: settings.json, database.json, cleanup.json.

### D — Önizleme kabulü

Son önizlemede 16/16 PASS: ana sayfa; source=database ile altı ürün; ürün detayı;
sepete ekleme ve /sepet; teklif özeti; bayilik alanları; kayıt → şifreyle giriş →
otomatik hesabım → adres ekle/sil → çıkış; oturumsuz hesap reddi; yanlış şifre
401; admin olmayanın sayfa ve hizmet erişiminin reddi; şifremi unuttum/e-posta
bağlantısı ve sıfırlama isteğinde SMTP eksikliğinin açık 503 hatası.

Bir deneme hesabı silindi. Kullanıcı, oturum, kimlik hesabı, adres, hesaba ait
sınır sayacı ve doğrulama kayıtlarının kalan sayıları 0; ürün sayısı 6.
Gerçek sipariş/ödeme veya e-posta gönderimi yapılmadı.

23 gerçek önizleme JavaScript dosyası ve sayfa bellekte sırlarla karşılaştırıldı;
eşleşme yok. Kaynaklar, çıktılar ve yerel tarayıcıya gönderilen dosyalar da
tarandı. Anahtar, bağlantı ve bypass değerleri dosyaya ya da çıktıya yazılmadı.
Göreve ait geçici otomasyon erişim anahtarı da iptal edildi. Tarayıcı iz/oturum kaydı
kapalı tutuldu; şifre alanları temizlenip gizlenerek dokuz görüntü kaydedildi.
Tarayıcı ve yerel PostgreSQL düzgün kapatıldı; geçici kurulum/derleme dosyaları
iş sonunda kaldırıldı.

Nihai kanıtlar: preview-checks.json, cleanup.json, final-targets.json,
secret-scan.json, final-receipt.json ve screenshots/01–09. İlk önizlemenin
bulguları ayrı deneme kayıtlarında korunur; son kabul bunlarla karıştırılmaz.

**Production geri dönüş noktası değişmedi:** afinazeytin.com hâlâ
`dpl_HckKC2sMZ6CVuXEMED25fLufsR8w` dağıtımına bağlı. Production dağıtımı veya
alan adı ataması yapılmadı. Bu görevin açık kabul maddesi kalmadı.

## Durum: TAMAMLANDI
