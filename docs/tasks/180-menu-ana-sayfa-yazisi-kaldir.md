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
- [ ] Birim testi: telefon menüsü üst satırında görünür "Ana Sayfa" metni yok; logo bağlantısının erişilebilir adı "Ana Sayfa" ve href "/".
- [ ] Mevcut menü/odak testleri geçiyor.
- [ ] `npm test`, lint, typecheck, build yeşil. Yayın + makbuz `.cache/task-180/final-receipt.json`.
- Görsel kabul (mobil 390): Claude.

## Yapılmaması gerekenler
- Menünün başka bölümleri, renkleri, navbar değişmesin. Yeni bağımlılık yok.
