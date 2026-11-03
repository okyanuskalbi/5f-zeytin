import { readFileSync } from "node:fs";
import { cleanup, render } from "@testing-library/react";
import { LazyMotion } from "motion/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { HarvestJourney } from "@/components/landing/HarvestJourney";
import styles from "@/components/landing/HarvestJourney.module.css";

vi.mock("@/components/media/CinematicScrub", () => ({ CinematicScrub: () => <div data-poster="" /> }));

let sheet: HTMLStyleElement;
beforeEach(() => {
  // Exercise the shipped module's cascade while the lazy renderer is pending.
  // JSDOM has no layout/CLS; the production cold-load probe owns that check.
  sheet = document.createElement("style");
  sheet.textContent = readFileSync(`${process.cwd()}/components/landing/HarvestJourney.module.css`, "utf8")
    .replace(/\.([_a-zA-Z][\w-]*)/g, (selector, name: string) => styles[name] ? `.${styles[name]}` : selector);
  document.head.append(sheet);
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: !query.includes("prefers-reduced-motion") && !query.includes("max-width"),
    addEventListener() {}, removeEventListener() {},
  }));
  vi.spyOn(navigator, "hardwareConcurrency", "get").mockReturnValue(8);
  vi.stubGlobal("scrollTo", vi.fn());
});
afterEach(() => { cleanup(); sheet.remove(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

it("keeps later scenes offstage before their first inline cinematic frame", () => {
  const { container } = render(<LazyMotion features={() => new Promise(() => {})}><HarvestJourney /></LazyMotion>);
  expect(container.querySelector("[data-harvest-journey]")?.getAttribute("data-mode")).toBe("cinematic");
  for (const [scene, transform] of [["tesisimiz", "translateY(100%)"], ["uretim-yolculugu", "translateY(34%)"]]) {
    const panel = container.querySelector<HTMLElement>(`[data-sc-scene="${scene}"]`)!;
    // Reproduce the captured browser commit: the cinematic class is present,
    // but the lazy renderer has not supplied its inline MotionValue frame.
    panel.removeAttribute("style");
    expect(getComputedStyle(panel).opacity).toBe("0");
    expect(getComputedStyle(panel).transform).toBe(transform);
    expect(getComputedStyle(panel).pointerEvents).toBe("none");
  }
  const orchard = container.querySelector<HTMLElement>('[data-sc-scene="baslangic"]')!;
  expect(getComputedStyle(orchard).opacity).not.toBe("0");
  expect(orchard.querySelector('a[href="#urunler"]')).not.toBeNull();
});

it("keeps the hero footer's 44px footprint when its native discovery link is removed", () => {
  const { container } = render(<LazyMotion features={() => new Promise(() => {})}><HarvestJourney /></LazyMotion>);
  const foot = container.querySelector<HTMLElement>(`.${styles.heroFoot}`)!;
  expect(getComputedStyle(foot).minHeight).toBe("44px");
  expect(getComputedStyle(foot.querySelector("a")!).display).toBe("none");
});

it("leaves native panels visible and lets inline timeline frames override the cinematic defaults", () => {
  const { container } = render(<LazyMotion features={() => new Promise(() => {})}><HarvestJourney /></LazyMotion>);
  const journey = container.querySelector<HTMLElement>("[data-harvest-journey]")!;
  const table = container.querySelector<HTMLElement>('[data-sc-scene="uretim-yolculugu"]')!;
  table.style.opacity = "1"; table.style.transform = "translateY(0%)";
  expect(getComputedStyle(table).opacity).toBe("1");
  expect(getComputedStyle(table).transform).toBe("translateY(0%)");
  table.removeAttribute("style"); journey.dataset.mode = "native";
  expect(getComputedStyle(table).opacity).not.toBe("0");
  expect(getComputedStyle(table).transform).not.toBe("translateY(34%)");
  expect(getComputedStyle(table).pointerEvents).not.toBe("none");
  expect(getComputedStyle(container.querySelector(`.${styles.heroFoot}`)!).minHeight).not.toBe("44px");
});
