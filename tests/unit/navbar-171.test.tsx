import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { useInsertionEffect, type ComponentProps } from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { Navbar } from "@/components/site/Navbar";

const route = vi.hoisted(() => ({ pathname: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => route.pathname }));
vi.mock("next/link", () => ({ default: (props: ComponentProps<"a">) => <a {...props} /> }));
vi.mock("next/dynamic", () => ({ default: () => () => null }));

vi.mock("@/lib/media/use-deferred-enhancement", () => ({ usePrefersReducedMotion: () => true }));

let frames: FrameRequestCallback[];
let scrollPosition: number;
const top = { hakkimizda: 1000, tesisimiz: 1000, urunler: 2000, toptan: 3000, iletisim: 4000 };
beforeEach(() => {
  route.pathname = "/"; frames = []; scrollPosition = 0;
  history.replaceState(null, "", "/");
  vi.spyOn(window, "scrollY", "get").mockImplementation(() => scrollPosition);
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => { frames.push(callback); return frames.length; });
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
    const y = this.hasAttribute("data-site-navbar") ? 0 : (top[this.id as keyof typeof top] ?? 0) - scrollPosition;
    return { x: 0, y, top: y, bottom: y + 80, width: 100, height: 80, left: 0, right: 100, toJSON: () => ({}) };
  });
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); history.replaceState(null, "", "/"); });

function mount() { render(<><Navbar /><main>{Object.keys(top).map(id => <section id={id} key={id} />)}</main></>); }
function flush() { act(() => { const queued = frames; frames = []; queued.forEach(callback => callback(0)); }); }
function current() { return within(screen.getByRole("navigation", { name: "Ana navigasyon" })).getAllByRole("link").find(link => link.hasAttribute("aria-current"))?.textContent; }
function scroll(y: number) { scrollPosition = y; fireEvent.scroll(window); flush(); }

it("keeps the public homepage active when the internal route pathname differs", () => {
  route.pathname = "/index";
  mount(); flush();
  expect(screen.getByRole("banner").getAttribute("data-tone")).toBe("solid");
  expect(current()).toBe("Ana Sayfa");
});

it("follows ordinary scrolling and returns to home without changing the URL", () => {
  mount(); flush();
  scroll(2100); expect(current()).toBe("Ürünler");
  scroll(3100); expect(current()).toBe("Toptan Satış");
  scroll(4100); expect(current()).toBe("İletişim");
  scroll(0); expect(current()).toBe("Ana Sayfa");
  expect(location.hash).toBe("");
});

it("retains an explicitly selected co-located corporate anchor, then follows the next section", () => {
  mount(); flush();
  history.replaceState(null, "", "/#hakkimizda"); scrollPosition = 1000;
  fireEvent(window, new HashChangeEvent("hashchange")); flush();
  expect(current()).toBe("Hakkımızda");
  scroll(2100); expect(current()).toBe("Ürünler");
  scroll(0); expect(current()).toBe("Ana Sayfa");
});

it("does not mark a homepage destination current on an interior page", () => {
  route.pathname = "/hesabim"; history.replaceState(null, "", "/hesabim");
  mount(); flush();
  expect(screen.getByRole("banner").getAttribute("data-tone")).toBe("solid");
  expect(current()).toBeUndefined();
});

it("marks the dealership link as the current page on its own route", () => {
  route.pathname = "/bayilik"; history.replaceState(null, "", "/bayilik");
  mount(); flush();
  expect(current()).toBe("Bayilik");
  expect(screen.getByRole("link", { name: "Bayilik" }).getAttribute("aria-current")).toBe("page");
});

it("keeps the current destination when a link is opened in another tab", () => {
  mount(); flush();
  fireEvent.click(screen.getByRole("link", { name: "Hakkımızda" }), { ctrlKey: true });
  expect(current()).toBe("Ana Sayfa");
});

it("reads the committed public URL after Next writes history without a popstate event", () => {
  function RouterCommit({ url }: { url: string }) {
    // Next's HistoryUpdater writes the URL in an insertion effect, after the
    // navbar rendered with the old address; pushState emits no popstate.
    useInsertionEffect(() => { history.pushState(null, "", url); }, [url]);
    return <Navbar />;
  }
  route.pathname = "/kvkk";
  history.replaceState(null, "", "/kvkk");
  const view = render(<RouterCommit url="/kvkk" />);
  expect(screen.getByRole("banner").getAttribute("data-tone")).toBe("solid");

  route.pathname = "/";
  view.rerender(<RouterCommit url="/" />); flush();
  expect(location.pathname).toBe("/");
  expect(screen.getByRole("banner").getAttribute("data-tone")).toBe("solid");
  expect(current()).toBe("Ana Sayfa");

  route.pathname = "/kvkk";
  view.rerender(<RouterCommit url="/kvkk" />); flush();
  expect(screen.getByRole("banner").getAttribute("data-tone")).toBe("solid");
  expect(current()).toBeUndefined();
});
