import { cleanup, render, screen, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, expect, it, vi } from "vitest";
import Page, { metadata } from "@/app/bayilik/page";
import sitemap from "@/app/sitemap";
import { GET } from "@/app/llms.txt/route";
import { StoreHeader as Navbar } from "@/components/storefront/StoreHeader";
import { StoreMenu as NavbarMenu } from "@/components/storefront/StoreMenu";

vi.mock("@/components/storefront/content/DealershipPage", () => ({ DealershipPage: () => <main><h1>Bayimiz Olun</h1></main> }));
vi.mock("next/navigation", () => ({ usePathname: () => "/bayilik" }));
afterEach(() => { cleanup(); history.replaceState(null, "", "/"); });

it("serves the dealership route with its own title, description and canonical", () => {
  render(<Page />);
  expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Bayimiz Olun");
  expect(metadata.title).toBe("Bayilik | AFİNA ZEYTİN");
  expect(metadata.description).toContain("AFİNA ZEYTİN bayiliği");
  expect(metadata.alternates).toEqual({ canonical: "/bayilik" });
  expect(metadata.openGraph).toMatchObject({ title: metadata.title, description: metadata.description, url: "/bayilik" });
  expect(metadata.twitter).toMatchObject({ title: metadata.title, description: metadata.description });
});

it("includes an ordered home to dealership BreadcrumbList without commercial promises", () => {
  const doc = new DOMParser().parseFromString(renderToStaticMarkup(<Page />), "text/html");
  const scripts = [...doc.querySelectorAll('script[type="application/ld+json"]')].map(script => JSON.parse(script.textContent!));
  expect(scripts).toContainEqual({
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: "https://afinazeytin.com/" },
      { "@type": "ListItem", position: 2, name: "Bayilik", item: "https://afinazeytin.com/bayilik" },
    ],
  });
});

it("adds the public dealership URL to the sitemap and AI discovery text", async () => {
  expect(sitemap().filter(entry => entry.url === "https://afinazeytin.com/bayilik")).toEqual([
    { url: "https://afinazeytin.com/bayilik", lastModified: "2026-11-11", changeFrequency: "monthly", priority: 0.7 },
  ]);
  const text = await (await GET()).text();
  expect(text).toContain("[Bayilik](https://afinazeytin.com/bayilik)");
  expect(text).toMatch(/Bayilik.*e-posta taslağı/);
});

it("keeps the home application button and active desktop menu on the dealership route", () => {
  history.replaceState(null, "", "/bayilik");
  render(<><Navbar /></>);
  const nav = within(screen.getByRole("navigation", { name: "Ana navigasyon" }));
  expect(nav.getByRole("link", { name: "Bayilik" }).getAttribute("href")).toBe("/bayilik");
  expect(nav.getByRole("link", { name: "Bayilik" }).getAttribute("aria-current")).toBe("page");
});

it("marks Bayilik as the active destination in the phone menu", () => {
  render(<NavbarMenu links={[{ label: "Ana Sayfa", href: "/" }, { label: "Bayilik", href: "/bayilik" }]}
    pathname="/bayilik" onClose={() => {}} onRestoreFocus={() => {}} />);
  expect(screen.getByRole("link", { name: "Bayilik" }).getAttribute("aria-current")).toBe("page");
  expect(screen.getByRole("link", { name: "Ana Sayfa" }).hasAttribute("aria-current")).toBe(false);
});
