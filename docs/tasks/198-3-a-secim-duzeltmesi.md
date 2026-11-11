# Task 198-3: K1 sonrası A düzeltmesi (Codex)

> K1 kararı (11 Kasım 2026): kullanıcı **A / Codex "Ellek sofrası"** tasarımını seçti. Kaynak: `output/task198-kiyas/KIYAS.md` + `KIYAS.pdf` (A 8/12, B 7/12). Bu görev A'nın kıyasta FAIL olan maddelerini ve "199 öncesi yapılacaklar" listesini kapatır. Talimat: `docs/MASTER-PROMPT.md` (§11.1, §13, §14, §14.1, §15).

## Tür
frontend

## Bağımlılık
198 (codex) + 198-2 TAMAMLANDI; K1 = A.

## Kapsam (yalnız bunlar)
1. **Telefon ürün sayfası:** 390×844 ve 320×568'de seçili boy, fiyat ve "Sepete ekle" ilk ekranda görünsün (ürün fotoğrafı küçülebilir ya da bilgi bloğu yukarı alınabilir; §11.1 düzeni bozulmasın). Kanıt: ilk ekran görüntüsü + düğmenin `getBoundingClientRect().bottom <= innerHeight` ölçümü.
2. **Fotoğraf üstü etiket (§14.1 madde 7):** açılıştaki yer adı rozeti (`components/storefront/StoreHome.tsx:38`, `StoreHome.module.css:15`) fotoğrafın dışına alınsın ya da kaldırılsın. Açılış başlığı fotoğraf üstünde kalır; kapsayıcısına §14.1'in izin işareti (`data-overlay-ok` ya da DESIGN.md'de tanımlı karşılığı) eklensin ve çakışma testi bunu tanısın.
3. **Uzun tire (§14.1 madde 1):** ziyaretçiye görünen ön yüz metinlerinde `—` ve `–` kalmasın. Sayı aralıkları kısa çizgiyle ("2-4 iş günü"), ayraçlar virgül ya da nokta ile. Bu görevde yalnız: `components/cart/CartPresentation.tsx:88`, `components/landing/TrustStrip.tsx:10`, `lib/catalog/product-details.ts` kargo satırı, ürün sayfası title/description ve `app/llms.txt/route.ts`. Form, hesap, admin ve hata metinleri 199/200'de; dokunma. Kanıt: `rg -n "—|–" components/storefront components/cart app/urun app/page.tsx lib/catalog app/llms.txt` → 0.
4. **Köşe tablosu (§14.1 madde 10):** `docs/DESIGN.md` içine tek tablo: öğe türü (düğme, kart, görsel, rozet/etiket, form alanı, çekmece/pencere) → köşe ölçüsü → token adı. Koddaki gerçek değerlerle birebir; uyuşmayan yer varsa kodu tabloya uydur (marka görünümünü değiştirmeden).
5. **Kontrast kanıtı (§14.1 madde 11):** ana sayfa + ürün sayfası; 390 WebKit, 768, 1440. Fotoğraf/video üstündeki başlık ve düğmeler için sayısal oran (metin rengi ile arkasındaki en açık/en koyu piksel bölgesi örneklenerek) ≥ 4,5:1 (büyük başlık ≥ 3:1); hata, pasif ("Mevcut değil"), odak ve seçili durumları ayrıca ölç. Gerekirse yalnız örtü (scrim) koyuluğunu ayarla. Kanıt `output/task198-3/KONTRAST.md` + json.

## Kullanılacak araçlar
ui-ux-pro-max, frontend-design, better-layout, motion-framer (değişen hareket varsa), responsiveness-check, impeccable/audit-ai-design-slop. 21st: bu görevde yeni bileşen yok.

## Kabul kriterleri
- [x] lint, typecheck, test, build, `git diff --check` PASS.
- [x] `scripts/qa-storefront-collisions.mjs` GREEN (0); 320/390/768/1024/1440/1920 × ana sayfa + ürün sayfası taşma 0, konsol hatası 0, kırık görsel 0.
- [x] Kapsam 1-5 için kanıt `output/task198-3/KANIT.md` (madde başına PASS/FAIL + dosya:satır ya da ekran adı). §14.1'in 12 maddesi yeniden puanlanır; hedef 12/12.
- [x] Ekran görüntüleri: `output/task198-3/ekran/` (ana sayfa + ürün, 390 WebKit / 768 / 1440, ilk ekran + tam sayfa).

## Yapılmaması gerekenler
MASTER-PROMPT §15 aynen: push/yayın/canlı DB/env yok, `.env*` okuma yok, `node_modules`/`.next` silme yok, AFINA-KAYNAK ve output git'e eklenmez. Font (Fraunces + Figtree) ve marka renkleri değişmez. Kapsam dışı sayfaya (199 işi) dokunma.

## Teslim
Tek kayıt: `fix: 198-3 A seçimi sonrası düzeltmeler`. Bu dosyaya `## Coder Notu (Codex)` + `## Durum: TAMAMLANDI`. Son satır: `CODEX-198-3 BİTTİ`.

## Coder Notu (Codex)

K1=A yönü korundu. Telefonda ürün adı, boy, fiyat ve satın alma bilgisi fotoğraftan önce gelir; masaüstünde fotoğraf solda, bilgi sağda kalır. 320×568'de Sepete ekle alt kenarı559,36px;390×844 WebKit'te537,75px. Fotoğraf, açıklama, boy/adet ve mevcut sepet/teklif işlevleri korunur.

Açılış yer rozeti kaldırıldı. Başlık/eylem grubu `data-overlay-ok`, video düğmesi işlevsel `data-media-control` taşır; kalıcı çakışma testi artık hero dahil20 ana sayfa hedefini denetler. Başlık bazı gerçek video karelerinde1,77:1 ölçüldüğü için yalnız yerel koyuluk güçlendirildi ve kenarları yumuşatıldı; fotoğraf üstündeki düğmelerin odak çizgisi açık düğme zeminine alındı. Son en kötü beyaz sınır7,157:1; hata6,745:1, pasif4,503:1, seçili12,065:1, odak5,131:1. Marka renkleri/Fraunces/Figtree değişmedi.

İstenen uzun tireler kaldırıldı; ürün metadata title/description zaten uygundu. Tek köşe tablosu DESIGN.md'de; storefront ve ortak sepet CSS'inde mevcut değerler adlandırılmış değişkenlere bağlandı, ölçüler değiştirilmedi. İlgili eski testlerin beklediği kargo/llms metinleri ve yer rozeti beklentisi güncellendi.

Rehberler: ui-ux-pro-max, frontend-design, better-layout, better-typography, better-colors, responsiveness-check, audit-ai-design-slop ve web-design-guidelines. Motion/shadcn rehberleri uyumluluk için okundu; yeni hareket/bileşen/paket yok,21st gerekmiyor. Eski v9 renk/scroll önerileri ve genel uzun tire tavsiyesi uygulanmadı; MASTER-PROMPT esas alındı.

Kanıt `output/task 198-3/KANIT.md`; `KONTRAST.md` + `contrast.json`/`state-contrast.json`,30profil `matrix.json`, `collisions/report.json`, iki ilk ekran `first-screen/report.json`, ekranlar `ekran/`. §14.1 bu görev kapsamı12/12. 1438 yazı örneği ve9odak durumu ölçüldü. 30profil/375kart-satır-hero denetiminde çakışma, taşma, konsol, kırık görsel,4xx/5xx,axe, küçük hedef ve düğme kırılması0; Chromium CLS en çok0,013297,WebKit desteklemediği için ölçülmedi. Menü Esc/odak, boy/adet/sepet, teklif ön seçimi, ödeme hazırlık yüzeyi ve reduced-motion iki motorda PASS.

Lint/typecheck/build/diff kontrolü PASS;1483 birim testi PASS, yerel PostgreSQL gerektiren26test bağlantı sağlanmadığı için SKIP. Telefon hız ölçümü1,916/1,916/1,924sn, masaüstü52/44/44ms; JavaScript232.952/396.105bayt, sınırlar altında. Yerel ölçümler fiziksel cihaz veya canlı kabul değildir.

Push/yayın/Vercel/canlı DB/.env işlemi yok. Önceki run-clean/no-env koruması kullanıldı. node_modules ve .next silinmedi; output ve AFINA-KAYNAK kayda eklenmedi. Test tarayıcıları ve bu görevin3018/3019sunucuları düzgün kapatıldı, geçici sertifikalar temizlendi. Form/hesap/admin metinleri ve199/200işleri bu görev dışında; müşteri hikâye malzemesi hâlâ bekleniyor.

Tek yerel kayıt: `fix: 198-3 A seçimi sonrası düzeltmeler`.

## Durum: TAMAMLANDI
