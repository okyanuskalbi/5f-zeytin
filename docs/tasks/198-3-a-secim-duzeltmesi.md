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
- [ ] lint, typecheck, test, build, `git diff --check` PASS.
- [ ] `scripts/qa-storefront-collisions.mjs` GREEN (0); 320/390/768/1024/1440/1920 × ana sayfa + ürün sayfası taşma 0, konsol hatası 0, kırık görsel 0.
- [ ] Kapsam 1-5 için kanıt `output/task198-3/KANIT.md` (madde başına PASS/FAIL + dosya:satır ya da ekran adı). §14.1'in 12 maddesi yeniden puanlanır; hedef 12/12.
- [ ] Ekran görüntüleri: `output/task198-3/ekran/` (ana sayfa + ürün, 390 WebKit / 768 / 1440, ilk ekran + tam sayfa).

## Yapılmaması gerekenler
MASTER-PROMPT §15 aynen: push/yayın/canlı DB/env yok, `.env*` okuma yok, `node_modules`/`.next` silme yok, AFINA-KAYNAK ve output git'e eklenmez. Font (Fraunces + Figtree) ve marka renkleri değişmez. Kapsam dışı sayfaya (199 işi) dokunma.

## Teslim
Tek kayıt: `fix: 198-3 A seçimi sonrası düzeltmeler`. Bu dosyaya `## Coder Notu (Codex)` + `## Durum: TAMAMLANDI`. Son satır: `CODEX-198-3 BİTTİ`.

## Durum: BEKLİYOR
