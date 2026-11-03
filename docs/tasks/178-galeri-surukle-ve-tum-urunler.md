> ONAY VERİLDİ (kullanıcı, 3 Kas 2026, ekran görüntüsüyle): "bu kısımda sağ sol tut-bırak ile devam edebilsin, hem mobil hem masaüstü; ayrıca tüm ürünler diye bir buton gelsin, grid düzende gelsin". Main push ve Vercel REST yayını AGENTS.md'deki gibi yetkilidir.

# Task 178: Ürün galerisinde sürükleyerek gezinme + "Tüm ürünler" ızgarası

## Tür
frontend

## Amaç
`#urunler` (AFİNA KOLEKSİYONU, "Sofranızdan işletmenize.") galerisinde ziyaretçi ürünleri fareyle ya da parmakla tutup sağa sola sürükleyerek gezebilsin. Ayrıca tek tıkla tüm ürünleri ızgara düzeninde görebilsin.

## Bağlam
- Bileşen: `components/landing/HorizontalProductGallery.tsx` (+ `.module.css`), ray: `components/ui/pendant-lamp-rail`.
- Masaüstünde (ve `scrub` modunda) dikey kaydırma yatay `x` değerini sürüyor (`scrollYProgress` → `x`). Ok düğmeleri `seekGallery` ile aynı kaydırma konumuna yazıyor. Native modda (`data-gallery-mode="native"`) viewport'un kendi `scrollLeft` değeri var.
- Bugün fareyle tutup sürükleme yok. Mobil scrub modunda yatay parmak hareketi galeriyi ilerletmiyor.
- Ekran görüntüsünde 03/06 "Salamura Siyah Zeytin 1 kg" kartının görseli boş görünüyordu (stok 0, "Mevcut değil"). Görsel `urun-03-siyah-1kg`.

## Kullanılacak araçlar
- Skill: `ui-ux-pro-max`, `frontend-design`, `motion-framer`, `shadcn-ui` (Dialog/Sheet zaten `components/ui` içinde), `better-layout`, `tdd-workflow`.
- 21st MCP: ızgara kart düzeni için referans olarak bakılabilir; yeni bağımlılık eklenmez.

## Adımlar
1. **Sürükleme (masaüstü + mobil, scrub ve native):**
   - Ray üzerinde pointer ile tut-sürükle-bırak çalışsın: fare (`pointerType: mouse`), dokunma ve kalem.
   - Yeni bir kaydırma motoru yazma. Sürükleme mevcut konuma yazsın: scrub modunda `seekGallery` ile aynı yoldan (sayfa dikey konumu + `scrollYProgress`), native modda viewport `scrollLeft`.
   - Dokunmada yön kilidi uygula: ilk ~8 px yatay baskınsa galeri sürüklenir, dikey baskınsa sayfa normal kaysın (`touch-action: pan-y`). Dikey sayfa kaydırması hiçbir cihazda bozulmasın.
   - Bırakınca hafif atalet, ardından en yakın kartın ortalanması. `prefers-reduced-motion` açıkken atalet yok, doğrudan en yakın karta otursun.
   - İmleç: üzerinde `grab`, sürüklerken `grabbing`. Sürükleme sırasında metin seçimi ve görsel "ghost drag" olmasın.
   - 6 px'ten uzun bir sürükleme sonrası kart içindeki tıklama (Sepete ekle / Teklife ekle / kart bağlantısı) tetiklenmesin. Kısa dokunuş ve normal tıklama aynen çalışsın.
   - Klavye, oklar, odakla ortaya getirme (`revealFocus`) ve mevcut ray davranışı değişmesin.
   - İpucu metinleri güncellensin: mobil "Kaydırın, sürükleyin veya okları kullanın.", masaüstü alt satır "Kaydırarak ya da sürükleyerek keşfedin."
2. **"Tüm ürünler" düğmesi + ızgara:**
   - Başlık alanına (sağdaki açıklamanın yanına/altına; mobilde başlığın altına) "Tüm ürünler" düğmesi ekle. Sitenin mevcut düğme dilini kullan; ok ya da ızgara ikonu `lucide-react`'tan.
   - Tıklayınca mevcut `components/ui/dialog` ya da `sheet` ile tam ekran (mobil) / geniş (masaüstü) bir panel açılsın, başlığı "Tüm ürünler".
   - Panel içinde tüm ürünler ızgara düzende listelensin: mobil 2 sütun (≤ 380 px'te 1), tablet 3, masaüstü 3–4. Aynı `ProductCard`'ı kullan; fiyat, ağırlık, stok durumu, "Sepete ekle" ve "Teklife ekle" galerideki gibi çalışsın.
   - "Teklife ekle" paneli kapatıp `#teklif`'e gitsin (galerideki davranışla aynı).
   - Odak tuzağı, Esc ile kapanma, kapanınca odak düğmeye dönsün. Arka plan kaydırması kilitlensin; kapanınca galeri konumu aynı kalsın.
   - Ürün sırası galeriyle aynı (`imageKey` sırası).
3. **Boş görsel:** 03 numaralı "Salamura Siyah Zeytin 1 kg" görselinin boş görünme nedenini bul (eksik varlık, yükleme/lazy, spotlight/opacity ya da stok 0 stili). Görsel varsa hem galeride hem ızgarada görünsün. Stok 0 ürün görsel olarak saklanmaz; yalnız düğme "Mevcut değil" kalır. Nedenini Coder Notu'na yaz.

## Kabul kriterleri
- [x] Birim/bileşen testi: yatay sürükleme `x`/konumu değiştiriyor (scrub ve native), dikey baskın dokunma galeriyi değiştirmiyor, 6 px üstü sürükleme sonrası kart düğmesine tıklama tetiklenmiyor, kısa tıklama tetikleniyor.
- [x] Birim/bileşen testi: "Tüm ürünler" paneli tüm ürünleri galeriyle aynı sırada ve aynı sayıda gösteriyor; Esc ile kapanıyor, odak düğmeye dönüyor; "Teklife ekle" ürünü seçip `#teklif`'e gidiyor.
- [x] Salamura Siyah görseli testle ya da derlenmiş çıktıyla doğrulanmış.
- [ ] `npm test`, lint, typecheck, build yeşil. Mevcut galeri/scroll/e2e testleri zayıflatılmadan geçiyor.
- [x] Yayın (main + Vercel REST) ve makbuz `.cache/task-178/final-receipt.json`.
- Gerçek tarayıcıda masaüstü fare sürüklemesi, iPhone/Android dokunma, takılma ölçümü: Claude doğrular.

## Yapılmaması gerekenler
- Galerinin görsel tasarımı, kart tasarımı, spotlight/lamba efektleri, sayfadaki diğer bölümler değişmesin (yalnız düğme + panel eklenir).
- Yeni bağımlılık ekleme (framer-motion, mevcut shadcn bileşenleri yeterli).
- Sepet, teklif, üyelik, ödeme mantığına, fiyat/stok verisine, DB'ye dokunma.
- Görünen metinde uzun tire, "%100 / organik / doğal" iddiası yok ("Doğal Kırma" ürün adı hariç).
- Scroll-snap ekleme (sayfa geneli).


## Coder Notu

- Kullanılan skill'ler: proje UI/UX Pro Max, frontend-design, motion-framer,
  shadcn-ui, better-layout ve tdd-workflow. Mevcut Next.js client component
  rehberi okundu. 21st MCP `product grid` araması: 28200 Product Card ve
  19021 skeleton metadata referansı incelendi; yeni kart/bağımlılık alınmadı.
  Resmî `npx shadcn@latest docs dialog` ile mevcut Dialog doğrulandı.
- Mevcut PendantLampRail zaten pointer sürükleme içeriyordu. Eylem düğmelerinin
  sürüklemeden dışlanması kaldırıldı; kısa tap ve klavye korunur. Yatay intent
  6px üstünde kilitlenir (yaklaşık 8px); dikey intent sayfaya bırakılır.
  Scrub `seekGallery`/scrollYProgress yoluna, native scrollLeft'e yazar.
  Mevcut sonlu Motion animasyonu atalet ve en yakın karta yerleşmeyi yürütür;
  reduced-motion artık hız projeksiyonu yapmaz. Native CSS snap'in her ara
  scrollLeft değerini yuvarlaması yalnız geliştirilmiş rayda kapatıldı;
  no-JS native snap korunur. Ghost drag ve sürükleme sonrası click engellenir.
- Başlıktaki düğme aynı altı ProductCard'ı imageKey sırasında açar. Izgara
  <=380px tek, telefon iki, >=768px üç sütun; mobil tam ekran ve sabit panel
  başlığı/ayrı kaydırma gövdesi. Radix odak tuzağı, Esc ve scroll lock sürer.
  Normal kapanış preventScroll ile düğmeye döner; teklif seçimi kapanıştan
  sonra #teklif'e gider ve form odağını alır.
- Siyah zeytin incelemesi: manifestteki dört AVIF/WebP mevcut ve sharp ile
  decode ediliyor; alpha ortalaması yaklaşık 238/255, renk aralığı 0–255.
  Boş/şeffaf dosya veya stok kaynaklı gizleme yok. Aynı görsel gridde de var,
  stok 0 yalnız satın alma düğmesini kapatıyor. Ray görselleri önceden lazy
  yükleniyordu; transformla görünür olan rayda gecikme riskini kaldırmak için
  altı ambalaja loading=eager, fetchPriority=auto uygulandı. Ekran görüntüsündeki
  boşluğun kesin tarayıcı nedeni bu komut kontrolleriyle kanıtlanamadı; Claude
  incelemesinde lazy/decode ve görünürlük zamanlaması teyit edilmeli.
- RED: yeni testler ilk çalıştırmada sürükleme/panel/yükleme eksiklerinden
  başarısız oldu (`.cache/task-178/red.log`). Aynı hedef GREEN'e döndü.
  Eski viewport testinde yalnız istenen ipucu metni güncellendi; eski purchase
  istisna testi yeni yatay sürükleme + alışveriş tetiklenmemesi beklentisine
  genişletildi. Klavye/native/rotation kontrolleri çıkarılmadı, e2e değiştirilmedi.
- Tarayıcı/e2e, fiziksel cihaz, görsel piksel kabulü ve takılma ölçümü bu oturumda
  çalıştırılmadı; kullanıcının talimatıyla Claude'a bırakıldı. Yeni medya veya
  gerçek hesap/ödeme/talep işlemi yapılmadı. RED/ara commit oluşturulmadı.

## Komut doğrulaması

- `npm test -- --maxWorkers=2`: 122 dosya / 1440 test PASS.
- `npm run lint`: PASS (uyarı yok).
- `npm run typecheck`: PASS.
- `npm run build`: PASS, production Turbopack ve tüm varlık kontrolleri.
- `git diff --check`: PASS.
- Loglar `.cache/task-178/{red,focused,unit,lint,typecheck,build}.log`.
- e2e dosyaları değiştirilmedi; kullanıcı isteğiyle çalıştırılmadı. Bu nedenle
  e2e içeren birleşik kabul satırı komut başarılarına rağmen işaretlenmedi.
- Main kaynak `2d6fcce` push edildi. CI41620563438 SUCCESS.
- REST `dpl_8ic3NZX3HH5wQJKYCVxmXsSHpGXF` READY; afinazeytin.com alias bağlı.
  Canlı HTTP200, yeni düğme/ipucu ve siyah zeytinin dört AVIF/WebP SHA256
  eşleşmesi PASS. Bu, tarayıcı/görsel kabulü değildir.
- Derlenmiş CSS: 2/3 sütun, mobil100dvh, touch-action ve panellerde
  --tw-translate-x/y:0px doğrulandı (`compiled-css.json`).
- Nihai makbuz `.cache/task-178/final-receipt.json`.
- Yeni/revizyonlu 45 hedef test ve toplam 1440 test PASS; tüm komut logları
  yukarıdaki dizinde. Yayın sonrası bu kayıt güncellemesi yalnız dokümantasyondur.
- BEKLİYOR nedeni: ekran görüntüsündeki boş görselin kesin nedeni tarayıcı
  yeniden üretimi olmadan kanıtlanamadı. Varlık/yükleme koruması ve komut
  kabulü tamamdır; Claude'un neden/görsel teyidi henüz yok.

## Claude Denetimi (3 Kas, canlı dpl_8ic3NZX3HH5wQJKYCVxmXsSHpGXF, headless Playwright)
- GEÇTİ: Masaüstü fare sürüklemesi (Chromium 1440/1280 + WebKit 1440): 360 px sürükleme bir sonraki karta oturuyor (active 0→1). Tüm ürünler paneli masaüstünde 3 sütun, mobilde 2 sütun, 6/6 görsel yüklü, yatay taşma yok, Esc kapatıyor ve odak düğmeye dönüyor. Konsol hatası yok.
- GEÇTİ: Siyah zeytin görseli galeride ve panelde yüklü (naturalWidth > 0). Madde 3 kapandı. Ekran görüntüsündeki boşluk eager yüklemeden önceki lazy gecikmesiydi.
- GEÇTİ: Mobilde dikey dokunma sayfayı kaydırıyor (250 px hareket → 253 px).
- KALDI: **Mobil yatay parmak kaydırması çalışmıyor.** 390×844, isMobile+hasTouch, scrub modu. `Input.synthesizeScrollGesture` ile 260 px sola kaydırma: rail `translateX` 0 → -8, ikinci kaydırmada -16, `data-rail-active` 0'da kalıyor. Sayfa `scrollY` +96 kayıyor. pointerdown/move/up olayları #urunler'e ulaşıyor, pointercancel yok. Yani sürükleme konumu ya çok küçük ölçekle yazılıyor ya da bırakınca 0. karta geri dönülüyor. Tekrar üretim: `PW=$PWD/node_modules/playwright node .cache/task-178/claude-touch-repro.cjs`.

## Düzeltme 178-1
1. Mobil/dokunma scrub modunda yatay parmak kaydırması parmak mesafesi kadar rayı taşısın (260 px sola → en az bir kart ileri). Bırakınca hıza göre bir sonraki/önceki karta otursun. Kısa ve yavaş sürüklemede en yakın karta otursun; 0. karta geri sıçramasın.
2. Nedeni bul: dokunma pointer olaylarında `touch-action: pan-y` altında `pointermove` yön kilidi, sayfa dikey kaydırmasının (`scrollY` +96) seek ile çakışması ya da settle hedefinin yanlış hesaplanması. Nedeni Coder Notu'na yaz.
3. Test: dokunma tipi pointer dizisiyle (pointerType "touch") yatay 260 px sola → active 1; sağa geri → active 0; dikey baskın dokunma galeriyi değiştirmiyor. Mümkünse yukarıdaki repro betiğini e2e/uyum testine çevir (canlı yerine yerel `next start`).
4. Masaüstü sürükleme, panel ve diğer davranışlar değişmesin. Yayın + makbuz aynı.

## Durum: BEKLİYOR
