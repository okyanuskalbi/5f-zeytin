# Task 203: Önizleme paketi (yayın Claude'da, kullanıcı onayıyla)

> `docs/MASTER-PROMPT.md` **A8** aşaması.

## Tür
sunum (Codex)

## Bağımlılık
202 K3 geçti (Kritik/Yüksek bulgu 0).

## Codex üretir
1. `AFINA-KAYNAK/tasarim/uygulama-kontrol/AFINA-onyuz-v2-onizleme.pdf`: kapak + her sayfanın 1440 ve 390 ekran görüntüsü (yan yana), sayfa başına 1–2 satır sade Türkçe açıklama, son sayfada "ne değişti / ne aynı kaldı" listesi. Teknik terim yok.
2. `AFINA-KAYNAK/tasarim/uygulama-kontrol/AFINA-onyuz-v2-gezinti.mp4`: ana sayfa → ürün → sepet → ödeme sayfası akışı, 1440 ve 390 (iki ayrı bölüm), doğal hızda kaydırma, ≤ 60 sn, sessiz.
3. `output/task203/KANIT.md`: kullanılan sunucu, commit, sayfa listesi.

## Claude yürütür (kullanıcı K4 onayından sonra)
push → CI (`vercel-yayin.yml`) yeşil → yeni klasörde `deploy.py prepare/preflight/upload/create/status` → canlı kontrol (sayfalar 200, /admin + /api/account 401, video, hız) → geri dönüş sürümü notu.

## Yapılmaması gerekenler
Codex: push/yayın/Vercel yok; kod değişikliği yok (bulgu görürse Coder Notu'na yazar). MASTER-PROMPT §15.


## Coder Notu (Codex)

12 Kasım 2026 — Codex üretir 1–3 tamamlandı. Önizleme kaynağı, ilk işin
`5f29b95` kaydıdır; bu aşamada uygulama kodu değiştirilmedi.

`AFINA-KAYNAK/tasarim/uygulama-kontrol/AFINA-onyuz-v2-onizleme.pdf`:
40 sayfa; kapak, 38 sayfa/durum için1440×900 ve390×844yan yana görüntüler,
1–2satır Türkçe açıklama, son sayfada değişen/korunanlar. Aynı klasörde
`AFINA-onyuz-v2-gezinti.mp4`:48,12sn,sessiz; iki ayrı boyutta ana sayfa→ürün→
sepet→ödeme hazırlık ekranı, doğal hız. Gerçek ödeme/sipariş gönderimi yok.
Kanıt ve38sayfa listesi `output/task203/KANIT.md`; capture.json,receipt.json,
76ilk ekran+76tam sayfa görüntüsü, PDF/video doğrulama kayıtları aynı klasörde.

Halka açık30sayfa production, girişli6hesap+2yönetim sayfası yerel geliştirme
sunucusunda kaydedildi. Yalnız output/task201/run-clean.mjs, ortamdan yerel
TEST_DATABASE_URL/afina_kontrol189 ve geçici --local-auth kullanıldı.
Test hesabı, kendi siparişi/adresi ve yetkisi temizlendi. Sunum görüntülerinde
yalnız geliştirme düğmesi gizlendi. Tüm ekran çiftleri, PDF örnek sayfaları
ve video sırası gözle incelendi; PDF40sayfa, video48,12sn/0ses akışı doğrulandı.
Açılan sunucular ve tarayıcılar kapatıldı;3024/3025dinleyen süreç yok.

**Yalnız not edilen ek bulgu — ayrı inceleme/düzeltme bekliyor:**
`components/account/Register.tsx:64-65` formunda method/action ve JavaScript
hazır olmadan gönderimi engelleyen koruma yok; yerel hazırlık sırasında
JavaScript devreye girmeden gönderimde formun varsayılan GET yolu çalıştı.
Böyle bir durumda şifre alanı dahil form değerleri adres sorgusuna taşınabilir.
Yerel deneme değerleri kullanıldı, sorgu kaydı maskelendi; gerçek kullanıcı
verisi yok. Normal girişli çekim başarıyla tamamlandı. Bu gözlem tüm
cihazlarda tekrar edilmiş bir normal-akış hatası olarak sunulmuyor;
Task203'ün kod değişikliği yasağı gereği yalnız burada kaydedildi.

Bilinen sınırlar korundu: panel özetleri “Veri yok”; ödeme/takip hizmetleri
hazırlıkta, hukuk metinleri ve gerçek fiyat/stok onayları ayrı bekleyen işler.
K4 onayı/yayın/fiziksel cihaz kabulü verilmiş sayılmaz. Push/yayın/Vercel/canlı
DB/.env* okuma-yazma yok; node_modules/.next korundu. Geliştirme sunucusunun
ürettiği next-env.d.ts farkı geri alındı; yalnız bu görev belgesi kayda girdi.
AFINA-KAYNAK ve output git'e eklenmedi. Geçici dosyalar temizlendi.

## Durum: ÖNİZLEME HAZIR (K4 kullanıcı onayı bekliyor)
