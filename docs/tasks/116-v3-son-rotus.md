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

## Durum: BEKLİYOR
