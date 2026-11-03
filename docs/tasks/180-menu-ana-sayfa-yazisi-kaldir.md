> ONAY VERİLDİ (kullanıcı, 3 Kas 2026, ekran görüntüsüyle): telefon menüsü üst satırındaki "Ana Sayfa" yazısı için "bunu kaldır". Main push ve Vercel REST yayını AGENTS.md'deki gibi yetkilidir.

# Task 180: Telefon menüsü üst satırından "Ana Sayfa" yazısını kaldır

## Tür
frontend

## Amaç
Telefon menüsünün koyu yeşil üst satırında logonun yanındaki görünür "Ana Sayfa" yazısı kaldırılsın; satırda yalnız logo ve Kapat düğmesi kalsın.

## Bağlam
- `components/site/NavbarMenu.tsx:69-70`: `<Link … aria-label={home.label} className={styles.menuHome}><BrandLogo … /><span>{home.label}</span></Link>`. Task 179 bu satıra koyu zemin verdi.

## Kullanılacak araçlar
- Skill: `frontend-patterns`, `tdd-workflow`.

## Adımlar
1. Görünür `<span>{home.label}</span>` kaldırılsın. Logo bağlantısı ana sayfaya gitmeye devam etsin; erişilebilir adı `aria-label="Ana Sayfa"` olarak kalsın, ilk odak yine bu bağlantıda olsun.
2. Logo ile Kapat düğmesinin hizası ve satır yüksekliği bozulmasın; boşalan yer kalmasın.
3. Masaüstü/tablet menüsü ve navbar'daki "Ana Sayfa" bağlantısı DEĞİŞMESİN; yalnız telefon menüsü üst satırı.

## Kabul kriterleri
- [x] Birim testi: telefon menüsü üst satırında görünür "Ana Sayfa" metni yok; logo bağlantısının erişilebilir adı "Ana Sayfa" ve href "/".
- [x] Mevcut menü/odak testleri geçiyor.
- [x] `npm test`, lint, typecheck, build yeşil. Yayın + makbuz `.cache/task-180/final-receipt.json`.
- Görsel kabul (mobil 390): Claude.

## Yapılmaması gerekenler
- Menünün başka bölümleri, renkleri, navbar değişmesin. Yeni bağımlılık yok.

## Coder Notu
- `frontend-patterns` ve `tdd-workflow` uygulandı; yerel Next.js Link rehberi okundu.
- Yalnız telefon üst satırındaki metin span'i kaldırıldı. Logo, erişilebilir ad, href, ilk odak ve CSS ölçüleri korundu; tek flex öğesi kaldığından iç gap boşluk ayırmaz. Yeni bileşen/bağımlılık gerekmedi.
- RED: menü testinde 1 beklenen hata / 3 başarılı; GREEN: `npm test -- --maxWorkers=2` 122 dosya / 1446 test PASS. Mevcut menü, odak ve tablet düzeni testleri dahil.
- `npm run lint`, `npm run typecheck`, `npm run build` (Turbopack), `git diff --check` PASS. Komut kayıtları `.cache/task-180/` altında.
- Tarayıcı çalıştırılmadı; 390 px görsel kabul kullanıcı talimatıyla Claude'a aittir.
- Kaynak `cc1eb30456d3ae8fe70d76f881770569c84950ff` origin/main üzerinde; CI `41628551599` SUCCESS. Vercel REST `dpl_4zycEgjdnsoyjs2hvLFWhgGumAkW` READY, afinazeytin.com bağlı; canlı HTTP 200 doğrulandı. Makbuz `.cache/task-180/final-receipt.json`.
- Uygulama/komut/yayın kapsamında eksik yok; tarayıcı/görsel kabul bu tamamlanma kaydına dahil değildir.

## Durum: TAMAMLANDI
