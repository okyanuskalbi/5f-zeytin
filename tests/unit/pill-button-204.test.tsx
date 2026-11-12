import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Leaf } from "lucide-react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, expect, it, vi } from "vitest";
import { Medallion } from "@/components/storefront/ui/Medallion";
import { OliveBranch } from "@/components/storefront/ui/OliveBranch";
import { PillButton } from "@/components/storefront/ui/PillButton";
import { SectionHeading } from "@/components/storefront/ui/SectionHeading";
import { Stamp } from "@/components/storefront/ui/Stamp";
import { Tag } from "@/components/storefront/ui/Tag";

afterEach(cleanup);

it("PillButton: a destination renders a link pill with a hidden gold coin", () => {
  render(<PillButton href="/urunler" variant="gold">Ürünleri İnceleyin</PillButton>);
  const link = screen.getByRole("link", { name: "Ürünleri İnceleyin" });
  expect(link).toHaveProperty("tagName", "A");
  expect(link.getAttribute("href")).toBe("/urunler");
  expect(link.hasAttribute("data-pill")).toBe(true);
  expect(link.getAttribute("data-variant")).toBe("gold");
  expect(link.querySelector("[data-coin]")?.getAttribute("aria-hidden")).toBe("true");
  expect(link.textContent).toBe("Ürünleri İnceleyin");
});

it("PillButton: defaults to a primary button with an arrow coin and forwards clicks", () => {
  const click = vi.fn();
  render(<PillButton onClick={click}>Gönder</PillButton>);
  const button = screen.getByRole("button", { name: "Gönder" });
  expect(button.getAttribute("type")).toBe("button");
  expect(button.getAttribute("data-variant")).toBe("primary");
  expect(button.querySelector("[data-coin] svg")).not.toBeNull();
  fireEvent.click(button);
  expect(click).toHaveBeenCalledOnce();
});

it("PillButton: busy announces itself, cannot be pressed and keeps its coin", () => {
  const click = vi.fn();
  render(<PillButton busy icon="cart" onClick={click}>Sepete ekle</PillButton>);
  const busy = screen.getByRole("button", { name: "Sepete ekle" });
  expect(busy.getAttribute("aria-busy")).toBe("true");
  expect((busy as HTMLButtonElement).disabled).toBe(true);
  expect(busy.querySelector("[data-coin]")).not.toBeNull();
  fireEvent.click(busy);
  expect(click).not.toHaveBeenCalled();
});

it("PillButton: disabled and quiet pills never draw a coin", () => {
  render(<><PillButton disabled>Mevcut değil</PillButton><PillButton variant="quiet" href="/blog" icon="arrow">Tüm yazılar</PillButton><PillButton icon="none">Kaydet</PillButton></>);
  const unavailable = screen.getByRole("button", { name: "Mevcut değil" });
  expect((unavailable as HTMLButtonElement).disabled).toBe(true);
  expect(unavailable.querySelector("[data-coin]")).toBeNull();
  const quiet = screen.getByRole("link", { name: "Tüm yazılar" });
  expect(quiet.getAttribute("data-variant")).toBe("quiet");
  expect(quiet.querySelector("[data-coin]")).toBeNull();
  expect(screen.getByRole("button", { name: "Kaydet" }).querySelector("[data-coin]")).toBeNull();
});

it("PillButton: size and width are data hooks, the label stays one element", () => {
  render(<PillButton size="md" fullWidth icon="plus">Ekle</PillButton>);
  const button = screen.getByRole("button", { name: "Ekle" });
  expect(button.getAttribute("data-size")).toBe("md");
  expect(button.hasAttribute("data-full")).toBe(true);
  expect(button.querySelectorAll("[data-pill-label]")).toHaveLength(1);
});

it("Stamp: a still image with its claim as the accessible name", () => {
  const { container } = render(<Stamp label="%100 Doğal ve Katkısız" />);
  const stamp = screen.getByRole("img", { name: "%100 Doğal ve Katkısız" });
  expect(stamp.tagName.toLowerCase()).toBe("svg");
  expect(container.innerHTML).not.toMatch(/animate|spin|rotate\(|marquee/i);
  expect(container.querySelector("animate, animateTransform")).toBeNull();
});

it("SectionHeading: the eyebrow precedes the title and as=h1 yields the only h1", () => {
  const { container } = render(<SectionHeading eyebrow="Hikayemiz" title="Nesillerin Emeği, Toprağın Bereketi" lead="Kısa giriş." as="h1" />);
  const heading = screen.getByRole("heading", { level: 1, name: "Nesillerin Emeği, Toprağın Bereketi" });
  expect(container.querySelectorAll("h1")).toHaveLength(1);
  expect(container.querySelector("h2")).toBeNull();
  const eyebrow = screen.getByText("Hikayemiz");
  expect(eyebrow.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(heading.compareDocumentPosition(screen.getByText("Kısa giriş.")) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
});

it("SectionHeading: defaults to h2 without an eyebrow and carries its tone", () => {
  const { container } = render(<SectionHeading title="Öne Çıkan Ürünler" tone="dark" align="center" />);
  expect(screen.getByRole("heading", { level: 2, name: "Öne Çıkan Ürünler" })).toBeTruthy();
  expect(container.querySelector("[data-eyebrow]")).toBeNull();
  expect(container.firstElementChild?.getAttribute("data-tone")).toBe("dark");
  expect(container.firstElementChild?.getAttribute("data-align")).toBe("center");
});

it("OliveBranch, Medallion and Tag icons are decoration; Tag text is real", () => {
  const html = renderToStaticMarkup(<><OliveBranch tone="gold" /><Medallion icon={Leaf} tone="dark" /><Tag tone="sage" icon={Leaf}>1 kg</Tag></>);
  const doc = new DOMParser().parseFromString(html, "text/html");
  expect(doc.querySelector("[data-olive-branch]")?.getAttribute("aria-hidden")).toBe("true");
  expect(doc.querySelector("[data-medallion]")?.getAttribute("aria-hidden")).toBe("true");
  const tag = doc.querySelector("[data-tag]")!;
  expect(tag.getAttribute("data-tone")).toBe("sage");
  expect(tag.textContent).toBe("1 kg");
  expect(tag.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
});
