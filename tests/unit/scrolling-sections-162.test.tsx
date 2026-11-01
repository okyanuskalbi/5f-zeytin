import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";
import Home from "@/app/page";

vi.mock("@/lib/catalog/read", async () => {
  const { getProductFamilies } = await import("@/lib/catalog/static-products");
  return { readProductFamilies: getProductFamilies };
});

it("provides a complete producer story and actual chapter destinations before JavaScript", async () => {
  const doc = document.implementation.createHTMLDocument();
  doc.body.innerHTML = renderToStaticMarkup(await Home());
  const ids = [...doc.querySelectorAll("main > section")].map(section => section.id);
  expect(ids.indexOf("uretim-yolculugu")).toBeLessThan(ids.indexOf("urunler"));
  const story = doc.getElementById("uretim-yolculugu")!;
  const links = [...story.querySelectorAll('nav[aria-label="Üretim hikâyesi"] a')];
  expect(links).toHaveLength(3);
  for (const link of links) {
    const target = doc.querySelector(link.getAttribute("href")!);
    expect(target?.querySelector("h3")?.textContent).toBeTruthy();
    expect(target?.querySelector("img")?.getAttribute("alt")).toBeTruthy();
  }
  expect(doc.querySelectorAll("[data-product-id]")).toHaveLength(6);
  expect(doc.querySelector("#iletisim h2")?.textContent).toBeTruthy();
  expect(doc.getElementById("iletisim")?.textContent).toContain("Sofrada görüşürüz.");
});
