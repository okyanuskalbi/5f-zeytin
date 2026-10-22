# Task 133: Ürün penceresinde büyük görsel çerçeveyi tam doldursun

## Tür
frontend

## Amaç
Kullanıcı (22 Eki, ekran görüntüsü `docs/referans/geri-bildirim/133-popup-gorsel.png`): "tam ekrana oturt."
130'daki ürün detay penceresinde büyük stüdyo görseli (krem zeminli teneke) koyu yeşil çerçevenin içinde küçük kalıyor. Solda, sağda ve altta yeşil boşluk var. Görsel, ayrılan alanı kenardan kenara doldurmalı.

## Kullanılacak araçlar
- **Kullanıcı isteği (22 Eki):** `ui-ux-pro-max` (§5), `frontend-design`, `better-layout` fiilen yüklenir. Coder Notu'na kısa "Skill / nerede kullanıldı" tablosu. `responsiveness-check` Claude'da.
- `tdd-workflow`.

## İstenen
1. Büyük görsel alanı (pencerenin sol kolonu, telefonda üst kısım) **görselle tamamen dolu**. İç boşluk/padding, yeşil kenar ya da harf kutusu (letterbox) yok. Görsel alanının köşe yuvarlaklığı pencereyle uyumlu.
2. **Oran, seçili görselin oranına uyar:** stüdyo görselleri 4:5 (ya da kaynak oranı) → alan 4:5. Sahne görseli 16:9 seçilince alan 16:9'a geçer (yükseklik geçişi yumuşak, 200–250 ms, reduced-motion'da anında). Böylece hiçbir görsel kırpılmaz ve boşluk kalmaz (`object-fit: cover` + aynı oran).
3. Masaüstünde pencere iki kolon: sol görsel kolonu pencerenin tam yüksekliğini kullanır. Görsel kolonun üstüne ve altına dayanır, küçük resim şeridi görselin **altında** ayrı, ince bir satırda kalır (görsel alanını küçültmez). Pencere `max-height: calc(100dvh - 48px)` içinde kalır. Sağ kolon gerekirse kendi içinde kayar.
4. Telefonda görsel tam genişlik (kenar boşluğu 0), pencerenin en üstünde. Küçük resimler altında.
5. Küçük resimler: seçili olan altın çerçeveli, 56–64px.
6. CLS 0: görsel kabı `aspect-ratio` ile; görseller `width/height` taşır.

## Kabul kriterleri
- [ ] Unit/CSS: görsel kabında padding yok, `aspect-ratio` seçili görsele göre (4/5 ↔ 16/9).
- [ ] E2E (yaz, çalıştırma) `tests/e2e/product-image-133.spec.ts`: 1440 ve 390'da pencere açılınca büyük `img` sınırları kabın sınırlarıyla ±1px eşit (boşluk yok); sahne küçük resmi seçilince kap 16:9 olur.
- [ ] `npm test`, lint, typecheck, build yeşil; 130 testleri korunur.
- [ ] Tarayıcı doğrulaması Claude'da.

## Yapılmaması gerekenler
- Görselleri yeniden üretme ya da kırpma; açıklama/bilgi metinlerine dokunma.
- `docs/` değiştirme (yalnız Coder Notu/Durum).

## Durum: BEKLİYOR
