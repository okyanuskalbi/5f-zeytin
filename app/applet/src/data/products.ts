export interface Product {
  id: string;
  name: string;
  category: 'zeytinyagi' | 'zeytin' | 'ezme-gurme';
  categoryLabel: string;
  subtitle: string;
  price: number;
  originalPrice?: number;
  image: string;
  volumeOrWeight: string;
  acidity?: string;
  harvestYear: string;
  region: string;
  description: string;
  tastingNotes?: string[];
  features: string[];
  inStock: boolean;
  isPopular?: boolean;
}

export const PRODUCTS: Product[] = [
  {
    id: '5f-evoo-erken-hasat-500ml',
    name: 'Erken Hasat Soğuk Sıkım Natürel Sızma Zeytinyağı',
    category: 'zeytinyagi',
    categoryLabel: 'Zeytinyağı',
    subtitle: 'Kuzey Ege bahçelerimizden yeşil hasat, 27°C altı ilk sıkım',
    price: 485,
    originalPrice: 550,
    image: '/src/assets/images/product_evoo_glass_bottle_1791969421720.jpg',
    volumeOrWeight: '500 ml Koyu Cam Şişe',
    acidity: 'Maks. %0.2',
    harvestYear: '2026/2027 Hasadı',
    region: 'Kaz Dağları Etekleri, Edremit Körfezi',
    description: 'Ekim ayı başında henüz yeşilken el ile tek tek toplanan zeytinlerimiz, hasattan sonraki 4 saat içinde 24°C sıcaklıkta kontinü sistemle sıkılarak elde edilir. Yüksek polifenol değeri ve taze biçilmiş çim, enginar ve yeşil elma aromasıyla damağınızda zarif bir yakıcılık bırakır.',
    tastingNotes: ['Taze çimen', 'Enginar', 'Yeşil elma', 'Hafif boğaz yakıcılığı (antioksidan)'],
    features: ['Soğuk Sıkım (<27°C)', 'Maksimum %0.2 Oleik Asit', 'Yüksek Polifenol (>420 mg/kg)', 'Filtresiz Doğal Çökeltme'],
    inStock: true,
    isPopular: true
  },
  {
    id: '5f-gemlik-dogal-sele-zeytin',
    name: 'Taş Baskı Doğal Sele Siyah Zeytin',
    category: 'zeytin',
    categoryLabel: 'Sofralık Zeytin',
    subtitle: 'Hiçbir kimyasal koruyucu olmadan yalnızca kaya tuzu ile olgunlaştırılmış',
    price: 240,
    image: '/src/assets/images/product_gemlik_black_olives_1791969421756.jpg',
    volumeOrWeight: '800 g Net',
    harvestYear: '2026 Hasadı',
    region: 'Gemlik & Körfez Bölgesi',
    description: 'Geleneksel sele yönteminde zeytinler keten çuvallarda kaya tuzu ile haftalarca çevrilerek acı suyunu doğal yolla dışarı atar. İnce kabuklu, küçük çekirdekli ve etli yapısıyla kahvaltı sofralarınızın baş tacıdır.',
    tastingNotes: ['Doğal meyvemsilik', 'Dengeli tuzluluk', 'Yağlı etli doku'],
    features: ['Doğal Fermantasyon', 'GDO ve Katkı Maddesi İçermez', 'Kaya Tuzu ile Olgunlaşma', 'İnce Kabuklu Gemlik Tipi'],
    inStock: true,
    isPopular: true
  },
  {
    id: '5f-ayvalik-kirma-yesil-zeytin',
    name: 'Kekikli & Limonlu Taş Kırma Yeşil Zeytin',
    category: 'zeytin',
    categoryLabel: 'Sofralık Zeytin',
    subtitle: 'Geleneksel taşla kırılan taze Ayvalık zeytinleri',
    price: 220,
    originalPrice: 260,
    image: '/src/assets/images/product_ayvalik_green_olives_1791969421899.jpg',
    volumeOrWeight: '900 g Kavanoz',
    harvestYear: '2026 Hasadı',
    region: 'Ayvalık, Balıkesir',
    description: 'Eylül sonu henüz sert ve körpeyken toplanan Ayvalık tipi yeşil zeytinler granit taşlarla tek tek kırılarak tatlı su kaynaklarında acılığı giderilir. Limon dilimleri ve dağ kekiği salamurasında dinlendirilir.',
    tastingNotes: ['Hafif ekşimsi limon ferahlığı', 'Dağ kekiği rayihası', 'Çıtır diri doku'],
    features: ['Elde Taşla Kırılmış', 'Doğal Limon ve Kekik Salamurası', 'Düşük Sodyum Oranı', 'Pastörize Edilmemiş Canlı Probiyotik'],
    inStock: true,
    isPopular: false
  },
  {
    id: '5f-evoo-filtresiz-teneke-5l',
    name: 'Aile Boyu Soğuk Sıkım Sızma Zeytinyağı',
    category: 'zeytinyagi',
    categoryLabel: 'Zeytinyağı',
    subtitle: 'Mutfakta günlük yemek ve salatalar için ideal dengeli lezzet',
    price: 3650,
    originalPrice: 3950,
    image: '/src/assets/images/product_evoo_glass_bottle_1791969421720.jpg',
    volumeOrWeight: '5 Litre Teneke Kutu',
    acidity: 'Maks. %0.5',
    harvestYear: '2026/2027 Hasadı',
    region: 'Kuzey Ege Havzası',
    description: 'Hem soğuk meze ve salatalarınızda hem de sıcak tencere ve fırın yemeklerinizde güvenle kullanabileceğiniz dengeli, yumuşak içimli soğuk sıkım natürel sızma zeytinyağı. Işık ve hava geçirmeyen gıda korumalı laklı tenekede sunulur.',
    tastingNotes: ['Yumuşak badem', 'Taze otlar', 'Dengeli meyvemsilik'],
    features: ['Soğuk Sıkım Tekniği', 'Gıdaya Uygun Laklı Teneke', 'Korumalı Hava Kilidi', 'Ekonomik Aile Boyu'],
    inStock: true,
    isPopular: false
  },
  {
    id: '5f-cevizli-siyah-zeytin-ezmesi',
    name: 'Kavrulmuş Cevizli & Baharatlı Siyah Zeytin Ezmesi',
    category: 'ezme-gurme',
    categoryLabel: 'Gurme Ezme',
    subtitle: 'Doğal sele zeytinlerinden el yapımı kahvaltılık ve mezelik ezme',
    price: 165,
    image: '/src/assets/images/product_gemlik_black_olives_1791969421756.jpg',
    volumeOrWeight: '280 g Cam Kavanoz',
    harvestYear: '2026 Hasadı',
    region: 'Kaz Dağları Butik Atölye',
    description: 'Doğal sele siyah zeytinlerinin çekirdekleri çıkarıldıktan sonra taş değirmende ezilip, yerli ceviz içi, sızma zeytinyağı, sarımsak ve kurutulmuş dağ kekiği ile harmanlanmasıyla hazırlanır.',
    tastingNotes: ['Kavruk ceviz', 'Zengin zeytin gövdesi', 'Kekik ve sarımsak uyumu'],
    features: ['Koruyucusuz & Katkısız', 'Hakiki Sızma Zeytinyağı ile', 'Ege Cevizi ile Zenginleştirilmiş', 'Bruschetta ve Mezeler İçin İdeal'],
    inStock: true,
    isPopular: false
  },
  {
    id: '5f-cizik-yesil-zeytin-domat',
    name: 'Kusursuz Domat Çizik Yeşil Zeytin',
    category: 'zeytin',
    categoryLabel: 'Sofralık Zeytin',
    subtitle: 'İri boy etli Akhisar Domat cinsi zeytinlerden özenle çizilerek hazırlanmış',
    price: 235,
    image: '/src/assets/images/product_ayvalik_green_olives_1791969421899.jpg',
    volumeOrWeight: '1000 g Kavanoz',
    harvestYear: '2026 Hasadı',
    region: 'Akhisar Ovası',
    description: 'Türkiye\'nin en meşhur iri yeşil zeytini olan Domat cinsi zeytinler iki yanından bıçakla çizilerek acısı geleneksel yöntemlerle dinlendirilir. Diri et dokusu ve sulu lezzetiyle sofranıza tazelik katar.',
    tastingNotes: ['Hafif meyvemsi', 'Dolgun etli', 'Doğal deniz tuzu lezzeti'],
    features: ['İri Kalibre (201-230 dane/kg)', 'Bıçak Çizikli', 'Doğal Deniz Tuzu ve Limon', 'Sert ve Çıtır Doku'],
    inStock: true,
    isPopular: false
  }
];
