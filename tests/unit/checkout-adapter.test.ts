import { afterEach, describe, expect, it, vi } from "vitest";
import { createCheckoutAdapter, createMockCheckoutAdapter, formatTrPhone, validateCheckoutDetails, type CheckoutDetails } from "@/lib/checkout/adapter";
import { getProducts } from "@/lib/catalog/static-products";

const details: CheckoutDetails = { name: "Deniz Sofra", email: "deniz@example.test", phone: "0532 123 45 67", city: "Osmaniye", district: "Düziçi", neighborhood: "Örnek Mahallesi", address: "Örnek Sokak No: 12", postalCode: "80700", billingType: "individual", company: "", taxNumber: "", taxOffice: "" };
afterEach(() => vi.unstubAllEnvs());

describe("checkout UI boundary", () => {
  it("requires explicit demo opt-in in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    for (const flag of [undefined, "0", "true"]) {
      vi.stubEnv("NEXT_PUBLIC_DEMO", flag);
      expect(createCheckoutAdapter()).toBeNull();
    }
    vi.stubEnv("NEXT_PUBLIC_DEMO", "1");
    expect(createCheckoutAdapter()).not.toBeNull();
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_DEMO", undefined);
    expect(createCheckoutAdapter()).not.toBeNull();
  });

  it("offers all provinces and their own districts offline", () => {
    const adapter = createMockCheckoutAdapter();
    const cities = adapter.provinces();
    expect(cities).toHaveLength(81);
    expect(new Set(cities).size).toBe(81);
    expect(cities.reduce((count, city) => count + adapter.districts(city).length, 0)).toBe(973);
    expect(adapter.districts("Osmaniye")).toContain("Düziçi");
    expect(adapter.districts("İstanbul")).toContain("Kadıköy");
    expect(adapter.districts("Ankara")).not.toContain("Kadıköy");
    expect(adapter.districts("Unknown")).toEqual([]);
  });

  it("validates contact, bounded text, postal code and city/district membership", () => {
    expect(validateCheckoutDetails(details)).toEqual({});
    const errors = validateCheckoutDetails({ ...details, name: " ", email: "bad", phone: "123", city: "Ankara", district: "Düziçi", neighborhood: "", address: "a".repeat(501), postalCode: "abcde" });
    expect(Object.keys(errors)).toEqual(expect.arrayContaining(["name", "email", "phone", "district", "neighborhood", "address", "postalCode"]));
    expect(validateCheckoutDetails({ ...details, city: "Unknown" }).city).toBeDefined();
    expect(validateCheckoutDetails({ ...details, billingType: "other" as "individual" }).billingType).toBeDefined();
    expect(formatTrPhone("+90 (532) 123-45-67")).toBe("0532 123 45 67");
    expect(formatTrPhone("5321234567")).toBe("0532 123 45 67");
    expect(formatTrPhone("0532")).toBe("0532");
    expect(validateCheckoutDetails({ ...details, phone: "+90 (532) 123-45-67" })).toEqual({});
  });

  it("requires company, ten digit VKN and tax office only for corporate billing", () => {
    const corporate = { ...details, billingType: "corporate" as const };
    expect(Object.keys(validateCheckoutDetails(corporate))).toEqual(["company", "taxNumber", "taxOffice"]);
    expect(validateCheckoutDetails({ ...corporate, company: "Örnek AŞ", taxNumber: "1234567890", taxOffice: "Düziçi" })).toEqual({});
    expect(validateCheckoutDetails({ ...details, taxNumber: "bad" })).toEqual({});
  });

  it("never invents shipping price or a final payable total, including invalid or missing catalog", async () => {
    const adapter = createMockCheckoutAdapter();
    const products = await getProducts();
    expect(adapter.shippingOptions()).toEqual([{ id: "standard", name: "Standart kargo", description: "Ücret ödeme adımında", priceKurus: null }]);
    const summary = adapter.summary([{ productId: "sample-table-olive", quantity: 2 }], products);
    expect(summary.subtotalKurus).toBe(25100);
    expect(summary.finalTotalKurus).toBeNull();
    expect(summary.lines[0].quantity).toBe(2);
    expect(summary.ready).toBe(true);
    for (const items of [[], [{ productId: "unknown", quantity: 1 }], [{ productId: "sample-table-olive", quantity: 99 }], [{ productId: "sample-table-olive", quantity: -1 }]]) {
      expect(adapter.summary(items, products).ready).toBe(false);
    }
    expect(adapter.summary([{ productId: "sample-table-olive", quantity: 2 }], null).subtotalKurus).toBeNull();
  });
});
