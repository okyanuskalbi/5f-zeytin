import classic from "@/lib/media/classic-photos.json";
import approved from "@/lib/media/editorial-photos.json";
import type { ProductGroupId } from "@/lib/catalog/groups";
import type { V3Image } from "@/lib/media/v3-assets";

/** One photograph per catalogue heading; "all" is the full list at /urunler. */
export const catalogBanners: Readonly<Record<ProductGroupId | "all", V3Image>> = {
  all: approved.assets["blog-sofra"],
  zeytinyagi: approved.assets["zeytinyagi-yatay"],
  zeytin: approved.assets["zeytin-kase"],
  "siyah-zeytin": classic.assets["siyah-zeytin"],
  "yesil-zeytin": classic.assets["yesil-zeytin"],
  "kirma-zeytin": approved.assets["blog-kirma"],
};
