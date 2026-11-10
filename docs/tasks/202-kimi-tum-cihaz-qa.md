# Task 202: Yeni ön yüz — tüm cihaz QA (yalnız analiz)

> `docs/MASTER-PROMPT.md` **A7** aşaması. Yöntem `docs/tasks/197-tum-cihaz-analizi.md` ile aynı; hedef canlı site değil **yerel yeni sürüm**.

## Tür
QA (Kimi)

## Bağımlılık
201 TAMAMLANDI.

## Hedef
Yerel production sunucusu (`npm run build` + `next start -p 3004`, yerel test DB'si `afina_kontrol189`; ortamı Claude verir). Girişli sayfalar için `next dev -p 3005` + `BETTER_AUTH_URL=http://localhost:3005` (yalnız yerel test hesabı).

## Kapsam
MASTER-PROMPT §11 tüm sayfalar + §13 test matrisi (15 cihaz, Chromium + WebKit) + akışlar (197 listesi) + her ekran görüntüsünün gözle incelenmesi. Yerelde formlar gönderilebilir (yalnız yerel DB); canlıya hiçbir istek atılmaz.

## Teslim
`output/task202/RAPOR.md` + `rapor.json` + ekran görüntüleri (197 rapor biçimi: özet, sorun tablosu — önem, sayfa, cihaz, ne oluyor, görüntü, olası dosya, önerilen düzeltme — sorunsuzlar, ölçülemeyenler). Son satır: `KIMI-202 BİTTİ`.

## Yapılmaması gerekenler
Repo dosyası değiştirme (yalnız `output/task202/` ve `AFINA-KAYNAK/araclar/202/`), commit yok, canlı siteye istek yok. MASTER-PROMPT §15.

## Sonra
Claude bulguları `## Düzeltme 202-x` olarak yazar → Codex uygular → Kimi yalnız ilgili sayfa × cihazları yeniden ölçer. Kritik/Yüksek 0 olunca K3.

## Durum: BEKLİYOR (201 sonrası)
