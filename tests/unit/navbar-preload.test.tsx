import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  loader: undefined as undefined | (() => Promise<unknown>),
  menuExport: vi.fn(),
}));

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));
vi.mock("next/link", () => ({ default: (props: ComponentProps<"a">) => <a {...props} /> }));
vi.mock("next/dynamic", () => ({
  default: (loader: () => Promise<unknown>) => { state.loader = loader; return () => null; },
}));
vi.mock("@/components/site/NavbarMenu", () => ({
  get NavbarMenu() { state.menuExport(); return () => null; },
}));
vi.mock("@/lib/media/use-deferred-enhancement", () => ({ usePrefersReducedMotion: () => true }));
vi.mock("motion/react", async importOriginal => ({
  ...await importOriginal<typeof import("motion/react")>(),
  useScroll: () => ({ scrollY: null }),
  useMotionValueEvent: () => {},
}));

let idleCallback: IdleRequestCallback | undefined;
const requestIdle = vi.fn((callback: IdleRequestCallback) => { idleCallback = callback; return 7; });
const cancelIdle = vi.fn();

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  vi.useFakeTimers();
  idleCallback = undefined;
  state.loader = undefined;
  vi.spyOn(document, "readyState", "get").mockReturnValue("complete");
  vi.stubGlobal("requestIdleCallback", requestIdle);
  vi.stubGlobal("cancelIdleCallback", cancelIdle);
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

async function renderNavbar() {
  const { Navbar } = await import("@/components/site/Navbar");
  return render(<Navbar />);
}

async function settleImport(): Promise<void> {
  await act(async () => { await vi.dynamicImportSettled(); });
}

function runIdle(): void {
  idleCallback?.({ didTimeout: false, timeRemaining: () => 50 });
}

describe("Navbar menu preloading", () => {
  it.each(["pointerEnter", "focus", "touchStart"] as const)("preloads on %s without opening, then reuses one import for every trigger and dynamic()", async event => {
    await renderNavbar();
    const trigger = screen.getByRole("button", { name: "Menüyü aç" });
    expect(state.menuExport).not.toHaveBeenCalled();

    fireEvent[event](trigger);
    await settleImport();
    expect(state.menuExport).toHaveBeenCalledTimes(1);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");

    fireEvent.pointerEnter(trigger);
    fireEvent.focus(trigger);
    fireEvent.touchStart(trigger);
    act(runIdle);
    const loaded = state.loader!();
    expect(state.loader!()).toBe(loaded);
    await loaded;
    await settleImport();
    expect(state.menuExport).toHaveBeenCalledTimes(1);
  });

  it("waits for page load before scheduling an idle preload", async () => {
    vi.spyOn(document, "readyState", "get").mockReturnValue("loading");
    await renderNavbar();
    expect(requestIdle).not.toHaveBeenCalled();
    expect(state.menuExport).not.toHaveBeenCalled();

    fireEvent.load(window);
    expect(requestIdle).toHaveBeenCalledTimes(1);
    act(runIdle);
    await settleImport();
    expect(state.menuExport).toHaveBeenCalledTimes(1);
  });

  it("preloads at idle when the page has already loaded", async () => {
    await renderNavbar();
    expect(requestIdle).toHaveBeenCalledTimes(1);
    expect(state.menuExport).not.toHaveBeenCalled();
    act(runIdle);
    await settleImport();
    expect(state.menuExport).toHaveBeenCalledTimes(1);
  });

  it("uses the 2000ms fallback when requestIdleCallback is unavailable", async () => {
    vi.stubGlobal("requestIdleCallback", undefined);
    await renderNavbar();
    act(() => vi.advanceTimersByTime(1999));
    expect(state.menuExport).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1));
    await settleImport();
    expect(state.menuExport).toHaveBeenCalledTimes(1);
  });

  it("cancels the idle callback on unmount", async () => {
    const view = await renderNavbar();
    view.unmount();
    expect(cancelIdle).toHaveBeenCalledExactlyOnceWith(7);
    expect(state.menuExport).not.toHaveBeenCalled();
  });

  it("removes the load listener on unmount", async () => {
    vi.spyOn(document, "readyState", "get").mockReturnValue("loading");
    const view = await renderNavbar();
    view.unmount();
    fireEvent.load(window);
    expect(requestIdle).not.toHaveBeenCalled();
    expect(state.menuExport).not.toHaveBeenCalled();
  });

  it("cancels the fallback timer on unmount", async () => {
    vi.stubGlobal("requestIdleCallback", undefined);
    const view = await renderNavbar();
    view.unmount();
    act(() => vi.advanceTimersByTime(2000));
    await settleImport();
    expect(state.menuExport).not.toHaveBeenCalled();
  });
});
