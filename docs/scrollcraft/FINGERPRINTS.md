# AFİNA — Scroll Craft fingerprint kayıtları

Bu kayıt mevcut AFİNA tasarım tarihçesini başlangıç çizgisi olarak içerir. Satırlar append-only'dir: yeni plana yer açmak için eski şekil değiştirilmez. Skill yazarının örnek siteleri bu projeye aitmiş gibi eklenmemiştir.

**Kapı:** Her yeni tasarım, her mevcut satırdan ayrı ayrı en az4/6 boyutta farklı olmalıdır: grammar, nav treatment, hero device, act-sequence shape, close pattern, signature move. Yalnız ad/renk/font değişimi yapısal fark değildir. Ortak opak marka menüsü değişmiş sayılmaz.

## Baseline registry

| Build | Grammar | Nav treatment | Hero device | Act-sequence shape | Close pattern | Signature move | World | Kanıt |
|---|---|---|---|---|---|---|---|---|
| AFİNA v6 — Üretici Atlası, Task157/158 | Sakin üretici editorial/vitrin | Sabit opak açık orijinal yatay marka; site/mağaza/sepet/hesap yolları | Kâğıt metin ile organik çerçeveli Flow kare penceresi; ayrı küçük gerçek ürün kartı; hafif girişler | Intro+üç olgu → büyük tesis fotoğrafı → standart3kolon altı ürün grid'i → resim/numaralı3adım → açık form paneliyle koyu B2B → SSS → ayrı adres → footer | Ayrı açık adres bölümü ve destek bağları, ardından açık site footer'ı | Yeni semantik bespoke seçim yok; tek ürün kartı mevcut incele/ekle işlemini açar | AFİNA kâğıt/zeytin/gerçek tesis | `docs/referans/DESIGN-v6-history-20261101.md`, `docs/tasks/157-tam-tasarim-ve-canli-kabul.md`, `docs/referans/yayin-v6-20261101.json`; Task158 ortak mikro hareket polish'i aynı yapıdır. |
| AFİNA v7 — Zeytinin İçinden, Task159 | Film açılışlı üretici editorial/vitrin | Aynı sabit opak açık orijinal marka ve ticaret yolları | Tam geniş tek A→B film, sol-alt overlay slogan/sağ destek, tam alt gradient, sahne etiketi/scroll oku, küçük film kabuğu parallax | Büyük film+caption → v6'nın intro/olgu/tesis/grid/numaralı adım/B2B/SSS/adres gövdesi | Aynı açık adres ve ardından ayrı site footer'ı | Gerçek film pause/play/replay; yeni ürün-seçim etkileşimi yok | Aynı AFİNA markası; tek onaylı Flow zeytinliği | `docs/tasks/159-flow-sinematik-hero.md`, `docs/referans/yayin-film-v7-20261101.json`, `.cache/task-159/live/` screenshots; kaynak `5a3b1f6`. |

## V8 yayın kaydı

| Build | Grammar | Nav treatment | Hero device | Act-sequence shape | Close pattern | Signature move | World | Kanıt |
|---|---|---|---|---|---|---|---|---|
| AFİNA v8 — Object journey, Task160 | Seçilebilir gerçek ambalajın yer/üretici/kanal yolculuğu | Aynı opak marka menüsü ve gerçek ticaret yolları; fark puanı değil | Tek kısa sticky içinde geri çekilen Flow + bağımsız öne gelen gerçek ambalaj + kendi kâğıt zeminiyle slogan; telefon ayrı doğal kompozisyon | Tek nesne zirvesi → kompakt gerçek tesis panoraması → altı SKU native galeri → kullanıcı açan B2B dalı → SSS/adres/alışveriş çözümü | Gerçek adres/mağaza ve büyük marka kapanışı; önceki adres/legal benzerliği fark sayılmaz | Üç gerçek SKU'nun görüntü/ad/fiyat/detail/cart hedefinin birlikte değişmesi; hydration öncesi disabled, sonrası gerçek1kg detail/cart | Korunmuş AFİNA paleti/fontu/yer/ambalaj; tek kullanıcı onaylı A→B runtime filmi | Kaynak179df851686a34d09a1e965315dc5e902a30c362; CI41304790349 SUCCESS; Vercel dpl_7EUijPZwcnzr9ML3nHMFRwUErZ89 READY; docs/referans/yayin-object-v8-20261101.json + qa-160-20261101.json; altı canlı boyut,74PASS/6responsive skip,190kare gerçek film. |

V6 ve v7 satırları değişmedi. Her birine göre doğrulanan fark **4/6**: grammar, hero device, act-sequence shape, signature move. Nav ve gerçek adres/legal yakınlığı sayılmadı. Yukarıdaki adlandırma, incelenmiş pikseller/işlev olmadan fark sayılmıyor.

## Planlanan ama henüz sahiplenilmeyen alan

Tarihsel plan notu (yayın öncesi yazıldı): V8 **Object journey**, `builds/afina-v8/BRIEF.md` ve `PLAN.md` içinde planlıydı. Başarılı yerel/canlı görsel ve işlev kabulü ile yayın tamamlanmadan yukarıdaki registry'ye bir v8 satırı eklenmez. Planlanan fark skoru v6'ya4/6 ve v7'ye4/6; nav ve benzer adres/legal kapanışına fark puanı verilmez. Uygulamada doğrulanmayan gramer veya signature farkı sayılamaz.

## Tekrar edilmemesi gereken şekiller

- V6: organik pencereli iki sütun hero + küçük ürün kartı; arkasından aynı eyebrow/grid/zigzag ritmi. Yeni yay veya renk bu şekli yeni tasarım yapmaz.
- V7: tek tam geniş film üstüne slogan/CTA ve önceki gövdenin aynısını eklemek. Başka video, sahne rozeti veya daha büyük scale tek başına yeni grammar/signature değildir.
- Opak orijinal nav, gerçek ürün/tesisi kullanma ve ticaret yolları güvenilir marka/işlev ortaklarıdır; sırf fark puanı için bozulmaz.

## Yeni satır ekleme

Gerçek yayın ve final-source kabulünden sonra satırın bütün sütunlarını, kesin commit/makbuz/görsel kanıtını ve hangi önceki boyutları paylaştığını yaz. Bu dosyadaki eski iki baseline satırı korunur. Henüz teslim edilmemiş çalışma shipped diye kaydedilmez.


## V9 yayın kaydı

| Build | Grammar | Nav treatment | Hero device | Act-sequence shape | Close pattern | Signature move | World | Kanıt |
|---|---|---|---|---|---|---|---|---|
| AFİNA v9 — Hasat Rotası, Task161 | Galeri/catalog, üretici güveni ve aynı SKU'nun işletme talebi | Orijinal marka/ticaret yollarıyla açık cam pill | Doğal5sn kabul edilmiş Flow loop; desktop bağımsız ön dal parallax, statik SSR slogan; telefon doğal fotoğraf/metin | Doğal hero → tek lineer raf zirvesi → tesis parallax → üç aşama bento → segment/aynı talep bağlamı → native SSS/adres/footer | Gerçek adres/mağaza ve özgün marka/legal; önceki sürümlerle ortak, fark puanı değil | Altı gerçek SKU'dan seçilen ambalaj ile B2B segmentinin aynı validasyonlu, kullanıcı tarafından gönderilecek mailto özetinde devamı | AFİNA'nın onaylı ağaç/tesis/ambalajı; pro planın parlak yeşil/taş ve Fraunces/Inter yönü | Source31f251cee2e8b83601fbc2cb3a376c979011f39f; CI41317227401 SUCCESS; API dpl_46Scpv4MqVnjKxb1pYt1bjwSD4Hq READY; qa-161/yayin-pro-v9-20261101.json;6canlı boyut,87PASS/8skip,121native frame,iki doğal video döngüsü. |

Geçmiş satırlar değişmedi. V6'ya5/6 (grammar/nav/hero/act/signature), v7'ye muhafazakâr4/6 (grammar/nav/act/signature; full-bleed hero ortaklığı sayılmaz), v8'e5/6 (grammar/nav/hero/act/signature). Kapanış ortaklığı ve renk/font değişimi puan değildir. Son pikseller/işlev ve kesin yayın kanıtından sonra bu satır eklendi; [VERIFICATION](builds/afina-v9/VERIFICATION.md) karşılaştırmanın sınırlarını kaydeder.
