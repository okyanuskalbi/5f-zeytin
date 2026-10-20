import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CART_STORAGE_KEY, createCartStore } from "@/lib/cart/store";
import type { CartProduct, CartStorage } from "@/lib/cart/types";

// Fixtures only: no real catalog, prices or customer data.
const products: readonly CartProduct[] = [
  { id: "olive", stock: 5 },
  { id: "oil", stock: 3 },
  { id: "sold-out", stock: 0 },
];

function createStore(storage: CartStorage | null = localStorage) {
  return createCartStore({ products, storage });
}

beforeEach(() => localStorage.clear());
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("local cart state", () => {
  it("starts empty and keeps a stable snapshot until the cart changes", () => {
    const store = createStore();
    const snapshot = store.getSnapshot();

    expect(snapshot).toEqual({ items: [], hydrated: false, storageError: false });
    expect(store.getSnapshot()).toBe(snapshot);
  });

  it("adds products, merges repeated additions and keeps separate lines", () => {
    const store = createStore();
    store.addItem("olive", 2);
    store.addItem("oil");
    store.addItem("olive", 3);

    expect(store.getSnapshot().items).toEqual([
      { productId: "olive", quantity: 5 },
      { productId: "oil", quantity: 1 },
    ]);
  });

  it("updates an existing quantity, removes at zero and removes by ID", () => {
    const store = createStore();
    store.addItem("olive", 4);
    store.addItem("oil", 2);
    store.setQuantity("olive", 1);
    expect(store.getSnapshot().items[0]).toEqual({ productId: "olive", quantity: 1 });

    store.setQuantity("olive", 0);
    expect(store.getSnapshot().items).toEqual([{ productId: "oil", quantity: 2 }]);
    store.removeItem("oil");
    store.removeItem("missing");
    expect(store.getSnapshot().items).toEqual([]);
  });

  it("clears all products and persists the empty cart", () => {
    const store = createStore();
    store.addItem("olive");
    store.addItem("oil");
    store.clear();

    expect(store.getSnapshot().items).toEqual([]);
    const refreshed = createStore();
    refreshed.hydrate();
    expect(refreshed.getSnapshot().items).toEqual([]);
  });

  it.each([0, -1, 1.5, NaN, Infinity, -Infinity, Number.MAX_SAFE_INTEGER + 1, "2", null])(
    "rejects invalid added quantity %s without changing the cart",
    (quantity) => {
      const store = createStore();
      store.addItem("olive", 1);
      const before = store.getSnapshot();
      const saved = localStorage.getItem(CART_STORAGE_KEY);

      expect(() => store.addItem("olive", quantity as number)).toThrow(RangeError);
      expect(store.getSnapshot()).toBe(before);
      expect(localStorage.getItem(CART_STORAGE_KEY)).toBe(saved);
    },
  );

  it.each([-1, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1, "2", null, undefined])(
    "rejects invalid replacement quantity %s",
    (quantity) => {
      const store = createStore();
      store.addItem("olive", 2);
      const before = store.getSnapshot();

      expect(() => store.setQuantity("olive", quantity as number)).toThrow(RangeError);
      expect(store.getSnapshot()).toBe(before);
    },
  );

  it.each(["missing", "sold-out", "", " ", "__proto__"])(
    "rejects unavailable product %s",
    (productId) => {
      const store = createStore();
      expect(() => store.addItem(productId)).toThrow(RangeError);
      expect(store.getSnapshot().items).toEqual([]);
    },
  );

  it("checks total accumulated quantity and replacement quantity against stock", () => {
    const store = createStore();
    expect(() => store.addItem("olive", 6)).toThrow(RangeError);
    store.addItem("olive", 4);
    const before = store.getSnapshot();

    expect(() => store.addItem("olive", 2)).toThrow(RangeError);
    expect(() => store.setQuantity("olive", 6)).toThrow(RangeError);
    expect(store.getSnapshot()).toBe(before);
  });

  it("does not insert an absent line through the quantity editor", () => {
    const store = createStore();
    expect(() => store.setQuantity("olive", 2)).toThrow(RangeError);
    store.setQuantity("missing", 0);
    expect(store.getSnapshot().items).toEqual([]);
  });

  it("reconciles decreased stock, sold-out and removed products with fresh catalog data", () => {
    const store = createStore();
    store.addItem("olive", 5);
    store.addItem("oil", 3);
    store.setProducts([{ id: "olive", stock: 2 }, { id: "oil", stock: 0 }]);
    expect(store.getSnapshot().items).toEqual([{ productId: "olive", quantity: 2 }]);
    expect(() => store.addItem("olive")).toThrow(RangeError);

    store.setProducts([{ id: "oil", stock: 4 }]);
    expect(store.getSnapshot().items).toEqual([]);
    expect(() => store.addItem("olive")).toThrow(RangeError);
    store.addItem("oil", 4);
    expect(store.getSnapshot().items).toEqual([{ productId: "oil", quantity: 4 }]);
  });

  it.each([-1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])(
    "treats invalid catalog stock %s as unavailable",
    (stock) => {
      const store = createCartStore({ products: [{ id: "olive", stock }], storage: null });
      expect(() => store.addItem("olive")).toThrow(RangeError);
    },
  );

  it("does not retain mutable references to catalog data or previous snapshots", () => {
    const catalog = [{ id: "olive", stock: 5 }];
    const store = createCartStore({ products: catalog, storage: null });
    catalog[0].stock = 0;
    store.addItem("olive", 2);
    const before = store.getSnapshot();
    expect(Object.isFrozen(before)).toBe(true);
    expect(Object.isFrozen(before.items)).toBe(true);
    expect(Object.isFrozen(before.items[0])).toBe(true);

    store.addItem("olive");
    expect(before.items).toEqual([{ productId: "olive", quantity: 2 }]);
    expect(store.getSnapshot().items[0].quantity).toBe(3);
  });

  it("notifies subscribers after changes and supports unsubscribe", () => {
    const store = createStore();
    store.hydrate();
    const observed: number[] = [];
    const unsubscribe = store.subscribe(() => {
      observed.push(store.getSnapshot().items[0]?.quantity ?? 0);
    });
    store.addItem("olive");
    store.setQuantity("olive", 3);
    store.removeItem("olive");
    unsubscribe();
    store.addItem("oil");

    expect(observed).toEqual([1, 3, 0]);
  });
});

describe("cart persistence and hydration", () => {
  it("restores ID and quantity after refresh and clamps against fresh stock", () => {
    const store = createStore();
    store.addItem("olive", 5);
    store.addItem("oil", 2);

    const refreshed = createCartStore({ products: [{ id: "olive", stock: 2 }], storage: localStorage });
    expect(refreshed.getSnapshot().items).toEqual([]);
    refreshed.hydrate();

    expect(refreshed.getSnapshot()).toEqual({
      items: [{ productId: "olive", quantity: 2 }], hydrated: true, storageError: false,
    });
  });

  it("hydrates once and reads existing storage before an early addition", () => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify([{ productId: "olive", quantity: 2 }]));
    const store = createStore();
    store.addItem("olive");
    const before = store.getSnapshot();
    localStorage.setItem(CART_STORAGE_KEY, "[]");
    store.hydrate();

    expect(store.getSnapshot()).toBe(before);
    expect(store.getSnapshot().items[0].quantity).toBe(3);
  });

  it.each(["setQuantity", "removeItem", "clear"] as const)(
    "hydrates before an early %s so stored lines are not lost",
    (action) => {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify([
        { productId: "olive", quantity: 2 }, { productId: "oil", quantity: 1 },
      ]));
      const store = createStore();
      if (action === "setQuantity") store.setQuantity("olive", 3);
      else if (action === "removeItem") store.removeItem("olive");
      else store.clear();

      const refreshed = createStore();
      refreshed.hydrate();
      const expected = action === "clear" ? [] : action === "removeItem"
        ? [{ productId: "oil", quantity: 1 }]
        : [{ productId: "olive", quantity: 3 }, { productId: "oil", quantity: 1 }];
      expect(refreshed.getSnapshot().items).toEqual(expected);
    },
  );

  it("persists and restores only whitelisted ID/quantity fields", () => {
    const catalog = [{ id: "olive", stock: 5, priceKurus: 1, email: "fixture@example.invalid" }];
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify([
      { productId: "olive", quantity: 2, priceKurus: 1, email: "fixture@example.invalid", cardNumber: "fixture" },
    ]));
    localStorage.setItem("unrelated", "preserve");
    const store = createCartStore({ products: catalog, storage: localStorage });
    store.hydrate();
    store.addItem("olive");

    const expected = [{ productId: "olive", quantity: 3 }];
    expect(store.getSnapshot().items).toEqual(expected);
    expect(JSON.parse(localStorage.getItem(CART_STORAGE_KEY)!)).toEqual(expected);
    store.clear();
    expect(localStorage.getItem("unrelated")).toBe("preserve");
  });

  it.each(["{broken", "null", "{}", "true", "42", '"text"', '[null, false, 3, "olive", {}]'])(
    "recovers from corrupt or invalid storage %s",
    (stored) => {
      localStorage.setItem(CART_STORAGE_KEY, stored);
      const store = createStore();
      expect(() => store.hydrate()).not.toThrow();
      expect(store.getSnapshot().items).toEqual([]);
      expect(JSON.parse(localStorage.getItem(CART_STORAGE_KEY)!)).toEqual([]);
      store.addItem("olive");
      expect(store.getSnapshot().items[0].quantity).toBe(1);
    },
  );

  it("filters invalid, deleted, sold-out and non-integer stored lines; merges duplicates", () => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify([
      { productId: "olive", quantity: 2 }, { productId: "olive", quantity: 4 },
      { productId: "oil", quantity: 0 }, { productId: "oil", quantity: -1 },
      { productId: "oil", quantity: 0.5 }, { productId: "oil", quantity: "2" },
      { productId: "oil", quantity: Number.MAX_SAFE_INTEGER + 1 },
      { productId: "missing", quantity: 1 }, { productId: "sold-out", quantity: 1 },
      { productId: 42, quantity: 1 }, { productId: "__proto__", quantity: 1 },
      { productId: "oil", quantity: 1 },
    ]));
    const store = createStore();
    store.hydrate();

    expect(store.getSnapshot().items).toEqual([
      { productId: "olive", quantity: 5 }, { productId: "oil", quantity: 1 },
    ]);
  });

  it("reads default localStorage lazily and keeps the SSR snapshot empty and stable", () => {
    const read = vi.spyOn(Storage.prototype, "getItem");
    const write = vi.spyOn(Storage.prototype, "setItem");
    const store = createCartStore({ products });
    const server = store.getServerSnapshot();
    expect(read).not.toHaveBeenCalled();
    expect(write).not.toHaveBeenCalled();
    store.hydrate();
    store.addItem("olive");

    expect(read).toHaveBeenCalledWith(CART_STORAGE_KEY);
    expect(store.getServerSnapshot()).toBe(server);
    expect(server).toEqual({ items: [], hydrated: false, storageError: false });
  });

  it("works without window during SSR and does not leak state between stores", () => {
    vi.stubGlobal("window", undefined);
    const store = createCartStore({ products });
    store.hydrate();
    store.addItem("olive");
    const other = createCartStore({ products });
    expect(store.getSnapshot().items).toEqual([{ productId: "olive", quantity: 1 }]);
    expect(other.getSnapshot().items).toEqual([]);
    expect(store.getSnapshot().storageError).toBe(false);
  });

  it("continues in memory when localStorage access is blocked", () => {
    vi.spyOn(window, "localStorage", "get").mockImplementation(() => { throw new Error("blocked"); });
    const store = createCartStore({ products });
    expect(() => store.addItem("olive")).not.toThrow();
    expect(store.getSnapshot().items[0].quantity).toBe(1);
    expect(store.getSnapshot().storageError).toBe(true);
  });

  it("continues in memory when reading storage throws", () => {
    const storage = { getItem: vi.fn(() => { throw new Error("read blocked"); }), setItem: vi.fn() };
    const store = createStore(storage);
    expect(() => store.hydrate()).not.toThrow();
    expect(store.getSnapshot().storageError).toBe(true);
    store.addItem("olive");
    expect(store.getSnapshot().items[0].quantity).toBe(1);
  });

  it("keeps edits on write failure, exposes the error and recovers when writing works", () => {
    const storage = {
      getItem: vi.fn(() => null),
      setItem: vi.fn<(key: string, value: string) => void>(() => { throw new Error("quota"); }),
    };
    const store = createStore(storage);
    store.addItem("olive", 2);
    expect(store.getSnapshot().items[0].quantity).toBe(2);
    expect(store.getSnapshot().storageError).toBe(true);

    storage.setItem.mockImplementation(() => undefined);
    store.setQuantity("olive", 3);
    expect(store.getSnapshot().storageError).toBe(false);
    expect(storage.setItem).toHaveBeenLastCalledWith(CART_STORAGE_KEY, JSON.stringify([{ productId: "olive", quantity: 3 }]));
  });
});
