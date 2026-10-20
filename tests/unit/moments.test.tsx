import { readFileSync } from "node:fs";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import Home from "@/app/page";

const titles = ["Hasat", "Seçim", "Kırma", "Salamura", "Dolum", "Sofrada"];
afterEach(cleanup);

it("places the six moments after the facility and before wholesale in the landing", async () => {
  render(await Home());
  const section = screen.getByRole("region", { name: "Topraktan sofraya" });
  expect(within(section).getAllByRole("heading", { level: 3 }).map(node => node.textContent)).toEqual(titles);
  expect(within(section).getAllByRole("listitem")).toHaveLength(6);
  const facility = document.querySelector("#tesisimiz")!;
  const wholesale = document.querySelector("#toptan-iletisim")!;
  expect(facility.compareDocumentPosition(section) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(section.compareDocumentPosition(wholesale) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
});

it("publishes only the official story sentence, never unconfirmed process copy", async () => {
  render(await Home());
  const section = screen.getByRole("region", { name: "Topraktan sofraya" });
  const paragraphs = [...section.querySelectorAll("p:not(.sr-only)")];
  expect(paragraphs.map(node => node.textContent)).toEqual(["Zeytinin hikâyesi toprakta başlar, sofrada tamamlanır."]);
  expect(section.textContent).not.toMatch(/saat|derece|katkısız|elle topla|soğuk sık|teyit bekliyor|organik/i);
  expect(readFileSync("docs/referans/icerik.md", "utf8")).toContain(paragraphs[0].textContent);
});

it("provides keyboard scroll access, named controls and typographic stage notes until distinct imagery is approved", async () => {
  render(await Home());
  const section = screen.getByRole("region", { name: "Topraktan sofraya" });
  expect(within(section).getByRole("list", { name: "Süreç anları" }).tabIndex).toBe(0);
  expect(within(section).getByRole("button", { name: "Önceki an" })).toBeDefined();
  expect(within(section).getByRole("button", { name: "Sonraki an" })).toBeDefined();
  expect(within(section).getByRole("progressbar", { name: "Süreç şeridi ilerlemesi" }).getAttribute("aria-valuenow")).toBe("0");
  expect(section.querySelectorAll("img")).toHaveLength(0);
  expect(section.querySelectorAll("li span")).toHaveLength(6);
});
