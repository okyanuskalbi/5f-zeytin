import { readFileSync } from "node:fs";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import postcss, { type Root } from "postcss";
import { afterEach, expect, it } from "vitest";
import { WholesaleForm } from "@/components/landing/WholesaleForm";

const formCss = postcss.parse(readFileSync("components/landing/WholesaleForm.module.css", "utf8"));
const dialogCss = postcss.parse(readFileSync("components/landing/WholesaleFaq.module.css", "utf8"));
const shortPhone = "(max-height: 700px) and (max-width: 767px)";

function declarations(css: Root, selector: string, media?: string): Record<string, string> {
  const values: Record<string, string> = {};
  css.walkRules(selector, rule => {
    const parent = rule.parent;
    const query = parent?.type === "atrule" ? parent.params : undefined;
    if (query === media) rule.walkDecls(decl => { values[decl.prop] = decl.value; });
  });
  return values;
}

afterEach(cleanup);

it("uses 12px field spacing, 4px label spacing and 44px inputs only on short phones", () => {
  expect(declarations(formCss, ".fields", shortPhone).gap).toBe("12px");
  expect(declarations(formCss, ".channels", shortPhone)).toMatchObject({
    gap: "12px", "grid-template-columns": "minmax(0, 1fr)",
  });
  expect(declarations(formCss, ".field", shortPhone).gap).toBe("4px");
  expect(declarations(formCss, ".field > input", shortPhone)).toMatchObject({
    height: "44px", "min-height": "44px",
  });
});

it("limits the short-phone message to two through four lines including padding and borders", () => {
  const base = declarations(formCss, ".field > textarea");
  const compact = declarations(formCss, ".field > textarea", shortPhone);
  const chrome = Number.parseFloat(base["padding-block"]) * 2 + 2;
  expect(Number.parseFloat(compact["min-height"])).toBe(Number.parseFloat(base["line-height"]) * 2 + chrome);
  expect(Number.parseFloat(compact["max-height"])).toBe(Number.parseFloat(base["line-height"]) * 4 + chrome);
});

it("makes room for consent above the separate sticky action without reducing its touch targets", () => {
  expect(declarations(dialogCss, ".sheet .formHeader > p", shortPhone).display).toBe("none");
  expect(declarations(dialogCss, ".sheet .formHeader", shortPhone)).toMatchObject({
    "min-height": "44px", "padding-block": "6px",
  });
  expect(declarations(formCss, ".actions", shortPhone)).toMatchObject({
    gap: "4px", "padding-top": "4px", "padding-bottom": "max(8px, env(safe-area-inset-bottom))",
  });
  expect(declarations(formCss, ".actions > button", shortPhone)).toMatchObject({
    "min-height": "44px", "padding-block": "8px",
  });
  for (const selector of [".consent", ".legal"]) {
    expect(declarations(formCss, selector)["min-height"]).toBe("44px");
  }
  render(<WholesaleForm />);
  const checkbox = screen.getByRole("checkbox");
  const legal = screen.getByRole("link", { name: "KVKK aydınlatma metni" });
  const footer = screen.getByRole("button", { name: "Talebi gönder" }).closest("[data-wholesale-actions]")!;
  expect(checkbox.closest("fieldset")?.contains(legal)).toBe(true);
  expect(footer.closest("fieldset")).toBeNull();
  expect(checkbox.compareDocumentPosition(footer) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
});

it("preserves the larger-phone and desktop density", () => {
  expect(declarations(formCss, ".field > input")["min-height"]).toBe("48px");
  expect(declarations(formCss, ".field > textarea")).toMatchObject({ "min-height": "90px", "max-height": "162px" });
  expect(declarations(formCss, ".fields").gap).toBe("10px");
  expect(declarations(formCss, ".channels", "(min-width: 768px)")["grid-template-columns"]).toBe("repeat(2, minmax(0, 1fr))");
  expect(declarations(dialogCss, ".formHeader > p").display).toBeUndefined();
});

it("grows to the compact four-line cap and resizes back when text or viewport changes", () => {
  render(<WholesaleForm />);
  const message = screen.getByRole("textbox", { name: "Talep mesajı" }) as HTMLTextAreaElement;
  const compact = declarations(formCss, ".field > textarea", shortPhone);
  // jsdom has no layout engine: supply the stylesheet's responsive measurements.
  Object.assign(message.style, {
    minHeight: compact["min-height"], maxHeight: compact["max-height"], borderTopWidth: "1px", borderBottomWidth: "1px",
  });
  let contentHeight = 400;
  Object.defineProperty(message, "scrollHeight", { get: () => contentHeight });
  const longText = "Talep satırı\n".repeat(12);
  fireEvent.change(message, { target: { value: longText } });
  expect(message.style.height).toBe("114px");
  const regular = declarations(formCss, ".field > textarea");
  Object.assign(message.style, { minHeight: regular["min-height"], maxHeight: regular["max-height"] });
  fireEvent.resize(window);
  expect(message.style.height).toBe("162px");
  Object.assign(message.style, { minHeight: compact["min-height"], maxHeight: compact["max-height"] });
  fireEvent.resize(window);
  expect(message.style.height).toBe("114px");
  expect(message.value).toBe(longText);
  contentHeight = 64;
  fireEvent.change(message, { target: { value: "Kısa talep" } });
  expect(message.style.height).toBe("66px");
});
