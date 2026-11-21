import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";

const path = vi.hoisted(() => ({ value: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => path.value }));

let idle: (() => void) | null;
let storageTouched: boolean;
beforeEach(async () => {
  vi.resetModules();
  idle = null; storageTouched = false;
  path.value = "/";
  vi.stubGlobal("requestIdleCallback", vi.fn((callback: () => void) => { idle = callback; return 1; }));
  vi.stubGlobal("cancelIdleCallback", vi.fn());
  Object.defineProperty(window, "localStorage", { configurable: true, get: () => { storageTouched = true; throw new Error("no storage"); } });
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });
const mount = async () => { const { VisitBeacon } = await import("@/components/site/VisitBeacon"); return render(<VisitBeacon />); };

describe("VisitBeacon", () => {
  it("renders nothing, waits for idle before sending, and sends once with keepalive and no credentials", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(null, { status: 204 })); vi.stubGlobal("fetch", fetcher);
    const view = await mount();
    expect(view.container.innerHTML).toBe("");
    expect(fetcher).not.toHaveBeenCalled();
    idle?.();
    expect(fetcher).toHaveBeenCalledOnce();
    const [url, init] = fetcher.mock.calls[0];
    expect(url).toBe("/api/visit");
    expect(init).toMatchObject({ method: "POST", keepalive: true, credentials: "omit" });
    expect(Object.keys(JSON.parse(init.body)).sort()).toEqual(["path", "ref", "uc", "um", "us"]);
    expect(document.cookie).toBe("");
    expect(storageTouched).toBe(false);
  });
  it("swallows network failures silently", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    await mount();
    expect(() => idle?.()).not.toThrow();
    await Promise.resolve();
  });
  it("does not send for excluded paths, DNT or GPC", async () => {
    const fetcher = vi.fn(); vi.stubGlobal("fetch", fetcher);
    path.value = "/panel/urunler";
    await mount(); expect(idle).toBeNull(); cleanup();
    path.value = "/blog";
    vi.stubGlobal("navigator", { ...navigator, doNotTrack: "1" });
    await mount(); expect(idle).toBeNull(); cleanup();
    vi.stubGlobal("navigator", { ...navigator, doNotTrack: null, globalPrivacyControl: true });
    await mount(); expect(idle).toBeNull();
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("is mounted in the root layout after the page content and uses no cookie or storage APIs", () => {
    const layout = readFileSync("app/layout.tsx", "utf8");
    expect(layout.indexOf("<VisitBeacon />")).toBeGreaterThan(layout.indexOf("<StoreFooter />"));
    const source = readFileSync("components/site/VisitBeacon.tsx", "utf8");
    expect(source).not.toMatch(/document\.cookie|localStorage|sessionStorage|sendBeacon/);
    expect(source).toMatch(/requestIdleCallback/);
  });
});
