# Task 187: ONAY GEREKLİ — Neon canlı geçiş

> ONAY GEREKLİ: canlı veritabanı, üyelik ve müşteri hesaplarını etkiler. Kullanıcı adımları ve son onay olmadan çalıştırılmaz.

## Tür
backend (yayın)

## Ön koşullar (kullanıcı)
1. Vercel'de afina1 ekibine Neon entegrasyonu (ücretsiz paket) kurulup `5f-zeytin` projesine bağlanır → `DATABASE_URL`, `DATABASE_URL_UNPOOLED` ortam değişkenleri gelir.
2. Supabase verisine erişim (kişisel erişim anahtarı Keychain'de `-a afina -s supabase-afina-token`, ya da mevcut service role ile aktarım).
3. Son onay: "canlıya geçir".

## Adımlar (özet; ayrıntı 186'nın `docs/yayin/neon-gecis.md` belgesinde)
1. 186 kodunu güncel main üzerine al (183–185 sonrası), testleri yeşil.
2. `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` ortam değişkenleri (Vercel, production + preview).
3. Neon'da `db:migrate`; Supabase'ten kuru aktarım → sayı karşılaştırması → gerçek aktarım.
4. Preview yayını; Claude tarayıcıda: giriş (eski şifre dahil), kayıt, hesabım, adres, admin, sepet, teklif.
5. Production yayını (Vercel REST, kesin SHA); canlı doğrulama.
6. Supabase projesi 30 gün dokunulmadan geri dönüş için bekletilir; sonra kullanıcı onayıyla kapatılır.

## Durum: BEKLİYOR
