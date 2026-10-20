import { describe, expect, it } from "vitest";
import { validateWholesaleRequest } from "@/lib/contracts/wholesale";

const valid = { name: "Örnek Firma", email: "talep@example.test", phone: "", message: "Zeytin için bilgi rica ederim." };

describe("wholesale client contract", () => {
  it("trims values and accepts either email or phone without marketing consent", () => {
    expect(validateWholesaleRequest({ ...valid, name: "  Örnek Firma  " })).toEqual({ ok: true, data: valid });
    expect(validateWholesaleRequest({ ...valid, email: "", phone: "+90 (555) 123 45 67" }).ok).toBe(true);
    expect(validateWholesaleRequest({ ...valid, phone: "5551234567" }).ok).toBe(true);
  });
  it("requires name, message and at least one contact method", () => {
    const result = validateWholesaleRequest({ name: " ", email: "", phone: "", message: " " });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(Object.keys(result.errors)).toEqual(["name", "email", "phone", "message"]);
  });
  it.each([
    ["name", "a"], ["name", "a".repeat(121)], ["email", "bad@"], ["email", "a@b.test\r\nBcc: x@y.test"],
    ["email", `${"a".repeat(250)}@b.test`], ["phone", "letters"], ["phone", "123456"],
    ["phone", "1".repeat(16)], ["phone", " ".repeat(10) + "1".repeat(31)], ["message", "short"], ["message", "a".repeat(2001)],
  ])("rejects invalid or oversized %s even when another contact method is valid", (field, value) => {
    const result = validateWholesaleRequest({ ...valid, [field]: value });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors).toHaveProperty(field);
  });
  it("accepts exact length boundaries", () => {
    expect(validateWholesaleRequest({ ...valid, name: "ab", message: "a".repeat(10) }).ok).toBe(true);
    expect(validateWholesaleRequest({ ...valid, name: "a".repeat(120), message: "a".repeat(2000) }).ok).toBe(true);
    expect(validateWholesaleRequest({ ...valid, email: `${"a".repeat(247)}@b.test` }).ok).toBe(true);
    expect(validateWholesaleRequest({ ...valid, phone: "1".repeat(15) }).ok).toBe(true);
  });
});
