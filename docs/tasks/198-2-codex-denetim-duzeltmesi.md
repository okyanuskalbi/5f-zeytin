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
- [ ] Çakışma testi düzeltme öncesi RED, sonrası GREEN (çıktılar `output/task198-codex/duzeltme-198-2/`).
- [ ] `home-{320,390,430,768}-full.png` yeniden alındı; Claude'un yeniden inceleyeceği yol KANIT.md'de.
- [ ] lint, typecheck, test, build, `git diff --check` PASS.
- [ ] Tek ek kayıt: `fix: 198-2 telefonda öne çıkan ürünler çakışması, Hakkımızda düğmesi, çakışma testi`.

MASTER-PROMPT §15 kuralları geçerli.

## Durum: BEKLİYOR
