# Task166 — GitHub kurulum hatasının düzeltilmesi

## İstek ve kapsam
Kullanıcı, main push sonrasında başarısız olan workflow'un düzeltilmesini veya
kaldırılmasını istedi. Ardından Vercel bağlantısı ile yetkilendirme yapılacak;
bu görevde production deploy başlatılmaz.

## Doğrulanan neden
`cbaec3d` main'e gönderildi. GitHub Actions run `41339456157`, job
`124946177607`, `npm ci` adımında EUSAGE ile durdu. Node 24.22.1 / npm
11.19.1 logu, lockfile'da `@emnapi/core@1.11.3` ve
`@emnapi/runtime@1.11.3` kayıtlarının eksik olduğunu bildirdi. Testler ve build
henüz başlamamıştı. Son bağımlılık kurulumunda platforma bağlı dört optional
kayıt lockfile'dan düşmüş; yerel node_modules ile geçen testler temiz Linux
kurulumunu doğrulamıyordu.

## Düzeltme
Önceki `371818f` lockfile'ındaki dört kayıt aynı sürüm ve metadata ile geri
alındı: üst core/runtime 1.11.3 ve Tailwind WASI içindeki bundled core/runtime
1.11.1. Yeni libphonenumber 1.13.15 korunur; paket sürümü yükseltilmez.

Workflow test/build amaçlı kalır. İçinde Vercel CLI, deploy komutu veya
Vercel tokenı bulunmaz. Başarısız koşunun geçmişi silinmez; yeni düzeltme
commit'inin sonucu ayrıca doğrulanır.

## Kabul
- İzole Linux x64/glibc çözümlemesi: cache'deki npm 11.19.0 ile `npm ci
  --dry-run --ignore-scripts --offline --include=optional`; eski lock aynı
  EUSAGE hatası, düzeltilmiş lock PASS. Gerçek offline kurulum lucide-react
  tarball'ı cache'de olmadığı için tamamlanmadı; dry-run kurulum başarısı değildir.
  Mevcut node_modules değiştirilmedi. Kanıt `.cache/task-166/lockfile-verification`.
- İlgili workflow güvenlik testleri: 11/11 PASS.
- Normal main push: `60a320f425a32d9bf1e07ad8702ed63054ed48fb`.
- Yeni GitHub Actions run `41339970932`: SUCCESS. Temiz `npm ci`, lint,
  typecheck, unit ve production build adımlarının tümü geçti. Bu sonuç
  doğrudan GitHub API'den doğrulandı; eski başarısız koşu tarihçede kalır.
- Vercel deploy: yapılmadı.

Vercel cihaz girişi kullanıcı için başlatıldı; yetkilendirme bekleniyor.
Bu kayıt yalnız CI onarımının tamamlandığını bildirir. API yayını ayrı iştir.

## Durum: TAMAMLANDI
