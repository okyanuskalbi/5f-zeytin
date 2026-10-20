import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import TrackingPage from "@/app/siparis-takip/page";
import { Tracking } from "@/components/orders/Tracking";
import { createMockAuthAdapter } from "@/lib/auth/adapter";
import { createMockAccountAdapter } from "@/lib/account/adapter";
import { createMockTrackingAdapter, createDemoAttemptLimiter, isTrackingDemoEnabled, validateTrackingQuery } from "@/lib/orders/tracking-adapter";

describe("tracking demo boundary and matching", () => {
  beforeEach(() => sessionStorage.clear());
  afterEach(() => vi.unstubAllEnvs());

  it("mounts the tracking client only with production demo opt-in", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_DEMO", "1");
    expect(TrackingPage().props.children.type).toBe(Tracking);
    vi.stubEnv("NEXT_PUBLIC_DEMO", "0");
    expect(TrackingPage().props.title).toBe("Sipariş takibi");
  });

  it("requires explicit production opt-in and validates bounded order/contact fields", () => {
    expect(isTrackingDemoEnabled("production", undefined)).toBe(false);
    expect(isTrackingDemoEnabled("production", "0")).toBe(false);
    expect(isTrackingDemoEnabled("production", "1")).toBe(true);
    expect(isTrackingDemoEnabled("test", undefined)).toBe(true);
    expect(validateTrackingQuery({ no: "<script>", contact: "12345" })).toEqual({ no: expect.any(String), contact: expect.any(String) });
    expect(validateTrackingQuery({ no: "DEMO-10801", contact: "4567" })).toEqual({});
    expect(validateTrackingQuery({ no: "DEMO-10801", contact: "demo@example.test" })).toEqual({});
  });

  it("returns the same not-found for unknown numbers and mismatched contacts; never trusts no alone", async () => {
    const adapter = createMockTrackingAdapter(createMockAuthAdapter(sessionStorage));
    const responses = await Promise.all([
      adapter.lookup({ no: "DEMO-10801", contact: "other@example.test" }),
      adapter.lookup({ no: "DEMO-00000", contact: "demo@example.test" }),
      adapter.getOwnOrder("DEMO-10801"),
    ]);
    expect(responses).toEqual([{ kind: "not-found" }, { kind: "not-found" }, { kind: "not-found" }]);
  });

  it("supports three distinct journeys, masks at the adapter boundary and returns isolated snapshots", async () => {
    const adapter = createMockTrackingAdapter(createMockAuthAdapter(sessionStorage));
    for (const [no, status, count] of [["DEMO-10902", "preparing", 3], ["DEMO-10801", "shipped", 4], ["DEMO-10800", "delivered", 6]] as const) {
      const result = await adapter.lookup({ no, contact: " DEMO@example.test " });
      expect(result.kind).toBe("found");
      if (result.kind !== "found") throw new Error("Expected a demo order");
      expect(result.order.status).toBe(status);
      expect(result.order.events.filter(event => event.at)).toHaveLength(count);
      expect(result.order.deliveryAddress).toContain("***");
      expect(result.order.items.reduce((sum, item) => sum + item.quantity * item.unitPriceKurus, 0)).toBe(result.order.amountKurus);
      result.order.items[0].name = "changed";
      expect(JSON.stringify(await adapter.lookup({ no, contact: "4567" }))).not.toContain("changed");
    }
  });

  it("allows only the current demo owner's account orders and rechecks sign-out", async () => {
    const auth = createMockAuthAdapter(sessionStorage);
    const adapter = createMockTrackingAdapter(auth);
    await auth.signInWithGoogle();
    for (const order of await createMockAccountAdapter(auth, sessionStorage).listOrders()) {
      const result = await adapter.getOwnOrder(order.no);
      expect(result.kind).toBe("found");
      if (result.kind === "found") expect(result.order.amountKurus).toBe(order.amountKurus);
    }
    await auth.signOut();
    expect(await adapter.getOwnOrder("DEMO-10801")).toEqual({ kind: "not-found" });
    await auth.signUp({ name: "Other User", email: "other@example.test", password: "Sofrada123!", privacy: true, consent: true, marketing: false });
    expect(await adapter.getOwnOrder("DEMO-10801")).toEqual({ kind: "not-found" });
  });

  it("limits attempts across changed order numbers and reloads, then recovers after the window", async () => {
    let now = 0;
    const auth = createMockAuthAdapter(sessionStorage);
    const limiter = () => createDemoAttemptLimiter(sessionStorage, () => now);
    const adapter = createMockTrackingAdapter(auth, limiter());
    for (let i = 0; i < 5; i++) expect((await adapter.lookup({ no: `DEMO-0000${i}`, contact: "4567" })).kind).toBe("not-found");
    const reloaded = createMockTrackingAdapter(auth, limiter());
    expect(await reloaded.lookup({ no: "DEMO-10801", contact: "4567" })).toEqual({ kind: "rate-limited", retryAfterSeconds: 60 });
    now = 60_001;
    expect((await reloaded.lookup({ no: "DEMO-10801", contact: "4567" })).kind).toBe("found");
  });
});
