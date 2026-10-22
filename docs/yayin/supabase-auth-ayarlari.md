# Supabase Auth — Task 077 canlı kontrol listesi

`supabase/config.toml` yalnız yerel CLI ortamını yapılandırır. Task 135
canlı ayar veya migration uygulamaz. Claude, Task 077'de onaylı Supabase
hedefinde aşağıdakileri ayrı doğrular; repodaki ayar canlıya uygulanmış sayılmaz.

- [ ] Email sağlayıcısında **Confirm email açık**. Onaysız kayıt için
  oturum verilmediğini doğrula.
- [ ] E-posta değişiminde eski ve yeni adres doğrulaması
  (`double_confirm_changes = true`) açık.
- [ ] Güvenli şifre değişimi (`secure_password_change = true`) açık.
- [ ] Site URL: `https://afinazeytin.com`.
- [ ] Redirect URL allowlist: `https://afinazeytin.com/**` ve geliştirme
  için `http://localhost:3004/**`. Başka host/wildcard ekleme. Canlıda
  localhost gerekmiyorsa yalnız onaylı canlı yönlendirmeleri tut.
- [ ] Minimum şifre uzunluğu **en az 10**. Yerel CLI'da da
  `minimum_password_length = 10`; sunucu kayıt doğrulamasıyla uyumlu.
- [ ] Auth rate limit'lerini kayıt/giriş, e-posta/OTP gönderimi, PKCE/OTP
  doğrulaması ve refresh için incele; hedefteki değerleri ve kısıtlamanın
  çalıştığını kabul kaydına ekle. Sayısal limitleri bu task belirlemez.
- [ ] İsteğe bağlı CAPTCHA kararı: Turnstile/hCaptcha kullanılacaksa ayrıca
  onayla, istemci token bağlantısını ve sunucu doğrulamasını tamamlayıp
  kabul et; yalnız Dashboard'da açmak kayıt/giriş akışını kırabilir.
- [ ] Claude Vercel'in ilgili ortamına sunucu env'i
  `SITE_ORIGIN=https://afinazeytin.com` ekler ve yeniden deploy eder.
  Değer yalnız origin içerir; path, query, kullanıcı bilgisi içermez.
  Production'da eksik/geçersizse auth/admin yazma istekleri **503** döner.
  Yalnız geliştirmede eksik değer request URL origin'ine düşer.
- [ ] Reverse proxy arkasında onaylı Origin kabul edilir; farklı Origin
  **403** döner. `Sec-Fetch-Site` varsa yalnız `same-origin` kabul edilir.
  `emailRedirectTo`, `SITE_ORIGIN` üzerinden `/auth/callback?next=/hesabim`
  olarak üretilir; request host ve forwarded host kaynak alınmaz.
- [ ] [İlk yönetici ataması](admin-bootstrap.md) tamamlanır. Şüpheli ön-kayıtta
  şifre sıfırlama, global çıkış ve eski access-token sürelerinin dolması
  tamamlanmadan `admin_users` satırı eklenmez.

Tarayıcı ve canlı kabul kontrollerini Claude doğrulayacak; yerel unit/PGlite,
lint, typecheck ve build bu canlı ayarların kanıtı değildir.

Kaynak: [Supabase CLI Auth ayarları](https://supabase.com/docs/guides/local-development/cli/config).
