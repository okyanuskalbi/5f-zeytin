# Task 108: Üyelik arayüzü: Google ile giriş + e-posta, hesabım

## Tür
frontend

## Amaç
Giriş/kayıt sayfası (önce 'Google ile devam et'), e-posta ile kayıt/giriş, şifre sıfırlama, hesabım (profil, adresler, siparişlerim).

## Bağlam
ZEYTİN v2 (`docs/DESIGN.md` "Topraktan sofraya" — krem 'sofra' dili, Fraunces/Figtree, ev kuralları). Kullanıcı (20 Eki): "21st.dev … MEMBERS ÜYELİK VS SİPARİŞ TAKİP KARGO VS ONLARIDA" + "GMAİL İLE GİRİŞ". **Bu görev yalnız arayüz + akış katmanıdır:** gerçek kimlik doğrulama, veritabanı ve kargo API'si YOK. Veriler bir **adaptör arayüzünün** arkasında (`lib/<alan>/adapter.ts`: `mock` uygulaması dev/test için; gerçek uygulama 040–050/069–072 ONAY GEREKLİ görevlerinde Supabase ile). Production build'de mock adaptör yalnız `NEXT_PUBLIC_DEMO=1` iken; aksi hâlde sayfalar "Yakında" durumunu gösterir (sahte başarı yok).

## Kullanılacak araçlar
- ECC skill: frontend-patterns, accessibility, security-review (form güvenliği), verification-loop; skill `motion-framer`, `ui-ux-pro-max`
- 21st MCP: Split Sign In Form 39096 (diarmuradi), Sign Up Form 28332 (diarmuradi), Order History 7710 (kavikatiyar) (kodu `mcp__21st__get_component` ile al, v2 tokenlarına uyarla; ikonlu kart ızgarası ev kuralı gereği YOK)

## Adımlar
1. `/giris` (tek sayfa, sekme: Giriş / Üye ol): en üstte tam genişlik **'Google ile devam et'** düğmesi (resmi Google marka kuralları: G logosu, 'Google ile devam et' metni, beyaz/koyu varyant), altında 'veya' ve e-posta + şifre (göster/gizle), 'Şifremi unuttum'. Kayıtta ad, e-posta, şifre (güç göstergesi), KVKK aydınlatma + açık rıza onayı (ayrı kutular), ticari ileti izni (isteğe bağlı, ayrı kutu).
2. Sol/sağ bölünmüş düzen (21st 39096 uyarlaması): bir tarafta form, diğer tarafta zeytinlik görseli + 'Kökü toprakta. Yeri sofrada.' (testimonial YOK — uydurma yorum yasak).
3. `/hesabim`: Profil (ad, e-posta, telefon), Adreslerim (ekle/düzenle/sil, varsayılan), Siparişlerim (21st 7710 uyarlaması: sipariş no, tarih, tutar, durum rozeti, 'Takip et' → `/siparis-takip?no=`), Çıkış. Mobilde sekmeler üstte kaydırılabilir.
4. Adaptör: `lib/auth/adapter.ts` (`signInWithGoogle`, `signInWithEmail`, `signUp`, `resetPassword`, `getSession`, `signOut`) + `lib/account/adapter.ts`; mock uygulama. Gerçek: Supabase Auth Google OAuth (043/040–042'de, ONAY GEREKLİ).
5. Sepet/ödeme akışında misafir alışverişi korunur; ödeme adımında 'Google ile hızlı giriş' önerisi (zorunlu değil).

## Kabul kriterleri
- [ ] e2e (mock): Google düğmesi adaptörü çağırır, e-posta kayıt/giriş/doğrulama hataları, KVKK onayı zorunlu, hesabım sekmeleri, adres CRUD
- [ ] Erişilebilirlik: form etiketleri, hata mesajları aria-live, şifre alanı autocomplete
- [ ] `lint.mjs app components` 0 FAIL; production `inspect.mjs` (iç sayfa istisnasıyla) FAIL 0; 1440/390 + iPhone 14 ekran görüntüleri `test-results/108/`
- [ ] lint/typecheck/build; e2e (mock adaptörle) + reduced-motion

## Durum: BEKLİYOR
