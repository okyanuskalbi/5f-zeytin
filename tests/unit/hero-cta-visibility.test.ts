import { readFileSync } from "node:fs";
import { afterEach, expect, it } from "vitest";

const css = readFileSync("components/landing/SofraHero.module.css", "utf8");

afterEach(() => { document.head.innerHTML = ""; document.body.innerHTML = ""; });

// Exercise the real stylesheet's cascade, including the pre-hydration disabled
// state. Pixel colour and WebKit compositing remain Claude's browser acceptance.
it.each([false, true])("keeps the solid hero CTA opaque when disabled=%s", disabled => {
  const style = document.createElement("style");
  style.textContent = css;
  document.head.append(style);
  const button = document.createElement("button");
  button.className = "purchase";
  button.disabled = disabled;
  document.body.append(button);

  expect(getComputedStyle(button).opacity).toBe("1");
  expect(getComputedStyle(button).appearance).toBe("none");
});
