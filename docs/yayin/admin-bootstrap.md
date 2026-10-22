# İlk yönetici ataması — Task 077 işletim adımı

Task 135 yalnız kodu ve bu prosedürü hazırlar. Canlı Supabase'e bağlanılmaz;
SQL'i onaylı hedefte Claude, Task 077 sırasında çalıştırır. E-posta adresi
kendi başına yetki vermez. Yönetici için Auth `getUser()` doğrulaması,
onaylı e-posta ve `public.admin_users` satırı birlikte zorunludur.
Mevcut şemada ayrıca etkinlik kolonu yoktur; satırın varlığı etkin atamadır.

1. Önce [Supabase Auth ayarlarını](supabase-auth-ayarlari.md) doğrula.
2. `admin@afina.com.tr` sahibini ve posta kutusuna erişimini doğrula.
   Auth kullanıcılarında bu adresin zaten bulunup bulunmadığını kontrol et.
3. Kullanıcı yoksa sahip bu adresle kayıt olur, güçlü ve benzersiz şifre
   belirler ve e-posta doğrulamasını tamamlar. Kullanıcı yoksa veya e-posta
   onaysızsa aşağıdaki SQL hiçbir atama yapmaz.
4. Kullanıcı zaten varsa ön-kayıt şüphesi kabul et. Önce varsa `admin_users`
   atamasını sil; yetkiyi hesap kurtarılmadan verme. Sahibin doğrulanmış
   posta kutusuyla şifre sıfırlamasını tamamlat; yalnız magic link ile giriş
   veya e-posta onayı saldırganın şifresini değiştirmez. Bu site henüz
   şifre sıfırlama ekranı sunmuyorsa Supabase'in desteklediği, işletmeci
   denetimli kurtarma akışını kullan; yeni bir site akışı varmış gibi davranma.
5. Şifre değişiminden sonra tüm cihazların oturumlarını Auth üzerinden
   kapat: sahibin doğrulanmış oturumuyla
   `supabase.auth.signOut({ scope: 'global' })` veya güvenilir sunucuda
   `supabase.auth.admin.signOut(ownerAccessToken, 'global')` kullan.
   Service-role anahtarını ve kullanıcı token'ını tarayıcıya, SQL'e,
   loglara veya repoya yazma. Sitenin normal çıkış işlemi `local` kapsamlıdır,
   bu işletim adımının yerini tutmaz.
6. Global çıkış refresh token'larını iptal eder; önceden verilmiş access
   token'lar süreleri dolana kadar geçerli olabilir. Atama olmadan, global
   çıkıştan önceki en uzun access-token geçerlilik süresinin bitmesini bekle.
   Şüpheli identity bağlantılarını da denetle. Eski şifreyle girişin
   reddedildiğini ve eski oturumların yenilenemediğini doğrula. Ardından
   sahip yeni şifresiyle tekrar giriş yapar.
7. Onaylı Supabase SQL Editor'da
   [admin-bootstrap.sql](../../supabase/snippets/admin-bootstrap.sql) içeriğini
   çalıştır. Snippet bir migration değildir, otomatik çalıştırılmaz:

   ```sql
   insert into public.admin_users (user_id)
   select id
   from auth.users
   where email = 'admin@afina.com.tr'
     and email_confirmed_at is not null
   on conflict (user_id) do nothing
   returning user_id;
   ```

8. Dönen `user_id` değerinin sahibin Auth kimliği olduğunu kontrol et.
   Boş sonuç kullanıcı yok/onaysız veya zaten atanmış anlamına gelebilir;
   ayrıca tabloyu oku. Sahip admin'e erişebilmeli, normal üye erişememeli.
   Tarayıcı kabulünü Claude doğrulayacak.

Yetki iptali için ilgili `user_id` satırını `public.admin_users` tablosundan
sil. Sonraki korumalı istek veya işlemde yetki yeniden okunur; oturum/cookie
içindeki e-posta veya rol iddiası yetkiyi geri getirmez.

Kaynaklar: [Supabase signOut](https://supabase.com/docs/reference/javascript/auth-signout),
[kullanıcı oturumları](https://supabase.com/docs/guides/auth/sessions).
