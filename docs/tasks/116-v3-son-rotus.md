# Task 116: v3 son rötuşlar (taslak etiketleri, header çakışması)

## Tür
frontend

## Amaç
115 sonrası Claude'un tarayıcı denetiminde kalan üç küçük kusuru gidermek.

## Bulgular (Claude, 21 Eki)
1. **Güven şeridi:** "Kargo 2–4 iş günü" altında küçük "Örnek süre" yazısı görünüyor. Ziyaretçiye taslak etiketi gösterme.
   - Kaldır.
   - Kargo süresi açık karar olarak kalır; önizleme notu zaten footer'da tek satır.
2. **Toptan:** "İletişim bilgileri yakında" yazısı.
   - Telefon/e-posta henüz yokken bu satırı tamamen gizle; yalnız "Toptan alım için bize yazın" başlığı kalmasın.
   - Bilgi gelene kadar toptan satırını komple gizle. Footer'daki "Toptan Satış İçin İletişime Geçin" bağlantısı da gizlensin.
3. **Header çakışması:** Masaüstünde hero'dan aşağı kaydırırken hero'nun "Sepete ekle / Ürünleri gör" düğmeleri yarı saydam header'ın altından görünüp üst üste biniyor.
   - Header kiler yeşili zemine geçince opak olsun, ya da hero içeriği header'ın altında kırpılsın.

## Kullanılacak araçlar
- ECC: frontend-patterns.
- Skill: `impeccable` (craft-floor).

## Kabul kriterleri
- [ ] `grep -rn "Örnek süre\|İletişim bilgileri yakında" app components` boş.
- [ ] Unit test: iletişim bilgisi boşken toptan satırı ve footer bağlantısı render edilmez.
- [ ] `npm test`, lint, typecheck, build yeşil.
- [ ] Tarayıcı kontrolü Claude'da.

## Coder Notu

- Güven şeridindeki "Örnek süre" etiketi ve kullanılmayan stili kaldırıldı. Kargo süresi açık karar olarak kaldı; footer'daki tek önizleme notu korundu.
- Telefon, WhatsApp ve e-posta boşken (yalnız boşluk içeren değerler dahil) toptan satırı başlığı ve anchor'larıyla birlikte render edilmiyor; footer bağlantısı da gizleniyor. Gizlenen hedefe yönlendirmemeleri için masaüstü/mobil menü ve hızlı görünümdeki toptan bağlantıları aynı ortak koşula bağlandı. Onaylı bir iletişim kanalı girildiğinde satır ve bağlantılar geri geliyor.
- Header yalnız sayfanın en üstünde şeffaf. İlk kaydırmadan itibaren opak kiler yeşili kullanıyor; zemindeki yarı saydam ara kareyi kaldırmak için renk geçişi kaldırıldı. Kaydırılmış sayfa açılışı, pageshow ve iç sayfaların açık zemini unit testlerle doğrulandı.
- TDD: uygulama öncesi hedef testlerde 9 beklenen başarısızlık görüldü; uygulama sonrası tüm unit testleri geçti. Boş/boşluk iletişim bilgileri ve her iletişim kanalının tek başına dolu olduğu durumlar kapsandı.
- Komut kanıtları: `grep -rn "Örnek süre\|İletişim bilgileri yakında" app components` boş çıktı (eşleşme yok, exit 1); `npm test` 27 dosyada 298/298 başarılı; `npm run lint`, `npm run typecheck`, `npm run build` başarılı. Build öncesindeki `check:assets` 18 görseli ve 98 v3 çıktıyı doğruladı. `git diff --check` temiz.
- ECC `frontend-patterns` ve Impeccable `craft-floor` uygulandı. Impeccable mekanik taraması değişen UI dosyalarında `[]` döndürdü. 21st MCP erişimi yoktu; yeni bileşen eklenmeden mevcut proje bileşenleri düzenlendi.
- Tarayıcı kabulü: **Claude doğrulayacak.** İlgili e2e beklentileri güncellendi; hero düğmeleri header'ın altından geçerken opak zemin kontrolü eklendi. Playwright, Lighthouse, inspect, ekran görüntüsü/kare şeridi çalıştırılmadı (AGENTS.md).
- Çalışma sırasında dışarıdan oluşan `.gitignore` içindeki `.vercel` satırı task kapsamı dışında bırakıldı; korunarak bu commit'e alınmadı.

## Durum: TAMAMLANDI
