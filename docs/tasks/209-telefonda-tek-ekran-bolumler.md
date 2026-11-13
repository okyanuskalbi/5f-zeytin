# 209 Telefonda her bölüm tek ekrana sığsın

Kaynak: kullanıcı onayı (13 Kas): bölüm listesi PDF'i (`output/bolum-listesi/AFINA-telefon-bolum-listesi.pdf`) + "önerilerini uygula". Beş karar: (1) kayan yazı şeridi geri gelmez, (2) ana sayfada alt mini sepet çubuğu olmaz, (3) Toptan & Bayilik formu telefonda pencerede açılır, (4) Tesisimiz ve Hasat ayrı ekranlar (üç fotoğraf alt alta kalır), (5) alt bilgi telefonda kısalır.

## Amaç
Ana sayfada (`/`), **telefon genişliklerinde (≤ 767 px)** her bölüm (aşağıdaki 10 blok) en çok bir ekran yüksekliğinde olsun; bölüm içinde ayrıca dikey kaydırma gerekmesin. Tablet (768–1023) ve masaüstü (≥ 1024) **piksel piksel aynı** kalır.

## 10 blok ve hedefleri (390 px genişlik, bugünkü yükseklik → hedef)
Bir ekran = görünür alan yüksekliği − sabit üst menü (390×844 → yaklaşık 780 px). Kontrol ölçüleri: 360×800 (≈ 736), 390×844 (≈ 780), 430×932 (≈ 868); 320×640'ta en çok %110 (en dar telefon, en iyi çaba).

| # | Blok | Bugün | Hedef / yapılacak |
|---|------|-------|-------------------|
| 1 | Hero `#baslangic` | 658 | Aynen kalır (değiştirme). |
| 2 | Ürünler `#urunler` | 1454 | Kategori sekmeleri aynı; ürün ızgarası telefonda **yatay kaydırmalı raf**: ekranda bir büyük kart, yanında sıradakinin ucu görünür. |
| 3 | Hikâyemiz (`#hikayemiz` içinde `.storyGrid`) | 866 | ≤ ekran: fotoğraf, iki cümle, üç değer, mühür. Fotoğraf ve boşlukları kıs. |
| 4 | Tesisimiz (`.facilityPhotos`) | 695 | Üç fotoğraf alt alta, tam genişlik (208-1'deki hâl) **aynen**; blok kendi başına bir ekran (≈ 755 px). Başlık eklenmez. |
| 5 | Hasat (`.harvest`) | 318 | "Bereketin Hasat Vakti", iki cümle, üç madde, zeytin dalı; ayrı ekran (≈ 440 px). |
| 6 | Toptan & Bayilik `#toptan-bayilik` | 1285 | Telefonda iki büyük seçim kartı; karta dokununca form **alttan tam ekran pencerede** açılır (ayrıntı aşağıda). |
| 7 | Zeytin Defteri `#blog` | 504 | Aynen. |
| 8 | Sık Sorulanlar (`#iletisim` içinde `StoreFaq`) | ≈ 530 | Aynen. |
| 9 | İletişim (`#iletisim` içinde `.contactCard`) | ≈ 370 | Aynen. |
| 10 | Alt bilgi (`StoreFooter`) | 1117 | ≤ ekran: ödeme logoları ve yasal bağlantılar kalır; bağlantı grupları sıkılaşır (önce iki sütun + sıkı boşluk dene; yetmezse katlanır liste, her bağlantıya hâlâ erişilebilir olmalı). |

**Önemli:** 3, 4, 5 numaralı bloklar bugün aynı `<section id="hikayemiz">` içinde. DOM'u bölme; masaüstü düzeni bozulmasın. Her bloğa ölçülebilir bir işaret ekle: `data-phone-screen="hero|products|story|facility|harvest|business|blog|faq|contact|footer"`. Bloklar arasında kaydırmaya bağlı efekt, `scroll-snap` ile sayfa yakalama YOK (yalnız ürün rafının kendi yatay `scroll-snap-type: x` kullanımı serbest).

## Kararlar (uygulanacak)
1. **Kayan yazı şeridi:** geri gelmez. Yapılacak bir şey yok; telefon ve masaüstünde yokluğunu bir testle sabitle.
2. **Mini sepet çubuğu:** ana sayfada telefonda gösterilmez (bugün de yok); `components/cart/MiniCart.tsx` diğer sayfalarda bugünkü gibi kalır. Ana sayfada telefon genişliklerinde yokluğunu bir testle sabitle.
3. **Toptan & Bayilik (yalnız ≤ 767 px):**
   - Bölümde başlık, iki büyük seçim kartı: "Toptan Satış" ve "Bayilik" (Medallion ikonu, Cormorant başlık, 1–2 cümle açıklama, `PillButton` ile "Teklif iste" / "Başvuru yap").
   - Karta dokununca form, `components/ui/sheet.tsx` (shadcn Sheet, `side="bottom"`) üzerinden **tam ekran alt pencerede** açılır. Sheet'i varsayılan hâlde bırakma: v3 "Altın Dal" token'larına göre (fildişi zemin, Cormorant başlık, altın çizgi) özelleştir; kapatma düğmesi ≥ 44 px; başlık "Toptan teklif formu" / "Bayilik başvurusu".
   - **Form bileşenleri ve mantığı değişmez:** `QuoteComposer`, `DeferredDealershipForm` içeriği, doğrulama, gönderim, fiyat/sepet davranışı aynen. Yalnız onları saran kabuk değişir.
   - Formun **tek örneği** olmalı: aynı anda hem satır içi hem pencerede çift kurulum, çift `id` (`#toptan`, `#teklif`, `#basvuru`) ve çift form durumu YOK. Masaüstünde bugünkü sekmeli düzen (`BusinessTabs`, PillSwitch) aynen.
   - Bağlantılar çalışmalı: `/?sekme=bayilik#toptan-bayilik`, `/?sekme=toptan#toptan-bayilik`, `?teklif=` ile gelen ürün (toptan formu açılır, ürün seçili), `#toptan`, `#teklif`, `#basvuru` adreslerine inilince ilgili pencere telefonda otomatik açılır. Pencere kapanınca adres/durum tutarlı kalır, geri düğmesi mantıklı çalışır.
   - Erişilebilirlik: odak tuzağı, Esc ile kapanma, kapanınca odak açan karta döner, arka plan kaydırması kilitli, ekran okuyucu için doğru başlık/rol; telefon klavyesi açılınca odaktaki alan görünür kalır (`dvh` / visualViewport); `prefers-reduced-motion`'da animasyon yok.
   - Bilinen sınırlama (raporla, çözmek zorunda değilsin): JavaScript kapalıyken Bayilik sekmesi zaten açılamıyordu.
4. **Tesisimiz / Hasat:** görev tablosundaki gibi (DOM'u bölmeden, yalnız telefon CSS'i ve `data-phone-screen` işaretleri).
5. **Alt bilgi:** tablodaki gibi.

## Dokunulacak dosyalar (beklenen)
`components/storefront/StoreHome.tsx`, `StoreHome.module.css`, `home/ProductShowcase.tsx`, `home/BusinessTabs.tsx` (veya yanına yeni küçük bileşenler, ör. `home/BusinessChooser.tsx`), `StoreFooter.tsx`, `Navigation.module.css`, `components/ui/sheet.tsx` (yalnız gerekiyorsa, v3 stili), ilgili testler. Dosyalar 800 satırı geçmesin; ihtiyaç varsa küçük bileşenlere böl.

## Dokunulmaz
- `lib/auth`, `lib/db`, `lib/cart`, `lib/checkout`, `lib/payments`, `lib/orders`, `app/api`, fiyat, sepet, ödeme, form doğrulama ve yetki mantığı: değişmez.
- `.env*` okunmaz, sır yazdırılmaz. `AFINA-KAYNAK/` ve `output/` git'e eklenmez (`git add -f` yasak).
- `node_modules` ve `.next` silinmez; `git stash/reset/clean` yok. Branch/PR yok. **Push yok, yayın yok.** PDF/video hazırlanmaz.
- Görsel dosyalarına, `docs/DESIGN.md` kurallarına aykırı süsleme eklenmez (uzun tire yok, ≤ 2 yeşil bant, tek altın vurgu).
- Port 3497 başka projeye ait, dokunma.

## İKİ AŞAMA (Codex şu an canlı kontrol yürütüyor: onun işini bozma)
**Çalışan başka iş:** Codex (görev 207-1) şu anda `https://localhost:3024` ön izlemesini ve canlı siteyi kullanarak kontrol yapıyor. Onun bittiğini görev dosyası `docs/tasks/207-1-canli-cihaz-kontrolu.md` sonunda `## Durum: TAMAMLANDI` ve `output/task207-1/RAPOR.md` varlığı gösterir.

### AŞAMA A (şimdi)
1. **ÖNCE** (hiçbir kodu değiştirmeden) "önce" görüntülerini canlı siteden al (aynı kod): `https://afinazeytin.com`, Playwright Chromium, genişlikler 390 (telefon), 768, 1024, 1440; ana sayfa tam sayfa + her `data-phone-screen` benzeri blok için telefon görüntüsü. Klasör `output/task209/once/`. Masaüstü/tablet karşılaştırma bu görüntülerle yapılacak.
2. Kodu yaz (yukarıdaki kararlar).
3. `npm run lint`, `npm run typecheck`, birim testler (`npm test`) geçmeli. Yeni davranış için testler ekle (önce başarısız gör, sonra geçir): şerit yok, mini sepet çubuğu ana sayfada yok, `data-phone-screen` işaretleri, Toptan & Bayilik telefonda kart + pencere, formun tek örneği, derin bağlantılarla pencere açılması, ürün rafı yatay kaydırma ve klavye erişimi, alt bilgi bağlantılarının erişilebilirliği. Eski yapıyı varsayan testler bu görevin kapsamı nedeniyle kırılırsa güncelle ve raporda yaz.
4. **YAPMA:** `npm run build`, `.next` altına yazan her şey, 3024 sunucusunu durdurma/yeniden başlatma (`output/task206/stop.sh`). Codex bitene kadar ön izlemeye dokunma.
5. **Aşama A bitince dur ve rapor ver** (kayıt YOK, commit YOK): hangi dosyalar değişti, hangi yaklaşım (özellikle formun tek örneği nasıl sağlandı, alt bilgi için hangi yol), çalıştırılan komutlar ve sonuçları, açık sorular. Devamı için seni yeniden çağıracağım.

### AŞAMA B (devam mesajı gelince)
1. Önce Codex'in bittiğini doğrula (yukarıdaki iki işaret). Bitmemişse 5 dakika aralıkla en çok 40 dakika bekle, yine bitmediyse dur ve söyle.
2. `npm run build`; güvenli sunucuyla ön izlemeyi yeniden başlat: `TEST_DATABASE_URL=postgresql://localhost:5432/afina_kontrol189 node output/task201/run-clean.mjs --local-auth node output/task206/serve.mjs` (https://localhost:3024). Bitince **açık bırak**.
3. Ölçüm betiği yaz/çalıştır (`scripts/qa-screens-209.mjs`; `scripts/qa-landing-208.mjs` örnek): 360×800, 390×844, 430×932, 320×640'ta 10 bloğun yüksekliği ve (yükseklik ≤ görünür alan − üst menü) sonucu; yatay taşma 0; konsol hatası 0; kırık görsel 0; dokunma hedefi ≥ 44 px; LCP/CLS (mümkünse). Ana sayfa toplam yüksekliği önce → sonra.
4. **Masaüstü/tablet değişmedi kanıtı:** 768, 1024, 1440'ta `output/task209/once/` görüntüleriyle yeni görüntüleri piksel karşılaştır; fark 0 değilse nedenini bul ve düzelt.
5. Telefon ekran görüntüleri: her blok için `output/task209/sonra/` (320, 360, 390, 430), pencere açıkken Toptan ve Bayilik formu (390), klavye açıkken alan görünürlüğü (mümkünse).
6. e2e: ana sayfa, ürün, sepet, teklif/bayilik formu ile ilgili Chromium e2e belirtimlerini çalıştır; tabanla (`output/task208/` içindeki 327 geçen / 94 düşen sonucu) karşılaştır: **yeni düşen 0**. Eski yapıyı varsayan beklentiler (ör. telefonda form hemen görünür varsayan) güncellenir, raporda listelenir.
7. Kısa rapor: `output/task209/KANIT.md` (sade Türkçe).
8. Yerel kayıt, doğrudan main: `feat: 209 telefonda her bölüm tek ekran`. Yalnız kaynak/test/doküman dosyaları; `output/` yok. Bu görev dosyasının sonuna `## Durum: TAMAMLANDI` ekle.

## Kullanılacak skill'ler
`ui-ux-pro-max`, `design-taste-frontend`, `shadcn-ui` (Sheet'i v3'e uyarlamak için), `frontend-patterns`/`react-best-practices`. Her birini Skill aracıyla çağır.

## Teslim (her aşama sonunda)
Sade Türkçe özet (jargonsuz): ne yapıldı, ölçüler, açık kalan konu.

## Sonuç (13 Kas)
On blok 360×800, 375×812, 390×844, 430×932 ve 320×640'ta tek ekrana sığıyor; ana sayfa 390 px'te 8005 → 5967 px. Masaüstü ve tablet (768, 1024, 1440) canlıdaki "önce" görüntüleriyle piksel farkı 0. e2e Chromium 390 + 1440: 325 geçen / 90 düşen, yeni düşen 0. Kanıt: `output/task209/KANIT.md`. Bilinen sınır: gerçek tarayıcı çubuklarıyla kısalan ekranda Tesisimiz bloğu bir ekranı aşar (karar: şimdilik değiştirilmedi).

## Durum: TAMAMLANDI
