# 213 Cloudflare'e taşıma (site + yönetim paneli + veritabanı), Vercel'i kaldırma

Kaynak: kullanıcı kararı (19 Kas 2026): "afina zeytin ve afina.com.tr hepsini veritabanıyla geçir, DNS yönetimini de geçir", "yönetim panelini de acayipisler cloudflaresinde aç, taşı", "vercelde bişi kalmasın". Veritabanı sorusunda kullanıcı **"Veritabanını da Cloudflare'e taşı" (D1)** seçti; "hazırlığa başla" dedi. Yazar: Codex. Plan ve denetim: Claude.

Hedef hesap: **Acayipislertr@gmail.com's Account** (id `1e17cf4ee1b533a8ea5cd17078275bc1`). Anahtar yalnız Keychain: `-a 3ebilgisayar -s api-cloudflare-acayip` (Zone/DNS + Workers + D1 + Pages izinli; R2 açık değil). Anahtar asla yazdırılmaz, dosyaya/commit'e yazılmaz; `wrangler` için ortam değişkeniyle verilir (`CLOUDFLARE_API_TOKEN=$(security …)` komutun içinde).

## Mevcut durum (ölçülmüş)
- Next 16.4.2, React 19.3, Better Auth 1.7.18, **ham `pg` (node-postgres)** ile ham SQL (`lib/db/index.ts`: `query`, `transaction` BEGIN/COMMIT, `@vercel/functions attachDatabasePool`). ORM yok.
- Şema: `db/migrations/0001–0003*.sql` (auth + hız sınırı) ve `supabase/migrations/*.sql` (katalog, admin, ürünler, kategori etiketi, müşteri paneli). Hepsi Postgres sözdizimi.
- Vercel'e bağlı yerler: `@vercel/functions`, `process.env.VERCEL`/`VERCEL_ENV`/`VERCEL_URL`, `next.config.ts` içindeki demo koruması, `.github/workflows/vercel-yayin.yml`, `.cache/*/deploy.py`.
- E-posta: `nodemailer` (SMTP). Workers'ta düz TCP/nodemailer çalışmaz; SMTP bilgileri henüz yok, formlardan e-posta şu an zaten gitmiyor. **Bu görevde e-posta gönderimi yeniden kurulmaz**; Workers'ta güvenli şekilde "kapalı/yapılandırılmamış" kalır, mevcut davranış korunur.
- Cloudflare tarafı hazır: `afinazeytin.com` yeni hesapta (durum: bekliyor, 20 DNS kaydı kopyalandı, ad sunucuları `emma.ns.cloudflare.com` + `javier.ns.cloudflare.com`). `afina.com.tr` ücretsiz hesap sınırı yüzünden önce afinazeytin.com etkinleşince eklenecek.

## Kural değişikliği (kullanıcı onaylı, yalnız bu görev)
Bu taşıma `lib/db`, `lib/auth`, `app/api`, `lib/orders`, `lib/cart`, `lib/checkout` içinde veritabanı çağrısı değişikliği gerektirir. Kullanıcı D1'e geçişi açıkça seçti, bu yüzden **veri erişim katmanı** değişebilir. Değişmeyecekler: iş mantığı, fiyat hesabı, sepet/ödeme akışının davranışı, form doğrulama, yetki kuralları, görünüm. Her değişen davranış testle aynı sonucu vermeli.

## Fazlar

### Faz A — Hazırlık (Codex yazar; canlıya DOKUNMAZ)
1. **Adaptör:** `@opennextjs/cloudflare` + `wrangler` ekle; `wrangler.jsonc` (Worker adı `afina-zeytin`, `nodejs_compat`, D1 bağlama `DB`), `open-next.config.ts`. Next 16.4.2 uyumunu kanıtla (derleme + yerel `wrangler dev`/preview). Uyumsuzluk çıkarsa durup raporla.
2. **Vercel bağımlılıklarını kaldır:** `@vercel/functions` ve `attachDatabasePool`; `VERCEL`, `VERCEL_ENV`, `VERCEL_URL` yerine tek bir `APP_ENV` (`production|preview|development`) ve `BETTER_AUTH_URL`; `next.config.ts` demo koruması `APP_ENV === "production"` ile aynı güvenceyi versin.
3. **D1 şeması:** Postgres migrasyonlarını SQLite/D1 sözdizimine çevir (`db/d1/0001_…sql`), eski dosyalar tarihçe olarak kalır. Tür karşılıkları: uuid → TEXT (uygulama üretir), timestamptz → TEXT ISO ya da INTEGER (tek tip seç, belgele), jsonb → TEXT JSON, boolean → INTEGER 0/1, numeric/para → INTEGER kuruş ya da mevcut temsil neyse değer kaybı olmadan. Kısıtlar, indeksler, benzersizlikler korunur.
4. **Veri katmanı:** `lib/db/index.ts` D1 bağlamasını kullansın (`getCloudflareContext().env.DB`); `query`/`transaction` imzaları mümkün olduğunca korunur. D1'de etkileşimli transaction yok: `BEGIN/COMMIT` kullanan her yer `DB.batch([...])` ya da tek ifadelik atomik yazıma çevrilir; her dönüşümün neden aynı garantiyi verdiğini rapora yaz. Tüm ham SQL (`$1` yer tutucular, `RETURNING`, `ON CONFLICT`, `ILIKE`, tür dönüşümleri vb.) SQLite diline çevrilir.
5. **Giriş sistemi:** Better Auth'u D1 ile çalıştır (resmi D1/Kysely yolu); oturum, hesap, doğrulama, hız sınırı tabloları. `admin:grant` ve `db:seed` betikleri D1'e (`wrangler d1 execute`) çalışacak şekilde uyarlanır.
6. **Testler:** Birim testleri yerel SQLite (D1 uyumlu: miniflare/`wrangler` yerel D1 ya da `better-sqlite3`) üzerinde koşar; mevcut 1466 birim testi yeşil kalır. e2e: taban `output/task210/e2e-final-names.txt` (86–90 düşen); **yeni düşen 0**. Güvenli çalıştırıcı (`output/task201/run-clean.mjs`) ve `TEST_DATABASE_URL` yöntemi D1/SQLite karşılığına uyarlanır; `.env*` okunmaz.
7. **Deneme yayını (canlı değil):** Acayipislertr hesabında D1 veritabanı `afina-zeytin` (konum ipucu: Avrupa), Worker `afina-zeytin` → `afina-zeytin.<alt-alan>.workers.dev`. Şema D1'e uygulanır, tohum ürünler yüklenir. Gizli değerler (`BETTER_AUTH_SECRET`, `PAYTR_*`, `GOOGLE_*`, `SMTP_*`) **yalnız `wrangler secret`** ile; bu fazda gerçek canlı değerler Vercel'den alınmaz, deneme için yeni üretilir ya da boş bırakılır (ödeme kapalı, `PAYMENT_PREVIEW`).
8. **Doğrulama (kanıt):** `npm run lint`, `typecheck`, `test`, derleme; deneme adresinde ana sayfa, ürün sayfası, sepet, kayıt/giriş, `/admin` (401 → yetkiyle giriş), 404, yönlendirmeler (308), güvenlik başlıkları; masaüstü/tablet/telefon görüntüleri canlı Vercel sürümüyle piksel karşılaştırması (**0 fark** beklenir; hero videosu/duran görüntü yöntemi 210–212'deki gibi). Rapor: `output/task213/KANIT.md` (sade Türkçe).
9. Commit/push/yayın **yok**; çalışma kopyasında değişiklik kalır, Claude denetler, kullanıcıya özet gider.

### Faz B — Veri (kullanıcı onayı gerekir)
Neon (Vercel) canlı verisi → D1. Önce **salt okunur** döküm ve satır sayıları (kullanıcı, oturum, sipariş, ürün, admin). Veri çoksa/gerçekse tek tek onay. Üretilen döküm `output/` altında, git dışı.

### Faz C — Alan adı geçişi (kullanıcı onayı gerekir)
1. Kullanıcı PublicDomainReg'de ad sunucularını yeni ikiliyle değiştirir → `afinazeytin.com` etkinleşir.
2. `afina.com.tr` yeni hesaba eklenir, 5 DNS kaydı kopyalanır, kullanıcı ad sunucularını değiştirir.
3. Worker'a özel alan adları: `afinazeytin.com`, `www.afinazeytin.com` (www → apex 308 aynen). Vercel'e giden A/CNAME kayıtları Worker yönlendirmesiyle değiştirilir. **E-posta kayıtları (MX, SPF, DMARC, SRV, mail/imap/pop3/smtp/webmail) aynen kalır.**
4. Canlı kontrol listesi: 15–17 sayfa 200, yönlendirmeler 308, giriş/kayıt, sepet; geri dönüş yolu: DNS kayıtları Vercel'e geri çevrilir (Vercel sürümü bu aşamada hâlâ durur).

### Faz D — Vercel'i kaldırma (kullanıcı onayı, geri alınamaz)
Canlı Cloudflare'de **en az 7 gün** sorunsuz çalıştıktan sonra, kullanıcı onayıyla: Vercel projeleri (`prj_4nr3Qeu05CcoMgDXt7MeAfnflyPp` ve KURUMSAL), Neon veritabanı, Vercel Keychain anahtarı, `.github/workflows/vercel-yayin.yml` (yerine `wrangler deploy` iş akışı), `.cache/*/deploy.py` ve Vercel'e ait ayarlar silinir/arşivlenir. Silinecekler tek tek listelenip "geri alınamaz" diye teyit alınır.

### Faz E — AFİNA KURUMSAL (afina.com.tr)
Ayrı depo (`okyanuskalbi/afina-kurumsal`, `AFINA-KURUMSAL/`). Aynı yöntem (adaptör, Vercel bağımlılıkları, Worker, özel alan adı). Veritabanı varsa ayrıca incelenir. Faz A–C'den sonra, ayrı görev dosyasıyla (214).

## Dokunulmaz
`.env*` okuma yok; sır yazdırma yok; `AFINA-KAYNAK/` ve `output/` git'e eklenmez (`git add -f` yasak); `node_modules` ve `.next` silinmez; `git stash/reset/clean` yok; port 3497'ye dokunma; canlı Vercel sürümü ve canlı DNS'e dokunma (Faz C'ye kadar). Alt ajan yok. Cloudflare'de başka alan adı/projeye (14 diğer alan adı, eski hesap) dokunma.

## Kabul kriterleri
- [ ] Derleme, lint, typecheck, birim testleri yeşil; e2e yeni düşen 0.
- [ ] Deneme adresinde tüm sayfalar ve giriş/kayıt/admin akışı çalışıyor; masaüstü/tablet/telefon görüntüleri canlıyla 0 fark.
- [ ] `lib/db` dışındaki iş mantığı davranışı değişmedi (fark raporu).
- [ ] Hiçbir gizli değer dosyada/komut çıktısında/commit'te yok.
- [ ] `output/task213/KANIT.md` yazıldı; bu dosyanın sonu `## Durum: TAMAMLANDI` (Faz A için).

## Durum: FAZ A TAMAMLANDI

Kanıt: `output/task213/KANIT.md`. Faz B, C, D, E yapılmadı; onay bekliyor. Açık sorular KANIT.md sonunda (Next 16.4.6 yükseltmesi önerisi dahil).
