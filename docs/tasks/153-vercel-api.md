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

## Durum: DOĞRU VERCEL PROJE ERİŞİMİ BEKLİYOR
