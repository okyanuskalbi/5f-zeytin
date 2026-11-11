import { describe, expect, it } from "vitest";
import { createDealershipDraft, dealershipSchema, type DealershipInput } from "@/lib/dealership/application";

const valid: DealershipInput = {
  companyName: "Ellek & Sofra #1", contactName: "Çağrı Öztürk", phoneCountry: "TR", phoneNational: "5321234567",
  email: "cagri+bayi@example.com", city: "Osmaniye", district: "Düziçi", businessType: "Market", outletCount: "2–5",
  message: "İlk satır: zeytin & zeytinyağı?\nİkinci satır #başvuru %100", consent: true,
};

describe("bayilik başvuru şeması", () => {
  it("accepts all required fields and normalizes whitespace and phone", () => {
    const result = dealershipSchema.safeParse({ ...valid, companyName: "  Ellek & Sofra #1  " });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.companyName).toBe(valid.companyName);
    expect(result.data.phone).toBe("+90 532 123 45 67");
  });
  it("reports each missing required field, including consent", () => {
    const result = dealershipSchema.safeParse({ companyName: "", contactName: "", phoneCountry: "TR", phoneNational: "", email: "", city: "", district: "", businessType: "", outletCount: "", message: "", consent: false });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(Object.keys(result.errors)).toEqual(["companyName", "contactName", "phone", "email", "city", "district", "businessType", "consent"]);
  });
  it.each(["bad", "a@", "a@b", "a b@example.com", "a@example.com\r\nBcc:a@evil.com"])("rejects invalid email %s", email => {
    const result = dealershipSchema.safeParse({ ...valid, email });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.errors.email).toBeTruthy();
  });
  it.each(["123", "1111111111", "905321234567"])("rejects invalid/duplicated-code phone %s", phoneNational => {
    const result = dealershipSchema.safeParse({ ...valid, phoneNational });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.errors.phone).toBeTruthy();
  });
  it("rejects unknown country, unchecked consent, unsupported business type and outlet count", () => {
    const result = dealershipSchema.safeParse({ ...valid, phoneCountry: "XX", consent: false, businessType: "unsupported", outletCount: "20" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.errors).toMatchObject({ phone: expect.any(String), consent: expect.any(String), businessType: expect.any(String), outletCount: expect.any(String) });
  });
  it("allows optional message/count and enforces the exact 1000 character boundary", () => {
    expect(dealershipSchema.safeParse({ ...valid, message: "", outletCount: "" }).success).toBe(true);
    expect(dealershipSchema.safeParse({ ...valid, message: "x".repeat(1000) }).success).toBe(true);
    const result = dealershipSchema.safeParse({ ...valid, message: "x".repeat(1001) });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.errors.message).toContain("1000");
  });
  it("encodes subject/body separately without query injection, retaining all rows", () => {
    const result = dealershipSchema.safeParse(valid);
    if (!result.success) throw Error("fixture invalid");
    const draft = createDealershipDraft(result.data);
    expect(draft.subject).toBe("Bayilik başvurusu - Ellek & Sofra #1");
    expect(draft.mailto).toBe(`mailto:info@afina.com.tr?subject=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(draft.body)}`);
    const url = new URL(draft.mailto);
    expect([...url.searchParams.keys()]).toEqual(["subject", "body"]);
    expect(url.searchParams.get("body")).toBe(draft.body);
    for (const text of [valid.companyName, valid.contactName, valid.email, "Osmaniye", "Düziçi", "Market", "2-5", valid.message.replace(/\n/g, "\r\n"), "+90 532 123 45 67", "KVKK"]) expect(draft.body).toContain(text);
  });
  it("keeps line breaks out of single-line fields and lists optional omissions", () => {
    const result = dealershipSchema.safeParse({ ...valid, companyName: "Ellek\r\n& Sofra", outletCount: "", message: "" });
    if (!result.success) throw Error("fixture invalid");
    const draft = createDealershipDraft(result.data);
    expect(draft.subject).toBe("Bayilik başvurusu - Ellek & Sofra");
    expect(draft.body).toContain("Satış noktası sayısı: Belirtilmedi");
    expect(draft.body).toContain("Mesaj: Belirtilmedi");
  });
});
