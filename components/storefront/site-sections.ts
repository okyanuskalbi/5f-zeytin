/** The landing page's menu: every destination is a section of `/`, addressed absolutely so it works from any page. */
export const siteSections = [
  { id: "urunler", label: "Ürünler", href: "/#urunler" },
  { id: "hikayemiz", label: "Hikâyemiz", href: "/#hikayemiz" },
  { id: "toptan-bayilik", label: "Toptan & Bayilik", href: "/#toptan-bayilik" },
  { id: "blog", label: "Blog", href: "/#blog" },
  { id: "iletisim", label: "İletişim", href: "/#iletisim" },
] as const;

export type SiteSectionId = (typeof siteSections)[number]["id"];

/** Pages that stay separate still belong to a section: a product to Ürünler, an article to Blog. */
export function sectionForPath(pathname: string | null): SiteSectionId | null {
  if (pathname?.startsWith("/urun/")) return "urunler";
  if (pathname?.startsWith("/blog/")) return "blog";
  return null;
}
