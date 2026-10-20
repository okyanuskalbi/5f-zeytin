# ZEYTİN — Yeniden kurgu tasarım yönü (DESIGN.md)

Tarih: 2026-10-20. Kullanıcı: "ZEYTİN PROJESİNİDE VERDİĞİM PDFLERE GÖRE BAŞTAN KURGULA VE MDLERİNİ OLUŞTUR".
Kaynaklar: `design-taste-frontend` föyü (`.taste-skill/direction.json`, yön **The page is the object**, `--keep palette,type`; `about` → `about-photo-tile-facts`, gerekçe: kurucu bilgisi yok, resmi metin değiştirilmez) + dört kit (`~/PROJELER/AFINA-KAYNAK/kitler/ozet.md`: sinematik hero, scroll'a bağlı video, AI-slop'tan profesyonele, AEO+GEO) + admin referansı (`docs/referans/admin-stil.md`). Eski token kaydı: `docs/DESIGN-token-kaydi.md`. Föyü basmak: `node ~/.claude/skills/design-taste-frontend/scripts/draw.mjs --show` (repo kökünden). Ek skill: `profesyonel-web-sitesi` (marka → hiyerarşi → mikro detay; ekran görüntüsü kanıtı).

## KORUNANLAR
Z-A fontları (Fraunces + Figtree), renkler (zeytin yeşili `#243A29`, fildişi `#F5F1E7`, altın `#D4B483`), onaylı logolar, onaylı zeytinlik görseli + zeytin videosu kare dizisi (086), `ScrollFrameSequence` (083), sepet altyapısı (035–039), PayTR önizleme (001b), resmi metinler (`docs/referans/icerik.md`), iddia kuralı (%100/organik/sertifika yok), ≤ 6 ürün.

## Fikir
> Bu sayfada **Afina Zeytin'in kendi teneke etiketi** (yeşil kenar bantları, beyaz orta alan, altın kurdele üzerinde ürün adı, "10 KG") → **sayfanın nesnesine** dönüşür: hero bir etiket kartıdır; ürünler yan yana dizilmiş etiket fişleridir; footer etiketin arka yüzüdür.

Rakip testi: başka zeytinciler kendi etiketiyle yapabilir ama bu etiket (referans: `~/PROJELER/AFINA-KAYNAK/referans/zeytin-teneke-instagram.png`) ve Osmaniye/Düziçi tesisi yalnız Afina'nın.

**Canlı öğe (tek):** Hero etiket kartında ürün ve boy seçimi (ör. Kırma Yeşil · 1 kg / 5 kg / 10 kg teneke) → etiketteki ad, gramaj ve fiyat "yeniden basılır"; "Sepete ekle" aynı kartta. Scroll edince kart küçülüp sol alt köşede **etiket koçanı** olur ve **sepet özeti** gösterir (ürün sayısı · toplam · "Sepete git"). Script yoksa: düz ürün listesi + sepet linki.

## Sayfa argümanı (bölümler = iddialar)
1. **Hero — Kart, loş oda üstünde:** zeytinlik video karesi (kararmış, `brightness(0.7)`) tam ekran; ortada etiket kartı (canlı öğe). İddia: kökü toprakta, yeri sofrada; Osmaniye üretim tesisi.
2. **Vitrin — Kenarda dizili etiket fişleri:** tam ekran fotoğraf/video önünde ≤ 6 ürün fişi (her biri farklı yükseklik, 2–3'ü 1–2° eğik): ad (Fraunces 600), gramaj, fiyat (tabular), stok, adet, Sepete ekle. Mobilde yatay kaydırılan sıra. İddia: az ama gerçek ürün.
3. **Tesisimiz — Geniş fotoğraf, renk karosu, bilgiler:** gerçek tesis fotoğrafı (`AFINA-KAYNAK/fabrika/afina-zeytin-tesis-osmaniye.png`, plaka YEREL olarak bulanıklaştırılır, dış yükleme yok; premium üretim 004/005 onaylanırsa değiştirilir) + Osmaniye ili SVG silüeti + Düziçi noktası; bilgiler: Ellek / Düziçi / Osmaniye · Faaliyet: sofralık zeytin, salamura, zeytinyağı · Kanal: perakende + toptan · Kuruluş: 2021 (vergi levhası işe başlama). İddia: kendi tesisimizde üretiyoruz.
4. **Topraktan sofraya — Sürüklenen anlar şeridi:** Hasat · Seçim · Kırma · Salamura · Dolum · Sofrada (her anda 1 satır başlık + 3 satır; süreç metinleri KULLANICI TEYİDİ gerektirir → teyit gelene kadar yalnız resmi belgeden türetilebilen genel ifadeler, iddia yok). Görseller: üretim görevi (Atlas, onaylı) gelene kadar onaylı kareler/tesis fotoğrafı kırpımları.
5. **SSS — Cevaplar okuma metni:** 087'deki **yalnız teyitli** sorular, iki kolon, akordeon yok.
6. **İletişim/Toptan — Ziyaret kartı fotoğraf üstünde:** tesis fotoğrafı tam ekran + kart: "Toptan satış" başlığı, adres (Şehit Ali Gökçe Mah. Şehit Ömer Halis Demir Sk. No:35, Ellek, Düziçi/Osmaniye), telefon/e-posta (TEYİT BEKLİYOR — yer tutucu görünmez, alan gizli), "Toptan Satış İçin İletişime Geçin" butonu → toptan form (081/082).
7. **Footer — Etiketin arka yüzü:** fırfırlı üst kenar, sol: imza cümlesi + kısa mesaj; sağ: adres/linkler + pul (tesis fotoğrafı minik); en altta baskı satırı: satıcı unvanı + VKN (SIRKET.md'deki kamuya açık alanlar) + yasal linkler (KVKK, mesafeli satış, iade).

## Renk (iki-üç renkli baskı işi)
Zemin fildişi `#F5F1E7` · mürekkep zeytin yeşili `#243A29` (ana metin), koyu `#141A15` (gövde) · etiket kenar bandı yeşili `#2F7A3B` (referans etiketteki canlı yeşil; yalnız etiket bantlarında) · altın `#D4B483` yalnız kurdele/vurgu ve birincil eylem değil (birincil eylem zeytin yeşili dolu düğme). Gradyan yok (etiket kurdelesi düz altın).

## Tipografi (Z-A)
Fraunces 600 (SOFT 50): etiket adı, bölüm başlıkları, ürün adları. Figtree 400/600: gövde 16–18px, fiyat tabular-nums, etiket detayları. 5 boyut tavanı; 13px altı yok; başlıklar ≤ 2 satır her genişlikte.

## Ev kuralları (inspect.mjs ölçer) + kit ilkeleri
Eyebrow yok ("OSMANİYE / ÜRETİM TESİSİ" küçük üst etiketi kalkar → bilgi başlıkta/cümlede), 01/02 yok, hairline/çerçeveli kutu yok (form/tablo hariç), gradyan yok, durağan gölge yok, glass yok, ikonlu kart yok, emoji yok, ≤ 2 font, "görsel hazırlanıyor" yer tutucu kutuları yok (görsel yoksa bölüm tipografiyle tamamlanır). Kit (AI-slop): marka kimliği → hiyerarşi → mikro detay sırası, her bölüm ekran görüntüsüyle kanıtlanır. Kit (sinematik): video <5 MB, poster, `muted playsinline`, reduced-motion'da poster, mobilde küçük kaynak.

## Hareket
İmza hareketi **Pinned story:** etiket kartı sticky; scroll'da küçülerek sol alta koçan olur (transform: scale + translate), ürün fişleri önünden geçer. Ayrıca: her bölümde başlık → metin → görsel girişi (60–90 ms stagger), tüm kontrollerde hover/press/focus, video kare dizisi + marquee yok (sakin). `prefers-reduced-motion`: kart statik, koçan yok (sepet header'da).

## Diğer sayfalar
Sepet, ödeme (PayTR iframe), hesap, sipariş takip, yasal sayfalar aynı etiket dili: kağıt panel + fildişi zemin, tek buton biçimi (kare köşe). Admin: `docs/referans/admin-stil.md` (ayrı, sade panel dili).

## Mobil (zorunlu)
iPhone 14/SE (WebKit), Pixel 7/Galaxy S20 (Chromium), yatay mod. Claude simülasyon bulguları (20 Eki): hero başlığı ilk ekranın altında kesiliyor; yer tutucu kutular uzun boş alanlar yaratıyor; ürün kartları çok uzun; footer linkleri tekrar. Yeni düzende: hero kartı 70svh, başlık iki satır 9vw; fişler yatay kaydırma (72vw genişlik); sabit alt koçan dokunma hedefi ≥ 44px ve iPhone güvenli alanı.

## Kapı
Her görev: `node ~/.claude/skills/design-taste-frontend/scripts/lint.mjs app components` + production'da `inspect.mjs http://127.0.0.1:<port>` FAIL 0; ekran görüntüleri 1440/768/390.

## İç sayfa denetim istisnası (Claude, 20 Eki)
Sepet, ödeme önizleme, hesap, sipariş takip, yasal sayfalar ve 404 okuma/işlem sayfalarıdır: `inspect.mjs` için yalnız `--allow few-pictures,focal-point,still-page` geçerlidir (landing yoğunluk kuralları). Diğer tüm kurallar (başlık satırı, kontrast, taşma, odak görünürlüğü, tipografi, ev kuralları) iç sayfalarda da FAIL 0 olmalıdır. Landing (`/`) için istisna YOK.
