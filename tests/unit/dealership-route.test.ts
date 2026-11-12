// @vitest-environment node
import { expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import { GET } from "@/app/llms.txt/route";
import config from "@/next.config";

// Task208: the dealership page is the "Bayilik" pill of the home page. Menu and footer links are covered in landing-208.
it("redirects the old dealership address to its pill and keeps it out of the sitemap", async () => {
  expect(await config.redirects?.()).toContainEqual({ source: "/bayilik", destination: "/?sekme=bayilik#toptan-bayilik", permanent: true });
  expect(sitemap().some(entry => entry.url.endsWith("/bayilik"))).toBe(false);
});

it("names the dealership pill in the AI discovery text", async () => {
  const text = await (await GET()).text();
  expect(text).toContain("[Bayilik](https://afinazeytin.com/?sekme=bayilik#toptan-bayilik)");
  expect(text).toMatch(/Bayilik.*e-posta taslağı/);
});
