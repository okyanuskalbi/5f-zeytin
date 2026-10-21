import { readFileSync } from "node:fs";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { Facility } from "@/components/landing/Facility";

afterEach(cleanup);
it("keeps the official story and uses only the approved blurred facility derivative", () => {
  render(<Facility />);
  const facility = screen.getByRole("region", { name: "Osmaniye’de, kendi tesisimizde." });
  const official = readFileSync("docs/referans/icerik.md", "utf8");
  const story = [...facility.querySelectorAll("p")].find(node => node.textContent?.startsWith("Osmaniye’de bulunan fabrikasıyla"))!;
  expect(official).toContain(story.textContent);
  const image = screen.getByRole("img", { name: "Afina Zeytin’in Ellek, Düziçi’ndeki üretim tesisi" });
  expect(image.getAttribute("src")).toBe("/images/v3/tesis-osmaniye-w800.webp");
  expect(facility.querySelector("svg, iframe, form, input")).toBeNull();
  expect(facility.textContent).toContain("Ellek, Düziçi");
  expect(facility.textContent).not.toMatch(/%100|organik|sertifikalı|lider/);
});
