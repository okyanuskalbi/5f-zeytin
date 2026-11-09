import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import postcss from "postcss";
import { expect, it, vi } from "vitest";
import Home from "@/app/page";
import { getProductFamilies } from "@/lib/catalog/static-products";
import homeClasses from "@/components/landing/ClassicHome.module.css";
import groupClasses from "@/components/landing/ProductGroups.module.css";
import faqClasses from "@/components/landing/Faq.module.css";

vi.mock("@/lib/catalog/read", () => ({ readProductFamilies: () => getProductFamilies() }));

const globals = postcss.parse(readFileSync("app/globals.css", "utf8"));
const modules = [
  ["components/landing/ClassicHome.module.css", homeClasses],
  ["components/landing/ProductGroups.module.css", groupClasses],
  ["components/landing/Faq.module.css", faqClasses],
] as const;
const targets = ["baslangic", "tesisimiz", "urunler", "hakkimizda", "toptan", "sik-sorulanlar", "iletisim",
  "kurumsal", "teklif", "toptan-iletisim", "uretim-yolculugu", "kiler"];

/** Resolve only the matching scroll-margin declarations, including module
 * class names and specificity. This checks the actual rendered target tree;
 * it does not pretend that jsdom performs browser layout or fragment scroll. */
function scrollMargin(element: Element): string {
  const candidates: { value: string; specificity: number; order: number }[] = [];
  for (const [file, classes] of modules) {
    postcss.parse(readFileSync(file, "utf8")).walkRules(rule => {
      if (!rule.nodes.some(node => node.type === "decl" && node.prop === "scroll-margin-top")) return;
      for (const sourceSelector of rule.selector.split(",")) {
        const selector = sourceSelector.trim().replace(/\.([a-zA-Z_][\w-]*)/g, (_, name: string) => `.${classes[name] ?? name}`);
        if (!element.matches(selector)) continue;
        const ids = sourceSelector.match(/#[\w-]+/g)?.length ?? 0;
        const classAttributes = sourceSelector.match(/\.[\w-]+|\[[^\]]+\]/g)?.length ?? 0;
        const types = sourceSelector.replace(/\.[\w-]+|\[[^\]]+\]/g, "").match(/\b[a-z][\w-]*\b/g)?.length ?? 0;
        rule.walkDecls("scroll-margin-top", declaration => {
          candidates.push({ value: declaration.value,
            specificity: ids * 100 + classAttributes * 10 + types, order: candidates.length });
        });
      }
    });
  }
  return candidates.sort((a, b) => a.specificity - b.specificity || a.order - b.order).at(-1)?.value ?? "0px";
}

it("uses one document offset for every homepage section and legacy alias, including FAQ and product anchors", async () => {
  const doc = new DOMParser().parseFromString(renderToStaticMarkup(await Home()), "text/html");
  for (const id of targets) {
    const target = doc.getElementById(id);
    expect(target, id).not.toBeNull();
    expect(scrollMargin(target!), id).toMatch(/^0(?:px)?$/);
  }
});

it.each([1440, 768, 390])("keeps the static offset calculation 16px below the header at %ipx", async width => {
  let documentPadding = "";
  let headerSize = "";
  globals.walkRules("html", rule => rule.walkDecls("scroll-padding-top", declaration => { documentPadding = declaration.value; }));
  globals.walkRules(":root", rule => {
    const media = rule.parent?.type === "atrule" && rule.parent.name === "media" ? rule.parent.params : "";
    const minimumWidth = media.match(/min-width:\s*(\d+)px/)?.[1];
    if (minimumWidth && width < Number(minimumWidth)) return;
    rule.walkDecls("--header-height", declaration => { headerSize = declaration.value; });
  });
  expect(documentPadding).toBe("calc(var(--header-height) + 16px)");
  function pixels(expression: string): number {
    const resolved = expression.replace(/env\([^)]*\)/g, "0px");
    return [...resolved.matchAll(/([+-]?\s*\d*\.?\d+)(rem|px)/g)]
      .reduce((total, [, value, unit]) => total + Number(value.replace(/\s+/g, "")) * (unit === "rem" ? 16 : 1), 0);
  }
  const headerHeight = pixels(headerSize);
  expect(headerHeight).toBe(width >= 901 ? 80 : 72);
  const documentOffset = pixels(documentPadding.replace("var(--header-height)", `${headerHeight}px`));
  // Both native fragment navigation and scrollIntoView use document padding
  // plus the target margin. Safe-area insets are shared by padding and header.
  const doc = new DOMParser().parseFromString(renderToStaticMarkup(await Home()), "text/html");
  for (const id of targets) {
    const targetMargin = pixels(scrollMargin(doc.getElementById(id)!).replace("var(--header-height)", `${headerHeight}px`));
    const gap = documentOffset + targetMargin - headerHeight;
    expect(gap, id).toBe(16);
    expect(gap, id).toBeGreaterThanOrEqual(8);
    expect(gap, id).toBeLessThanOrEqual(40);
  }
  expect(readFileSync("components/site/Navbar.module.css", "utf8")).toContain("height:var(--header-height)");
});

it("preserves standalone FAQ/product margins and the document padding used by other pages", () => {
  const doc = document.implementation.createHTMLDocument();
  const faq = doc.createElement("section"); faq.className = faqClasses.section;
  const anchor = doc.createElement("span"); anchor.className = groupClasses.anchor;
  doc.body.append(faq, anchor);
  expect(scrollMargin(faq)).toBe("calc(var(--header-height) + 24px)");
  expect(scrollMargin(anchor)).toBe("calc(var(--header-height) + 24px)");
  expect(readFileSync("app/globals.css", "utf8")).toContain("html { scroll-padding-top: calc(var(--header-height) + 16px); }");
});
