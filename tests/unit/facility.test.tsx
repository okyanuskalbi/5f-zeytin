import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { Facility } from "@/components/landing/Facility";

afterEach(cleanup);
it("keeps the confirmed facility facts and uses only the approved blurred derivative", () => {
  render(<Facility />);
  const facility = screen.getByRole("region", { name: "Osmaniye’de, kendi tesisimizde." });
  const image = screen.getByRole("img", { name: "Afina Zeytin’in Ellek, Düziçi’ndeki üretim tesisi" });
  expect(image.getAttribute("src")).toBe("/images/v3/tesis-osmaniye-w800.webp");
  expect(facility.querySelector("svg, iframe, form, input")).toBeNull();
  expect(facility.textContent).toContain("Ellek · Düziçi · 2021’den bu yana.");
  expect(facility.textContent).toContain("perakende ve toptan alıcılarla");
  expect(facility.textContent).not.toMatch(/%100|organik|sertifikalı|lider/);
});
