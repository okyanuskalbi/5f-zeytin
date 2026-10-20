import { beforeEach, describe, expect, it } from "vitest";
import { createMockAuthAdapter, isMembershipDemoEnabled } from "@/lib/auth/adapter";
import { createMockAccountAdapter } from "@/lib/account/adapter";

describe("membership demo boundary", () => {
  it("requires an explicit production opt-in", () => {
    expect(isMembershipDemoEnabled("production", undefined)).toBe(false);
    expect(isMembershipDemoEnabled("production", "true")).toBe(false);
    expect(isMembershipDemoEnabled("production", "1")).toBe(true);
    expect(isMembershipDemoEnabled("test", undefined)).toBe(true);
    expect(isMembershipDemoEnabled("development", undefined)).toBe(true);
  });
});

describe("isolated mock adapters", () => {
  beforeEach(() => sessionStorage.clear());

  it("validates registration, separates consents, signs in and never persists passwords", async () => {
    const auth = createMockAuthAdapter(sessionStorage);
    const registration = { name: "Deniz Test", email: "deniz@example.test", password: "Sofrada123!", privacy: true, consent: true, marketing: false };
    await expect(auth.signUp({ ...registration, privacy: false })).rejects.toMatchObject({ fields: { privacy: expect.any(String) } });
    await expect(auth.signUp({ ...registration, consent: false })).rejects.toMatchObject({ fields: { consent: expect.any(String) } });
    await expect(auth.signUp({ ...registration, email: "bad", password: "12" })).rejects.toMatchObject({ fields: { email: expect.any(String), password: expect.any(String) } });
    const session = await auth.signUp(registration);
    expect(session.email).toBe(registration.email);
    expect(JSON.stringify(sessionStorage)).not.toContain(registration.password);
    await auth.signOut();
    expect(await auth.getSession()).toBeNull();
    await expect(auth.signInWithEmail({ email: registration.email, password: "Wrong123!" })).rejects.toThrow();
    expect((await auth.signInWithEmail(registration)).id).toBe(session.id);
    expect((await auth.resetPassword(registration.email)).message).toContain("e-posta gönderilmedi");
  });

  it("isolates address ownership and keeps exactly one default after CRUD", async () => {
    const auth = createMockAuthAdapter(sessionStorage);
    const account = createMockAccountAdapter(auth, sessionStorage);
    await expect(account.listAddresses()).rejects.toThrow();
    await auth.signInWithGoogle();
    const address = { title: "Ev", recipient: "Deniz Test", phone: "05321234567", city: "Osmaniye", district: "Düziçi", line: "Örnek Mahallesi 12", postalCode: "80700" };
    await expect(account.saveAddress({ ...address, phone: "----------" })).rejects.toMatchObject({ fields: { phone: expect.any(String) } });
    await expect(account.updateProfile({ name: "Deniz Test", phone: "(        )" })).rejects.toMatchObject({ fields: { phone: expect.any(String) } });
    const first = await account.saveAddress(address);
    const second = await account.saveAddress({ ...address, title: "İş" });
    await account.setDefaultAddress(second.id);
    expect((await account.listAddresses()).filter(a => a.isDefault).map(a => a.id)).toEqual([second.id]);
    await account.saveAddress({ ...second, title: "Ofis" });
    await account.deleteAddress(second.id);
    expect(await account.listAddresses()).toEqual([expect.objectContaining({ id: first.id, isDefault: true })]);
    await auth.signOut();
    await auth.signUp({ name: "Başka Kişi", email: "other@example.test", password: "Sofrada123!", privacy: true, consent: true, marketing: false });
    expect(await account.listAddresses()).toEqual([]);
    await expect(account.deleteAddress(first.id)).rejects.toThrow();
  });
});
