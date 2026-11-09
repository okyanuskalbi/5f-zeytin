import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import Page from "@/app/bayilik/page";

it("composes the real dealership page and form into readable, safe server HTML", () => {
  const doc = new DOMParser().parseFromString(renderToStaticMarkup(<Page />), "text/html");
  expect(doc.querySelectorAll("main")).toHaveLength(1);
  expect([...doc.querySelectorAll("h1")].map(heading => heading.textContent)).toEqual(["Bayimiz Olun"]);
  const form = doc.querySelector("#basvuru form");
  expect(form).not.toBeNull();
  expect(form!.getAttribute("aria-label")).toMatch(/bayilik/i);
  expect(form!.querySelectorAll("[required]")).toHaveLength(8);
  const submit = form!.querySelector('button[type="submit"]');
  expect(submit).not.toBeNull();
  expect(submit!.hasAttribute("disabled") || submit!.closest("fieldset[disabled]") !== null).toBe(true);
  expect(submit!.textContent).toBe("Başvuru E-postasını Hazırla");
  expect(form!.querySelector('a[href^="mailto:"][href*="subject="]')).toBeNull();
  expect(doc.querySelector('a[href="/kvkk"]')).not.toBeNull();
  expect(doc.body.textContent).not.toMatch(/başvurunuz alındı|başvurunuz gönderildi|Türkiye geneli|kâr marjı|sertifika/i);
});

it("keeps form identifiers unique and gives each visible control a connected name and description", () => {
  const doc = new DOMParser().parseFromString(renderToStaticMarkup(<Page />), "text/html");
  const ids = [...doc.querySelectorAll("[id]")].map(element => element.id);
  expect(new Set(ids).size).toBe(ids.length);
  const fields = [...doc.querySelectorAll<HTMLElement>('form input:not([type="hidden"]), form select:not([hidden]):not([aria-hidden="true"]), form textarea')];
  expect(fields.length).toBeGreaterThanOrEqual(10);
  for (const field of fields) {
    const label = [...doc.querySelectorAll("label")].find(element => element.htmlFor === field.id && field.id);
    const referenced = field.getAttribute("aria-labelledby")?.split(/\s+/).map(id => doc.getElementById(id)?.textContent).join(" ");
    expect(Boolean(label?.textContent?.trim() || referenced?.trim() || field.closest("label")?.textContent?.trim() || field.getAttribute("aria-label")), field.outerHTML).toBe(true);
    for (const id of field.getAttribute("aria-describedby")?.split(/\s+/).filter(Boolean) ?? []) {
      expect(doc.getElementById(id), `Description ${id} for ${field.getAttribute("name")}`).not.toBeNull();
    }
  }
});
