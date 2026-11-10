import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import postcss from "postcss";
import { expect, it } from "vitest";
import { Footer } from "@/components/site/Footer";

it("keeps every C destination and legal/payment content usable before JavaScript", () => {
  const doc = new DOMParser().parseFromString(renderToStaticMarkup(<Footer />), "text/html");
  expect([...doc.querySelectorAll('nav[aria-label="Alt menü"] a')].map(link => link.getAttribute("href"))).toEqual([
    "/hakkimizda", "/toptan-satis", "/bayilik", "/blog", "/hakkimizda#iletisim",
  ]);
  expect([...doc.querySelectorAll('nav[aria-label="Yasal bilgiler"] a')].map(link => link.getAttribute("href"))).toEqual(["/kvkk", "/mesafeli-satis", "/iade"]);
  expect(doc.querySelectorAll('ul[aria-label="Kabul edilen kartlar"] > li')).toHaveLength(3);
  expect(doc.querySelector('a[href="#"]')).toBeNull();
  expect(doc.querySelector('input, button, canvas')).toBeNull();
});

it("uses named local payment vectors with safe markup and reserved dimensions on the dark surface", () => {
  const doc = new DOMParser().parseFromString(renderToStaticMarkup(<Footer />), "text/html");
  const payment = doc.querySelector('[aria-label="Güvenli ödeme"]')!;
  expect([...payment.querySelectorAll("img")].map(image => image.alt)).toEqual(["PayTR", "Visa", "Mastercard", "Troy"]);
  for (const image of payment.querySelectorAll("img")) {
    expect(image.getAttribute("src")).toBe(`/images/payment/${image.alt.toLowerCase()}.svg`);
    expect(Number(image.getAttribute("width"))).toBeGreaterThan(0);
    expect(Number(image.getAttribute("height"))).toBeGreaterThan(0);
    const svg = new DOMParser().parseFromString(readFileSync(`public${image.getAttribute("src")}`, "utf8"), "image/svg+xml");
    expect(svg.documentElement.getAttribute("viewBox")).toBeTruthy();
    expect(svg.querySelector("parsererror, script, foreignObject, image, use")).toBeNull();
    expect([...svg.querySelectorAll("*")].flatMap(node => [...node.attributes]).filter(attribute => !attribute.name.startsWith("xmlns"))
      .some(attribute => /^on/i.test(attribute.name) || /^(?:https?:|data:|javascript:)/i.test(attribute.value))).toBe(false);
  }
});

it("provides visible keyboard focus, full touch targets and a narrow-screen grid", () => {
  const sheet = postcss.parse(readFileSync("components/site/ClassicFooter.module.css", "utf8"));
  let minimum = "";
  let focus = "";
  let narrowColumns = "";
  sheet.walkRules(rule => {
    if (rule.selector === ".link") rule.walkDecls("min-height", decl => { minimum = decl.value; });
    if (rule.selector.includes(":focus-visible")) rule.walkDecls("outline", decl => { focus = decl.value; });
    if (rule.selector === ".links" && rule.parent?.type === "atrule" && rule.parent.params === "(max-width:767px)")
      rule.walkDecls("grid-template-columns", decl => { narrowColumns = decl.value; });
  });
  expect(Number.parseFloat(minimum)).toBeGreaterThanOrEqual(48);
  expect(focus).toContain("2px solid");
  expect(narrowColumns).toBe("repeat(2,minmax(0,1fr))");
});
