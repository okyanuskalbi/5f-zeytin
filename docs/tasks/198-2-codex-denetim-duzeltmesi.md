# Düzeltme 198-2 (Codex): Claude görsel denetimi bulguları

> 198'i yapan Codex oturumuna `resume --last` ile verilir. Dayanak `docs/MASTER-PROMPT.md` v1.1.
> Kanıt: Claude, `output/task198-codex/ekran/home-390-full.png` görüntüsünü gözle inceledi.

## Bulgular

### 1. KRİTİK — Telefonda "Öne Çıkan Ürünler" yazıları fotoğrafın üstüne biniyor
390 px'de her satırda ürün fotoğrafı (~200 px) ile metin sütunu üst üste geliyor: "Salamura Yeşil Zeytin" başlığının ilk harfleri, "3 L", "5 L", "1 kg", "Stokta mevcut", "Mevcut değil" yazıları görselin içinde kalıyor (dört satırın dördünde). Masaüstünde (1440) sorun yok.
KANIT.md'deki "taşma 0" ölçümü yalnız yatay sayfa taşmasını ölçtüğü için bunu yakalamadı.
**Düzelt:** dar ekranda bu satırlar metni görselle çakıştırmayacak bir düzene geçsin (ör. ≤ 600 px'de görsel üstte, metin altta; ya da görsel 96–120 px küçük ve metin sütunu `minmax(0,1fr)`). 320, 360, 375, 390, 414, 430 ve 768'de doğrula.

### 2. ORTA — Hikayemiz'de "Hakkımızda" bir düğme olmalı
BRIEF: "hakkımızda sayfasına yönlendiren bir **buton** ile sağ tarafta bulunan 3'lü ikonu koruyalım." Şu an altı çizili metin bağlantısı. DESIGN.md'deki ikincil düğme biçimine çevir (metin aynı kalabilir).

### 3. Test açığı — üst üste binme ölçümü
Tarayıcı testine kalıcı bir **çakışma** kontrolü ekle: her ürün kartı/satırı, kategori kutusu, banner ve blog kartı içinde görünür metin öğelerinin kutusu ile `img`/`picture` kutusu kesişmesin (bilerek üstte duran hero/banner başlıkları gibi `data-overlay-ok` işaretli öğeler hariç). Ana sayfa + ürün sayfası × MASTER-PROMPT §13 cihazları. Bu test hatayı ilk önce KIRMIZI göstermeli (düzeltmeden önce çalıştır, çıktıyı sakla), sonra yeşile dönmeli.

## Kabul
- [x] Çakışma testi düzeltme öncesi RED, sonrası GREEN (çıktılar `output/task198-codex/duzeltme-198-2/`).
- [x] `home-{320,390,430,768}-full.png` yeniden alındı; Claude'un yeniden inceleyeceği yol KANIT.md'de.
- [x] lint, typecheck, test, build, `git diff --check` PASS.
- [x] Tek ek kayıt: `fix: 198-2 telefonda öne çıkan ürünler çakışması, Hakkımızda düğmesi, çakışma testi`.

MASTER-PROMPT §15 kuralları geçerli.

## Coder Notu (Codex)

Düzeltmeden önce mevcut kaynak0484272 üzerinde kalıcı
`scripts/qa-storefront-collisions.mjs` çalıştırıldı. RED çıkış1:30 profilin5'inde
87 kesişme (360:24,375:16,390WebKit:16,414:16,430WebKit:15). Bu profillerde
yatay taşma0 olması önceki test açığını doğruladı. RED kaynak/hash ve ham
çıktıları `output/task198-codex/duzeltme-198-2/red-source.json`, `red.txt`
ve `red/report.json` içinde; bu aşamada uygulama CSS/TSX'i değiştirilmemişti.

767px ve altında öne çıkan kartların fotoğrafı üstte, bilgisi altta;
fotoğraf yüksekliği artık tüm kartın yüksekliğinden alınmıyor. Masaüstü
korundu. Hakkımızda, aynı hedefe giden yeşil çerçeveli ikincil düğme oldu.
DESIGN.md bu dar değişikliklerle güncellendi.

RED'den sonra test dosyası değiştirilmeden aynı komut çalıştırıldı: GREEN
çıkış0,30/30 profil ve360 kart/satırda0 kesişme. Ana sayfada19,ürün sayfasında5
hedef; kategori/banner/blog dahil. Her iki motorda kontrol örneği gerçek
kesişmeyi ve data-overlay-ok istisnasını doğruluyor. Uygulamaya istisna
etiketi eklenmedi. Test yalnız yerel adres kabul eder; tarayıcıları düzgün kapatır.

Ek30 profil denetiminde taşma/konsol/kaynak/kırık görsel/axe/küçük hedef0;
Hakkımızda düğmesi15 ölçüde≥48px ve doğru hedefte. Chromium CLS≤0.01480;
WebKit CLS desteklenmediğinden ölçülmedi. lint/typecheck/1483test/build/diff
PASS; yerel Neon DB sağlanmadığı için26 ilgili test SKIP. Üç yavaş telefon
LCP1.908/1.916/1.916sn; toplam JS telefon232932,masaüstü396085bayt.

Son görüntüler ve ayrıntılı kanıt:
`output/task198-codex/duzeltme-198-2/KANIT.md`.
Claude yeniden incelemesi için320/390/430/768 tam sayfa dosyaları
`quality/ekran/home-{320,390,430,768}-full.png`; okunur390px yakın görüntüler
`featured-390-view.png` ve `story-390-view.png`. Ana198 KANIT/DENETIM kayıtlarına
önceki çakışma değerlendirmesinin yanlışlandığı ve yeni kanıt yolu eklendi.

Yeni paket,medya,hareket,backend/auth/sepet/ödeme mantığı veya ortam dosyası
değişikliği yok. Push/yayın/canlı DB işlemi yapılmadı; node_modules/.next
korundu. output/AFINA-KAYNAK kayda eklenmedi. K1 seçimi ve fiziksel cihaz
kabulü bu düzeltmenin dışında. Tek ek yerel kayıt istenen mesajla oluşturuldu.

## Durum: TAMAMLANDI
