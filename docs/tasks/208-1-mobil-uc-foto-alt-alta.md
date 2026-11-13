# 208-1 Mobilde 3 fotoğraf kartı alt alta

Kaynak: kullanıcı (13 Kas, canlı site telefon ekran görüntüsü): "Mobilde şu 3'lü alt altta verelim."

## Amaç
Ana sayfa > Hikâyemiz bölümündeki üç fotoğraf kartı (Tesisimiz, Her Tanede Aynı Özen, Ellek zeytinlikleri) telefonda şu an üç sütun yan yana ve dar. Telefonda **alt alta, her biri tam içerik genişliğinde** olacak. Masaüstü ve tablet aynen kalır.

## Kapsam
- Kapsam: yalnız `components/storefront/StoreHome.module.css` içindeki `.facilityPhotos`, `.facilityPhoto`, `.facilityPhoto figcaption` kuralları (şu an ~101-106, 175-183, 211-213, 243. satırlar civarı; satır numaraları kayabilir, `grep facilityPhoto` ile bul).
- Etkilenen genişlik: **≤ 767 px (telefon)**. 768 px ve üstü (tablet, masaüstü) bugünkü hâliyle kalır, piksel farkı olmamalı.
- İşaretleme (`StoreHome.tsx`) değişmez; gerekmedikçe dokunma.

## İstenen sonuç (telefon)
1. `.facilityPhotos` tek sütun, kartlar arası boşluk 12 px.
2. Kart oranı yatay ve alçak olsun ki üç kart birlikte yaklaşık bir telefon ekranına sığsın: 390 px genişlikte üçünün toplam yüksekliği (boşluklar dahil) **≤ 720 px**. Öneri `aspect-ratio: 3 / 2`; sonuç iyi görünmüyorsa 16 / 10 dene ve seçimini gerekçesiyle yaz.
3. Alt yazılar (figcaption) okunaklı: 360 px ve üstünde ≥ 20 px, 320 px'te ≥ 18 px; kart içi kenar boşluğu 16 px. Karttaki alt yazının fotoğraf üstünde kontrastı üç fotoğrafta da yeterli olsun (koyu degrade alt yazının arkasında; gözle ve gerekirse hesapla, hedef ≥ 4,5:1).
4. Eski telefon ayarlarından (3 sütuna göre küçültülmüş yazı, `gap: 8px`, `aspect-ratio: 3 / 4`, 359 px'teki 15 px yazı) artık gereksiz olanları temizle; çakışan çift kural kalmasın.
5. Fotoğraflar kesilirken konu (tesis binası, zeytin dalı + el, zeytinlik) kadrajda kalsın; gerekirse `object-position` ayarla, ama görsel dosyalarına dokunma.

## Dokunulmaz
- `lib/auth`, `lib/db`, `lib/cart`, `lib/checkout`, `lib/payments`, `lib/orders`, `app/api`: hiçbir değişiklik yok.
- `.env*` okunmaz. Sır yazdırılmaz. `AFINA-KAYNAK/` ve `output/` git'e eklenmez (`git add -f` yasak).
- `node_modules` ve `.next` silinmez; `git stash/reset/clean` yok. Branch açma, PR yok.
- **Push yok, yayın yok.** Yalnız yerel kayıt (commit, doğrudan main): `fix: 208-1 mobilde 3 foto alt alta`.
- PDF/video hazırlanmaz. Ekran görüntüsü serbest.

## Doğrulama (hepsi çalıştırılıp sonucu raporda yazılacak)
1. `npm run lint`, `npm run typecheck`, `npm run build` geçmeli.
2. Birim testler: `npm test` (veya ilgili testler); `facility` / `StoreHome` geçen testler varsa onlar mutlaka. Yalnız bu değişiklikle doğrudan ilgili bir bekleme (3 sütun varsayan) kırılırsa güncelle ve raporda yaz.
3. Yeni derlemeyi güvenli yerel sunucuyla aç ve ekran görüntüsü al:
   `TEST_DATABASE_URL=postgresql://localhost:5432/afina_kontrol189 node output/task201/run-clean.mjs --local-auth node output/task206/serve.mjs` (https://localhost:3024). 3497 numaralı port başka projeye ait, dokunma. Bitince kullanıcı bakacağı için sunucu **açık kalsın**.
4. Ekran görüntüleri (yalnız Hikâyemiz fotoğraf alanı + bir önceki/sonraki bölümle birlikte): 320, 360, 390, 430 (telefon, yeni düzen), 768, 1024, 1440 (eskisiyle aynı olmalı: `git stash` kullanmadan, önceki derleme görüntüsüyle ya da CSS kurallarının değişmediğini hesapla göstererek kanıtla). Klasör: `output/task208-1/ekran/`.
5. Ölçümler 320/360/390/430'da: yatay taşma 0, konsol hatası 0, kırık görsel 0, üç kartın toplam yüksekliği, ana sayfa toplam yüksekliği (önce/sonra). `scripts/qa-landing-208.mjs` varsa çalıştır, çıktıyı rapora ekle.
6. Kısa rapor: `output/task208-1/KANIT.md` (sade Türkçe, ne değişti, hangi oran seçildi ve neden, ölçüler, çalıştırılamayanlar).

## Teslim
Sade Türkçe özet: ne değişti, sonuç ölçüleri, kayıt numarası, ön izleme adresi, açık kalan konu.

## Coder Notu (13 Kas)
- Telefonda (≤ 767 px) üç kart tek sütun, 12 px ara, oran 16:10. 3:2 hesapla elendi: 390 px'te 3 × 238,67 + 24 = 740 px eder, 720 sınırını aşar; 16:10 ile 695,25 px.
- Alt yazı her telefonda 22 px, kenar boşluğu 16 px (temel kural); 3 sütuna göre küçültülmüş telefon ayarları ve 359 px'teki 15 px silindi.
- Telefonda karartma yalnız alt yazı bandında (tablet kuralındaki karartma tam genişlik kartta fotoğrafın %90'ını örtüyordu). En düşük kontrast 6,48:1.
- `StoreHome.tsx`: yalnız `sizes` değeri (telefon `31vw` → `calc(100vw - 32px)`); yoksa tam genişlik kartta 480 px'lik küçük dosya seçilip bulanık görünüyordu.
- `object-position` gerekmedi; görsel dosyalarına dokunulmadı.
- Test: `tests/unit/facility-photos-208-1.test.ts`. Kanıt: `output/task208-1/KANIT.md`.

## Durum: TAMAMLANDI
