# Task 208: Tek sayfa landing (v3 "Altın Dal")

## Tür
frontend (yalnız görünüm, yönlendirme ve sayfa yapısı; iş mantığı değişmez)

## Amaç
Müşteri sitesini **tek sayfalık landing** yapmak: ana sayfa Ürünler, Hikâyemiz, Toptan & Bayilik, Blog özeti, SSS ve İletişim bölümlerini taşır. Bölüm boşlukları daralır; tekrar eden yazı ve düğmeler silinir; yazı bağlantıları "altın dal" düğme düzenine geçer. **Mobil birinci sınıf** (kullanıcı: "mobil'de çok iyi olmalı").

## Kullanıcı kararları (12 Kasım 2026, aynen)
- "boşlukları azalt, gereksiz tekrar eden yazıları ve düğmeleri kaldır, one page landing page olsun"
- Kapsam: **Hepsi ana sayfada, yalnız zorunlular ayrı.** Ana sayfaya girenler: Ürünler, Hakkımızda, Toptan, Bayilik formu, Blog özeti, SSS, İletişim. Ayrı kalanlar: sepet, ödeme, giriş/kayıt/hesabım, yönetim paneli, yasal sayfalar (KVKK, iade, mesafeli satış, sipariş takip). Eski adresler ana sayfadaki ilgili bölüme yönlendirilir.
- Geçişler: **yalnız hafif belirme + hover/odak geçişi** (aşağıda "Hareket"). Kaydırmayla oynayan efekt (parallax, pin, scrub) yok; müşteri kaydırma animasyonu istemedi.
- Yazı bağlantıları: "biraz daha button tarzı, derli toplu hizalı, altın dal sistemi" → eski `docs/tasks/206` "Düzeltme 206-1" bu görevin 5. maddesine katıldı (206-1 ayrıca yapılmaz).

## Planlayıcı kararları (kullanıcı değiştirebilir; raporda belirt)
1. `/urun/[slug]` ve `/blog/[slug]` sayfaları **silinmez** ve yönlendirilmez: Google'da ve paylaşılan bağlantılarda yaşıyorlar. Menüde yer almazlar; ana sayfadan yalnız ürün adı/görseli ve blog kartı bu sayfalara gider. Sitemap'te kalırlar.
2. `/urunler`, `/urunler/[kategori]`, `/hakkimizda`, `/toptan-satis`, `/bayilik`, `/blog` → **308** yönlendirme (hedefler aşağıda). Sitemap'ten çıkarılır.
3. Ürün kartında tek eylem "Sepete ekle"; "Teklife ekle" Toptan bölümündeki forma (ürün seçici) taşınır.

## Önce oku
`AGENTS.md` (AKTİF TASARIM SÖZLEŞMESİ), `docs/DESIGN.md` (özellikle "Sayfa yapısı" bölümü ve Components), `docs/MASTER-PROMPT.md` §8 hareket kuralları, `output/task206/KANIT.md` (kanıt biçimi, yerel sunucu ve e2e yöntemi: `output/task206/serve.mjs`, `output/task201/run-clean.mjs`), `components/storefront/StoreHome.tsx`, `StoreHeader.tsx`, `StoreFooter.tsx`, `StoreMenu.tsx`, `components/storefront/content/*`, `next.config.*`, `app/sitemap.ts`.

## Kullanılacak araçlar (Skill aracıyla FİİLEN çağır)
`frontend-design`, `ui-ux-pro-max`, `design-taste-frontend`, `better-layout`, `responsiveness-check`, `scroll-craft` yalnız "yapma" listesi için (scrub yok), `seo` / `claude-seo:seo-technical` yönlendirme ve sitemap için. 21st MCP gerekmez (mevcut `PillButton`, `PillSwitch`, `Tag`, `SectionHeading`, `OliveBranch`, `Medallion` yeterli); yeni paket ekleme.

## Sayfa yapısı (üstten alta, tek `/` sayfası)
Her bölüm `id` taşır; menü bağlantıları **`/#id` biçiminde mutlak** (başka sayfalardan da çalışsın); `scroll-margin-top` = yapışkan üst menü yüksekliği (+8 px); `html { scroll-behavior: smooth }` yalnız `prefers-reduced-motion: no-preference`.

| # | id | Bölüm | İçerik ve kural |
|---|---|---|---|
| 1 | `baslangic` | Hero | Mevcut hero. **Tek düğme** "Ürünleri İnceleyin" → `#urunler`. Alt cümle kalır. |
| 2 | `urunler` | Ürünler | Üstte kategori sekmeleri (`PillSwitch`/hap: Tümü, Zeytinyağı, Zeytin, Siyah, Yeşil, Kırma); altında ürün kartları (altı ürün, adaçayı zemin, kart başına yalnız "Sepete ekle"). Eski "4 kutu geçiş" + "Sofranıza AFİNA" + "Öne Çıkan Ürünler" **tek bölümde birleşir** (aynı ürünler üç kez gösterilmez). Kategori seçimi sayfayı yeniden yüklemez; `?kategori=` ile açılırsa ilgili sekme seçili gelir. Koyu bant **yok** (koyu bant sayısı ≤ 1, o da alt bilgi dışında en fazla bir bölüm). |
| 3 | `hikayemiz` | Hikâyemiz | "Nesillerin Emeği" + Hakkımızda özeti + tesis (üçlü banner) + Hasat maddeleri + mühür **tek bölüm**; üç ikonlu madde (Geleneksel Üretim / %100 Doğal / Kendi Tesisimizde) **bir kez**. Mühür yalnız burada. |
| 4 | `toptan-bayilik` | Toptan & Bayilik | İki sekmeli (`PillSwitch`: Toptan Satış / Bayilik) tek bölüm; seçili sekmenin kısa kartı + **mevcut form bileşeni** (ürün seçici dahil). `?sekme=bayilik` ile Bayilik açılır. Form mantığı, KVKK onayı, doğrulama aynen. |
| 5 | `blog` | Zeytin Defteri | 3 yazı kartı (görsel + başlık + okuma süresi), her kart `/blog/[slug]`'a gider. Ayrı "Tüm yazılar" düğmesi yok. |
| 6 | `iletisim` | SSS + İletişim | SSS akordeonu (mevcut sorular) + adres, telefon, e-posta, "Yol tarifi" (`quiet` hap). Sipariş takibi / iade / satış koşulları bağlantıları burada **yinelenmez** (alt bilgide durur). |
| – | – | Alt bilgi (koyu) | Logo, slogan, üç sütun (Ürünler / Kurumsal / Yardım) 44 px satırlı liste, ödeme logoları. Slogan sayfada **en çok iki kez** (hero + alt bilgi). |

Üst menü: Ürünler · Hikâyemiz · Toptan & Bayilik · Blog · İletişim (`/#id`) + hesap ikonu + sepet hapı; telefonda mevcut menü çekmecesi aynı bağlantılarla. Etkin bölüm vurgusu (2 px altın alt çizgi) kaydırma konumuna göre **sınıf değişimiyle** (animasyonsuz). Başka sayfalarda (sepet, hesabım, yasal…) menü aynıdır ve `/#id`'ye gider.

## Yönlendirmeler (`next.config` `redirects`, kalıcı 308, `curl -I` ile doğrula; hash'in `Location`'da korunduğunu göster)
| Eski | Yeni |
|---|---|
| `/urunler` | `/#urunler` |
| `/urunler/:kategori` | `/?kategori=:kategori#urunler` |
| `/hakkimizda` | `/#hikayemiz` |
| `/toptan-satis` | `/?sekme=toptan#toptan-bayilik` |
| `/bayilik` | `/?sekme=bayilik#toptan-bayilik` |
| `/blog` | `/#blog` |

Eski sayfa dosyalarını (`app/urunler`, `app/hakkimizda`, `app/toptan-satis`, `app/bayilik`, `app/blog/page.tsx`) yönlendirme devraldığı için kaldır; bileşenleri ana sayfada yeniden kullanılanlar kalır, kimsenin kullanmadığı bileşen ve CSS silinir (silinenleri KANIT.md'ye listele). Ürün/blog ayrıntı sayfalarındaki "geri" bağlantıları ve breadcrumb'lar `/#urunler` ve `/#blog`'a çevrilir. `sitemap.ts`, `robots.ts`, canonical, JSON-LD (Organization/WebSite, SSS şeması ana sayfaya) tutarlı güncellenir.

## Boşluk ve tekrar temizliği (ölçülebilir)
- Bölüm dikey boşluğu: masaüstü 96 → **56–64 px**, tablet 72 → 48, telefon 64 → **36–40 px**. Başlık altı boşluk, kart arası boşluk, hero alt boşluğu aynı ölçekte sıkılaşır; `DESIGN.md` spacing tokenları buna göre güncellenir (tek kaynak).
- **Tekrar silme kuralları:** (a) aynı hedefe giden ikinci düğme yok ("Ürünleri İnceleyin", "Tüm Ürünler", "Ürünlere dön", "Teklif iste" tekrarları); (b) bölüm başına en çok 1 `primary`/`gold` düğme; (c) aynı cümle ya da aynı iddia ikinci kez geçmez (slogan, "kendi tesisimizde", "%100 doğal", adres); (d) boş geçiş cümleleri ve tekrar eden alt başlıklar silinir. Silinen her metin/düğme `output/task208/TEKRAR.md` içinde "yer · metin · neden" olarak listelenir. Ürün adı, fiyat, stok, yasal metin ve form alan etiketleri silinmez.
- Hedef: masaüstü ve telefonda **eklenen bölümlere rağmen** ana sayfa yüksekliği 204-1 ekran görüntüsündeki ana sayfadan (1440 px'te 7575 px; 390 px'te ≈ 9160 px) **uzun olmasın**; önce/sonra yükseklikleri KANIT.md'de.

## Yazı bağlantıları (eski 206-1)
`PillButton` `quiet` yeni tanımı (DESIGN.md'de yazılı): kâğıt zemin, 1 px `--sf-line` kenar, 44 px yükseklik, sağda 28 px mini madalyon. **Tek başına duran** her yazı bağlantısı bu görünüme geçer; cümle içi bağlantılar alt çizgili kalır. Eylem satırları: flex, `gap` 12, aynı yükseklik, sola hizalı; telefonda alt alta tam genişlik ya da 2 sütun, yetim bağlantı yok. Alt bilgi sütun bağlantıları hap olmaz: 44 px satır, ortak sol çizgi, hover'da altın renk. Envanter `output/task208/ENVANTER.md`.

## Hareket (müşteri kuralıyla uyumlu)
- Bölüm girişinde **tek seferlik hafif belirme**: `opacity 0→1` + `translateY(8px→0)`, 280 ms `ease-out`, `IntersectionObserver` ile bir kez; ilk bölüm (hero + ürünler başı) hariç (LCP ve CLS korunur). JS kapalıyken ve `prefers-reduced-motion`'da içerik doğrudan görünür. Kaydırmaya bağlı sürekli efekt, parallax, pin, scrub **yok**. CLS 0.
- Düğme/kart hover ve odak geçişleri DESIGN.md'deki gibi (180 ms). Sekme (kategori, Toptan/Bayilik) değişiminde içerik yalnız 160 ms `opacity` geçişi, yükseklik animasyonu yok.
- Bölümler arası ayrım: zemin tonu (kâğıt / fildişi / adaçayı dönüşümlü) + bölüm sonunda ince `OliveBranch` ayırıcı (en çok 2 kez, ağır görünmesin).

## Mobil kabul (çok önemli; 320, 360, 390, 430, 768)
- Taşma 0, yatay kaydırma yok, konsol hatası 0, kırık görsel 0, erişilebilirlik (axe) 0.
- Dokunma alanı ≥ 44 px; komşu iki hedef arası ≥ 8 px; düğme etiketi tek satır (sığmazsa tam genişlik).
- Form alanları 16 px yazı (iOS yakınlaştırmasın), doğru `inputmode`/`autocomplete`, klavye açıkken gönder düğmesi erişilebilir (390×500 görünümde doğrula).
- Menü çekmecesinde bağlantıya dokununca çekmece kapanır ve bölüme doğru konumda iner (üst menü bölümü örtmez); geri tuşu davranışı bozulmaz.
- Telefon LCP ≤ 2,5 sn (204'te 2,03 sn), ilk JS ≤ 250 KB, CLS ≤ 0,05; ilk ekranda hero + tek ana eylem görünür.
- Telefon ekran görüntüleri (390 ve 320, tam sayfa + ilk ekran): ana sayfa; Ürünler sekmeleri; Toptan/Bayilik sekmeleri ve form; menü çekmecesi; alt bilgi; bir yasal sayfa; sepet; ürün ayrıntısı.

## Adımlar
1. Envanter ve plan: `output/task208/PLAN.md` (bölüm eşlemesi, silinecek/taşınacak bileşenler, yönlendirme tablosu, riskler).
2. **Önce test** (v3 beklentisi): yönlendirme (308 + hedef), ana sayfa bölüm `id`'leri ve sırası, menü bağlantıları `/#id`, kategori sekmesi, Toptan/Bayilik sekmesi, tekrar kuralları (ör. slogan ≤ 2, ana sayfada `data-variant="primary"` bölüm başına ≤ 1), tek başına bağlantılarda alt çizgi yok / cümle içinde var. Kırmızıyı gör.
3. Uygula; eski testleri tek tek ele al: yeni yapıyla çelişen beklentiyi güncelle, geri kalanı gevşetme.
4. Sitemap, robots, canonical, JSON-LD, yönlendirmeler.
5. Dokümanlar: `docs/DESIGN.md` (Sayfa yapısı + spacing tokenları + `quiet`), `AGENTS.md` ve `CLAUDE.md` tek satır, `docs/PLAN.md` en üste kısa not.
6. Kapılar: lint, typecheck, build, birim testleri (tam takım), e2e (Chromium 390 + 1440; taban `fd8ad45`'in kendi ayrı kopyasında aynı yöntemle koşulur; **yeni düşen 0** kabul), `scripts/qa-design-v3.mjs` (ana sayfa, shop, pages kapsamları yeni rotalara göre güncellenir), yönlendirme `curl` kanıtı. Kanıt: `output/task208/KANIT.md`, ekranlar `output/task208/ekran/`.
7. Tek kayıt: `feat: 208 tek sayfa landing, boşluk ve tekrar temizliği, bağlantı düğme düzeni`.

## Kabul kriterleri
- [ ] `/` altı bölümü sırayla ve doğru `id`'lerle taşır; menü `/#id` bağlantıları her sayfada çalışır.
- [ ] Altı eski adres 308 ile doğru bölüme gider (hash korunur); sitemap'te yok; `/urun/[slug]`, `/blog/[slug]`, yasal sayfalar, sepet, ödeme, hesabım, yönetim paneli çalışır.
- [ ] Boşluklar belirtilen aralıkta; sayfa yüksekliği eski ana sayfayı aşmıyor; TEKRAR.md dolu.
- [ ] Tek başına yazı bağlantılarında alt çizgi yok, hepsi `quiet` hap; cümle içi alt çizgili.
- [ ] Mobil kabul maddelerinin hepsi ölçülmüş ve 5 genişlikte geçmiş.
- [ ] Yeni düşen e2e 0; birim testleri 0 düşen; lint/typecheck/build temiz; korunan klasörlerde fark 0.

## Yapılmaması gerekenler
- Push, yayın, canlı veritabanı, dal açma, `git stash/reset/clean` yok. `.env*` okunmaz; sır yazdırılmaz. `AFINA-KAYNAK/` ve `output/` git'e eklenmez. `node_modules` ve `.next` silinmez.
- Korunan klasörler: `lib/auth`, `lib/db`, `lib/cart`, `lib/checkout`, `lib/payments`, `lib/orders`, `app/api` (dokunma). İş mantığı, fiyat, sepet, indirim, ödeme, form doğrulama, yetki değişmez.
- Yönetim paneli özet kartlarına veri bağlama, yeni içerik yazma, yeni paket ekleme, kaydırmaya bağlı efekt yok.
- Başka projelerin süreçlerine dokunma (3497'deki süreç başka projeye ait).

## Durum: BEKLİYOR
