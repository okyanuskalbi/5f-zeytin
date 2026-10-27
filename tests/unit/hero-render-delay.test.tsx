import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, expect, it } from "vitest";
import { Hero } from "@/components/landing/Hero";
import styles from "@/components/landing/SofraHero.module.css";

const css = readFileSync("components/landing/SofraHero.module.css", "utf8");

afterEach(() => { document.head.innerHTML = ""; document.body.innerHTML = ""; });

function serverHero(): HTMLElement {
  document.body.innerHTML = renderToStaticMarkup(<Hero />);
  // Apply the actual stylesheet to the CSS module's server-rendered markup.
  const style = document.createElement("style");
  style.textContent = css.replace(/\.([a-zA-Z][\w-]*)/g, (selector, name: string) =>
    styles[name] ? `.${styles[name]}` : selector);
  document.head.append(style);
  return document.querySelector<HTMLElement>("[data-hero-intro]")!;
}

it("paints every first-screen hero plane and the purchase image before hydration or decode callbacks", () => {
  const hero = serverHero();
  const targets = hero.querySelectorAll<HTMLElement>("[data-layer], [data-hero-copy], [data-hero-card] img");
  expect(targets).toHaveLength(5);
  for (const target of targets) {
    for (let node: HTMLElement | null = target; node && node !== document.body; node = node.parentElement) {
      const computed = getComputedStyle(node);
      expect(Number(computed.opacity || 1), `${target.dataset.layer ?? target.tagName}: ${node.className}`).toBeGreaterThan(0);
      expect(computed.display).not.toBe("none");
      expect(computed.visibility).not.toBe("hidden");
    }
  }
  expect(hero.querySelector('[data-layer="products"]')?.getAttribute("data-ready")).toBe("false");
  expect(hero.querySelector('[data-layer="branch"]')?.getAttribute("data-ready")).toBe("false");
});

it("keeps the complete plate and purchase image visible when enhancement layers fail", () => {
  const hero = serverHero();
  for (const plane of hero.querySelectorAll<HTMLElement>('[data-layer="products"], [data-layer="branch"]')) {
    plane.dataset.failed = "true";
    expect(getComputedStyle(plane).opacity).toBe("0");
  }
  for (const target of hero.querySelectorAll<HTMLElement>('[data-layer="plate"], [data-hero-card]')) {
    expect(Number(getComputedStyle(target).opacity || 1)).toBe(1);
    expect(target.querySelector("img")).not.toBeNull();
  }
});
