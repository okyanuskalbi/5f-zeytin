# HTCOM / Villa Lara / MLNEW incelemesi

1 Kasım 2026. Üç repo salt okunur incelendi; mevcut dirty dosyaları korunuyor.

| Referans | Aktif kaynak | Alınacak tasarım ilkesi |
| --- | --- | --- |
| HTCOM | components/sections/WindowJourney.tsx | Pencere, bulut, Antalya, sonuç ve boarding-pass aynı sahnede birbirini hazırlar. |
| Villa Lara | platform/src/components/landing-v7/V7Page.tsx | Portre, hikâye şeridi, bilet, karşılaştırma, spot ışığı ve klinik ayrı fikirler; ortak atmosfer. |
| MLNEW | components/home/HeroScrub.tsx | Yüzük/RFID dönüşümüyle ürün bilgisinin birlikte okunması. |

MLNEW canlı açılışı ve bir ara scroll konumu CUA ile görüntülendi.
Villa Lara V7 kayıtlı ekranları ve prototip hero/spotlight görselleri incelendi.
HTCOM aktif kodu ve kaynak görselleri incelendi; canlı hareket kabulü yapılmadı.
Villa Lara ana scroll motoru GSAP/Lenis, HTCOM/MLNEW Motion kullanır.
AFİNA uygulaması kullanıcının tercihiyle Framer Motion olarak kalır.

V11 eksikleri: ilk görüntüyü örten yoğun koyu perde, sıkışık başlık aralığı,
görselden daha baskın açık renk navigasyon, yinelenen toprak/üretim metinleri,
bağımsız bloklar ve teknik testin görsel kalite yerine sunulması.

İnceleme materyalleri:
- /Users/emre/PROJELER/HTCOM/components/sections/WindowJourney.tsx
- /Users/emre/PROJELER/VILLALARA/docs/design/evidence/364/browser/chromium-tr-1440-full.png
- /Users/emre/PROJELER/VILLALARA-YENI/_qa/b1-hero.jpg
- /Users/emre/PROJELER/VILLALARA-YENI/_qa/3-spot.jpg
- /Users/emre/PROJELER/MLNEW/DESIGN.md
- https://www.mlakdeniz.com/
