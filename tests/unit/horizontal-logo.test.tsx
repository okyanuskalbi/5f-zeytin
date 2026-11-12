import { readFileSync, statSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import sharp from "sharp";
import { StoreHeader as Navbar } from "@/components/storefront/StoreHeader";
import { StoreFooter as Footer } from "@/components/storefront/StoreFooter";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));
vi.mock("motion/react", async importOriginal => ({
  ...await importOriginal<typeof import("motion/react")>(),
  useScroll: () => ({ scrollY: null }),
  useMotionValueEvent: () => {},
}));

afterEach(cleanup);

it("identifies the light landing header with the original dark-lettered logo and an accessible home link", () => {
  render(<Navbar />);
  const header = screen.getByRole("banner");
  const home = within(header).getByRole("link", { name: "Afina Zeytin ana sayfa" });
  const logo = within(home).getByRole("img", { name: "AFİNA ZEYTİN" });
  expect(home.getAttribute("href")).toBe("/");
  expect(home.textContent).toBe("");
  expect(logo.getAttribute("src")).toBe("/brand/afina-zeytin-yatay@2x.webp");
  expect(logo.getAttribute("width")).toBe("180");
  expect(logo.getAttribute("height")).toBe("48");
  expect(logo.hasAttribute("fetchpriority")).toBe(false);
  expect(logo.getAttribute("loading")).not.toBe("lazy");
  expect(header.querySelector('link[rel="preload"]')).toBeNull();
  expect(within(header).getByRole("button", { name: "Sepetim, 0 adet" })).toBeTruthy();
  expect(within(header).getByRole("button", { name: "Menüyü aç" })).toBeTruthy();
});

it("uses the original horizontal footer artwork and retains the community identity on a dark surface", () => {
  const doc = new DOMParser().parseFromString(renderToStaticMarkup(<Footer />), "text/html");
  const home = doc.querySelector<HTMLAnchorElement>('a[aria-label="Afina Zeytin ana sayfa"]')!;
  const logo = home.querySelector("img")!;
  expect(home.getAttribute("href")).toBe("/");
  expect(logo.alt).toBe("AFİNA ZEYTİN");
  expect(logo.getAttribute("src")).toBe("/brand/afina-zeytin-yatay-dark@2x.webp");
  expect([logo.width, logo.height]).toEqual([180, 48]);
  expect(logo.getAttribute("loading")).toBe("lazy");
  // Task208: the group's name is a link inside its sentence (sentence links stay underlined).
  const community = doc.querySelector('a[href="https://afina.com.tr"]')!;
  expect(community.textContent).toBe("AFİNA Şirketler Topluluğu");
  expect(community.closest("p")?.textContent).toBe("AFİNA Şirketler Topluluğu markasıdır.");
  expect(community.getAttribute("target")).toBe("_blank");
  expect(community.getAttribute("rel")!.split(/\s+/)).toContain("noopener");
});

it("offers original 2x/3x WebP candidates matched to the light header and dark footer", () => {
  render(<Navbar />);
  const footer = new DOMParser().parseFromString(renderToStaticMarkup(<Footer />), "text/html");
  for (const [root, tone] of [[screen.getByRole("banner"), ""], [footer.querySelector("footer")!, "-dark"]] as const) {
    const picture = root.querySelector("picture")!;
    expect(picture).not.toBeNull();
    expect(picture.querySelector("source")?.getAttribute("type")).toBe("image/webp");
    expect(picture.querySelector("source")?.getAttribute("srcset")).toBe(
      `/brand/afina-zeytin-yatay${tone}@2x.webp 2x, /brand/afina-zeytin-yatay${tone}@3x.webp 3x`,
    );
  }
});

it.each(["", "-dark"])("keeps the light/dark %s assets transparent, proportioned and within 25 KB each", async tone => {
  for (const scale of [2, 3]) {
    const file = `public/brand/afina-zeytin-yatay${tone}@${scale}x.webp`;
    expect(statSync(file).size).toBeLessThanOrEqual(25_000);
    const meta = await sharp(readFileSync(file)).metadata();
    expect(meta.format).toBe("webp");
    expect(meta.hasAlpha).toBe(true);
    expect([meta.width, meta.height]).toEqual([180 * scale, 48 * scale]);
  }
});

it.each([2, 3])("preserves the emblem and ZEYTİN colors while turning only the AFİNA lettering to milk at %ix", async scale => {
  const light = await sharp(`public/brand/afina-zeytin-yatay@${scale}x.webp`).ensureAlpha().raw().toBuffer();
  const dark = await sharp(`public/brand/afina-zeytin-yatay-dark@${scale}x.webp`).ensureAlpha().raw().toBuffer();
  const width = 180 * scale;
  const height = 48 * scale;
  let changedOutsideLettering = 0;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    // Outside AFİNA's source bounds: full hand/branch emblem and the lower ZEYTİN row.
    if (x / width * 405.666 < 132 || y / height * 108.221 > 72) {
      const offset = (y * width + x) * 4;
      const sameAlpha = light[offset + 3] === dark[offset + 3];
      const sameVisibleColor = !light[offset + 3] || light.subarray(offset, offset + 3).equals(dark.subarray(offset, offset + 3));
      if (!sameAlpha || !sameVisibleColor) changedOutsideLettering++;
    }
  }
  expect(changedOutsideLettering).toBe(0);
  // Interior of F's vertical stem, away from antialiased edges.
  const offset = (Math.round(40 / 108.221 * height) * width + Math.round(210 / 405.666 * width)) * 4;
  expect([...light.subarray(offset, offset + 4)]).toEqual([0, 0, 0, 255]);
  expect([...dark.subarray(offset, offset + 4)]).toEqual([247, 243, 234, 255]);
});
