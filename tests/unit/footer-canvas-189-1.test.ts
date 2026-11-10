import { readFileSync } from "node:fs";
import postcss from "postcss";
import { expect, it } from "vitest";

const global = postcss.parse(readFileSync("app/globals.css", "utf8"));
const footer = postcss.parse(readFileSync("components/site/ClassicFooter.module.css", "utf8"));
const cart = postcss.parse(readFileSync("components/cart/CartExperience.module.css", "utf8"));

function declarations(sheet: postcss.Root, selector: string): Record<string, string> {
  const result: Record<string, string> = {};
  sheet.walkRules(rule => {
    if (rule.selector !== selector) return;
    rule.walkDecls(declaration => { result[declaration.prop] = declaration.value; });
  });
  return result;
}
const tokens = declarations(global, ":root");
function resolve(value: string | undefined): string | undefined {
  const variable = /^var\((--[\w-]+)\)$/.exec(value ?? "");
  return variable ? resolve(tokens[variable[1]]) : value?.toLowerCase();
}

it("paints the document canvas and mini-cart reserve in the footer colour while keeping content ivory", () => {
  const footerBackground = resolve(declarations(footer, ".footer").background);
  expect(resolve(declarations(global, "html").background)).toBe(footerBackground);
  expect(resolve(declarations(global, "body").background)).toBe(footerBackground);
  expect(resolve(declarations(cart, ".miniReserve").background)).toBe(footerBackground);
  expect(resolve(declarations(global, "#ana-icerik").background)).toBe(resolve(tokens["--background"]));
  expect(resolve(tokens["--background"])).toBe("#faf8f2");
});

it("lets short content fill the screen without adding a fixed height to long content or removing cart clearance", () => {
  const body = declarations(global, "body");
  expect(body.display).toBe("flex");
  expect(body["flex-direction"]).toBe("column");
  expect(body["min-height"]).toBe("100dvh");
  expect(body.height).toBeUndefined();
  expect(declarations(global, "#ana-icerik").flex).toBe("1 0 auto");
  expect(declarations(cart, ".miniReserve").height).toBe("calc(88px + env(safe-area-inset-bottom))");
});
