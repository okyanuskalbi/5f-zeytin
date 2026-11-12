# Task 202: Yeni ön yüz — tüm cihaz QA (yalnız analiz)

> `docs/MASTER-PROMPT.md` **A7** aşaması. Yöntem `docs/tasks/197-tum-cihaz-analizi.md` ile aynı; hedef canlı site değil **yerel yeni sürüm**.

## Tür
QA (Kimi)

## Bağımlılık
201 TAMAMLANDI (`f389ad0`). Temel: main, A tasarımı (198/198-2/198-3) + 199 + 200 + 201.

## Ortam (Claude, 11 Kasım)
- Ortamda `TEST_DATABASE_URL` var (yerel Postgres `afina_kontrol189`). Sunucuyu Codex'in kullandığı güvenli yoldan başlat: `output/task201/run-clean.mjs` (yalnız localhost afina_kontrol189'a izin verir, `--local-auth` ile geçici oturum sırrı üretir, `no-env.cjs` ile `.env*` okumayı engeller). Kopyasını `AFINA-KAYNAK/araclar/202/` altına al, `BETTER_AUTH_URL` portunu kendi portuna göre değiştir.
- Girişli sayfalar için yerel test hesabını yalnız bu DB'de oluştur; yönetici gerekiyorsa `npm run admin:grant` yalnız bu DB'de. İş bitince geçici hesap/sipariş/adresleri temizle, açtığın sunucuları kapat.
- Bilinen açık iş (bulgu sayma, "bilinen" diye listele): yönetim paneli özet kartları "Veri yok" (özet yükleyicisi bağlı değil, 201 Coder Notu).

## Hedef
Yerel production sunucusu (`npm run build` + `next start -p 3004`, yerel test DB'si `afina_kontrol189`; ortamı Claude verir). Girişli sayfalar için `next dev -p 3005` + `BETTER_AUTH_URL=http://localhost:3005` (yalnız yerel test hesabı).

## Kapsam
MASTER-PROMPT §11 tüm sayfalar + §13 test matrisi (15 cihaz, Chromium + WebKit) + akışlar (197 listesi) + her ekran görüntüsünün gözle incelenmesi + MASTER-PROMPT §14.1 son kalite listesi (12 madde, her sayfa için PASS/FAIL; FAIL'ler sorun tablosuna). Yerelde formlar gönderilebilir (yalnız yerel DB); canlıya hiçbir istek atılmaz.

## Teslim
`output/task202/RAPOR.md` + `rapor.json` + ekran görüntüleri (197 rapor biçimi: özet, sorun tablosu — önem, sayfa, cihaz, ne oluyor, görüntü, olası dosya, önerilen düzeltme — sorunsuzlar, ölçülemeyenler). Son satır: `KIMI-202 BİTTİ`.

## Yapılmaması gerekenler
Repo dosyası değiştirme (yalnız `output/task202/` ve `AFINA-KAYNAK/araclar/202/`), commit yok, canlı siteye istek yok. MASTER-PROMPT §15.

## Sonra
Claude bulguları `## Düzeltme 202-x` olarak yazar → Codex uygular → Kimi yalnız ilgili sayfa × cihazları yeniden ölçer. Kritik/Yüksek 0 olunca K3.

## Durum: BEKLİYOR (201 sonrası)

## Sonuç (Claude, 12 Kasım)
Rapor `output/task202/RAPOR.md` (veri Kimi, tamamlama Codex): 0 Kritik / 0 Yüksek / 0 Orta / 1 Düşük. K3 geçti. WebKit telefon alanı "readonly" bulgusu test kaynaklı (alan ekran dışında, kaydırınca hazır), site hatası değil.

## Düzeltme 202-1 (Codex)
202-01: ana sayfa hero posteri `/blog` ve blog yazılarında da ön yükleniyor. Kök nedeni bul (`components/storefront/StoreHome.tsx:34`, ortak layout/head), ön yüklemeyi yalnız `/` sayfasında üret. Kanıt: 5 blog rotası + `/` için belge başında poster `preload` var/yok tablosu (yalnız `/`'da var), WebKit 320/360/375 ve Chromium 1440'ta kullanılmayan kaynak uyarısı 0; ana sayfa LCP'si gerilemedi (telefon ≤ 2,5 sn). lint, typecheck, test, build PASS. Tek kayıt: `fix: 202-1 hero poster ön yüklemesi yalnız ana sayfada`. Kanıt `output/task202-1/KANIT.md`.

## Coder Notu 202-1 (Codex)

12 Kasım 2026 — 202-01 kapandı. İlk HTML'de bloga ait poster ön yüklemesi
zaten yoktu; blogdaki Ana Sayfa bağlantısının varsayılan arka plan hazırlığı
ana sayfa yanıtını alıp poster bağlantısını blogun belge başına ekliyordu.
Yalnız `app/blog/page.tsx` ve `app/blog/[slug]/page.tsx` içindeki Ana Sayfa
bağlantısında `prefetch={false}` kullanıldı. StoreHome ve ortak layout
korundu; ana sayfanın erken poster yüklemesi değişmedi.

Beş blog testi önce beklenen nedenle FAIL, düzeltme sonrası PASS; mevcut
ana sayfa poster testi PASS. 150 dosya/1311 test, lint, typecheck ve
Turbopack build PASS. Altı rota × Chromium1440/WebKit320/360/375 = 24
kontrolde poster yalnız `/` belge başında; blog poster isteği ve kullanılmayan
kaynak uyarısı 0. Üç ek soğuk Chromium390 açılışı 76/48/64 ms; önce140 ms.
WebKit320 önce148 ms, sonra128 ms; WebKit360 156 ms,375 112 ms.
Yerel/yavaşlatılmamış ölçüm; telefon LCP≤2,5 sn ve gözlenen gerileme yok.
Fiziksel cihaz/canlı kabulü değildir.

Kanıt: `output/task202-1/KANIT.md`, before/after.json, red/green ve kontrol
kayıtları. frontend-patterns + tdd-workflow uygulandı; yeni bileşen yok.
Kullanıcının tek kayıt talimatıyla ayrı RED/GREEN kayıtları oluşturulmadı.
Yalnız güvenli başlatıcı, yerel afina_kontrol189 ve headless tarayıcılar;
açılan sunucular/tarayıcılar düzgün kapandı. .env* okunmadı/yazılmadı;
push/yayın/Vercel/canlı DB yok; node_modules/.next korundu; output ve
AFINA-KAYNAK git'e alınmadı.
