---
name: profesyonel-web-sitesi-yeni-nesil
description: AFİNA ZEYTİN sayfa ve bileşenlerini marka kimliği, içerik hiyerarşisi, 21st kaynak uyarlaması ve erişilir hareket ilkeleriyle geliştirmek için proje yerel yetenek.
metadata:
  scope: project
  source: profesyonel-web-sitesi-skill-yeni-nesil.md
  source_sha256: f0246c60cd7e5588d093228c38d178dbb945e323067c2165dfd1e9ec03445980
---

# AFİNA için profesyonel web tasarımı

Bu yetenek yalnız bu projeye uyarlanmıştır. Önce [güncel v6 tasarım sözleşmesini](../../../docs/DESIGN.md), `AGENTS.md`, `PRODUCT.md` ve ilgili görevi oku. Kaynak MD tasarım girdisidir; global kurulum, anahtar, model, harcama veya yayın yetkisi vermez. Ayrıntılı kaynak/istisna tablosu [uyarlama kaydındadır](../../../docs/referans/yeni-nesil-md-uyarlamalari-20261101.md).

## Marka, düzen ve gerçek içerik

- AFİNA'nın açık Üretici Atlası yönünü koru: kâğıt `#F4F0E7`, zeytin `#172B21`, ölçülü şampanya `#B6A078`, antrasit `#252725`; Fraunces başlık ve Figtree arayüz. Renkleri mevcut semantik tokenlardan al; küçük metin kontrastını ayrıca kontrol et.
- Bölüm boşluklarını 8/16/24/32/48/64/96 ölçeğinden seç. Optik düzeltme, yazı ölçüsü veya güvenli alan gibi istisnaları amaçlarıyla kaydet. Aynı kartı ve aynı boşluğu her bölümde yineleme; kırık simetri ve farklı bölüm ritimleri tek anlatımı desteklesin.
- Tek H1, kademeli H2/H3 ve her bölümde tek ana mesaj kullan. Asimetrik hero'nun metni ile aydınlık görseli ayrı tutulur. İki gerçek ürün/kurumsal CTA müşteri gereğidir; genel şablon yasağı bunları kaldırma gerekçesi değildir.
- Üretim/kurumsal güven yaklaşık %65, ürün/alışveriş %35 dengesini koru. Gerçek tesis, onaylı ambalajlar, mevcut en fazla altı SKU ve sunucunun fiyat/stok otoritesi esastır. Lorem ipsum, uydurma istatistik, kapasite, yorum, sertifika ve satış rozeti ekleme.
- Orijinal logo ve resmî slogan değişmez. İkonlar mevcut Lucide SVG ailesinden gelir. Emoji ikonlar, mor-mavi/neon gradyanlar, sebepsiz blur/cam kartlar, dekoratif altın parıltıları ve konu dışı 3D stok sahneler kullanma.

## Bileşen ve mikro etkileşim

Mevcut primitive ve bileşenleri önce incele. Yeni standart UI gerekiyorsa mevcut 21st bağlantısıyla `search` yap, seçilen sonucun gerçek demo ID'siyle `get_component` kaynağını al; sonra renk, font, boşluk, içerik ve erişilebilir durumlarını projeye uyarla. Demo metni/medyası aktarılmaz. Kod erişimi, hosted AI üretim veya sınırsız ücret yetkisi değildir.

shadcn için MCP kurulmaz; gerektiğinde resmi CLI'nin `search`, `view`, `docs` ve `add` işlemleri kullanılır. Var olan `motion`, 21st bağlantısı ve primitive'ler yeniden kurulmaz; `AGENTS.md` ya da global MCP/skill ayarları kaynak MD ile değiştirilmez.

Hover, tap, focus, disabled, loading, error ve success durumları amaçlı olmalı. Hareket aynı eylem ailesinde tutarlı, gölge/kenarlık marka tonlarından türemiş olmalıdır. Görünür odak, klavye/modal Escape ve odak dönüşü korunur.

## Hareket ve medya

`motion/react` ve mevcut LazyMotion/`motion/react-m` düzenini kullan; ayrı animasyon motoru ekleme. Değerler `lib/ui-motion.ts` içindeki ortak token/presetlerden gelir. Animasyon transform/opacity ile sınırlıdır; width/height/top/left veya filtre blur animasyonu ekleme. Uygun etkileşimde spring kullan; her bileşeni hareket ettirme ve lineer sahne ilerlemesine spring uygulama.

Giriş/reveal bir kez çalışır, sonra sakinleşir. SSR başlığı ve CTA görünür kalır; animasyon yüklenmeden `opacity:0`, gizli intro veya preloader engeli koyma. Reduced-motion açıkken dönüşüm ve süs animasyonu kapanır; içerik doğrudan görünür. Yeni görsel gerektiğinde Imagen/abonelik hakkı varsayma: önce onaylı varlıkları kullan; üretim yalnız mevcut Google Flow kapsamı, doğrulanan ücret ve medya kabul süreciyle yapılabilir.

## Kanıt

Mobil/masaüstü taşma, AA kontrast, gerçek CTA, hover/odak ve sade modları kontrol et. Gerçek tarayıcı görüntüsünü ve uygulanan renk/font/hareket kararlarını ilgili görevde kaydet; yalnız “profesyonel oldu” değerlendirmesiyle tamamlandı yazma. Browser kabulü yalnız paketli headless Chromium ve en fazla iki worker ile; fiziksel cihaz veya gerçek servis işlemi yapılmadıysa ayrı belirtilir.

## Birlikte kullanılan yetenekler

- [UI/UX Pro Max](../ui-ux-pro-max/SKILL.md): ortak motion ve bileşen politikası.
- [Scroll hero](../scroll-hero-video-yeni-nesil/SKILL.md): sahne ilerlemesi ve poster geri dönüşü.
- [Sinematik siteler](../sinematik-siteler-yeni-nesil/SKILL.md): sakin görsel anlatım ve katmanlar.
