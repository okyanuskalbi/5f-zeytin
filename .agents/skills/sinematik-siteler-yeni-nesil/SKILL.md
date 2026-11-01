---
name: sinematik-siteler-yeni-nesil
description: AFİNA'nın açık v6 düzeninde onaylı görsel, sakin kamera hareketi ve ölçülü Motion katmanlarıyla sinematik anlatım oluşturma yeteneği.
metadata:
  scope: project
  source: sinematik-siteler-yeni-nesil.md
  source_sha256: aa630ea06c077ae0c96444c602a7a46328300e4435e4adbc2c1a7a450a4ebac6
---

# AFİNA için sinematik anlatım

[Güncel v6 Üretici Atlası](../../../docs/DESIGN.md) uygulanır. Kullanıcı eski koyu, ortalanmış video hero ve cam menüyü reddetti. Bu kaynak MD'nin genel siyah zemin/glass/autoplay örneği o düzeni geri getirme yetkisi değildir. Orijinal logo, Fraunces/Figtree, açık kâğıt/zeytin/şampanya paleti ve kurumsal %65 / alışveriş %35 dengesi korunur.

## Üç katmanın proje karşılığı

1. **Görsel katman:** onaylı ve karartılmamış zeytinlik sahnesi kendi çerçevesinde; gerçek tesis fotoğrafı ve doğru ambalaj geometrisi anlatımı tamamlar. Sahne başlığın arkasına yayılmaz.
2. **İçerik katmanı:** resmî slogan, kısa üretici anlatımı ve iki gerçek CTA. Mobilde başlık/açıklama/eylem/görsel doğal sırayla gelir. E-posta toplama pill'i veya servis karşılığı olmayan form eklenmez.
3. **Hareket katmanı:** dikkati ve mekânsal sürekliliği destekleyen küçük giriş, hover/tap ve kaydırma ilişkisi. Anlamsız sürekli oynayan süs, büyük parallax, blur başlık ve başlığı geciktiren sekans yoktur.

## Sakin sahne ve üretim

Yavaş dolly/parallax, kararlı kompozisyon, ani kesme ve kamera sarsıntısından kaçınma ilkeleri uygulanabilir. Ancak kaynaktaki laptop/CRT, çiçek yaprağı, neon sıvı ışık ve 3D obje promptları AFİNA'nın gerçek tesisi veya ürün kanıtı yerine konmaz. Yeni bir loop ayrıca istenirse ilk/son kare sürekliliği kontrol edilir; mevcut farklı A→B uçları “aynı kare” yapmak için değiştirilmez.

Önce kabul edilmiş varlıklar ve provenans kullanılır. Google Flow/Veo ya da model seçimi gerçek arayüzde doğrulanır; Imagen'in Codex aboneliğine dahil olduğu, üretimin ücretsiz olduğu veya önerilen sürenin modelde bulunduğu varsayılmaz. Yeni video/model/tekrar mevcut kullanıcı kapsamını ve kredi sınırını aşamaz. Son kayıtlı Google doğrulama engeli yeni çıktı değildir. Yeni adaylar kabul edilmeden public/runtime'a alınmaz.

MD'deki Omni Chrome Use, mevcut oturumlu Flow yüzeyini tarayıcı otomasyonuyla kullanma yaklaşımıdır; ayrı eklenti varsayılmaz ve Omni 1.1 Flash model adıyla karıştırılmaz. Mevcut CUA/browser erişimi kullanılabilir; güvenlik veya CAPTCHA atlanmaz.

## Hareket karakteri

- `motion/react` ve mevcut LazyMotion yapısı kullanılır; yeni bağımlılık/animasyon motoru kurulmaz. Token/presetler `lib/ui-motion.ts` içinden gelir.
- Transform/opacity ile sınırlı küçük hareketler uygundur. Başlık/nav için `filter: blur(...)` animasyonu, layout ölçülerinin animasyonu ve SSR'da gizli başlangıç kullanılmaz.
- Tek giriş/reveal bir kez çalışır, sonra sakinleşir. Hover/tap hedefleri okunur ve erişilir kalır. Spring uygun etkileşime uygulanır; lineer sahne/kare zamanına uygulanmaz. Damping sayısı tek başına “lüks” veya kalite kanıtı değildir; gerçek etkileşim gözlenir.
- Reduced-motion ve veri tasarrufunda dönüşüm/scroll oynatma kapanır, statik poster kalır. Açılış otomatik video loop'una dönmez; içerik ve gerçek eylemler her zaman görünürdür.

## Bileşen ve kanıt

Standart bölüm/control ihtiyacında mevcut primitive'leri incele, mevcut 21st bağlantısında ara ve gerçek kaynağı marka tokenlarına uyarla. Kaynaktaki cam nav/input araması yerine v6'ya uygun sade editoryal örnekler seçilir; Instrument Serif veya ikinci font servisi eklenmez. shadcn gerektiğinde resmi CLI kullanılır; global MCP/skill/anahtar yapılandırması değiştirilmez.

Sahne netliği, okunurluk, ilk kare/poster eşliği, normal/ters kaydırma, yavaş bağlantı ve reduced-motion görüntüsü gerçek browser kanıtıyla değerlendirilir. Video sıkıştırma örnekleri mevcut canvas bütçesi yerine konmaz. Paketli headless Chromium, en fazla iki worker ve düzgün kapanış; gerçek telefon/Lighthouse yapılmadıysa yapılmış sayılmaz.

## Birlikte kullanılan yetenekler

- [Profesyonel web](../profesyonel-web-sitesi-yeni-nesil/SKILL.md)
- [Scroll hero](../scroll-hero-video-yeni-nesil/SKILL.md)
- [UI/UX Pro Max](../ui-ux-pro-max/SKILL.md)

Kaynak/istisna tablosu: [yeni nesil MD uyarlamaları](../../../docs/referans/yeni-nesil-md-uyarlamalari-20261101.md).
