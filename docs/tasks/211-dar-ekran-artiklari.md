# 211 Dar ekran artıkları (210 denetimi sonrası)

Kaynak: görev 210 bağımsız denetimi + Claude'un gerçek tarayıcı ölçümleri (13 Kas). Çalışma kopyası = yerel main `d858534` (209 + 210 kayıtlı; GitHub'a/canlıya yayın ayrı süreçte yapılabilir, bu görev kayıt YAPMAZ). Yazar: Codex. Küçük, dar bir düzeltme görevidir; kapsam dışına çıkma.

## Kullanıcı kararı — 392 px çelişkisi çözüldü (13 Kasım 2026)

≥389 px görüntüsünü koruma şartı yalnız ürün sayfası ilgili kartlarının
389–392 px aralığı için gevşetildi. Aynı iç boşluk düzeltmesi 376–392 px
tek aralığına uygulanır. 389/390/391/392 px'te etiket tek satır, yazı-simge
boşluğu en az 6 px; yazı boyutu değişmez. ≤375 px ve ≥393 px görüntüsü
birebir korunur. Matris 320–430 px, 4 px adımlı ve ayrıca
375/376/389/390/391/392/393 px'tir. Bu karar, aşağıdaki ilk metinde yer alan
≥389 px değişmezlik şartının önündedir. Kayıt/GitHub/yayın yasağı sürer.

## Yapılacaklar

### A. "Sepete ekle" etiketi 376–388 px'te iki satıra bölünüyor (ürün sayfası, ilgili ürünler)
Ölçüm (Chromium, `https://localhost:3024/urun/dogal-kirma-yesil-zeytin`, 4 ilgili ürün kartı): 320–375 px'te etiket 1 satır; **376, 380, 384, 388 px'te etiket 2 satır** ("Sepete / ekle", düğme yükseliyor); 389–390 px'te 1 satır ama yazı-simge boşluğu yalnız ≈ 4,2–4,7 px; ≥ 393 px'te sorun yok. Ana sayfa raf kartları 320–430 px'te 1 satır (320 px'te boşluk ≈ 4,4 px).
- Hedef: **320 ile 430 px arasında, 4 px adımlarla (320, 324, … 430) ve 375, 376, 389, 390, 393 dahil**, ürün sayfası ilgili kartlarında ve ana sayfa raf kartlarında etiket **tek satır**, yazı kutusu simgeyle kesişmez, boşluk ≥ 4 px (mümkünse ≥ 6 px); yazı KÜÇÜLTÜLMEZ.
- Yöntem önerisi: sütun sayısını/aralığını ya da `--pill-pad`/`--pill-gap` değerlerini 376–388 px'e göre ayarla; **< 376 px ve ≥ 389 px'te mevcut görünüm piksel piksel aynı kalsın** (210'daki düzeltmeler bozulmasın).
- Ölçüm yöntemi (reçete): düğme `button[data-pill]` / `a[data-pill]`, görünen etiket `[data-add-label="true"]` (içindeki `data-add-label-measure` öğeleri `aria-hidden`, ölçüm dışı), simge `[data-coin]`. Satır sayısı: etiketin `Range.getClientRects()` benzersiz `top` sayısı; boşluk = `coin.left − metin.right`. Düğme metni `textContent` ile aranmaz (gizli ölçüm öğeleri içerir).
- Kanıt: genişlik × (ürün sayfası, ana sayfa) tablosu önce → sonra.

### B. Giriş ve Kayıt sayfaları 320 ve 360 px'te 2 px uzamış
Canlı site (`https://afinazeytin.com`, kod 8f518fc) ile yerel ön izlemenin `main` öğesi karşılaştırması: `/giris` 320×1101 → 1103, 360×1075 → 1077; `/kayit` 320×1497 → 1499, 360×1446 → 1448. 390 ve 430 px'te fark yok. Sepet, ödeme, sipariş takibi, yasal sayfalar, blog, 404: 320/360/390/430 px'te fark yok (kanıt: Claude ölçümü).
- Hedef: `/giris` ve `/kayit` 320/360/390/430 px'te canlıyla **0 fark** (boyut ve piksel), F4'ün yazı-iki-kat davranışını bozmadan (iki kat yazıda taşma/üst üste binme yine yok).
- Yer: `components/storefront/ui/PillButton.module.css`, `ui.module.css` (≤ 767 px kuralları: `min-height`, `line-height`, ek satır aralığı); giriş/kayıt sayfalarındaki düğmeler.
- Kanıt: `main` öğesi karşılaştırma betiği (canlı vs yerel), tablo.

### C. Test ve betik temizliği
1. `tests/unit/quote-composer-161.test.tsx` (~94–100. satırlar): bekleme görünümü ile gerçek telefon alanının erişilebilir adı artık aynı olduğundan test "gerçek alan yüklendi"yi kanıtlamıyor. Önce gerçek alanın yüklendiğini koşulla (örn. telefon alanı `readOnly === false`) ve sonra adı sına; tek başına çalıştırıldığında da kararlı olsun.
2. `tests/unit/accessibility-210.test.tsx`: erişilebilir adların "görünen yazıyı içerdiğini" sabit dizge yerine DOM'dan hesapla (görünen metin → ad içinde geçiyor mu); mevcut sabit adlar da kalabilir.
3. `scripts/qa-storefront-flow-199.mjs` (~47 ve 52. satırlar): ürün seçici düğmesini artık `… · İlgilendiğiniz ürünler` adıyla bulur (tam eşleşme yerine `/İlgilendiğiniz ürünler$/` ve `endsWith`); betik yeni adla çalışsın (çalıştırabiliyorsan dene).

## Yapılmayacaklar
- F2 (açılış başlığı kontrastı, ≥ 360 px) YAPILMAZ: kullanıcı kararı bekliyor. F5 (poster çözünürlüğü) YAPILMAZ.
- Ana sayfa bölüm yapısı, Toptan & Bayilik penceresi, alt bilgi, ürün rafı mantığı: değişmez.
- Form mantığı, fiyat, sepet, ödeme, doğrulama: değişmez. Korunan klasörler (`lib/auth`, `lib/db`, `lib/cart`, `lib/checkout`, `lib/payments`, `lib/orders`, `app/api`): fark 0.
- `.env*` okuma yok; sır yazdırma yok; `AFINA-KAYNAK/` ve `output/` git'e eklenmez (`git add -f` yasak); `node_modules` ve `.next` silinmez; `git stash/reset/clean` yok; port 3497'ye dokunma. **Commit YOK, push YOK, yayın YOK.** Alt ajan yok. PDF/video yok.

## Doğrulama
1. Önce (kod değiştirmeden) A ve B için "önce" ölçümlerini al (ön izleme `d858534` derlemesini gösteriyor olmalı; değilse `npm run build` ve sunucuyu yeniden başlat).
2. Düzeltmeleri yap; birim testleri (önce başarısız, sonra geçen) ekle/güncelle.
3. `npm run lint`, `npm run typecheck`, `npm test` geçmeli (güvenli çalıştırıcıyla: `TEST_DATABASE_URL=postgresql://localhost:5432/afina_kontrol189 node output/task201/run-clean.mjs <komut>`); `npm run build`; ön izlemeyi yeniden başlat (`output/task206/stop.sh`, sonra `TEST_DATABASE_URL=postgresql://localhost:5432/afina_kontrol189 node output/task201/run-clean.mjs --local-auth node output/task206/serve.mjs`, https://localhost:3024) ve AÇIK bırak.
4. 768/1024/1440 px ve ana sayfa bölüm görüntüleri: değişmedi (0 piksel fark); 210'daki kanıt programlarını (`scripts/qa-compare-210.mjs`, `qa-aligned-210.mjs`) kullanabilirsin.
5. e2e (Chromium 390 + 1440, ana sayfa/ürün/sepet/form belirtimleri): taban `output/task210/e2e-final-names.txt` (90 düşen); **yeni düşen 0**.
6. Rapor `output/task211/KANIT.md` (sade Türkçe). Bu dosyanın sonunu `## Durum: TAMAMLANDI` yap.

## Coder Notu (13 Kasım 2026)

- Yazar Codex. `frontend-patterns` ve `tdd-workflow` uygulandı; yerel Next.js CSS kılavuzu okundu. Yeni bileşen/bağımlılık gerekmedi, mevcut PillButton korundu.
- A: kullanıcı kararıyla düzeltme tek aralık olarak 376–392 px'e genişletildi. 34 genişlikte 272 “Sepete ekle” etiketi ölçümü geçti; yazı boyutu değişmedi. 389/390/391/392 px boşlukları 14,17 / 14,67 / 15,17 / 15,67 px. ≤375 px ve ≥393 px görüntüsü birebir aynı; ana sayfa rafı bütün genişliklerde aynı. Açık çelişki çözüldü.
- B: giriş/kayıt `main` öğeleri 320/360/390/430 px'te canlıyla boyut ve piksel farkı 0. Aynı sekiz görünümde iki kat yazıda taşma/çakışma 0.
- C: gerçek telefon alanının yüklenmesini bekleyen test, DOM'dan görünür yazı kontrolü ve yeni ürün seçici adı uygulandı. Tek başına telefon testi önce başarısız, sonra başarılı; 1466 birim testi ve kod/tür/derleme kontrolleri geçti.
- Uçtan uca: 329 geçti, 86 başarısız, 169 atlandı, 30 çalışmadı; önceki 90 başarısız testin listesine göre **yeni başarısız 0**. Dört yönetim erişim testi bu yerel ortamda geçti; görevde bu mantık değiştirilmedi.
- Son karar sonrası lint, typecheck, 1466 birim testi ve build yeniden geçti. 120 tam sayfa/bölüm karşılaştırmasında yalnız dört ürün sayfasının 390 px görüntüleri değişti; kalan 116 görüntüde fark 0. Ek 68 kart görüntüsünde yalnız ilgili kartların 389–392 px görüntüleri değişti; diğer 64 görüntüde fark 0. Yukarıdaki tam akış testi ilk uygulama adımına aittir; son karar sonrası genişlik/görüntü kabulü ve dört kod kontrolü yenilendi.
- Ayrıntılı önce/sonra tabloları, akış denemeleri ve kalan kabul sınırı: `output/task211/KANIT.md`. F2/F5, korunan klasörler, kayıt/GitHub/yayın kapsam dışında tutuldu.

## Durum: TAMAMLANDI
