import { Product } from '../types';

export const PRODUCTS: Product[] = [
  {
    id: '5f-erken-hasat-500ml',
    name: '5F Erken Hasat Soğuk Sıkım Natürel Sızma',
    subtitle: 'Koyu renk UV korumalı cam şişede, yüksek polifenollü özel seri',
    category: 'oil',
    price: 490,
    originalPrice: 560,
    rating: 4.9,
    reviewCount: 148,
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80',
    badge: 'Çok Satan',
    volumeOrWeight: '500 ml',
    acidity: '0.2 Asit (Dizyem)',
    polyphenol: '480+ mg/kg',
    harvestYear: '2025/2026',
    pressType: '24°C Kontrollü Soğuk Sıkım',
    oliveType: 'Edremit Yağlık',
    description: 'Ekim ayının ilk iki haftasında henüz yeşilken elle toplanan zeytinlerimiz, en geç 4 saat içinde oksijensiz ortamda 24°C altında sıkılarak üretilmiştir. Çağla badem, taze çimen ve enginar aroması yoğundur.',
    tastingNotes: ['Yeşil Çağla Badem', 'Taze Çimen', 'Enginar Yaprağı', 'Hafif Boğaz Yakıcılığı'],
    usageRecommendation: 'Kahvaltılarda çiğ içim, taze salatalar, deniz ürünleri ve mezelere son dokunuş olarak.',
    inStock: true,
    featured: true
  },
  {
    id: '5f-filtresiz-butik-750ml',
    name: '5F Filtresiz Taş Baskı Butik Zeytinyağı',
    subtitle: 'Meyvemsi partikülleri korunmuş, taze sıkım yoğun kıvam',
    category: 'oil',
    price: 640,
    originalPrice: 720,
    rating: 5.0,
    reviewCount: 92,
    image: 'https://images.unsplash.com/photo-1541256942802-7b2996a84f97?auto=format&fit=crop&w=800&q=80',
    badge: 'Özel Rezerv',
    volumeOrWeight: '750 ml',
    acidity: '0.3 Asit (Dizyem)',
    polyphenol: '520+ mg/kg',
    harvestYear: '2025/2026',
    pressType: 'Geleneksel Soğuk Pres Taş Baskı',
    oliveType: 'Ayvalık Yerli',
    description: 'Filtre edilmeden tortusuyla şişelenen bu nadir seri, zeytinin tüm besleyici mikro öğelerini ve canlı klorofil pigmentlerini muhafaza eder. Kıvamı kadifemsi, kokusu bahçe tazeliğindedir.',
    tastingNotes: ['Yeşil Elma', 'Roka Notaları', 'Zeytin Çiçeği', 'Doygun Kadife Kıvam'],
    usageRecommendation: 'Kızarmış ekmek üzerine dökerek, sıcak çorba üzerine gezdirerek veya gurme peynir tabaklarıyla.',
    inStock: true,
    featured: true
  },
  {
    id: '5f-naturel-teneke-5lt',
    name: '5F Soğuk Sıkım Natürel Sızma (5 Litre Teneke)',
    subtitle: 'Aile boyu ekonomik, sofralık ve yemeklik birinci sınıf lezzet',
    category: 'oil',
    price: 2450,
    originalPrice: 2850,
    rating: 4.8,
    reviewCount: 310,
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
    badge: 'Ekonomik Boy',
    volumeOrWeight: '5 Litre',
    acidity: '0.5 Asit (Dizyem)',
    polyphenol: '320+ mg/kg',
    harvestYear: '2025/2026',
    pressType: '26°C Sürekli Sistem Soğuk Sıkım',
    oliveType: 'Körfez Karışımı (Edremit & Ayvalık)',
    description: 'Evdeki her öğün için ideal, hem sıcak zeytinyağlı tencere yemeklerinde hem de fırın lezzetlerinde yanma noktası yüksek, hafif ve sindirimi son derece kolay doğal sızma zeytinyağımız.',
    tastingNotes: ['Hafif Meyvemsi', 'Dengeli Gövde', 'Yumuşak Bitiş'],
    usageRecommendation: 'Tüm zeytinyağlı yemekler, fırın sebzeleri, marinasyon ve günlük mutfak kullanımı.',
    inStock: true,
    featured: true
  },
  {
    id: '5f-gemlik-siyah-zeytin-1kg',
    name: '5F Doğal Fermente Gemlik Çevirme Siyah Zeytin',
    subtitle: 'İlaçsız, kostiksiz, yalnızca kaya tuzu ile havuzda olgunlaşmış',
    category: 'olive',
    price: 290,
    originalPrice: 340,
    rating: 4.9,
    reviewCount: 204,
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    badge: 'Geleneksel',
    volumeOrWeight: '1000 gr',
    harvestYear: '2025 Hasadı',
    oliveType: 'Gemlik İnce Kabuklu',
    description: 'Kimyasal karartıcı veya hızlandırıcı kullanılmadan, geleneksel çevirme ve taş baskı yöntemiyle 6-8 ay boyunca kaya tuzunda kendi öz suyunda tatlandırılmış ince kabuklu, küçük çekirdekli siyah zeytin.',
    tastingNotes: ['Doğal Tuzluluk', 'Etli Doku', 'Çekirdekten Kolay Ayrılma'],
    usageRecommendation: 'Kahvaltılarda üzerine kekik, pul biber ve 5F sızma zeytinyağı gezdirilerek.',
    inStock: true,
    featured: true
  },
  {
    id: '5f-kirma-yesil-zeytin-1kg',
    name: '5F Taş Kırma Ayvalık Yeşil Zeytin',
    subtitle: 'Taze limon ve kaya tuzu salamurasında, çıtır diri kıvam',
    category: 'olive',
    price: 270,
    originalPrice: 310,
    rating: 4.8,
    reviewCount: 116,
    image: 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&w=800&q=80',
    badge: 'Yeni Mahsul',
    volumeOrWeight: '1000 gr',
    harvestYear: '2025 Hasadı',
    oliveType: 'Ayvalık Erken Yeşil',
    description: 'Ekim ayında zeytinler henüz dalında sert ve yeşilken tek tek elle seçilip meşe tokmakla kırılarak acısı kaynak suyuyla giderilmiştir. Çıtır dokusu ve taze meyve kokusuyla sofraların vazgeçilmezidir.',
    tastingNotes: ['Limon Ferahlığı', 'Çıtır Doku', 'Hafif Doğal Acılık'],
    usageRecommendation: 'Limon dilimleri, taze nane ve sarımsakla harmanlayarak meze olarak.',
    inStock: true,
    featured: false
  },
  {
    id: '5f-cizik-yesil-zeytin-1kg',
    name: '5F Çizik Ege Yeşil Zeytini',
    subtitle: 'Geleneksel üç çizikli, taze sıkılmış limonlu hafif salamura',
    category: 'olive',
    price: 280,
    rating: 4.7,
    reviewCount: 78,
    image: 'https://images.unsplash.com/photo-1589927986089-35812388d1f4?auto=format&fit=crop&w=800&q=80',
    volumeOrWeight: '1000 gr',
    harvestYear: '2025 Hasadı',
    oliveType: 'Edremit Çizik',
    description: 'Etli ve dolgun taneleri 3 yerinden özenle çizilerek doğal fermantasyona bırakılan leziz yeşil zeytin.',
    tastingNotes: ['Dengeli Ekşilik', 'Sert ve Dolgun'],
    usageRecommendation: 'Salatalara doğrayarak veya ceviz ve nar ekşisi ile meze yaparak.',
    inStock: true,
    featured: false
  },
  {
    id: '5f-zeytin-ezmesi-300g',
    name: '5F Taş Değirmen Çeşnili Siyah Zeytin Ezmesi',
    subtitle: 'Hakiki zeytinyağı, dağ kekiği ve cevizle zenginleştirilmiş püre',
    category: 'gourmet',
    price: 160,
    originalPrice: 190,
    rating: 4.9,
    reviewCount: 89,
    image: 'https://images.unsplash.com/photo-1599818816933-5c0a373b9e4a?auto=format&fit=crop&w=800&q=80',
    badge: 'Gurme Favori',
    volumeOrWeight: '300 gr',
    harvestYear: '2025',
    description: 'Ayıklanmış doğal fermente Gemlik zeytinlerinin taş değirmende pürüzsüzce çekilmesi ve içine Kaz Dağları kekiği, sarımsak ve sızma zeytinyağı ilave edilmesiyle hazırlanır.',
    tastingNotes: ['Yoğun Zeytin Aroması', 'Kekik & Sarımsak Esintisi'],
    usageRecommendation: 'Kızarmış ekmek üstüne, sandviçlere ve fırınlanmış bruschettalara sürmek için.',
    inStock: true,
    featured: true
  },
  {
    id: '5f-cesnili-yag-biberiye-sarimsak',
    name: '5F Biberiyeli & Sarımsaklı Gurme Zeytinyağı',
    subtitle: 'Doğal kurutulmuş baharatlarla masere edilmiş aromatik yağ',
    category: 'gourmet',
    price: 340,
    rating: 4.8,
    reviewCount: 63,
    image: 'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&w=800&q=80',
    volumeOrWeight: '250 ml',
    acidity: '0.3 Asit',
    harvestYear: '2025',
    description: 'Natürel sızma zeytinyağımıza köyümüzün taze biberiye dalları ve kurutulmuş yerli sarımsakları eklenerek karanlık ortamda demlenmiştir.',
    tastingNotes: ['Yoğun Biberiye', 'Kavruk Sarımsak Nüansı'],
    usageRecommendation: 'Et marinasyonlarında, pizza ve makarna soslarının üzerine doğrudan gezdirilerek.',
    inStock: true,
    featured: false
  },
  {
    id: '5f-dogal-zeytinyagli-sabun',
    name: '5F Geleneksel Saf Zeytinyağı Sabunu (3\'lü Paket)',
    subtitle: 'Soğuk süreçle üretilen, gliserini korunmuş el ve vücut sabunu',
    category: 'natural-soap',
    price: 180,
    originalPrice: 220,
    rating: 4.9,
    reviewCount: 174,
    image: 'https://images.unsplash.com/photo-1607006314592-349098fb49ea?auto=format&fit=crop&w=800&q=80',
    badge: '%100 Doğal',
    volumeOrWeight: '3 x 120 gr',
    harvestYear: '2025 Üretimi',
    description: 'Kimyasal köpürtücü, paraben ve yapay esans içermez. Çiftliğimizin saf zeytinyağları ile soğuk yöntemle hazırlanır, cildi kurutmadan derinlemesine nemlendirir.',
    tastingNotes: ['Doğal Zeytinyağı Kokusu', 'İpeksi Köpük'],
    usageRecommendation: 'Hassas ciltler, bebekler ve saç yıkama dahil tüm vücut için günlük kullanıma uygundur.',
    inStock: true,
    featured: false
  },
  {
    id: '5f-defne-zeytinyagi-sabun',
    name: '5F Hatay Usulü Defneli Zeytinyağı Sabunu',
    subtitle: 'Doğal yabani defne yağı ile kepeğe karşı etkili saç & banyo sabunu',
    category: 'natural-soap',
    price: 210,
    rating: 4.8,
    reviewCount: 95,
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
    volumeOrWeight: '3 x 130 gr',
    harvestYear: '2025 Üretimi',
    description: '%40 oranında hakiki yabani defne yağı ve %60 soğuk sıkım zeytinyağı harmanıyla yapılmıştır. Gözenekleri açar ve saç diplerini canlandırır.',
    tastingNotes: ['Ferahlatıcı Defne Özü'],
    usageRecommendation: 'Saç derisi bakımı, kepek önleme ve banyo keyfi.',
    inStock: true,
    featured: false
  }
];

export const PHILOSOPHY_ITEMS = [
  {
    letter: 'F',
    title: 'FİDAN',
    badge: '1. Adım',
    desc: 'Kaz Dağları ve Edremit Körfezi\'nin bin yıllık mikroklimasında yetişen yerli, aşılanmamış doğal zeytin ağaçlarımızdan miras fidanlar.'
  },
  {
    letter: 'F',
    title: 'FARK',
    badge: '2. Adım',
    desc: 'Asla 24°C sıcaklığın üzerine çıkmayan gerçek soğuk sıkım. Oksijensiz kapalı devre sistemle polifenol ve E vitamini kaybını sıfırlarız.'
  },
  {
    letter: 'F',
    title: 'FAYDA',
    badge: '3. Adım',
    desc: 'Düşük asit (0.2 - 0.4 dizyem) ve 450+ mg/kg polifenol değeriyle vücudun bağışıklık sistemini destekleyen doğal bir şifa kaynağı.'
  },
  {
    letter: 'F',
    title: 'FERAHLIK',
    badge: '4. Adım',
    desc: 'Erken hasat tazeliği; açtığınız anda odayı saran taze biçilmiş çimen, yeşil çağla ve enginar yaprağının canlandırıcı kokusu.'
  },
  {
    letter: 'F',
    title: 'FÜTÜVVET',
    badge: '5. Adım',
    desc: 'Toprağa, üreticiye ve tüketiciye saygı. Aracı olmadan, adil ticaret ve çiftlikten doğrudan evinize uzanan dürüst şeffaflık.'
  }
];

export const FAQS = [
  {
    q: 'Erken Hasat Soğuk Sıkım zeytinyağının farkı nedir?',
    a: 'Zeytinler henüz yeşilken (Ekim başında) elle toplanır. Bu dönemde zeytinin yağ verimi düşüktür ancak polifenol, antioksidan ve vitamin değerleri zirvededir. 24°C altında sıkılarak besin değerleri ve o nefis meyvemsi koku korunur.'
  },
  {
    q: 'Asit oranı (Dizyem) ne anlama gelir?',
    a: 'Dizyem, zeytinyağındaki serbest yağ asitliği oranını ifade eder. 0.8 asidin altı "Natürel Sızma" kabul edilir. 5F Zeytin erken hasat yağlarımızda asit oranı 0.2 - 0.4 dizyem bandında olup uluslararası en yüksek kalite standardındadır.'
  },
  {
    q: 'Gerçek zeytinyağı buzdolabında donar mı?',
    a: 'Evet, saf ve katkısız natürel sızma zeytinyağı içerisindeki doğal doymamış ve tekli doymamış yağ asitleri nedeniyle +4°C ile +6°C arasında kristalleşip donmaya başlar. Oda sıcaklığına alındığında kalitesi bozulmadan eski berrak haline geri döner.'
  },
  {
    q: 'Zeytinyağı nasıl saklanmalıdır?',
    a: 'Zeytinyağının üç büyük düşmanı vardır: Işık, ısı ve hava (oksijen). Bu nedenle yağlarımız koyu renkli UV korumalı cam şişelerde veya laklı tenekelerde sunulur. Serin, güneş almayan ve kapağı sıkıca kapalı bir ortamda saklayınız.'
  },
  {
    q: 'Siyah zeytinlerinizde kimyasal renklendirici veya kostik var mı?',
    a: 'Kesinlikle hayır. Gemlik ve Ayvalık zeytinlerimiz yalnızca kaya tuzu ve kaynak suyuyla geleneksel fermantasyon havuzlarında 6 ile 8 ay süreyle doğal şekilde olgunlaştırılır.'
  },
  {
    q: 'Kargo ve teslimat süreci nasıl işler?',
    a: 'Tüm siparişler kırılmaya karşı korumalı özel hava kanallı kolilerle paketlenir. Saat 14:00\'e kadar verilen siparişler aynı gün kargoya verilir. 500 TL üzeri tüm siparişlerde kargo ücretsizdir.'
  }
];
