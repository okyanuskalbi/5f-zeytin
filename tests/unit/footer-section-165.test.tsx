import { renderToStaticMarkup } from "react-dom/server";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { Footerdemo, buildFooterQuoteDraft } from "@/components/ui/footer-section";

const contact = { phone: "", whatsapp: "", email: "" };
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

it("switches only footer colors and matching logos, leaving the page theme and form state alone", () => {
  const original = document.documentElement.className;
  render(<Footerdemo contact={contact} />);
  const field = screen.getByRole("textbox", { name: "Ürün ve teklif bilgisi alın" });
  fireEvent.change(field, { target: { value: "buyer@example.test" } });
  const toggle = screen.getByRole("switch", { name: "Alt bilgi için koyu görünüm" });
  fireEvent.click(toggle);
  expect(toggle.getAttribute("aria-checked")).toBe("true");
  expect(screen.getByRole("contentinfo").getAttribute("data-surface")).toBe("dark");
  expect(document.documentElement.className).toBe(original);
  expect((field as HTMLInputElement).value).toBe("buyer@example.test");
  expect(screen.getByAltText("PayTR").getAttribute("src")).toBe("/images/payment/paytr.svg");
  fireEvent.click(toggle);
  expect(screen.getByRole("contentinfo").getAttribute("data-surface")).toBe("light");
  expect(screen.getByAltText("PayTR").getAttribute("src")).toBe("/images/payment/paytr-dark.svg");
});

it("validates an email then prepares an encoded unsent draft, clearing it after edits without network or storage writes", () => {
  const fetch = vi.spyOn(globalThis, "fetch");
  const storage = vi.spyOn(Storage.prototype, "setItem");
  render(<Footerdemo contact={contact} />);
  const form = screen.getByRole("form", { name: "E-postayla teklif taslağı" });
  const field = screen.getByRole("textbox", { name: "Ürün ve teklif bilgisi alın" });
  fireEvent.submit(form);
  expect(screen.queryByRole("link", { name: "E-posta uygulamasında aç" })).toBeNull();
  fireEvent.change(field, { target: { value: "invalid-address" } });
  fireEvent.submit(form);
  expect(screen.queryByRole("link", { name: "E-posta uygulamasında aç" })).toBeNull();
  fireEvent.change(field, { target: { value: "buyer+afina@example.test" } });
  fireEvent.submit(form);
  const link = screen.getByRole("link", { name: "E-posta uygulamasında aç" });
  const uri = new URL(link.getAttribute("href")!);
  expect(uri.protocol).toBe("mailto:");
  expect(uri.pathname).toBe("info@afina.com.tr");
  expect(uri.searchParams.get("body")).toContain("buyer+afina@example.test");
  expect([...uri.searchParams.keys()]).toEqual(["subject", "body"]);
  expect(screen.getByRole("status").textContent).toContain("Bu sayfa e-posta göndermedi.");
  fireEvent.change(field, { target: { value: "another@example.test" } });
  expect(screen.queryByRole("link", { name: "E-posta uygulamasında aç" })).toBeNull();
  expect(fetch).not.toHaveBeenCalled();
  expect(storage).not.toHaveBeenCalled();
});

it("never turns raw address delimiters or line breaks into email recipients or headers", () => {
  const uri = new URL(buildFooterQuoteDraft("test@example.test&bcc=stranger@example.test\r\nSubject: injected"));
  expect(uri.pathname).toBe("info@afina.com.tr");
  expect([...uri.searchParams.keys()]).toEqual(["subject", "body"]);
  expect(uri.searchParams.get("subject")).toBe("AFİNA ZEYTİN · Ürün ve teklif bilgisi");
  expect(uri.searchParams.get("body")).toContain("test@example.test&bcc=stranger@example.test Subject: injected");
});

it("serves the real fallback logo, navigation and disabled email/theme controls before JavaScript", () => {
  const doc = new DOMParser().parseFromString(renderToStaticMarkup(<Footerdemo contact={contact} />), "text/html");
  expect(doc.querySelector('img[alt="AFİNA ZEYTİN"]')).not.toBeNull();
  expect(doc.querySelector('button[type="submit"]')?.hasAttribute("disabled")).toBe(true);
  expect(doc.querySelector('button[role="switch"]')?.hasAttribute("disabled")).toBe(true);
  expect(doc.querySelector('a[href="/#toptan-iletisim"]')).not.toBeNull();
  expect(doc.querySelector('a[href^="mailto:"]')).toBeNull();
  expect(doc.querySelector('input[type="email"]')?.hasAttribute("name")).toBe(false);
  expect(doc.querySelector("canvas")).toBeNull();
});
