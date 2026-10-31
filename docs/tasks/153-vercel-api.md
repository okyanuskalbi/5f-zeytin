# Task 153: Vercel API yayın geçişi

## Hedef
Doğrulanan commit normal main push; dağıtım doğrudan Vercel API ile. Test kapıları korunur, çift yayın olmaz.

## İlk gözlem (cihaz girişi öncesi)
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

## Yayın ve kabul
- Normal main push yapıldı. İlk CI, eski GitHub deploy adımlarını zorunlu tutan dört workflow beklentisiyle RED oldu. Testler yeni API sınırına güncellendi: GitHub'da token/yayın yok, bütün doğrulamalar her durumda koşar; eski güvenlik korumaları korunur.
- Yayınlanan commit: `112f55ffbc78ae93807fcd1b4e4b9d9d811f5185`. [GitHub doğrulaması](https://github.com/okyanuskalbi/5f-zeytin/actions/runs/41250576271) SUCCESS: 83 dosya / 1146 test, lint, typecheck, production build PASS.
- Kaynak, git snapshot'ından okundu; yalnız commit edilmiş 1338 dosya / 57.660.413 bayt. Yerel auth/env/cache ve aday Flow dosyaları kaynak paketine alınmadı. Snapshot manifest hash'i yayın makbuzunda.
- Vercel REST API `/v2/files` ve `/v13/deployments` kullanıldı; `project`, ekip ve production hedefi açıkça sabitlendi. Mevcut Node 24.x/nextjs korundu; build komutu aynı varlık kontrolünü koruyarak `ASSET_SKIP_REENCODE=1 npm run build` oldu.
- Yeni production: `dpl_EmnZx1KUcZ5R5WkYnX9kCMkLXSkB`, **READY**, aliasAssigned **true**. `afinazeytin.com`, `www.afinazeytin.com`, `afina-zeytin.vercel.app` yeni dağıtıma bağlı.
- Canlı HTTP/HTML kabulü: `/` ve `/giris` 200; yeni resmî başlık, altı bölüm, gerçek tesis görseli, beş görünür/JSON-LD cevap, canonical ve robots metadata doğru. Katalog API'si veritabanından altı ürün döndürüyor.
- Özel hesap sayfaları `/giris`e 307; müşteri account/adres/sipariş API'leri oturumsuz 401 ve private/no-store. Gerçek müşteri oluşturma, şifre/sipariş/adres mutasyonu yapılmadı. Uzak customer migration uygulanmadı; canlı üyelik/ödeme kabulü değildir.
- Tarayıcı/e2e/Lighthouse çalıştırılmadı. Yeni Flow videosu runtime'a alınmadı; kalan üç üretim Google doğrulama engelindedir.
- Kanıt: `docs/referans/yayin-20261101.json`. Önceki READY ID makbuzda korunur. Token veya oturum kodu repoda yok.

## Durum: TAMAMLANDI
