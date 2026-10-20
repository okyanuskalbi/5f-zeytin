import type { Product } from "@/types/catalog";

/** Local intent only. Prices and checkout validation belong to the server. */
export type CartItem = Readonly<{
  productId: string;
  quantity: number;
}>;

/** Catalog availability is transient and is never persisted with the cart. */
export type CartProduct = Pick<Product, "id" | "stock">;

export type CartState = Readonly<{
  items: readonly CartItem[];
  hydrated: boolean;
  storageError: boolean;
}>;

export type CartStorage = Pick<Storage, "getItem" | "setItem">;

export type CartStoreOptions = Readonly<{
  products: readonly CartProduct[];
  /** Omit for browser localStorage; null explicitly selects memory only. */
  storage?: CartStorage | null;
}>;

export type CartStore = Readonly<{
  getSnapshot: () => CartState;
  getServerSnapshot: () => CartState;
  subscribe: (listener: () => void) => () => void;
  /** Call after mount, outside render; mutations also hydrate before editing. */
  hydrate: () => void;
  addItem: (productId: string, quantity?: number) => void;
  /** Zero removes a line; invalid/negative/over-stock quantities throw RangeError. */
  setQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
  setProducts: (products: readonly CartProduct[]) => void;
}>;
