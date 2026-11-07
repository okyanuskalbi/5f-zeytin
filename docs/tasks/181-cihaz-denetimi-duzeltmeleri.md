> ONAY VERİLDİ (kullanıcı, 7 Kas 2026): "tüm siteleri mobil vs kontrol et, bir sorun eksik varsa codex'e çözdür". Main push ve Vercel REST API yayını AGENTS.md'deki gibi yetkilidir.

# Task 181: Cihaz denetimi düzeltmeleri (ZEYTİN)

## Tür
frontend

## Amaç
7 Kasım canlı cihaz denetiminde (15 profil, Chromium + WebKit) bulunan görünüm ve dokunma sorunlarını, tasarımı değiştirmeden gidermek.

## Bağlam
Denetim: Claude (headless Playwright, canlı afinazeytin.com, 3e8120e). Ekran görüntüleri `/private/tmp/claude-501/-Users-emre/862bcbce-6e8d-4a73-a71a-971f141b67f4/scratchpad/qa-fable/shots/`.

## Kullanılacak araçlar
- Skill: `frontend-patterns`, `tdd-workflow`, `better-layout`, `ui-ux-pro-max`.
- 21st MCP: hayır (yeni bileşen yok).

## Adımlar
1. **SSS giriş yazısında boşluk kaybı** (≤1023px, tüm telefon + iPad dikey): "İyi bir seçim,açık bilgiylebaşlar." görünüyor. Neden: `components/landing/RenewalLanding.tsx:94` `<br />` çevresinde boşluk yok, `ScrollingSections.module.css:169` mobilde `br` gizliyor. Düzelt: `<br />` öncesine/sonrasına `{" "}` koy (ya da satırları span ile ver). Masaüstünde satır kırılımı aynı kalsın.
2. **Teklif formu "İşletme türü" seçimi Safari/iOS'ta 25px** (diğer alanlar 48px). `components/landing/QuoteComposer.module.css:6`. Düzelt: `.field select` için `appearance:none`, diğer alanlarla aynı yükseklik/padding/kenarlık, sağda ok ikonu (CSS background ya da mevcut Lucide ChevronDown). Chromium görünümü değişmesin, odak halkası kalsın.
3. **3. sahne ("Yeri sofrada") düğmesi sahne gezinmesinin üstüne biniyor** (1366×768 ve 1440×900 gibi kısa ekranlar): "Sofranız için keşfedin" düğmesi ile Zeytinlik/Üretim/Sofra gezinme bağlantıları çakışıyor. `components/landing/HarvestJourney.module.css:51` `.sceneNav` ve `HarvestJourney.tsx:189` CTA ikisi de sağ altta. Düzelt: kısa ekranlarda (yükseklik < 820px) metin sütununa altta yeterli boşluk ver ya da gezinmeyi CTA ile çakışmayacak yere al. Kabul: 1280×720, 1366×768, 1440×900, 1920×1080'de iki öğenin kutuları kesişmez.
4. **Yatay telefonda (844×390) hero düğmesi alt satırla çakışıyor**: "Ürünleri Keşfet" ile "Ellek · Düziçi · Osmaniye" üst üste (`HarvestJourney.module.css:21/95` `.heroFoot`). Düzelt: `(max-height:500px) and (orientation:landscape)` için alt satırı gizle ya da hero'yu içerik kadar uzat. Kesişme 0 olsun.
5. **Boş /sepet sayfasında yerleşim kayması** (Android 412×915, CLS 0.132): özet ve kupon bloğu yüklemeden sonra beliriyor (`components/cart/CartSummary.tsx:145`, `CartExperience.module.css:124`). Düzelt: sunucu tarafında yer ayır (iskelet ya da `min-height`) ve CLS < 0.1 olsun. Sepet/kupon/fiyat mantığına dokunma.
6. **Misafir kullanıcıda konsol hatası**: üyelik penceresi açılınca `GET /api/account` 401 dönüp konsola hata basıyor (`components/account/AuthDialog.tsx:32`). Düzelt: 401'i normal "giriş yapılmamış" durumu olarak sessizce işle (konsol hatası yok). Oturum açıkken davranış değişmesin. Auth/çerez/sunucu kodu DEĞİŞMEZ, yalnız istemci tarafı.
7. **12px altı yazılar**: figcaption "AFİNA ZEYTİN · ÜRETİM TESİSİ" 8px (375/412), adres 10px, üst başlıklar 9–10px, footer 11px, üyelik imzası 11px (`HarvestJourney.module.css:30,89,95,142`, `MobileBuyBar.module.css:4`, `CustomerPanel.module.css:86`). Düzelt: süs etiketleri en az 11px, okunması gereken metin (adres, açıklama, footer) en az 12px. Taşma/kırılma oluşturma.
8. **Ürün kartında ad iki kez**: "Doğal Kırma Yeşil Zeytin" başlığının altında "10 kg Doğal Kırma Yeşil Zeytin" (`components/catalog/ProductCard.tsx`). Düzelt: ikinci satırda yalnız ambalaj/ağırlık (mevcut veriden) görünsün. Ürün adı, fiyat, stok, SKU verisi değişmez; erişilebilir ad tam kalabilir.
9. **Mobil galeri kartında boşluk**: 393/412 dokunmatik kartlarda ağırlık satırı ile fiyat satırı arasında büyük boş alan (`HorizontalProductGallery.module.css`). Düzelt: dokunmatik kart düzenini sıkılaştır; kart ekran içinde kalsın, sürükleme/tıklama davranışı değişmesin.
10. **Alt sayfalarda canonical yok** (sepet, giris, kayit, kvkk, iade, mesafeli-satis, siparis-takip, odeme): her birine kendi URL'si ile canonical ekle. noindex ayarları ve "(Taslak)" başlıkları DEĞİŞMEZ (yasal metinler müşteri onayı bekliyor).

## Kabul kriterleri
- [x] Birim testi: SSS giriş metninin metin içeriği "İyi bir seçim, açık bilgiyle başlar." (tek boşluklu) olur.
- [x] Birim/kaynak testi: `.field select` için `appearance:none` ve diğer alanlarla aynı yükseklik kuralı var.
- [x] Birim testi: AuthDialog 401 yanıtında `console.error` çağırmaz, misafir görünümünü gösterir.
- [x] Birim testi: ProductCard ikinci satırı ürün adını tekrar etmez.
- [x] Birim/kaynak testi: listelenen alt sayfaların metadata'sında `alternates.canonical` var; robots noindex korunur.
- [x] `npm test`, lint, typecheck, build yeşil; main push, exact-SHA CI, Vercel REST yayını READY, makbuz `.cache/task-181/final-receipt.json`.
- Görsel kabul (adım 3, 4, 5, 7, 9; Safari select; 15 profil): Claude canlıda doğrular.

## Yapılmaması gerekenler
- Tasarım, sahne, animasyon, renk, görsel/video değişmez; yalnız listelenen düzeltmeler.
- Sepet, fiyat, stok, ödeme, auth, DB, sunucu API'si ve teklif gönderim mantığı değişmez.
- "%100/organik/doğal" iddiası ekleme ("Doğal Kırma" ürün adı istisna). Yeni bağımlılık ekleme.
- Ürün görsellerini değiştirme (yeni teneke görselleri ayrı onayla gelecek).

## Coder Notu

7 Kasım 2026 — `frontend-patterns`, `tdd-workflow`, `better-layout`, `ui-ux-pro-max` okundu; Next.js yerel metadata rehberi kullanıldı. Yeni bileşen/bağımlılık yok; 21st görev gereği kullanılmadı.

- Adım 1/2/8/10 uygulandı: SSS boşlukları, ortak 48px select ve dekoratif ok, kartta yalnız ağırlık, sekiz sayfada kendi canonical adresi. Ürün verisi, detay kategorisi, noindex ve taslak başlıklar korundu.
- Adım 3/4: masaüstü CTA için en az 92px alt bant ayrıldı (gezinme 24+44px); 500px ve altı yatay ekranda hero alt satırı gizlendi. Adım 5: sepet içeriğine sunucu çıktısından itibaren 320px asgari alan ayrıldı; zaten sunucuda bulunan özet/kuponun yüklemeden sonra aşağı itilmesi hedeflendi. Adım 7/9: süs etiketleri en az 11px, adres/alt satır/footer/üyelik imzası en az 12px; dokunmatik galeride fiyat satırının otomatik üst boşluğu kaldırıldı.
- RED: dört hedef dosyada 13 başarısız / 50 başarılı test. GREEN: aynı dört dosyada 63/63 başarılı. Eski kategori rozeti beklentileri yeni yalnız-ambalaj sözleşmesine uyarlandı; detay kategorisi testleri korundu. Kullanıcının talebiyle ara/RED kaydı oluşturulmadı, yalnız yeşil sonuç kaydediliyor.
- Komutlar: `npm test` **123 dosya / 1460 test PASS**; `npm run lint`, `npm run typecheck`, `npm run build` (Turbopack) **PASS**; `git diff --check` **PASS**. Günlükler `.cache/task-181/` altında. Ayrı kapsam yüzdesi ölçümü yapılmadı.
- **Adım 6 kısmen doğrulandı, tam çözüm yapılamadı:** AuthDialog zaten 401'i gövde okumadan misafir olarak işliyor; yeni test misafir formunu ve `console.error` çağrılmadığını doğruladı. Ancak tarayıcının HTTP 401 kaynak kaydı istemci `catch` ile susturulamaz. Mevcut oturum çerezi HttpOnly ve oturum sunucuda yönetiliyor; isteği kaldırmak oturumu açık kullanıcı davranışını bozar. Görevin sunucu/auth/çerez değişikliği yasağına uyularak bu kod değiştirilmedi. Tam çözüm için sunucunun normal misafir sonucunu hata olmayan yanıtla bildirmesi ayrı kapsam gerektirir.
- **Yayın engeli:** mevcut proje oturumu, güncel Vercel CLI oturumu ve önceki AFINA oturumuyla üç salt okunur hedef kontrolü de `403 Not authorized` döndü. Yeni dağıtım oluşturulmadı; Vercel READY iddiası yok. Geçerli AFINA yayın erişimi gerekiyor.
- Tarayıcılar kullanıcı isteğiyle çalıştırılmadı. Adım 3/4/5/7/9, Safari select, CLS <0.1 ve 15 profil görsel kabulü **Claude'da**; birim/kaynak testi bu kabulün yerine geçmez. Görev adım 6 ve yayın engeli nedeniyle BEKLİYOR.
- Yeşil kaynak main'e gönderildikten sonra exact-SHA CI sonucu ve yayın engeli `.cache/task-181/final-receipt.json` içine kaydedilir; bu makbuz Git dışında yerel kanıttır.

## Yayın — 7 Kasım 2026

- Task 181 + 182 içeren `bc4f16da4e025004ae3c5f6f8e8ceea6bf570d11`, aynı kayda ait [GitHub doğrulaması](https://github.com/okyanuskalbi/5f-zeytin/actions/runs/42370005956) başarılı olduktan sonra doğrudan Vercel REST ile yayımlandı. `dpl_GMnXJDmfsymRAbto7Spgkb9xGqXx` **READY**; `afinazeytin.com` bağlantısı doğrulandı. Önceki 403 yayın engeli kalktı.
- Canlı ana sayfa ve sekiz alt sayfa HTTP 200; sayfaların canonical adresleri, SSS boşlukları ve iki yeni ürün fotoğrafının kaynakla birebir eşleşmesi doğrulandı. Tarayıcı testi yapılmadı; tarayıcı/görsel kabul Claude'da. Kod ve canlı veritabanı değiştirilmedi.
- Adım 6: tarayıcının 401 ağ kaydı Claude tarafından kabul edildi (7 Kasım kullanıcı bildirimi); önceki kısmi kabul notu bu kararla kapanmıştır.
- Güncel makbuz: `.cache/task-181/final-receipt.json` (Git dışında yerel kayıt).

## Durum: TAMAMLANDI

## Düzeltme 181-1 (Claude canlı denetimi, 7 Kas, 8468a47 sonrası)
- Adım 3 hâlâ başarısız: 3. sahnede ("Yeri sofrada") scrollY=3000 konumunda "Sofranız için keşfedin" düğmesi (1366×768'de kutu x1074 y696 238×52) sahne gezinmesinin (Zeytinlik/Üretim/Sofra, y700, x1146–1281) tam üstünde. Çakışma: 1366×768 5153 px², 1440×900 1489 px², 1920×1080 4222 px²; 1280×720 temiz. Ekran: `/private/tmp/claude-501/-Users-emre/862bcbce-6e8d-4a73-a71a-971f141b67f4/scratchpad/kontrol/cta-1366.png`. Eklenen 92px alt bant bu sahnede düğmeyi gezinmeden ayırmıyor.
- Düzelt: bu sahnede düğme ile gezinme hiçbir masaüstü yükseklikte çakışmasın. Öneri: gezinmeyi düğmenin üstüne (ya da sola, metin sütunu hizasına) al veya düğmeyi gezinmenin üstünde ayrı satıra koy. Kabul (Claude ölçer): 1280×720, 1366×768, 1440×900, 1920×1080, 2560×1440'ta sahne boyunca her 150px kaydırmada kesişim 0.
- Ölçüm betiği: `/private/tmp/claude-501/-Users-emre/862bcbce-6e8d-4a73-a71a-971f141b67f4/scratchpad/kontrol/k181b.cjs` (PW=<repo>/node_modules/playwright). Yerelde production build ile kendin de çalıştırabilirsin (yalnız headless Chromium, en fazla 2 tarayıcı).

### Coder Notu 181-1
- 7 Kasım 2026: `frontend-patterns`, `tdd-workflow`, `better-layout`, `ui-ux-pro-max` ve Next.js yerel CSS rehberi uygulandı. Neden: `.table` girişte aşağıdan taşındığı için 92px alt bant sabit gezinmeyi korumuyordu. Yalnız masaüstü gezinmesi sol sütuna alındı; sahne hareketi ve mobil düzen korunur.
- RED: yeni yerleşim testi başarısız; GREEN: 12/12 hedef test ve toplam **125 dosya / 1464 test**, lint, typecheck, Turbopack build PASS. Production üzerinde paketli headless Chromium ile 1280×720, 1366×768, 1440×900, 1920×1080, 2560×1440; her 150px kaydırmada **185 ölçüm, kesişim 0**. 720px yükseklik mevcut native akıştadır. Tarayıcı ve yerel sunucu düzgün kapatıldı; fiziksel cihaz kabulü değildir.
- 182-1 ile tek yeşil kayıt ve aynı SHA için CI → Vercel REST yayını; kesin kaynak/CI/READY/alias sonucu Git dışındaki `.cache/task-181-182-fix/` makbuzunda izlenir. Bu not yayın öncesi yerel kabulü kaydeder.
