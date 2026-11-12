import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, it, vi } from "vitest";
import Layout from "@/app/urunler/layout";
import CategoryPage, { dynamic, dynamicParams, generateMetadata, generateStaticParams, revalidate } from "@/app/urunler/[kategori]/page";
import { getGroupTrail, getProductGroup, productGroups, productsForGroup } from "@/lib/catalog/groups";
import { getProductFamilies } from "@/lib/catalog/static-products";
import type { ProductFamily } from "@/types/catalog";

const { readFamilies, route } = vi.hoisted(() => ({ readFamilies: vi.fn(), route: { pathname: "/urunler" } }));
vi.mock("@/lib/catalog/read", () => ({ readProductFamilies: readFamilies }));
vi.mock("next/navigation", () => ({ usePathname: () => route.pathname, notFound: () => { throw new Error("NEXT_NOT_FOUND"); } }));

beforeEach(async () => { readFamilies.mockResolvedValue(await getProductFamilies()); });
const params = (kategori: string) => ({ params: Promise.resolve({ kategori }) });
const parse = (markup: string) => new DOMParser().parseFromString(markup, "text/html");

it("defines the two root groups and three ordered olive children and assigns every family to one known group", async () => {
  expect(productGroups.map(group => [group.id, group.name, group.photo])).toEqual([
    ["zeytinyagi", "Zeytinyağı", "zeytinyagi"], ["zeytin", "Zeytin", "siyah-zeytin"],
    ["siyah-zeytin", "Siyah Zeytin", "siyah-zeytin"], ["yesil-zeytin", "Yeşil Zeytin", "yesil-zeytin"], ["kirma-zeytin", "Kırma Zeytin", "kirma-zeytin"],
  ]);
  for (const family of await getProductFamilies()) expect(productGroups.filter(group => group.id === family.groupId)).toHaveLength(1);
  expect(generateStaticParams()).toEqual(productGroups.map(group => ({ kategori: group.id })));
  expect(dynamic).toBe("force-static"); expect(dynamicParams).toBe(false); expect(revalidate).toBe(300);
});

it.each([
  ["zeytin", ["sample-green-olive-10kg", "sample-green-olive-1kg", "sample-black-olive-1kg", "sample-brined-green-olive-5kg"]],
  ["siyah-zeytin", ["sample-black-olive-1kg"]], ["yesil-zeytin", ["sample-brined-green-olive-5kg"]],
  ["kirma-zeytin", ["sample-green-olive-10kg", "sample-green-olive-1kg"]], ["zeytinyagi", ["sample-olive-oil-1l", "sample-olive-oil-5l"]],
] as const)("renders every approved size in %s with shared cards and a hierarchical breadcrumb schema", async (id, ids) => {
  const group = getProductGroup(id)!;
  route.pathname = `/urunler/${id}`;
  const doc = parse(renderToStaticMarkup(<Layout>{await CategoryPage(params(id))}</Layout>));
  expect(doc.querySelector("h1")?.textContent).toBe(group.name);
  const trail = doc.querySelector('nav[aria-label="İçerik yolu"]')!;
  expect(trail.textContent).toBe(`Ana Sayfa/Ürünler/${getGroupTrail(id).map(item => item.name).join("/")}`);
  expect(trail.querySelector('a[href="/urunler"]')?.textContent).toBe("Ürünler");
  expect(trail.querySelector('[aria-current="page"]')?.textContent).toBe(group.name);
  expect(doc.body.textContent).toContain("Ambalajınızı seçin, sepetinize veya teklifinize ekleyin.");
  expect([...doc.querySelectorAll("[data-product-id]")].map(card => card.getAttribute("data-product-id"))).toEqual(ids);
  for (const productId of ids) expect(doc.querySelector(`a[href="/toptan-satis?teklif=${productId}"]`)).not.toBeNull();
  const schema = JSON.parse(doc.querySelector('script[type="application/ld+json"]')!.textContent!);
  expect(schema["@type"]).toBe("BreadcrumbList");
  expect(schema.itemListElement).toEqual([
    expect.objectContaining({ position: 1, name: "Ana Sayfa", item: "https://afinazeytin.com/" }),
    expect.objectContaining({ position: 2, name: "Ürünler", item: "https://afinazeytin.com/urunler" }),
    ...getGroupTrail(id).map((item, index) => expect.objectContaining({ position: index + 3, name: item.name, item: `https://afinazeytin.com/urunler/${item.id}` })),
  ]);
  const metadata = await generateMetadata(params(id));
  expect(metadata.title).toBe(`${group.name} | AFİNA ZEYTİN`);
  expect(metadata.description).toContain("Ambalajınızı seçin, sepetinize veya teklifinize ekleyin.");
  expect(metadata.alternates).toEqual({ canonical: `/urunler/${id}` });
  expect(metadata.robots).toEqual({ index: false, follow: true });
});

it("includes all sizes from two separate families assigned to one group", async () => {
  const families = await getProductFamilies();
  const black = families.find(family => family.groupId === "siyah-zeytin")!;
  const second: ProductFamily = { ...black, id: "second-black", variants: [
    { ...black.variants[0], id: "test-black-small", familyId: "second-black" },
    { ...black.variants[0], id: "test-black-large", familyId: "second-black", weight: "2 kg" },
  ] };
  const testFamilies = [...families, second];
  expect(productsForGroup(testFamilies, "siyah-zeytin").map(product => product.id)).toEqual(["sample-black-olive-1kg", "test-black-small", "test-black-large"]);
  readFamilies.mockResolvedValue(testFamilies);
  const doc = parse(renderToStaticMarkup(await CategoryPage(params("siyah-zeytin"))));
  expect(doc.querySelectorAll("[data-product-id]")).toHaveLength(3);
});

it("announces an empty group with a route back to the full catalogue", async () => {
  readFamilies.mockResolvedValue([]);
  const doc = parse(renderToStaticMarkup(await CategoryPage(params("siyah-zeytin"))));
  expect(doc.querySelector('[role="status"]')?.textContent).toBe("Bu grupta şu an ürün bulunmuyor.");
  expect(doc.querySelector('a[href="/urunler"]')?.textContent).toBe("Tüm Ürünler");
  expect(doc.querySelectorAll("[data-product-id]")).toHaveLength(0);
});

it("rejects unknown groups rather than displaying another group", async () => {
  expect(getProductGroup("olmayan")).toBeUndefined();
  await expect(CategoryPage(params("olmayan"))).rejects.toThrow("NEXT_NOT_FOUND");
  await expect(generateMetadata(params("olmayan"))).rejects.toThrow("NEXT_NOT_FOUND");
});
