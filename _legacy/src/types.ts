export type ProductCategory = 'oil' | 'olive-green' | 'olive-black' | 'gourmet' | 'gift-box';

export interface ProductVariant {
  id: string;
  title: string;
  volumeOrWeight: string;
  price: number;
  originalPrice?: number;
  stock: number;
  sku: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  sku: string;
  subtitle: string;
  categoryId: ProductCategory;
  categoryTitle: string;
  description: string;
  price: number;
  originalPrice?: number;
  stock: number;
  rating: number;
  reviewCount: number;
  media: string[];
  badges: string[];
  volumeOrWeight: string;
  variants: ProductVariant[];
  acidity?: string; // e.g. "0.2 Dizyem"
  polyphenol?: string; // e.g. "480+ mg/kg"
  harvestYear: string;
  pressType?: string; // "24°C Gerçek Soğuk Sıkım"
  oliveType?: string; // "Edremit / Ayvalık Tipi"
  tastingNotes?: string[];
  usageRecommendation?: string;
  inStock: boolean;
  featured?: boolean;
}

export interface ToneMappingConfig {
  operator: 'ACESFilmic' | 'AgX' | 'Reinhard' | 'Linear';
  exposure: number;
  outputColorSpace: 'SRGB';
  ambientIntensity: number;
  keyLightIntensity: number;
  fillLightIntensity: number;
  rimLightIntensity: number;
  glassRoughness: number;
  oilTransmission: number;
  oilColor: string;
}

export interface StoryScene {
  id: string;
  order: number;
  sceneCode: '01' | '02' | '03' | '04' | '05' | '06';
  title: string;
  subtitle: string;
  quote?: string;
  description: string;
  desktopMedia: string;
  mobileMedia: string;
  type: 'image-hybrid-3d' | '3d-canvas' | 'cinematic-image';
  linkedProductId: string;
  linkedVariantId?: string;
  toneMapping: ToneMappingConfig;
  published: boolean;
  version: number;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  selectedVariant: ProductVariant;
  quantity: number;
}

export interface CustomerOrder {
  orderId: string;
  customerName: string;
  email: string;
  phone: string;
  city: string;
  district: string;
  address: string;
  orderNote?: string;
  paymentMethod: 'credit-card' | 'bank-transfer' | 'cash-on-delivery';
  paymentStatus: 'Tahsil Edildi (Demo)' | 'Havale Bekleniyor' | 'Kapıda Tahsil Edilecek';
  fulfillmentStatus: 'Hazırlanıyor' | 'Kargoya Verildi' | 'Teslim Edildi' | 'İptal / İade';
  items: {
    productId: string;
    productTitle: string;
    variantTitle: string;
    sku: string;
    price: number;
    quantity: number;
  }[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  createdAt: string;
  trackingCode?: string;
}

export interface StockBatch {
  id: string;
  batchNo: string;
  productId: string;
  productTitle: string;
  harvestDate: string;
  bottlingDate: string;
  initialQuantity: number;
  remainingQuantity: number;
  quarantineStatus: 'Satılabilir' | 'Analiz / Karantina' | 'Rezerve';
  acidityLabResult: string;
  peroxideLabResult: string;
}

export interface VisualStudioPrompt {
  id: string;
  code: string;
  title: string;
  sceneId: string;
  aspectRatio: string;
  targetResolution: string;
  model: 'Google Gemini 2.5' | 'Nano Banana 2.1' | 'OpenAI DALL-E 3';
  prompt: string;
  negativePrompt: string;
  previewUrl: string;
  status: 'Onaylandı (Yayında)' | 'İnceleme Bekliyor' | 'Taslak';
  costEstimate: string;
  assignedAssetId: string;
}
