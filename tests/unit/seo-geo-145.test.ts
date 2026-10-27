// @vitest-environment node
import { readFile } from "node:fs/promises";
import sharp from "sharp";
import { expect, it } from "vitest";
import nextConfig from "@/next.config";
import { getProducts } from "@/lib/catalog/static-products";
import robots from "@/app/robots";

it("serves a static Markdown discovery file with all six variant sizes and no prices or legal drafts", async () => {
  const route = await import("@/app/llms.txt/route");
  expect(route.dynamic).toBe("force-static");
  const response = await route.GET();
  expect(response.status).toBe(200);
  expect(response.headers.get("content-type")).toMatch(/^text\/(plain|markdown)(;|$)/);
  const body = await response.text();
  expect(body).toMatch(/^# Afina Zeytin\n/);
  const products = await getProducts();
  expect(products).toHaveLength(6);
  expect(body.split("\n").filter(line => line.startsWith("- ") && !line.includes("]("))).toHaveLength(6);
  for (const product of products) {
    expect(body).toContain(`${product.name} — ${product.weight}`);
    expect(body).not.toContain(String(product.priceKurus));
  }
  expect(body).toContain("Düziçi / Osmaniye");
  for (const href of ["/#toptan-iletisim", "/#sik-sorulanlar", "https://afina.com.tr"]) expect(body).toContain(`](${href})`);
  expect(body).not.toMatch(/₺|\bTRY\b|\bTL\b|\/(?:kvkk|iade|mesafeli-satis)|%100|organik/i);
  expect(robots().rules).toMatchObject({ allow: "/" });
  expect((robots().rules as { disallow: string[] }).disallow).not.toContain("/llms.txt");
});

it("disables the framework signature", () => {
  expect(nextConfig.poweredByHeader).toBe(false);
});

it("serves a multi-size ICO and a 180px Apple PNG alongside the original SVG", async () => {
  const ico = await readFile("app/favicon.ico");
  expect(ico.readUInt16LE(0)).toBe(0);
  expect(ico.readUInt16LE(2)).toBe(1);
  expect(ico.readUInt16LE(4)).toBe(3);
  for (const [index, size] of [16, 32, 48].entries()) {
    const offset = 6 + index * 16;
    expect(ico[offset]).toBe(size);
    expect(ico[offset + 1]).toBe(size);
    const length = ico.readUInt32LE(offset + 8);
    const start = ico.readUInt32LE(offset + 12);
    expect(start + length).toBeLessThanOrEqual(ico.length);
    expect(await sharp(ico.subarray(start, start + length)).metadata()).toMatchObject({ format: "png", width: size, height: size });
  }
  expect(await sharp("app/apple-icon.png").metadata()).toMatchObject({ format: "png", width: 180, height: 180 });
  expect(await readFile("public/brand/favicon.svg", "utf8")).toContain("<svg");
});
