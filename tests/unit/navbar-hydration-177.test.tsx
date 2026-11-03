import { act, fireEvent } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { hydrateRoot, type Root } from "react-dom/client";
import type { ComponentProps } from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { Navbar } from "@/components/site/Navbar";

const route = vi.hoisted(() => ({ pathname: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => route.pathname }));
vi.mock("next/link", () => ({ default: (props: ComponentProps<"a">) => <a {...props} /> }));
vi.mock("next/dynamic", () => ({ default: () => () => null }));
vi.mock("@/components/cart/CartProvider", () => ({ useCart: () => null }));
vi.mock("@/components/account/MembershipDialogProvider", () => ({ useMembershipDialog: () => null }));
vi.mock("@/lib/media/use-deferred-enhancement", () => ({ usePrefersReducedMotion: () => true }));
vi.mock("@/components/ui/liquid-glass-navbar", () => ({
  NimbusIcons: {},
  LiquidNavbar: ({ active, items }: { active: number; items: { label: string; href: string }[] }) => <nav aria-label="Ana navigasyon">
    {items.map((item, index) => <a key={item.href} href={item.href} aria-current={index === active ? "location" : undefined}>{item.label}</a>)}
  </nav>,
}));

let root: Root | undefined;
let container: HTMLDivElement;
beforeEach(() => {
  container = document.createElement("div");
  document.body.append(container);
  vi.stubGlobal("requestAnimationFrame", vi.fn(() => 1));
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
});
afterEach(async () => {
  if (root) await act(async () => root?.unmount());
  root = undefined;
  container.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  history.replaceState(null, "", "/");
});

it.each([
  ["/index", "/", "glass"],
  ["/", "/", "glass"],
  ["/kvkk", "/kvkk", "solid"],
  ["/hesabim", "/hesabim", "solid"],
] as const)("hydrates the %s prerender at %s without leaving stale header attributes", async (serverPath, browserPath, tone) => {
  // Vercel's live / HTML carries RSC canonical segments ["", "index"].
  // Next initializes the browser router from location.href, so hydration's
  // usePathname is / instead. Client-only renders cannot reproduce this bug.
  history.replaceState(null, "", browserPath);
  route.pathname = serverPath;
  container.innerHTML = renderToString(<Navbar />);
  const serverHeader = container.querySelector("header")!;
  const serverTone = serverHeader.getAttribute("data-tone");
  route.pathname = browserPath;
  const recoverable = vi.fn();
  const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  await act(async () => { root = hydrateRoot(container, <Navbar />, { onRecoverableError: recoverable }); });

  expect(container.querySelector("header")).toBe(serverHeader);
  expect(serverHeader.getAttribute("data-tone")).toBe(tone);
  expect(serverHeader.getAttribute("data-over-hero")).toBe(String(tone === "glass"));
  expect(serverTone).toBe(tone); // The no-JS/SSR result must also be correct.
  expect(container.querySelector('[aria-current="location"]')?.textContent).toBe(tone === "glass" ? "Ana Sayfa" : undefined);
  expect(recoverable).not.toHaveBeenCalled();
  expect(consoleError).not.toHaveBeenCalled();

  fireEvent.resize(window);
  fireEvent.scroll(window);
  expect(serverHeader.getAttribute("data-tone")).toBe(tone);
});
