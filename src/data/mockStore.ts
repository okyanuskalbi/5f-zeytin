import { Product, StoryScene, CustomerOrder, StockBatch, VisualStudioPrompt } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'afina-erken-hasat-sizma',
    title: 'AFİNA Erken Hasat Soğuk Sıkım Natürel Sızma',
    slug: 'afina-erken-hasat-soguk-sikim',
    sku: 'AFN-OIL-001',
    subtitle: 'Koyu UV korumalı cam şişe, 24°C altında oksijensiz kapalı devre sıkım',
    categoryId: 'oil',
    categoryTitle: 'Soğuk Sıkım Zeytinyağları',
    description: 'Ekim ayının ilk iki haftasında zeytinler henüz yeşilken elle toplanır. En geç 4 saat içinde 24°C altında soğuk sıkılarak yüksek polifenol ve taze çimen, çağla badem ve enginar rayihası korunur.',
    price: 490,
    originalPrice: 560,
    stock: 240,
    rating: 4.9,
    reviewCount: 168,
    media: [
      'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1541256942802-7b2996a84f97?auto=format&fit=crop&w=900&q=80'
    ],
    badges: ['Çok Satan', 'Erken Hasat 2025/26'],
    volumeOrWeight: '500 ml',
    acidity: '0.2 Asit (Dizyem)',
    polyphenol: '480+ mg/kg',
    harvestYear: '2025/2026',
    pressType: '24°C Gerçek Soğuk Sıkım',
    oliveType: 'Edremit / Ayvalık Tipi',
    tastingNotes: ['Yeşil Çağla Badem', 'Taze Çimen', 'Enginar Yaprağı', 'Hafif Damak Yakıcılığı'],
    usageRecommendation: 'Kahvaltıda çiğ içim, meze ve taze salatalara son dokunuş.',
    inStock: true,
    featured: true,
    variants: [
      { id: 'var-500ml', title: '500 ml Koyu Cam Şişe', volumeOrWeight: '500 ml', price: 490, originalPrice: 560, stock: 120, sku: 'AFN-OIL-500' },
      { id: 'var-750ml', title: '750 ml Gurme Şişe', volumeOrWeight: '750 ml', price: 680, originalPrice: 760, stock: 80, sku: 'AFN-OIL-750' },
      { id: 'var-5000ml', title: '5 Litre Aile Boyu Teneke', volumeOrWeight: '5 Litre', price: 2450, originalPrice: 2800, stock: 40, sku: 'AFN-OIL-5000' }
    ]
  },
  {
    id: 'afina-tas-baski-filtresiz',
    title: 'AFİNA Filtresiz Taş Baskı Rezerv Zeytinyağı',
    slug: 'afina-tas-baski-filtresiz-rezerv',
    sku: 'AFN-OIL-002',
    subtitle: 'Meyvemsi partikülleri korunmuş, taze sıkım yoğun kadife kıvam',
    categoryId: 'oil',
    categoryTitle: 'Soğuk Sıkım Zeytinyağları',
    description: 'Filtre edilmeden kendi doğal tortusuyla dinlendirilen özel rezerv. Canlı klorofil yeşili, zengin antioksidan ve tarladan yeni sıkılmış tazelik.',
    price: 640,
    originalPrice: 720,
    stock: 75,
    rating: 5.0,
    reviewCount: 94,
    media: [
      'https://images.unsplash.com/photo-1541256942802-7b2996a84f97?auto=format&fit=crop&w=900&q=80'
    ],
    badges: ['Özel Seri', 'Sınırlı Üretim'],
    volumeOrWeight: '750 ml',
    acidity: '0.3 Asit (Dizyem)',
    polyphenol: '520+ mg/kg',
    harvestYear: '2025/2026',
    pressType: 'Geleneksel Soğuk Taş Baskı',
    oliveType: 'Ayvalık Yerli',
    tastingNotes: ['Yeşil Elma', 'Roka Notaları', 'Zeytin Çiçeği', 'Doygun Kıvam'],
    usageRecommendation: 'Sıcak ekmek üzerine banarak veya özel peynir tabaklarıyla.',
    inStock: true,
    featured: true,
    variants: [
      { id: 'var-tb-750ml', title: '750 ml Butik Şişe', volumeOrWeight: '750 ml', price: 640, originalPrice: 720, stock: 75, sku: 'AFN-OIL-TB-750' }
    ]
  },
  {
    id: 'afina-kirma-yesil-zeytin',
    title: 'AFİNA Taş Kırma Ayvalık Yeşil Zeytini',
    slug: 'afina-kirma-yesil-zeytin',
    sku: 'AFN-GRN-001',
    subtitle: 'Taze limon ve kaya tuzu salamurasında, çıtır diri kıvam',
    categoryId: 'olive-green',
    categoryTitle: 'Yeşil Zeytinler',
    description: 'Dalında henüz sert ve taze yeşilken elle toplanıp meşe tokmakla tek tek kırılarak tatlandırılmıştır. Kostiksiz, tamamen doğal kaya tuzlu kaynak suyunda olgunlaşmıştır.',
    price: 270,
    originalPrice: 310,
    stock: 140,
    rating: 4.8,
    reviewCount: 112,
    media: [
      'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&w=900&q=80'
    ],
    badges: ['Yeni Mahsul', '%100 Doğal'],
    volumeOrWeight: '1000 gr',
    harvestYear: '2025 Hasadı',
    oliveType: 'Ayvalık Erken Yeşil',
    tastingNotes: ['Limon Ferahlığı', 'Çıtır Etli Doku', 'Hafif Doğal Acılık'],
    usageRecommendation: 'Kekik, pul biber ve AFİNA zeytinyağı ile harmanlayarak meze olarak.',
    inStock: true,
    featured: true,
    variants: [
      { id: 'var-grn-1000g', title: '1000 gr Cam Kavanoz', volumeOrWeight: '1000 gr', price: 270, originalPrice: 310, stock: 90, sku: 'AFN-GRN-1000' },
      { id: 'var-grn-500g', title: '500 gr Cam Kavanoz', volumeOrWeight: '500 gr', price: 160, stock: 50, sku: 'AFN-GRN-500' }
    ]
  },
  {
    id: 'afina-gemlik-cevirme-siyah',
    title: 'AFİNA Doğal Fermente Gemlik Çevirme Siyah Zeytin',
    slug: 'afina-gemlik-cevirme-siyah-zeytin',
    sku: 'AFN-BLK-001',
    subtitle: 'İlaçsız, kostiksiz, 8 ay kaya tuzunda kendi öz suyunda olgunlaşmış',
    categoryId: 'olive-black',
    categoryTitle: 'Siyah Zeytinler',
    description: 'Kimyasal renklendirici veya hızlandırıcı kullanılmadan, geleneksel çevirme havuzlarında kendi suyunda dinlenmiş ince kabuklu, küçük çekirdekli ve etli Gemlik tipi siyah zeytin.',
    price: 290,
    originalPrice: 340,
    stock: 180,
    rating: 4.9,
    reviewCount: 205,
    media: [
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=80'
    ],
    badges: ['Geleneksel Lezzet', 'Kimyasalsız'],
    volumeOrWeight: '1000 gr',
    harvestYear: '2025 Hasadı',
    oliveType: 'Gemlik İnce Kabuklu',
    tastingNotes: ['Doğal Tuz Dengesi', 'Dolgun Yağlı Et', 'Kolay Ayrılan Çekirdek'],
    usageRecommendation: 'Geleneksel Türk kahvaltısı sofralarının baş tacı.',
    inStock: true,
    featured: true,
    variants: [
      { id: 'var-blk-1000g', title: '1000 gr Cam Kavanoz', volumeOrWeight: '1000 gr', price: 290, originalPrice: 340, stock: 110, sku: 'AFN-BLK-1000' },
      { id: 'var-blk-500g', title: '500 gr Cam Kavanoz', volumeOrWeight: '500 gr', price: 175, stock: 70, sku: 'AFN-BLK-500' }
    ]
  },
  {
    id: 'afina-cizik-yesil-zeytin',
    title: 'AFİNA Çizik Ege Yeşil Zeytini',
    slug: 'afina-cizik-yesil-zeytin',
    sku: 'AFN-GRN-002',
    subtitle: 'Geleneksel üç çizikli, taze sıkılmış limonlu hafif salamura',
    categoryId: 'olive-green',
    categoryTitle: 'Yeşil Zeytinler',
    description: 'Etli ve dolgun taneleri 3 yerinden özenle çizilerek doğal fermantasyona bırakılan, ekşisi ve tuzu dengeli yeşil zeytin.',
    price: 280,
    stock: 95,
    rating: 4.7,
    reviewCount: 84,
    media: [
      'https://images.unsplash.com/photo-1589927986089-35812388d1f4?auto=format&fit=crop&w=900&q=80'
    ],
    badges: ['Hasat Seçimi'],
    volumeOrWeight: '1000 gr',
    harvestYear: '2025 Hasadı',
    oliveType: 'Edremit Çizik',
    tastingNotes: ['Hafif Ekşimsi', 'Sert ve Dolgun'],
    usageRecommendation: 'Salatalara doğrayarak veya ceviz ve nar ekşisi ile meze yaparak.',
    inStock: true,
    featured: false,
    variants: [
      { id: 'var-czk-1000g', title: '1000 gr Cam Kavanoz', volumeOrWeight: '1000 gr', price: 280, stock: 95, sku: 'AFN-GRN-CZK-1000' }
    ]
  },
  {
    id: 'afina-gurme-tadim-kutusu',
    title: 'AFİNA Koleksiyon Gurme Hediye Sandığı',
    slug: 'afina-koleksiyon-gurme-hediye-sandigi',
    sku: 'AFN-GFT-001',
    subtitle: 'Erken Hasat Şişe (500ml) + Siyah & Yeşil Zeytin + Seramik Tadım Kasesi',
    categoryId: 'gift-box',
    categoryTitle: 'Özel Setler',
    description: 'Ahşap özel üretim kutusunda; 1 adet 500ml Erken Hasat Soğuk Sıkım Zeytinyağı, 500gr Gemlik Siyah Zeytin, 500gr Kırma Yeşil Zeytin ve el yapımı seramik zeytinyağı tadım kasesi.',
    price: 1190,
    originalPrice: 1350,
    stock: 35,
    rating: 5.0,
    reviewCount: 42,
    media: [
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=900&q=80'
    ],
    badges: ['Gurme Set', 'Özel Hediye'],
    volumeOrWeight: 'Set Paketi',
    harvestYear: '2025/2026',
    tastingNotes: ['Eksiksiz Akdeniz Sofrası Deneyimi'],
    usageRecommendation: 'Kendiniz ve sevdikleriniz için prestijli gurme hediye.',
    inStock: true,
    featured: true,
    variants: [
      { id: 'var-gft-full', title: 'Ahşap Sandıklı Tam Set', volumeOrWeight: 'Set Paketi', price: 1190, originalPrice: 1350, stock: 35, sku: 'AFN-GFT-BOX' }
    ]
  }
];

export const INITIAL_SCENES: StoryScene[] = [
  {
    id: 'scene-01-roots',
    order: 1,
    sceneCode: '01',
    title: '01 — Kökler',
    subtitle: 'Köklerinden aldığı güçle büyüyor.',
    quote: 'Asırlık zeytin ağacımızın gövdesinde biriken bilgelik, toprağın bereketiyle harmanlanıyor.',
    description: 'Ege’nin bin yıllık mikroklimasında kök salmış kadim zeytin ağaçlarımız, her hasat döneminde doğallığını ve saf özünü cömertçe sunar.',
    desktopMedia: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1600&q=85',
    mobileMedia: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=900&q=85',
    type: 'image-hybrid-3d',
    linkedProductId: 'afina-erken-hasat-sizma',
    linkedVariantId: 'var-500ml',
    toneMapping: {
      operator: 'ACESFilmic',
      exposure: 1.1,
      outputColorSpace: 'SRGB',
      ambientIntensity: 0.65,
      keyLightIntensity: 1.8,
      fillLightIntensity: 0.8,
      rimLightIntensity: 1.2,
      glassRoughness: 0.08,
      oilTransmission: 0.92,
      oilColor: '#8C9A27'
    },
    published: true,
    version: 1,
    updatedAt: '2026-10-14'
  },
  {
    id: 'scene-02-green-olive',
    order: 2,
    sceneCode: '02',
    title: '02 — Yeşil Zeytin',
    subtitle: 'Güneşin ve dalın taze armağanı',
    quote: 'Kamera dala yaklaşır: Çiy taneleriyle parıldayan diri ve diri yeşil zeytinler.',
    description: 'Ekim başında tek tek elle toplanan taze yeşil zeytinler, çıtır dokusu ve limonlu hafif acılığıyla sofraya tazelik getirir.',
    desktopMedia: 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&w=1600&q=85',
    mobileMedia: 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&w=900&q=85',
    type: 'cinematic-image',
    linkedProductId: 'afina-kirma-yesil-zeytin',
    linkedVariantId: 'var-grn-1000g',
    toneMapping: {
      operator: 'ACESFilmic',
      exposure: 1.15,
      outputColorSpace: 'SRGB',
      ambientIntensity: 0.7,
      keyLightIntensity: 1.6,
      fillLightIntensity: 0.85,
      rimLightIntensity: 1.3,
      glassRoughness: 0.1,
      oilTransmission: 0.88,
      oilColor: '#7A8E1D'
    },
    published: true,
    version: 1,
    updatedAt: '2026-10-14'
  },
  {
    id: 'scene-03-black-olive',
    order: 3,
    sceneCode: '03',
    title: '03 — Siyah Zeytin',
    subtitle: 'Geleneksel havuzlarda sabırla olgunlaşan tat',
    quote: 'Siyah zeytin makrosu: Yüzey ayrıntıları, doğal mor-siyah ten ve kadife yağ ışıltısı.',
    description: 'Kimyasal karartıcı kullanılmadan, yalnızca kaya tuzuyla kendi suyunda 8 ay boyunca çevrilerek fermente edilen hakiki Gemlik zeytini.',
    desktopMedia: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1600&q=85',
    mobileMedia: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=85',
    type: 'cinematic-image',
    linkedProductId: 'afina-gemlik-cevirme-siyah',
    linkedVariantId: 'var-blk-1000g',
    toneMapping: {
      operator: 'ACESFilmic',
      exposure: 1.1,
      outputColorSpace: 'SRGB',
      ambientIntensity: 0.6,
      keyLightIntensity: 1.7,
      fillLightIntensity: 0.75,
      rimLightIntensity: 1.4,
      glassRoughness: 0.12,
      oilTransmission: 0.85,
      oilColor: '#5C6E15'
    },
    published: true,
    version: 1,
    updatedAt: '2026-10-14'
  },
  {
    id: 'scene-04-harvest',
    order: 4,
    sceneCode: '04',
    title: '04 — Hasat',
    subtitle: 'Emeğin, vaktin ve sadakatin ritmi',
    quote: 'Toprağa düşmeyen, dalından el emeğiyle hasır sepetlere indirilen saflık.',
    description: 'Zeytinler yere düşmeden kasalara toplanır; bekletilmeden, fermente olmadan saatler içinde taş sıkım tesisine yetiştirilir.',
    desktopMedia: 'https://images.unsplash.com/photo-1589927986089-35812388d1f4?auto=format&fit=crop&w=1600&q=85',
    mobileMedia: 'https://images.unsplash.com/photo-1589927986089-35812388d1f4?auto=format&fit=crop&w=900&q=85',
    type: 'cinematic-image',
    linkedProductId: 'afina-cizik-yesil-zeytin',
    linkedVariantId: 'var-czk-1000g',
    toneMapping: {
      operator: 'ACESFilmic',
      exposure: 1.12,
      outputColorSpace: 'SRGB',
      ambientIntensity: 0.65,
      keyLightIntensity: 1.75,
      fillLightIntensity: 0.8,
      rimLightIntensity: 1.25,
      glassRoughness: 0.1,
      oilTransmission: 0.9,
      oilColor: '#849B22'
    },
    published: true,
    version: 1,
    updatedAt: '2026-10-14'
  },
  {
    id: 'scene-05-oil-stream',
    order: 5,
    sceneCode: '05',
    title: '05 — Zeytinyağı',
    subtitle: '24°C Soğuk sıkımla süzülen altın sıvı',
    quote: 'Işığı geçiren altın-yeşil yağ damlasından AFİNA cam şişesine sinematik dönüşüm.',
    description: 'Yüksek polifenolün ve çağla badem rayihasının korunduğu 0.2 dizyemlik saf natürel sızma; laboratuvar onaylı şifa kaynağı.',
    desktopMedia: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=1600&q=85',
    mobileMedia: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=900&q=85',
    type: 'image-hybrid-3d',
    linkedProductId: 'afina-erken-hasat-sizma',
    linkedVariantId: 'var-500ml',
    toneMapping: {
      operator: 'ACESFilmic',
      exposure: 1.15,
      outputColorSpace: 'SRGB',
      ambientIntensity: 0.7,
      keyLightIntensity: 2.0,
      fillLightIntensity: 0.9,
      rimLightIntensity: 1.5,
      glassRoughness: 0.05,
      oilTransmission: 0.95,
      oilColor: '#98AC29'
    },
    published: true,
    version: 1,
    updatedAt: '2026-10-14'
  },
  {
    id: 'scene-06-table',
    order: 6,
    sceneCode: '06',
    title: '06 — Sofra',
    subtitle: 'Akdeniz zarafeti sofranızda buluşuyor',
    quote: 'Köy ekmeği, beyaz porselen kasede sızma yağ, zeytinler ve sevdiklerinizle paylaşılan anlar.',
    description: 'AFİNA koleksiyonunun tüm onaylı ürünleri, bereketli bir sofrada doğallığın en samimi halini sunar.',
    desktopMedia: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1600&q=85',
    mobileMedia: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=85',
    type: 'cinematic-image',
    linkedProductId: 'afina-gurme-tadim-kutusu',
    linkedVariantId: 'var-gft-full',
    toneMapping: {
      operator: 'ACESFilmic',
      exposure: 1.1,
      outputColorSpace: 'SRGB',
      ambientIntensity: 0.65,
      keyLightIntensity: 1.7,
      fillLightIntensity: 0.85,
      rimLightIntensity: 1.2,
      glassRoughness: 0.1,
      oilTransmission: 0.9,
      oilColor: '#8C9A27'
    },
    published: true,
    version: 1,
    updatedAt: '2026-10-14'
  }
];

export const INITIAL_ORDERS: CustomerOrder[] = [
  {
    orderId: 'AFN-2026-9481',
    customerName: 'Ayşe Karaca',
    email: 'ayse.karaca@example.com',
    phone: '0532 444 11 22',
    city: 'İstanbul',
    district: 'Kadıköy',
    address: 'Moda Cad. No: 42 D: 5, Caferağa Mah.',
    paymentMethod: 'credit-card',
    paymentStatus: 'Tahsil Edildi (Demo)',
    fulfillmentStatus: 'Hazırlanıyor',
    items: [
      { productId: 'afina-erken-hasat-sizma', productTitle: 'AFİNA Erken Hasat Soğuk Sıkım', variantTitle: '500 ml Koyu Cam Şişe', sku: 'AFN-OIL-500', price: 490, quantity: 2 },
      { productId: 'afina-gemlik-cevirme-siyah', productTitle: 'AFİNA Doğal Fermente Siyah Zeytin', variantTitle: '1000 gr Cam Kavanoz', sku: 'AFN-BLK-1000', price: 290, quantity: 1 }
    ],
    subtotal: 1270,
    discount: 127,
    shipping: 0,
    total: 1143,
    createdAt: '14 Ekim 2026, 11:24',
    trackingCode: 'MNG-784920194'
  },
  {
    orderId: 'AFN-2026-9480',
    customerName: 'Mehmet Eren',
    email: 'mehmet.eren@example.com',
    phone: '0555 888 33 44',
    city: 'İzmir',
    district: 'Urla',
    address: 'İskele Mah. Mithatpaşa Sok. No: 18',
    paymentMethod: 'bank-transfer',
    paymentStatus: 'Havale Bekleniyor',
    fulfillmentStatus: 'Hazırlanıyor',
    items: [
      { productId: 'afina-erken-hasat-sizma', productTitle: 'AFİNA Erken Hasat Soğuk Sıkım', variantTitle: '5 Litre Aile Boyu Teneke', sku: 'AFN-OIL-5000', price: 2450, quantity: 1 }
    ],
    subtotal: 2450,
    discount: 0,
    shipping: 0,
    total: 2450,
    createdAt: '14 Ekim 2026, 09:15'
  },
  {
    orderId: 'AFN-2026-9475',
    customerName: 'Zeynep Yıldız',
    email: 'zeynep.yildiz@example.com',
    phone: '0544 333 99 11',
    city: 'Ankara',
    district: 'Çankaya',
    address: 'Tunalı Hilmi Cad. No: 88 D: 12',
    paymentMethod: 'cash-on-delivery',
    paymentStatus: 'Kapıda Tahsil Edilecek',
    fulfillmentStatus: 'Kargoya Verildi',
    items: [
      { productId: 'afina-kirma-yesil-zeytin', productTitle: 'AFİNA Taş Kırma Yeşil Zeytini', variantTitle: '1000 gr Cam Kavanoz', sku: 'AFN-GRN-1000', price: 270, quantity: 2 }
    ],
    subtotal: 540,
    discount: 0,
    shipping: 0,
    total: 540,
    createdAt: '13 Ekim 2026, 16:40',
    trackingCode: 'YRT-482019385'
  }
];

export const INITIAL_BATCHES: StockBatch[] = [
  {
    id: 'batch-2025-01',
    batchNo: 'LOT-2025-EH01',
    productId: 'afina-erken-hasat-sizma',
    productTitle: 'AFİNA Erken Hasat Soğuk Sıkım Natürel Sızma',
    harvestDate: '08 Ekim 2025',
    bottlingDate: '10 Ekim 2025',
    initialQuantity: 500,
    remainingQuantity: 240,
    quarantineStatus: 'Satılabilir',
    acidityLabResult: '0.22 Dizyem',
    peroxideLabResult: '4.8 meqO2/kg'
  },
  {
    id: 'batch-2025-02',
    batchNo: 'LOT-2025-TB02',
    productId: 'afina-tas-baski-filtresiz',
    productTitle: 'AFİNA Filtresiz Taş Baskı Rezerv',
    harvestDate: '11 Ekim 2025',
    bottlingDate: '12 Ekim 2025',
    initialQuantity: 150,
    remainingQuantity: 75,
    quarantineStatus: 'Satılabilir',
    acidityLabResult: '0.28 Dizyem',
    peroxideLabResult: '5.2 meqO2/kg'
  },
  {
    id: 'batch-2025-03',
    batchNo: 'LOT-2025-BLK03',
    productId: 'afina-gemlik-cevirme-siyah',
    productTitle: 'AFİNA Doğal Fermente Siyah Zeytin',
    harvestDate: 'Kasım 2024 (8 Ay Havuz)',
    bottlingDate: 'Eylül 2025',
    initialQuantity: 300,
    remainingQuantity: 180,
    quarantineStatus: 'Satılabilir',
    acidityLabResult: 'Doğal Tuzluluk %4.1',
    peroxideLabResult: 'Tuz & Su Analizi Onaylı'
  }
];

export const INITIAL_PROMPTS: VisualStudioPrompt[] = [
  {
    id: 'p-01',
    code: 'P01',
    title: 'Kadim Zeytin Ağacı Hero Sahnesi',
    sceneId: 'scene-01-roots',
    aspectRatio: '16:9 (Masaüstü) / 9:16 (Mobil)',
    targetResolution: '3840x2160 / 1080x1920',
    model: 'Google Gemini 2.5',
    prompt: 'AFİNA ZEYTİN için fotogerçekçi, sinematik Akdeniz zeytinliği sahnesi. Yüzyıllık, heybetli kadim bir zeytin ağacı; kıvrımlı derin gövde kabuk dokusu, güneş ışığını süzen gümüş-yeşil yapraklar. Sol tarafta geniş ferah negatif alan (HTML başlık yerleşimi için). Apply tone mapping — without it, the model renders dark and muddy.',
    negativePrompt: 'Uydurma marka yazısı, bozuk logo, plastik zeytin dokusu, ağır bloom, çamurlu gölge, yapay filtre.',
    previewUrl: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1200&q=80',
    status: 'Onaylandı (Yayında)',
    costEstimate: '0.04 $ / çağrı',
    assignedAssetId: 'afina-scene-01-hero-tree'
  },
  {
    id: 'p-02',
    code: 'P02',
    title: 'Dalında Canlı Yeşil Zeytin Makro Çekimi',
    sceneId: 'scene-02-green-olive',
    aspectRatio: '4:5 / 9:16',
    targetResolution: '2160x2700',
    model: 'Nano Banana 2.1',
    prompt: 'AFİNA ZEYTİN makro plan: Dal üzerinde taze çiy damlacıklı canlı yeşil zeytinler. Doğal pürüzsüz meyve dokusu, sabah sisi çiğ damlacıkları, sıcak kenar ışığı (rim lighting), gümüşi zeytin yaprakları. Apply tone mapping — without it, the model renders dark and muddy.',
    negativePrompt: 'Soluk çamurlu renkler, yapay parlama, deforme dal yapısı.',
    previewUrl: 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&w=1200&q=80',
    status: 'Onaylandı (Yayında)',
    costEstimate: '0.035 $ / çağrı',
    assignedAssetId: 'afina-scene-02-green-olive'
  },
  {
    id: 'p-05',
    code: 'P05',
    title: 'Altın-Yeşil Sızma Yağ Akışı & Şişe Packshot',
    sceneId: 'scene-05-oil-stream',
    aspectRatio: '4:5',
    targetResolution: '2160x2700',
    model: 'Google Gemini 2.5',
    prompt: 'Sinematik makro çekim: Saydam altın-zümrüt yeşili natürel sızma zeytinyağı damlası ve ince akış. Işığın yağın içinden süzülüşü (subsurface scattering / light transmission), gerçekçi viskozite ve ipeksi kıvam. Doğal taş zemin. Apply tone mapping — without it, the model renders dark and muddy.',
    negativePrompt: 'Motor yağı sarısı, bal rengi, yanmış aşırı beyaz ışık patlaması.',
    previewUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=1200&q=80',
    status: 'Onaylandı (Yayında)',
    costEstimate: '0.04 $ / çağrı',
    assignedAssetId: 'afina-scene-05-oil-drop'
  }
];
