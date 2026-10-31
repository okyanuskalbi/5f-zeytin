# Task 153: Vercel API yayın geçişi

## Hedef
Doğrulanan commit normal main push; dağıtım doğrudan Vercel API ile. Test kapıları korunur, çift yayın olmaz.

## 1 Kasım gözlemi
- GitHub erişimi `okyanuskalbi`; uzak main başlangıçta `e58567be0df7e1d7d63ae4ffb6e032e838dacf2f`, branch protection kapalı.
- `.github/workflows/vercel-yayin.yml` main push'ta test ve production deploy yapıyor; bu görevde değiştirilmedi/devre dışı bırakılmadı.
- ZEYTİN proje: `prj_4nr3Qeu05CcoMgDXt7MeAfnflyPp`, ekip: `team_IWBdFFE1yrN06w4L0BQxK1Cz`.
- Yerel Vercel CLI oturumu okunabildi; `/v2/user` ve `/v2/teams` 200 döndü, yalnız OYA GOLD ekibi erişilebilir. ZEYTİN `/v9/projects/<id>?teamId=<id>` 403. Kimlik bilgisi gösterilmedi/değiştirilmedi.
- Git auto-deploy durumu bu erişimle okunamadı; bilinmiyor. Hata yanıtı "bağlı değil" kanıtı değildir.

## Devam sırası
1. Kullanıcı doğru ZEYTİN Vercel hesabıyla yerel CLI oturumunu açar veya yetkili bağlantıyı sağlar; token sohbete istenmez.
2. Proje, ekip, alan adları ve Git auto-deploy okunur. Mevcut production sürümü kaydedilir.
3. Testler yeşilken Actions'ın yalnız deploy adımları kontrollü kaldırılır; lint/typecheck/unit/build CI olarak kalır. Git auto-deploy varsa tek yayın sorumlusu olacak şekilde doğrulanır.
4. Görev dosyaları açıkça stage/commit, normal main push; uzak SHA kontrolü. Branch protection değişirse PR kullanılır.
5. API deployment aynı commit'i kullanır; deployment ID/state/URL kaydedilir, READY ve domain aynı dağıtımı gösterir. Çağrı yapmadan deploy edildi denmez.

## Doğrulanan devam (1 Kasım)
- Kullanıcının Firefox'ta tamamladığı cihaz girişinden sonra API kimliği `afina-4104`, ekip `afina1` / AFINA olarak doğrulandı. Oturum yalnız bu proje için ignore edilen yerel cache dizinindedir; OYA hesabının global oturumu korunur. Token/redeem kodu repoya alınmaz.
- Proje, alan adları ve son production dağıtımı API'den okundu: proje/ekip doğru; Node 24.x ve nextjs. `link: null`, `gitRepository: null`, `gitProviderOptions.createDeployments: disabled`. Git auto-deploy kapalıdır.
- Önceki READY production: `dpl_FzdZWe3fDUuY24anD4KTS9eayi9q`; `afinazeytin.com`, `www.afinazeytin.com` ve `afina-zeytin.vercel.app` bu hedefe bağlıdır.
- GitHub Actions içindeki Vercel pull/build/deploy adımları kaldırılır; lint/typecheck/unit (≤2 worker)/normal production build korunur. Hiçbir test/koruma atlanmaz. Bu geçişte branch protection false olarak tekrar okundu; normal fast-forward push kullanılacak.
- Mevcut production environment anahtarları adlarıyla doğrulandı (değerler okunup raporlanmadı/değiştirilmedi). Uzak Supabase migration veya ödeme sağlayıcı ayarı bu yayın görevinde uygulanmaz.

## Durum: ERİŞİM DOĞRULANDI; API YAYINI UYGULANIYOR
