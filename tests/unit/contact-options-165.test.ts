import { expect, it } from "vitest";
import { GET as address } from "@/app/api/address-options/route";
import { GET as countries } from "@/app/api/phone-countries/route";
import { findPhoneCountries, groupedNational, phoneDigits, phoneInputLimit, splitPhone, validPhoneParts } from "@/lib/contact/customer-phone";

it("searches Turkish cities and only districts belonging to the selected city", async () => {
  const cities = await address(new Request("https://afina.test/api/address-options?kind=city&query=istan")).json();
  expect(cities.items).toEqual(["İstanbul"]);
  const districts = await address(new Request("https://afina.test/api/address-options?kind=district&city=Osmaniye&query=duz")).json();
  expect(districts.items).toEqual(["Düziçi"]);
  const other = await address(new Request("https://afina.test/api/address-options?kind=district&city=İstanbul&query=duz")).json();
  expect(other.items).not.toContain("Düziçi");
  expect(address(new Request("https://afina.test/api/address-options?kind=district")).status).toBe(400);
  expect(address(new Request("https://afina.test/api/address-options?kind=city&kind=district")).status).toBe(400);
});
it("finds countries by localized name, ISO and calling code without conflating shared codes", async () => {
  expect(findPhoneCountries("tr", "ingiltere")[0].country).toBe("GB");
  expect(findPhoneCountries("tr", "TR")[0].code).toBe("+90");
  const result = await countries(new Request("https://afina.test/api/phone-countries?query=%2B1")).json();
  expect(result.items.map((item: { country: string }) => item.country)).toEqual(expect.arrayContaining(["US", "CA"]));
  expect(countries(new Request("https://afina.test/api/phone-countries?query=x&email=private")).status).toBe(400);
});
it("formats without discarding digits and validates the selected national numbering plan", () => {
  expect(phoneDigits(groupedNational("05551234567", "TR"))).toBe("05551234567");
  expect(validPhoneParts("TR", "05551234567")?.phoneNational).toBe("5551234567");
  expect(validPhoneParts("TR", "905551234567")).toBeNull();
  expect(validPhoneParts("TR", "123")).toBeNull();
  expect(phoneInputLimit("0555", "TR")).toBe(11);
  expect(splitPhone("0044 7400 123456")).toEqual({ country: "GB", national: "7400123456" });
});
