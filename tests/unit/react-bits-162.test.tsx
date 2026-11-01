import { renderToStaticMarkup } from "react-dom/server";
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { BlurText } from "@/components/animation/react-bits/BlurText";

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

it("provides the complete single-copy heading text before JavaScript without hiding or filtering words", () => {
  const html = renderToStaticMarkup(<h2><BlurText text="Sofrada görüşürüz." /></h2>);
  const doc = document.implementation.createHTMLDocument();
  doc.body.innerHTML = html;
  expect(doc.querySelector("h2")?.textContent).toBe("Sofrada görüşürüz.");
  expect(doc.querySelector("[data-react-bits]")?.getAttribute("data-react-bits")).toBe("BlurText");
  expect(html).not.toMatch(/opacity:0|visibility:hidden|filter:blur|aria-hidden/);
});

it("starts only in view, settles once and disconnects the observer", () => {
  let notify: IntersectionObserverCallback;
  const disconnect = vi.fn();
  vi.stubGlobal("matchMedia", () => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
  vi.stubGlobal("IntersectionObserver", class {
    constructor(callback: IntersectionObserverCallback) { notify = callback; }
    observe = vi.fn(); unobserve = vi.fn(); disconnect = disconnect;
  });
  const view = render(<BlurText text="İşletmeniz için AFİNA." />);
  const root = view.container.querySelector("[data-react-bits]")!;
  expect(root.getAttribute("data-text-entered")).toBe("false");
  act(() => notify!([{ isIntersecting: false } as IntersectionObserverEntry], {} as IntersectionObserver));
  expect(root.getAttribute("data-text-entered")).toBe("false");
  act(() => notify!([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver));
  expect(root.getAttribute("data-text-entered")).toBe("true");
  expect(root.textContent).toBe("İşletmeniz için AFİNA.");
  expect(disconnect).toHaveBeenCalled();
  view.unmount();
});

it("uses a complete static heading when reduced motion is enabled or the observer is unavailable", () => {
  const observe = vi.fn();
  vi.stubGlobal("matchMedia", () => ({ matches: true, addEventListener() {}, removeEventListener() {} }));
  vi.stubGlobal("IntersectionObserver", class { observe = observe; disconnect() {} });
  const view = render(<BlurText text="Sofrada görüşürüz." />);
  expect(observe).not.toHaveBeenCalled();
  expect(view.container.textContent).toBe("Sofrada görüşürüz.");
  expect([...view.container.querySelectorAll("span span")].every(span => (span as HTMLElement).style.transform === "none")).toBe(true);
  view.unmount();
  vi.stubGlobal("matchMedia", () => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
  vi.stubGlobal("IntersectionObserver", undefined);
  const fallback = render(<BlurText text="Sofrada görüşürüz." />);
  expect(fallback.container.textContent).toBe("Sofrada görüşürüz.");
});
