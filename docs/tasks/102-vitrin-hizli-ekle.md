# Task 102: Vitrin: ürün ızgarası, hızlı ekle, hızlı görünüm

## Tür
frontend

## Amaç
≤ 6 ürünlük 3×2 vitrin; hızlı ekle durum makinesi; hızlı görünüm paneli (galeri, boy seçici, adet).

## Bağlam
ZEYTİN v2 — **önce `docs/DESIGN.md` (tamamı; v2 "Topraktan sofraya") okunur**; v1 (`DESIGN-v1-etiket.md`) bileşenleri (etiket kartı, koçan, fişler, fırfırlı footer) kaldırılır/dönüştürülür. Korunanlar DEĞİŞMEZ. Kullanıcı (20 Eki): "ZEYTİN SİTESİNİ HİÇ BEĞENMEDİM BAŞTAN YAP" + "21.DEV VE FRAMER MOTION UX/UI SKİLLERİ İLE EN İYİ SEÇENEKLERİ YAP".

## Kullanılacak araçlar
- ECC skill: frontend-patterns, motion-patterns, motion-advanced, accessibility, design-system, verification-loop; skill `motion-framer`, `profesyonel-web-sitesi`, `ui-ux-pro-max` (e-ticaret UX)
- 21st MCP: evet — Add to Cart Button 34564, Product Card 5650, Thumbnail image viewer 37501, Drawer 23558/31360 (uyarla)

## Adımlar
1. Görseller: `~/PROJELER/AFINA-KAYNAK/urun-gorselleri/onayli/` VARSA (kullanıcı onayı, ONAY.md) stüdyo 4:5 + sahne; YOKSA mevcut onaylı görseller (teneke referans kırpımı yalnız 1 üründe, zeytinlik yalnız 1 üründe) ve diğer kartlar görselsiz tipografik varyant (boş kutu YOK). 'Temsili görsel' notu 13px.
2. Kart: görsel (hover → sahne çapraz geçiş), ad (Fraunces), gramaj, fiyat (tabular), adet −/+, 'Sepete ekle' (bas→yükleniyor→'Eklendi ✓'→sıfırla, spring); tükendi durumu.
3. Hızlı görünüm: karta tıklayınca masaüstünde sağ panel (odak tuzağı, ESC), mobilde alt sayfa (sürükle-kapat, snap); galeri (küçük resim şeridi, klavye), boy/varyant seçici, adet, sepete ekle, kısa açıklama, 'Toptan teklif iste'. URL'de `?urun=<slug>` (paylaşılabilir, geri tuşu kapatır).
4. Veri: `getProducts()` (geçici sabit veri, 030 sözleşmesi); Product JSON-LD YOK (gerçek katalog gelene kadar).
5. Giriş: kart stagger `whileInView`.

## Kabul kriterleri
- [ ] e2e: hızlı ekle durumları, sepet rozeti artar; hızlı görünüm aç/kapa (ESC, geri, sürükle), klavye; tükendi devre dışı
- [ ] `lint.mjs app components` 0 FAIL; production (`next build && next start -p 3104`) `inspect.mjs` bu bölüm için FAIL 0; 1440/768/390 + iPhone 14 (WebKit) + Pixel 7 ekran görüntüleri `test-results/102/`
- [ ] lint/typecheck/build; ilgili e2e (reduced-motion + mobil); sepet/PayTR önizleme/toptan form testleri bozulmaz

## Durum: BEKLİYOR
