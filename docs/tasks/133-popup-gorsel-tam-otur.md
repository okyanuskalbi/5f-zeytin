# Task 133: Ürün penceresinde büyük görsel çerçeveyi tam doldursun

## Tür
frontend

## Amaç
Kullanıcı (22 Eki), iki ekran görüntüsüyle:
- `docs/referans/geri-bildirim/133-popup-gorsel.png`: "tam ekrana oturt."
- `docs/referans/geri-bildirim/133-popup-sahne-bosluk.png`: "burayı doldur, altta boşluk olmasın." Sahne görseli (16:9) seçiliyken görselin üstünde ve altında yeşil bant var, küçük resim şeridinin altında da sol kolonda büyük boş alan kalıyor.
130'daki ürün detay penceresinde büyük stüdyo görseli (krem zeminli teneke) koyu yeşil çerçevenin içinde küçük kalıyor. Solda, sağda ve altta yeşil boşluk var. Görsel, ayrılan alanı kenardan kenara doldurmalı.

## Kullanılacak araçlar
- **Kullanıcı isteği (22 Eki):** `ui-ux-pro-max` (§5), `frontend-design`, `better-layout` fiilen yüklenir. Coder Notu'na kısa "Skill / nerede kullanıldı" tablosu. `responsiveness-check` Claude'da.
- `tdd-workflow`.

## İstenen
1. **Sol görsel kolonu baştan sona dolu.** Masaüstünde (≥ 768) görsel kolonu, pencerenin sağ kolonuyla **aynı yükseklikte** (pencere yüksekliği). Büyük görsel bu kolonu **üstten alta, kenardan kenara** doldurur: `position: absolute; inset: 0; object-fit: cover`. Yeşil bant, letterbox, padding ya da görselin altında boş alan yok.
2. **Odak noktası:** `object-fit: cover` ile kırpılan görsellerde ürün her zaman görünür kalsın. Stüdyo görsellerinde `object-position: center`. Sahne görsellerinde ürün kadrajın neresindeyse ona göre `object-position` ayarla (ör. kavanoz/teneke merkezdeyse `center`, sağdaysa `70% center`). Değerleri varyant/görsel başına bir haritada tut.
3. **Küçük resimler görselin üstünde:** şerit, büyük görselin alt kenarına **bindirilir** (görselin içinde, alttan 16px), arkasında hafif koyu degrade (yalnız şerit okunurluğu için). Şerit ayrı bir satır kaplamaz, kolonun altında boş alan bırakmaz. Seçili küçük resim altın çerçeveli, 56–64px.
4. **Telefon (< 768):** görsel tam genişlik, en üstte, yüksekliği `min(62svh, 125vw)`. Görsel bu alanı `cover` ile doldurur. Küçük resimler yine görselin altına bindirilir. Altında içerik başlar, aradaki boşluk 16px.
5. Görsel değiştirildiğinde kap boyutu **değişmez** (yükseklik zıplaması yok), yalnız görsel yumuşak geçişle değişir (opacity 150–200 ms, reduced-motion'da anında).
6. Köşe yuvarlaklığı pencereyle uyumlu (masaüstünde sol üst ve sol alt köşe, telefonda üst köşeler). CLS 0.
7. Pencere `max-height: calc(100dvh - 48px)` içinde. Sağ kolon gerekirse kendi içinde kayar, sol görsel kolonu sabit kalır.

## Kabul kriterleri
- [ ] Unit/CSS: görsel kabı kolonun tamamını kaplıyor (`inset: 0` + `cover`), padding yok. Küçük resim şeridi görsel kabının içinde, mutlak konumlu.
- [ ] Unit: sahne görselleri için `object-position` haritası var.
- [ ] E2E (yaz, çalıştırma) `tests/e2e/product-image-133.spec.ts`: 1440×900 ve 390×844'te pencere açılınca, stüdyo ve sahne görseli seçiliyken büyük `img` sınırları görsel kolonunun sınırlarıyla ±1px eşit. Görsel kolonunun alt kenarı sağ kolonun alt kenarıyla ±2px aynı (masaüstü). Küçük resim şeridi büyük görselin içinde.
- [ ] `npm test`, lint, typecheck, build yeşil; 130 testleri korunur.
- [ ] Tarayıcı doğrulaması Claude'da.

## Yapılmaması gerekenler
- Görselleri yeniden üretme ya da kırpma; açıklama/bilgi metinlerine dokunma.
- `docs/` değiştirme (yalnız Coder Notu/Durum).

## Durum: BEKLİYOR
