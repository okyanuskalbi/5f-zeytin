> ONAY VERİLDİ (kullanıcı, 28 Eki 2026): "Zeytin giriş çerezinin tarayıcı kodundan okunamaz hale getirilmesi ... sende". Kaynak: `~/security-audit-skill/5f-zeytin/run-1/REPORT.md` §5.

# Task 150: Supabase oturum çerezleri httpOnly

## Tür
backend (auth, küçük)

## Amaç
Oturum ve yenileme (refresh) çerezlerini tarayıcı JavaScript'inden okunamaz yapmak. CSP `unsafe-inline` olduğu için ileride bir XSS olursa refresh token çalınamasın.

## Bağlam
- `lib/auth/config.ts:46` `getAuthCookieOptions()` → `httpOnly: false`. Gerekçe yorumu "browser client needs the same cookies".
- Tarayıcı istemcisi `lib/auth/client.ts` (`createAuthBrowserClient`) uygulama kodunda HİÇ kullanılmıyor; yalnız `tests/unit/auth-core.test.ts` içe aktarıyor. Tüm auth akışı sunucuda: `lib/auth/server.ts:51`, `app/api/auth/*`, `app/auth/callback`, `proxy.ts` oturum yenileme. PKCE verifier çerezi de sunucu rotalarında yazılıp okunuyor.

## Kullanılacak araçlar
- Skill: `security-review`, `backend-patterns`, `tdd-workflow`.
- 21st MCP: hayır.

## Adımlar
1. `getAuthCookieOptions()` → `httpOnly: true`; diğer alanlar aynı (`path "/"`, `sameSite "lax"`, prod'da `secure`). Yorumu yeni gerçeğe göre düzelt.
2. `lib/auth/client.ts` dosyasını ve yalnız onu test eden test parçalarını kaldır (kullanılmayan, httpOnly ile çalışamayacak kod). Başka içe aktaran varsa önce raporla, kaldırma.
3. Regresyon testi (kaynak testi): `app/`, `components/`, `lib/` içinde `createBrowserClient` ve `@supabase/ssr` içe aktaran `"use client"` dosya yok; `getAuthCookieOptions().httpOnly === true`.
4. Birim testi: kayıt, giriş (şifre + magic link), callback ve proxy yenilemesinin yazdığı `sb-*` çerezlerinin `Set-Cookie` başlığında `HttpOnly` var (mevcut mock'lu route testlerine ekle). PKCE verifier çerezi dahil.
5. Mevcut `auth-core` beklentilerini (`httpOnly: false`) yalnız bu değişiklik için güncelle; zayıflatma.

## Kabul kriterleri
- [ ] `git grep -n "httpOnly: false" lib app` boş.
- [ ] `lib/auth/client.ts` yok; `git grep -n "createBrowserClient" app lib components` boş.
- [ ] Adım 3–4 testleri yeşil.
- [ ] `npm test`, lint, typecheck, build yeşil.
- Tarayıcı testi (giriş → /hesabim → sayfa yenile → çıkış, `document.cookie` içinde `sb-` yok) Claude'da.

## Yapılmaması gerekenler
- Giriş/kayıt akışı, Origin kontrolü, `sameSite`, CSP, RLS, migration, ödeme değişmesin.
- Ön-kayıt (preclaim) ve hesap değiştirme çerez temizliği bu görevde YOK (ayrı karar/test).
- Yeni bağımlılık ekleme.

## Durum: BEKLİYOR
