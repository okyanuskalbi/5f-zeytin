import { useContext } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { parse } from "postcss";
import { MotionConfigContext } from "motion/react";
import { expect, it, vi } from "vitest";
import { ClassicHero } from "@/components/landing/ClassicHome";
import { DealershipPage } from "@/components/dealership/DealershipPage";
import { MotionProvider } from "@/components/site/MotionProvider";
import { motionTokens, storefrontMotionStyles } from "@/lib/ui-motion";

vi.mock("@/components/dealership/DealershipForm", () => ({ DealershipForm: () => <form /> }));

it.each([ClassicHero, DealershipPage])("keeps each hero readable on the server and marks a single four-part entrance", Component => {
  const doc = new DOMParser().parseFromString(renderToStaticMarkup(<Component />), "text/html");
  const hero = doc.querySelector("[data-storefront-hero]")!;
  expect(hero).not.toBeNull();
  expect([...hero.querySelectorAll("[data-hero-enter]")].map(node => node.getAttribute("data-hero-enter"))).toEqual(["eyebrow", "title", "description", "actions"]);
  for (const node of hero.querySelectorAll<HTMLElement>("[data-hero-enter]")) {
    expect(node.textContent?.trim()).toBeTruthy();
    expect(node.style.opacity).not.toBe("0");
    expect(node.style.visibility).not.toBe("hidden");
    expect(node.hidden).toBe(false);
  }
  if (Component === ClassicHero) expect(hero.querySelector("[data-hero-photo] img")).not.toBeNull();
  else expect(hero.querySelector("video")).toBeNull();
});

it("uses only transform and opacity keyframes behind the no-preference media query", () => {
  const css = parse(readFileSync("components/landing/ClassicHome.module.css", "utf8"));
  const animations: string[] = [];
  css.walkAtRules("keyframes", rule => {
    animations.push(rule.params);
    expect(rule.parent?.type).toBe("atrule");
    if (rule.parent?.type === "atrule") expect(rule.parent.params).toBe("(prefers-reduced-motion:no-preference)");
    rule.walkDecls(decl => { expect(["transform", "opacity"]).toContain(decl.prop); });
  });
  expect(animations).toContain("heroTextEntrance");
  expect(animations).toContain("heroPhotoEntrance");
  const tokens = motionTokens.storefront;
  expect(tokens.hero.stagger * 3 + tokens.enterDuration).toBeLessThanOrEqual(.9);
  expect(tokens.hero.photoDuration).toBe(1.2);
  expect(storefrontMotionStyles["--motion-hero-distance"]).toBe(`${tokens.hero.distance}px`);
});

function MotionPreference() {
  return <output>{useContext(MotionConfigContext).reducedMotion}</output>;
}
it("passes the user's reduced-motion preference to all lazy Motion descendants", () => {
  expect(renderToStaticMarkup(<MotionProvider><MotionPreference /></MotionProvider>)).toContain("<output>user</output>");
});
