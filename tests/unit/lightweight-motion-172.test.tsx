import { act, cleanup, renderHook } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, expect, it, vi } from "vitest";
import { useLightweightMotion } from "@/lib/media/use-lightweight-motion";

afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

function policy({ reduced = false, saveData = false, cores = 8, connectionAvailable = true } = {}) {
  const mediaListeners = new Set<() => void>();
  const connectionListeners = new Set<() => void>();
  const connection = {
    saveData,
    addEventListener: (_: string, notify: () => void) => connectionListeners.add(notify),
    removeEventListener: (_: string, notify: () => void) => connectionListeners.delete(notify),
  };
  vi.stubGlobal("navigator", { hardwareConcurrency: cores, ...(connectionAvailable ? { connection } : {}) });
  vi.stubGlobal("matchMedia", () => ({
    get matches() { return reduced; },
    addEventListener: (_: string, notify: () => void) => mediaListeners.add(notify),
    removeEventListener: (_: string, notify: () => void) => mediaListeners.delete(notify),
  }));
  return {
    reduced(next: boolean) { act(() => { reduced = next; mediaListeners.forEach(notify => notify()); }); },
    saveData(next: boolean) { act(() => { connection.saveData = next; connectionListeners.forEach(notify => notify()); }); },
    listeners: () => mediaListeners.size + connectionListeners.size,
  };
}

it("keeps server HTML static even when the current client could animate", () => {
  policy();
  function Probe() { return <span>{String(useLightweightMotion())}</span>; }
  expect(renderToStaticMarkup(<Probe />)).toBe("<span>false</span>");
});

it.each([
  [{ cores: 4 }, true], [{ cores: 8 }, true], [{ cores: 2 }, false],
  [{ reduced: true }, false], [{ saveData: true }, false],
  [{ connectionAvailable: false }, true],
] as const)("uses optional motion only when resources and preferences permit: %j", (options, expected) => {
  policy(options);
  const { result } = renderHook(useLightweightMotion);
  expect(result.current).toBe(expected);
});

it("reacts to both preferences in either direction and removes every subscription", () => {
  const settings = policy();
  const { result, unmount } = renderHook(useLightweightMotion);
  expect(result.current).toBe(true);
  settings.saveData(true); expect(result.current).toBe(false);
  settings.reduced(true);
  settings.saveData(false); expect(result.current).toBe(false);
  settings.reduced(false); expect(result.current).toBe(true);
  expect(settings.listeners()).toBeGreaterThan(0);
  unmount(); expect(settings.listeners()).toBe(0);
});
