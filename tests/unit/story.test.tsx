import { readFileSync } from "node:fs";
import { act, cleanup, render, screen, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { LazyMotion, domAnimation } from "motion/react";
import { parse } from "postcss";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { Story } from "@/components/landing/Story";
import styles from "@/components/landing/Story.module.css";
import facility from "@/public/images/tesis-v4-manifest.json";

const scroll = vi.hoisted(() => ({ values: [] as { set: (value: number) => void }[] }));
vi.mock("motion/react", async importOriginal => {
  const actual = await importOriginal<typeof import("motion/react")>();
  const { useState } = await import("react");
  return { ...actual, useScroll: () => {
    const [progress] = useState(() => {
      const value = actual.motionValue(0.5);
      scroll.values.push(value);
      return value;
    });
    return { scrollYProgress: progress };
  } };
});

const titles = ["Kökü toprakta.", "Kendi tesisimizde.", "Yeri sofrada."];
const texts = [
  "Osmaniye'nin Düziçi ilçesi, Ellek beldesi. Zeytinin hikâyesi burada, toprakta başlar; sofrada tamamlanır.",
  "Seçim, salamura ve dolum Ellek'teki kendi tesisimizde yapılır. 2021'den bu yana perakende ve toptan alıcılara ulaşıyoruz.",
  "Sofralık zeytin, salamura zeytin ve zeytinyağı. Yalın ve özenli bir sunumla, ürünün özüne saygıyla.",
];
const captions = ["Düziçi, Osmaniye", "Tesisimiz · Ellek", "Natürel sızma · 1 L"];
const alts = [
  "Doğal Kırma Yeşil Zeytin, 10 kg teneke, sofra sunumu",
  "Afina Zeytin’in Ellek, Düziçi’ndeki üretim tesisi",
  "Natürel Sızma Zeytinyağı, 1 L cam şişe, sofra sunumu",
];
const css = parse(readFileSync("components/landing/Story.module.css", "utf8"));

beforeEach(() => { scroll.values = []; });
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

it("renders three independent articles with complete, unchanged copy and photos in SSR", () => {
  const doc = document.implementation.createHTMLDocument();
  doc.body.innerHTML = renderToStaticMarkup(<Story />);
  const story = doc.querySelector("#tesisimiz")!;
  expect(story.getAttribute("aria-labelledby")).toBe("tesisimiz-title");
  const articles = [...story.querySelectorAll("article")];
  expect(articles).toHaveLength(3);
  for (const [index, article] of articles.entries()) {
    expect(article.querySelector("[data-story-number]")?.textContent).toBe(`0${index + 1}`);
    expect(article.querySelector("h2")?.textContent).toBe(titles[index]);
    expect(article.querySelector("p")?.textContent).toBe(texts[index]);
    expect(article.querySelector("figcaption")?.textContent).toBe(captions[index]);
    expect(article.querySelectorAll("img")).toHaveLength(1);
    expect(article.querySelector("img")?.alt).toBe(alts[index]);
    expect(article.getAttribute("aria-labelledby")).toBe(article.querySelector("h2")?.id);
    expect(article.children[0].contains(article.querySelector("img"))).toBe(true);
    expect(article.getAttribute("data-story-step")).toBe(String(index));
  }
  expect(story.querySelector('[hidden], [aria-hidden="true"], [style*="opacity:0"], [style*="transform"]')).toBeNull();
});

it("uses each photo's own ratio and the approved blurred-plate facility source", () => {
  const view = render(<Story />);
  const photos = [...view.container.querySelectorAll<HTMLElement>("figure")];
  expect(photos).toHaveLength(3);
  for (const [index, photo] of photos.entries()) {
    let ratio = "";
    css.walkRules(rule => {
      if (/^\.\w+$/.test(rule.selector) && photo.classList.contains(styles[rule.selector.slice(1)])) {
        rule.walkDecls("aspect-ratio", declaration => { ratio = declaration.value; });
      }
    });
    expect(ratio).toBe(index === 1 ? "16 / 10" : "16 / 9");
    const image = photo.querySelector("img")!;
    const [width, height] = ratio.split("/").map(Number);
    expect(image.width / image.height).toBeCloseTo(width / height, 5);
    expect(image.getAttribute("loading")).toBe("lazy");
  }
  expect(photos[1].querySelector("img")?.getAttribute("src")).toBe("/images/tesis/tesis-osmaniye-v4-1200.webp");
  expect(facility.source).toBe("docs/referans/tesis/tesis-osmaniye-plaka-bulanik.jpg");
  expect(photos[1].querySelector("img")?.alt).not.toMatch(/plaka|\d{2}\s+[A-Z]+\s+\d/);
});

it("has no sticky/fixed positions, stacked photos or viewport-height spacer steps", () => {
  const view = render(<Story />);
  expect(view.container.querySelector("[data-story-sticky], [data-active], [data-story-enhanced]")).toBeNull();
  css.walkDecls("position", declaration => { expect(declaration.value).not.toMatch(/sticky|fixed/); });
  css.walkDecls(/^(min-)?height$/, declaration => { expect(declaration.value).not.toMatch(/(?:s|d|l)?vh/); });
  css.walkRules(rule => { expect(rule.selector).not.toMatch(/\.sticky|\.frame|data-active|data-story-enhanced/); });
});

it("keeps every article visible and transform-free with reduced motion", () => {
  vi.stubGlobal("matchMedia", () => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  const view = render(<LazyMotion features={domAnimation}><Story /></LazyMotion>);
  const articles = screen.getAllByRole("article");
  expect(articles).toHaveLength(3);
  for (const article of articles) {
    expect(within(article).getAllByRole("img")).toHaveLength(1);
    expect(within(article).getAllByRole("heading", { level: 2 })).toHaveLength(1);
  }
  expect(view.container.querySelector('[style*="transform"], [style*="opacity: 0"], [aria-hidden="true"]')).toBeNull();
  act(() => scroll.values.forEach(value => value.set(1)));
  expect(view.container.querySelector('[style*="transform"]')).toBeNull();
});

it("reveals each row once and moves whole photos independently by at most 24px", async () => {
  vi.stubGlobal("matchMedia", () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  let dispatch: IntersectionObserverCallback;
  const observe = vi.fn();
  const unobserve = vi.fn();
  vi.stubGlobal("IntersectionObserver", class {
    constructor(callback: IntersectionObserverCallback) { dispatch = callback; }
    observe = observe;
    unobserve = unobserve;
    disconnect() {}
  });
  const view = render(<LazyMotion features={domAnimation}><Story /></LazyMotion>);
  const photos = [...view.container.querySelectorAll<HTMLElement>("figure")];
  const rows = screen.getAllByRole("article");
  expect(observe).toHaveBeenCalledTimes(3);
  const enter = (isIntersecting: boolean) => act(() => {
    const box = rows[0].getBoundingClientRect();
    dispatch([{
      target: rows[0], isIntersecting, intersectionRatio: isIntersecting ? 1 : 0,
      boundingClientRect: box, intersectionRect: box, rootBounds: null, time: performance.now(),
    }], {} as IntersectionObserver);
  });
  const visual = rows[0].querySelector<HTMLElement>("[data-story-reveal]")!;
  enter(true);
  await vi.waitFor(() => expect(Number(visual.style.opacity)).toBeLessThan(1));
  await vi.waitFor(() => expect(visual.style.opacity).toBe("1"), { timeout: 1500 });
  enter(false);
  enter(true);
  expect(visual.style.opacity).toBe("1");
  expect(scroll.values).toHaveLength(3);
  act(() => scroll.values[0].set(-1));
  await vi.waitFor(() => expect(photos[0].style.transform).toBe("translateY(-12px)"));
  expect(photos[1].style.transform).not.toMatch(/translateY\((?!0px)/);
  act(() => scroll.values[0].set(2));
  await vi.waitFor(() => expect(photos[0].style.transform).toBe("translateY(12px)"));
  expect(photos[0].querySelector("img")?.style.transform).toBe("");
  expect(screen.getAllByRole("img")).toHaveLength(3);
  view.unmount();
  expect(unobserve).toHaveBeenCalledTimes(3);
});

it("retains the complete static story when motion APIs are unavailable", () => {
  vi.stubGlobal("matchMedia", undefined);
  vi.stubGlobal("IntersectionObserver", undefined);
  const view = render(<Story />);
  expect(screen.getAllByRole("article")).toHaveLength(3);
  expect(screen.getAllByRole("img")).toHaveLength(3);
  expect(view.container.querySelector('[hidden], [aria-hidden="true"], [style*="transform"]')).toBeNull();
});
