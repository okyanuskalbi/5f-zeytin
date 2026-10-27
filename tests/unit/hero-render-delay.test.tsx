import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { Hero } from "@/components/landing/Hero";
import styles from "@/components/landing/SofraHero.module.css";

const css = readFileSync("components/landing/SofraHero.module.css", "utf8");

afterEach(() => { cleanup(); document.head.innerHTML = ""; document.body.innerHTML = ""; });

function applyStyles(): void {
  // Apply the actual stylesheet to the CSS module's rendered markup.
  const style = document.createElement("style");
  style.textContent = css.replace(/\.([a-zA-Z][\w-]*)/g, (selector, name: string) =>
    styles[name] ? `.${styles[name]}` : selector);
  document.head.append(style);
}

it("keeps decorative planes hidden in SSR while the plate, copy and purchase image paint immediately", () => {
  document.body.innerHTML = renderToStaticMarkup(<Hero />);
  applyStyles();
  const hero = document.querySelector<HTMLElement>("[data-hero-intro]")!;
  const targets = hero.querySelectorAll<HTMLElement>('[data-layer="plate"], [data-hero-copy], [data-hero-card] img');
  expect(targets).toHaveLength(3);
  for (const target of targets) {
    for (let node: HTMLElement | null = target; node && node !== document.body; node = node.parentElement) {
      const computed = getComputedStyle(node);
      expect(Number(computed.opacity || 1), `${target.dataset.layer ?? target.tagName}: ${node.className}`).toBeGreaterThan(0);
      expect(computed.display).not.toBe("none");
      expect(computed.visibility).not.toBe("hidden");
    }
  }
  for (const plane of hero.querySelectorAll<HTMLElement>('[data-layer="products"], [data-layer="branch"]')) {
    expect(plane.getAttribute("data-ready")).toBe("false");
    expect(getComputedStyle(plane).opacity).toBe("0");
    expect(plane.hasAttribute("data-failed")).toBe(false);
  }
});

it("reveals both planes only after all images load and hides them permanently after a late failure", () => {
  render(<Hero />);
  applyStyles();
  const hero = document.querySelector<HTMLElement>("[data-hero-intro]")!;
  const planes = [...hero.querySelectorAll<HTMLElement>('[data-layer="products"], [data-layer="branch"]')];
  const images = planes.flatMap(plane => [...plane.querySelectorAll("img")]);
  expect(images).toHaveLength(3);
  for (const image of images) {
    fireEvent.load(image);
    const ready = image === images.at(-1);
    for (const plane of planes) {
      expect(plane.getAttribute("data-ready")).toBe(String(ready));
      expect(getComputedStyle(plane).opacity).toBe(ready ? "1" : "0");
    }
  }
  fireEvent.error(images[0]);
  images.forEach(image => fireEvent.load(image));
  for (const plane of planes) {
    expect(plane.getAttribute("data-ready")).toBe("false");
    expect(getComputedStyle(plane).opacity).toBe("0");
  }
  for (const target of hero.querySelectorAll<HTMLElement>('[data-layer="plate"], [data-hero-card]')) {
    expect(Number(getComputedStyle(target).opacity || 1)).toBe(1);
    expect(target.querySelector("img")).not.toBeNull();
  }
});
