import { createMockAuthAdapter, isMembershipDemoEnabled, type AuthAdapter, type DemoStorage } from "./adapter";
import { createMockAccountAdapter, type AccountAdapter } from "@/lib/account/adapter";

let adapters: { auth: AuthAdapter; account: AccountAdapter } | undefined;

export function getMembershipAdapters() {
  if (!isMembershipDemoEnabled() || typeof window === "undefined") throw new Error("Membership demo is disabled.");
  if (!adapters) {
    const memory = new Map<string, string>();
    // Storage-denied browsers retain a working in-memory demo for this page.
    const storage: DemoStorage = {
      getItem(key) { try { return window.sessionStorage.getItem(key) ?? memory.get(key) ?? null; } catch { return memory.get(key) ?? null; } },
      setItem(key, value) { memory.set(key, value); try { window.sessionStorage.setItem(key, value); } catch { /* memory fallback */ } },
      removeItem(key) { memory.delete(key); try { window.sessionStorage.removeItem(key); } catch { /* memory fallback */ } },
    };
    const auth = createMockAuthAdapter(storage);
    adapters = { auth, account: createMockAccountAdapter(auth, storage) };
  }
  return adapters;
}
