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
