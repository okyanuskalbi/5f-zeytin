# Task 184: Ana sayfayı klasik C tasarımına geçir (kaydırma sahneleri kalkar)

## Tür
frontend

## Amaç
Kullanıcı kararı (9 Kas 2026): kaydırmaya bağlı sinematik sahne sistemi bırakılır; ana sayfa, kullanıcının örneğinin birebir ve geliştirilmiş hali olan **C tasarımı** ile klasik, yukarıdan aşağı okunan sabit bölümlü sayfa olur. Alışveriş (sepet, ürün detayı, Tüm ürünler, ödeme), teklif formu, SSS ve iletişim çalışmaya devam eder.

## Tasarım kaynağı (bağlayıcı)
- `AFINA-KAYNAK/tasarim/klasik-anasayfa-c/masaustu.png` ve `mobil.png` — hedef görünüm.
- `AFINA-KAYNAK/tasarim/klasik-anasayfa-c/referans/ORNEK-birebir.png` — kullanıcının örneği (düzen ve stil bununla birebir).
- `AFINA-KAYNAK/tasarim/klasik-anasayfa-c/GOREV.md` — metinler ve düzeltilmiş ifadeler; buradaki "Kesin kurallar" sitede de geçerli.
- Tasarım görsellerindeki logo ve ambalaj etiketleri yapay zekâ çizimidir: sitede **gerçek logo** (`BrandLogo` / `public/brand`) ve **gerçek tesis fotoğrafı** (`public/images/tesis/tesis-osmaniye-v4-*`) kullanılır.

## Kullanılacak araçlar
- Kullanıcı isteğiyle fiilen yükle: `ui-ux-pro-max` (§1 erişilebilirlik, §2 dokunma, §3 performans, §5 düzen), `frontend-design`, `better-layout`, `better-typography`, `better-accessibility`, `responsiveness-check`.
- ECC skill: `frontend-patterns`, `tdd-workflow`, `nextjs-turbopack`.
- 21st MCP: yalnız gerekirse (ör. erişilebilir mobil menü), C görünümüne birebir uyarlanarak.
- **Codex alt ajanları (multi_agent):** fotoğraf üretimi, bölüm bileşenleri ve test güncellemesi gibi bağımsız işleri alt ajanlara paralel ver; birleştirmeyi ve son kontrolü sen yap.
- Fotoğraflar YALNIZ yerleşik görsel üretim aracıyla; ücretli API yok.

## Sayfa yapısı (yukarıdan aşağı)
1. **Üst menü (sabit, C):** koyu orman yeşili şerit; solda gerçek logo (açık sürüm), ortada Ana Sayfa (`/`), Hakkımızda (`/#hakkimizda`), Üretim Tesisimiz (`/#tesisimiz`), Ürünler (`/#urunler`), Toptan Satış (`/#toptan`), Bayilik (`/bayilik`), İletişim (`/#iletisim`); etkin madde altında ince altın çizgi; sağda altın çerçeveli "Online Mağaza" (Tüm ürünler / mağaza panelini açar), sepet (adet rozetiyle, mevcut sepet çekmecesi) ve hesap (`/hesabim`). Telefonda: logo + sepet + menü düğmesi; açılan panelde aynı bağlantılar, Online Mağaza ve Hesabım. Sabit menü bölüm başlıklarını örtmez (`scroll-margin-top`).
2. **Hero (`#baslangic`):** tam genişlik fotoğraf (ahşap kasede parlak siyah zeytin, arkada zeytinyağı şişesi, yanda yeşil zeytin ve dal, arkada zeytinlik; masaüstü yatay ve telefon dikey kırpım). Solda "KENDİ ÜRETİMİMİZ", H1 "Doğal, Lezzetli, Güvenilir Zeytin", paragraf "Osmaniye Düziçi'nin Ellek zeytinliklerinden gelen zeytinleri kendi tesisimizde hazırlayıp sofranıza ulaştırıyoruz.", düğmeler "Ürünlerimizi İncele" (`#urunler`) ve "Toptan Teklif Al" (`#toptan`). Yazı arkasında yalnız yerel koyuluk; kontrast ≥ 4.5:1. Kase üstündeki "AFİNA ZEYTİN" kazıması kusursuz yazılamıyorsa düz kase kullan; "®" asla yok.
3. **Güven şeridi:** "Kendi Üretim Tesisimiz ile Kontrollü Üretim", "Geleneksel Usul Doğal Kırma", "Online Sipariş ve Toptan Satış", "Otel, Restoran, Market ve Bayilik İş Birlikleri"; ince altın çizgi simgeler (Lucide), aralarında ince dikey çizgi; telefonda 2×2.
4. **Tesis (`#tesisimiz`):** solda gerçek tesis fotoğrafı (plaka okunmaz), sağda "ÜRETİCİ GÜCÜMÜZ", "Modern Üretim Tesisimiz", "Zeytin ayıklama, salamura, paketleme ve depolama süreçlerini Osmaniye Düziçi'ndeki kendi tesisimizde gerçekleştiriyoruz.", "Tesisimizi Keşfedin" (`#hakkimizda`); köşede silik çizgisel zeytin dalı.
5. **Ürün grupları (`#urunler`):** ortalı "ÜRÜN GRUPLARIMIZ" ve iki yanında ince altın çizgi; 4 fotoğraflı kart (kasede siyah zeytin / yeşil zeytin / kırma zeytin / zeytinyağı) altta açık şerit + yuvarlak ok. Kartlar sırasıyla Salamura Siyah, Salamura Yeşil, Doğal Kırma Yeşil, Natürel Sızma Zeytinyağı ailesinin mevcut ürün detayını açar (sepete ekle / teklife ekle aynı). Altında "Tüm ürünleri gör" ile mevcut mağaza paneli.
6. **İş kartları:** zeytinlik zemini üstünde iki koyu kart: "Toptan Satış" — "Otel, restoran, market ve toplu tüketim için koli bazında teklif." — "Toptan Teklif Al" (`#toptan`); "Bayimiz Olun" — "AFİNA ZEYTİN'i bölgenizde birlikte büyütelim; bayilik için bize yazın." — "Bayilik Başvurusu" (`/bayilik`). Fotoğraflar: depoda koliler ve forklift (başka marka yazısı yok), zeytin dalı.
7. **Hakkımızda (`#hakkimizda`):** mevcut kurumsal içerikten (AFİNA Şirketler Topluluğu güvencesi, Osmaniye/Düziçi/Ellek, doğal kırma yöntemi, kendi tesis) kısa, C diliyle sade bölüm. Yeni iddia yok.
8. **Toptan teklif (`#toptan`):** mevcut teklif akışı (fotoğraflı çoklu ürün seçimi, adet, mailto taslağı) davranışı aynen; görünümü C diline uyar.
9. **SSS:** mevcut 5 soru/cevap ve FAQPage verisi aynen; C diline uygun açılır-kapanır.
10. **İletişim (`#iletisim`):** mevcut adres/iletişim içeriği; C diliyle.
11. **Alt bilgi (C):** koyu yeşil; logo, "Ellek, Düziçi / Osmaniye", menü bağlantıları, "AFİNA Şirketler Topluluğu markasıdır.", mevcut yasal bağlantılar (KVKK, mesafeli satış, iade) ve ödeme logoları.

## Kaldırılacaklar
- Ana sayfadaki tüm kaydırmaya bağlı yapı: `HarvestJourney` sahneleri (sticky/pin, 480–600svh), kaydırmayla ilerleyen film, yatay ürün rayı, sabitlenen işletme sahnesi, kaydırma kaçırma (Lenis vb. varsa ana sayfada). Native kaydırma.
- Ana sayfada kullanılmayan bileşen/CSS/test dosyaları (yalnız başka sayfa kullanmıyorsa).
- Eski çapalar kırılmasın: `#kurumsal` → `#hakkimizda`, `#teklif` ve `#toptan-iletisim` → `#toptan`, `#uretim-yolculugu` → `#tesisimiz` (boş çapa ya da yönlendirme).

## Hareket
Yalnız sayfa açılışında hero metninde tek, kısa giriş; `prefers-reduced-motion` açıkken hiç hareket yok. Kart başına giriş animasyonu, kaydırmaya bağlı efekt yok.

## Görseller
- Yeni fotoğraf kaynakları `AFINA-KAYNAK/tasarim/klasik-anasayfa-c/fotograflar/` altına; mevcut sharp boru hattı mantığıyla `public/images/klasik/` altına AVIF/WebP genişlik türevleri.
- Hero LCP: öncelikli yükleme, doğru `sizes`; ekran altındaki görseller gecikmeli; tüm görsellerde boyut ayrılmış (CLS < 0.1).
- Fotoğraflarda yazı/marka/logo uydurma yok (kase kazıması kuralı yukarıda).

## Kabul kriterleri
- [ ] Unit: ana sayfa bölüm sırası ve id'ler (`baslangic`, `tesisimiz`, `urunler`, `hakkimizda`, `toptan`, `iletisim`), tek H1, menüde 7 bağlantı + Online Mağaza + sepet + hesap.
- [ ] Unit: ana sayfada sticky/pinned kaydırma zaman çizgisi ve kaydırmaya bağlı video yok; `HarvestJourney` ana sayfada render edilmiyor.
- [ ] Unit: ürün grup kartları doğru ailenin detayını açar; sepete ekleme ve teklife ekleme akışları mevcut testlerle yeşil.
- [ ] Unit: metinler GOREV.md'deki düzeltilmiş halleriyle; "Ege", "Türkiye geneli", "uluslararası", "standart", "%100", "organik", "®" sayfada yok.
- [ ] Eski çapalar yeni bölümlere ulaşır.
- [ ] `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`, `npm run check:assets` yeşil.
- [ ] Tarayıcı doğrulaması Claude'da (390 / 768 / 1440; taşma, odak, dokunma, LCP/CLS).

## Yapılmaması gerekenler
- Sepet, ödeme (PayTR), üyelik, admin, API, DB koduna dokunma (yalnız görünüm/bağlantı).
- Production yayını yapma (Vercel REST dahil). Commit + testler yeşilse `origin main` push (CI çalışır, yayın yapmaz).
- `docs/` değiştirme (yalnız Coder Notu/Durum).

## Durum: BEKLİYOR
