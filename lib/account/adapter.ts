import { MembershipError, type AuthAdapter, type DemoStorage, type Session } from "@/lib/auth/adapter";

export type AddressInput = { title: string; recipient: string; phone: string; city: string; district: string; line: string; postalCode: string };
export type Address = AddressInput & { id: string; isDefault: boolean };
export type AccountOrder = { no: string; date: string; amountKurus: number; status: "Hazırlanıyor" | "Kargoya verildi" | "Teslim edildi" };
export interface AccountAdapter {
  getProfile(): Promise<Session>;
  updateProfile(input: Pick<Session, "name" | "phone">): Promise<Session>;
  listAddresses(): Promise<Address[]>;
  saveAddress(input: AddressInput & { id?: string }): Promise<Address>;
  deleteAddress(id: string): Promise<void>;
  setDefaultAddress(id: string): Promise<void>;
  listOrders(): Promise<AccountOrder[]>;
}

function validPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return /^[+\d\s()-]{10,20}$/.test(phone) && digits.length >= 10 && digits.length <= 15;
}

export function validateAddress(input: AddressInput): Record<string, string> {
  const fields: Record<string, string> = {};
  const labels = { title: "Adres başlığı", recipient: "Alıcı", city: "İl", district: "İlçe", line: "Açık adres" } as const;
  for (const key of Object.keys(labels) as (keyof typeof labels)[]) if (input[key].trim().length < 2 || input[key].length > (key === "line" ? 500 : 100)) fields[key] = `${labels[key]} alanını doldurun (en az 2 karakter).`;
  if (!validPhone(input.phone)) fields.phone = "Geçerli bir telefon numarası girin.";
  if (!/^\d{5}$/.test(input.postalCode)) fields.postalCode = "5 haneli posta kodunu girin.";
  return fields;
}

type AccountData = { profile: Session; addresses: Address[] };

/** Per-demo-user UI data. Never used by a server or checkout as identity/address authority. */
export function createMockAccountAdapter(auth: AuthAdapter, storage: DemoStorage): AccountAdapter {
  async function read(): Promise<{ key: string; data: AccountData }> {
    const session = await auth.getSession();
    if (!session) throw new MembershipError("Hesabınızı görmek için giriş yapın.");
    const key = `afina:membership:demo-account:${session.id}`;
    try {
      const data: AccountData = JSON.parse(storage.getItem(key) ?? "null");
      if (data?.profile?.id === session.id && typeof data.profile.name === "string" && typeof data.profile.phone === "string" && data.profile.email === session.email && Array.isArray(data.addresses) && data.addresses.every(a => typeof a.id === "string" && typeof a.isDefault === "boolean" && [a.title, a.recipient, a.phone, a.city, a.district, a.line, a.postalCode].every(v => typeof v === "string"))) return { key, data };
    } catch { /* Corrupt demo data gets an empty UI, never a privileged session. */ }
    return { key, data: { profile: session, addresses: [] } };
  }
  function save(key: string, data: AccountData): void { storage.setItem(key, JSON.stringify(data)); }
  return {
    async getProfile() { return (await read()).data.profile; },
    async updateProfile(input) {
      const fields: Record<string, string> = {};
      if (input.name.trim().length < 2 || input.name.trim().length > 100) fields.name = "Ad soyad 2–100 karakter olmalı.";
      if (input.phone && !validPhone(input.phone)) fields.phone = "Geçerli bir telefon numarası girin.";
      if (Object.keys(fields).length) throw new MembershipError("Lütfen alanları kontrol edin.", fields);
      const { key, data } = await read();
      data.profile = { ...data.profile, name: input.name.trim(), phone: input.phone.trim() };
      save(key, data);
      return data.profile;
    },
    async listAddresses() { return (await read()).data.addresses; },
    async saveAddress(input) {
      const fields = validateAddress(input);
      if (Object.keys(fields).length) throw new MembershipError("Lütfen adres alanlarını kontrol edin.", fields);
      const { key, data } = await read();
      const existing = input.id ? data.addresses.find(a => a.id === input.id) : undefined;
      if (input.id && !existing) throw new MembershipError("Adres bulunamadı.");
      if (!existing && data.addresses.length >= 20) throw new MembershipError("Demo için en fazla 20 adres eklenebilir.");
      const address: Address = { title: input.title.trim(), recipient: input.recipient.trim(), phone: input.phone.trim(), city: input.city.trim(), district: input.district.trim(), line: input.line.trim(), postalCode: input.postalCode, id: existing?.id ?? crypto.randomUUID(), isDefault: existing?.isDefault ?? data.addresses.length === 0 };
      data.addresses = existing ? data.addresses.map(a => a.id === address.id ? address : a) : [...data.addresses, address];
      save(key, data);
      return address;
    },
    async deleteAddress(id) {
      const { key, data } = await read();
      if (!data.addresses.some(a => a.id === id)) throw new MembershipError("Adres bulunamadı.");
      data.addresses = data.addresses.filter(a => a.id !== id);
      if (data.addresses.length && !data.addresses.some(a => a.isDefault)) data.addresses[0].isDefault = true;
      save(key, data);
    },
    async setDefaultAddress(id) {
      const { key, data } = await read();
      if (!data.addresses.some(a => a.id === id)) throw new MembershipError("Adres bulunamadı.");
      data.addresses = data.addresses.map(a => ({ ...a, isDefault: a.id === id }));
      save(key, data);
    },
    async listOrders() {
      const { data } = await read();
      return data.profile.id === "demo-google" ? [
        { no: "DEMO-10801", date: "2026-10-20", amountKurus: 125000, status: "Kargoya verildi" },
        { no: "DEMO-10800", date: "2026-10-10", amountKurus: 89000, status: "Teslim edildi" },
      ] : [];
    },
  };
}
