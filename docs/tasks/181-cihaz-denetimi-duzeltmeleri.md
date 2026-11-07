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
- [ ] `npm test`, lint, typecheck, build yeşil; main push, exact-SHA CI, Vercel REST yayını READY, makbuz `.cache/task-181/final-receipt.json`.
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

## Durum: BEKLİYOR
