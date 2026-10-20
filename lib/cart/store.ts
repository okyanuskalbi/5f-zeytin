import type {
  CartItem, CartProduct, CartState, CartStorage, CartStore, CartStoreOptions,
} from "@/lib/cart/types";

export const CART_STORAGE_KEY = "afina-zeytin:cart";

const EMPTY_STATE: CartState = Object.freeze({
  items: Object.freeze([]), hydrated: false, storageError: false,
});

function stockFrom(products: readonly CartProduct[]): ReadonlyMap<string, number> {
  return new Map(products
    .filter(({ id, stock }) => typeof id === "string" && id.trim() !== ""
      && Number.isSafeInteger(stock) && stock > 0)
    .map(({ id, stock }) => [id, stock]));
}

function restoreItems(value: unknown, stock: ReadonlyMap<string, number>): CartItem[] {
  if (!Array.isArray(value)) return [];
  const quantities = new Map<string, number>();

  for (const entry of value) {
    if (typeof entry !== "object" || entry === null) continue;
    const { productId, quantity } = entry;
    if (typeof productId !== "string" || !Number.isSafeInteger(quantity) || quantity <= 0) continue;
    const available = stock.get(productId);
    if (!available) continue;
    quantities.set(productId, Math.min(available, (quantities.get(productId) ?? 0) + quantity));
  }

  // Whitelist fields: never restore prices, personal information or payment data.
  return Array.from(quantities, ([productId, quantity]) => ({ productId, quantity }));
}

/**
 * Create per client cart owner; never share a mutable singleton between SSR requests.
 * Snapshots/subscriptions can be consumed with React useSyncExternalStore in Task 038.
 * Construction and snapshot reads have no browser side effects. Hydrate after mount.
 * Catalog stock is a UI guard only; checkout must revalidate stock/prices on the server.
 */
export function createCartStore(options: CartStoreOptions): CartStore {
  let stock = stockFrom(options.products);
  let state = EMPTY_STATE;
  const listeners = new Set<() => void>();

  function getStorage(): CartStorage | null {
    if (options.storage !== undefined) return options.storage;
    return typeof window === "undefined" ? null : window.localStorage;
  }

  function update(items: readonly CartItem[], storageError = false, persist = true): void {
    if (persist) {
      try {
        getStorage()?.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } catch {
        // Preserve the edit in memory and let consumers report persistence failure.
        storageError = true;
      }
    }
    state = Object.freeze({
      items: Object.freeze(items.map(({ productId, quantity }) => Object.freeze({ productId, quantity }))),
      hydrated: true,
      storageError,
    });
    listeners.forEach((listener) => listener());
  }

  function hydrate(): void {
    if (state.hydrated) return;
    let stored: string | null;
    try {
      stored = getStorage()?.getItem(CART_STORAGE_KEY) ?? null;
    } catch {
      // A failed read must not overwrite an unread cart with an empty one.
      update([], true, false);
      return;
    }
    let parsed: unknown;
    try {
      parsed = stored === null ? [] : JSON.parse(stored);
    } catch {
      // Repair corrupt JSON; valid future edits can still be persisted.
      parsed = [];
    }
    update(restoreItems(parsed, stock));
  }

  function validateQuantity(quantity: number, minimum: number): void {
    if (!Number.isSafeInteger(quantity) || quantity < minimum) {
      throw new RangeError("Adet geçerli bir tam sayı olmalı.");
    }
  }

  function validateStock(productId: string, quantity: number): void {
    const available = stock.get(productId) ?? 0;
    if (!available || quantity > available) {
      throw new RangeError("Ürün bulunamadı veya istenen adet stok sınırını aşıyor.");
    }
  }

  function addItem(productId: string, quantity = 1): void {
    hydrate();
    validateQuantity(quantity, 1);
    const current = state.items.find((item) => item.productId === productId);
    const nextQuantity = (current?.quantity ?? 0) + quantity;
    validateStock(productId, nextQuantity);
    update(current
      ? state.items.map((item) => item.productId === productId ? { productId, quantity: nextQuantity } : item)
      : [...state.items, { productId, quantity }]);
  }

  function removeItem(productId: string): void {
    hydrate();
    update(state.items.filter((item) => item.productId !== productId));
  }

  function setQuantity(productId: string, quantity: number): void {
    hydrate();
    validateQuantity(quantity, 0);
    if (quantity === 0) {
      removeItem(productId);
      return;
    }
    validateStock(productId, quantity);
    if (!state.items.some((item) => item.productId === productId)) {
      throw new RangeError("Güncellenecek ürün sepette bulunamadı.");
    }
    update(state.items.map((item) => item.productId === productId ? { productId, quantity } : item));
  }

  function setProducts(products: readonly CartProduct[]): void {
    stock = stockFrom(products);
    if (!state.hydrated) {
      hydrate();
      return;
    }
    update(restoreItems(state.items, stock));
  }

  return {
    getSnapshot: () => state,
    getServerSnapshot: () => EMPTY_STATE,
    subscribe(listener) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    hydrate,
    addItem,
    setQuantity,
    removeItem,
    clear() {
      hydrate();
      update([]);
    },
    setProducts,
  };
}
