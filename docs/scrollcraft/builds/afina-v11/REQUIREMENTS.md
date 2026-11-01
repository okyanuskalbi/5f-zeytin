# Dokuz kaynak: uygulama ve kabul eşlemesi

Özgün dosyalar değiştirilmedi. Exact yol, byte ve SHA256: [SOURCES.json](SOURCES.json).
Dört PDF metni yalnız .cache/task-163 altında inceleme için çıkarıldı.

| Kullanıcı kaynağı | Uygulanan şart ve somut karşılığı | Kabul |
|---|---|---|
| profesyonel-web-sitesi-skill-yeni-nesil.md | Konuya özgü renk/tipografi, iki font, 8px ritim, değişen bölüm düzeni; gerçek 21st kaynakları ve özel tokenlar | Kaynak/token/SSR kontrolü geçti; gerçek render bekliyor |
| scroll-hero-video-kiti-yeni-nesil.md | İleri/geri scroll → film zamanı; doğrusal hedef, sessiz/inline kısa GOP; poster ve sade mod; bağımsız dal/ambalaj | Seek/geri dönüş/cleanup/policy unit ve artifact gate geçti; scrub/flick/ara kare kabulü bekliyor |
| sinematik-siteler-yeni-nesil.md | Anlam taşıyan sahne hareketi, Fraunces/Inter, girişleri bir kez çalıştırma, telefona özgü düzen, boş yükleme ekranı olmaması | SSR/reduced testleri geçti; piksel/kontrast/gerçek telefon bekliyor |
| ui-ux-pro-max.md | Kullanıcının exact `uipro init --ai codex` komutu; proje yerel rehber, Next ve storytelling aramaları | Task162 kurulum/arama kanıtları; renk/font önerisi gerçek markaya uyarlandı |
| sinematik-siteler.pdf | Marka fikri, sinematik sahne ve gerçek alışverişe bağlanan net sonraki eylem | Üç sahneli açılış; her zaman erişilen ürün/kurumsal yol; görsel kabul bekliyor |
| web-site-yetenegi-kiti.pdf | Özgün kimlik, gerçek marka görselleri, bölüm hikâyesi, mobil ve etkileşim kalitesi | Gerçek ambalaj/tesis, üç üretim adımı, SKU/segment→teklif ve sepet; etkileşim unit var, tarayıcı kabulü bekliyor |
| 9-mayis-10-kiti.pdf | Bileşen kaynağı, tutarlı stil, anlamlı motion ve kapsamlı son kontrol | 21st provenansı, UIPro ve React Bits lisansı, ortak Motion runtime; kontrol sonuçları VERIFICATION içinde |
| AEO_GEO_Rehberi_Onur_Kocak.pdf | Doğrudan cevap, görünür bilgi/şema tutarlılığı, llms, feed, sitemap/robots/canonical/OG | Ortak5FAQ, Organization/Place/WebPage/WebSite; llms/full/feed aynı kamuya açık veri; fiyat/Offer uydurulmaz. Test/build çıktı kontrolü geçti; canlı bot/index/GSC kabulü yok |
| 10k-websites-skill.zip | Önce marka/3konsept/beat paketi; gerçek scrub, Blob, tek seek, en son hedef, hata reset, dinlenen RAF, statik kapılar, son durum ve tam site | DESIGN-PACKAGE ve runtime uygulanmış; teknik testler geçti. Bağımsız inceleme yapılıyor. Görsel/gerçek cihaz/yayın kapısı bekliyor |

## Açık tercihlerin ve çelişkilerin uyarlaması

- Kullanıcı Codex, Framer Motion, UIPro, React Bits ve bütün kaynakları açıkça
  birlikte istedi. ZIP'in Claude/vanilla/Higgsfield/Hostinger varsayılanları bu
  isteğin veya mevcut Next.js ticaret mimarisinin yerine geçmez. Yeni hesap,
  MCP, sağlayıcı, global ayar veya hosting kurulmadı.
- Kullanıcı bütün senaryoyu devretti. Üç konsept ve seçimin gerekçesi somut
  pakette; yapılmamış marka görüşmesi veya verilmemiş medya onayı uydurulmadı.
- Mevcut kabul edilmiş A→B kullanılır. Yeni paid üretim yapılmadığı için yeni
  medya storyboard/harcama kapısı tetiklenmez. Diğer Flow adayları onaysızdır.
- Autoplay-loop örneği yerine kullanıcının scroll isteği ve ZIP standardına
  uygun ileri/geri scrub seçildi. Eski Task161 loop artifact'i tarihçedir.
- İki font ve anlamlı/sınırlı hareket isteyen kullanıcı MD'leri; ZIP'in üçüncü
  mono font, sürekli arka plan ve her bölümde sonsuz döngü örneklerinden önce
  gelir. Konuya özgü yeşil/taş gerçek ambalaj ve görüntüden gelir; genel neon
  veya krem/terracotta şablonu değildir. İmza, zeytinlik→gerçek AFİNA tenekesi.
- Tasarlanmış etkileşim: mevcut ambalajı ve işletme türünü seçme, aynı bağlamı
  gerçek talep özetinde görme. Oyunlaştırılmış basılı tutma kapısı eklenmez.
- Yerel fontlar için dış sağlayıcı preconnect'i gerekmez. Gerçek domain ve
  OG zaten vardır. JSON-LD ürün/yorum/sağlık/sertifika iddiası eklemez.
- AEO dosyaları Google görünürlük garantisi değildir. Google AI özel dosya
  istemez; görünür, erişilebilir ve kaynaklı metin esastır. Bot erişimi,
  indeksleme, Search Console ve analitik ayrı canlı doğrulama konularıdır.

## Birincil araştırma

Alıcı dili için Reddit'teki [zeytinyağı alım deneyimleri](https://www.reddit.com/r/Turkey/comments/1892bnl/zeytinya%C4%9F%C4%B1_nereden_nas%C4%B1l_al%C4%B1n%C4%B1r_tecr%C3%BCbelerinizi/)
ve [toplu alım sorusu](https://www.reddit.com/r/istanbul/comments/16aia9a/uygun_fiyatl%C4%B1_nat%C3%BCrel_s%C4%B1zma_zeytinya%C4%9F%C4%B1n%C4%B1_nerede/)
incelendi: köken, ambalaj ve fiyat bilgisini kolay bulma ihtiyacı, AFİNA
müşteri yorumu gibi aktarılmadan kurguyu besledi.

Teknik iddialar: [Google AI features](https://developers.google.com/search/docs/appearance/ai-features),
[Google AI optimization](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide),
[OpenAI crawler ayrımı](https://developers.openai.com/api/docs/bots),
[FAQ rich result kapsamı](https://developers.google.com/search/blog/2023/08/howto-faq-changes).
Google llms.txt kullanımı veya ticari site için FAQ rich-result garantisi verilmez.
