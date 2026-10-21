import type { JSX } from "react";
import { V3Picture } from "@/components/media/V3Picture";
import { v3Image } from "@/lib/media/v3-assets";
import type { Product } from "@/types/catalog";
import styles from "./CartExperience.module.css";

export function ProductThumbnail({ product }: { product: Product }): JSX.Element | null {
  if (!("imageKey" in product) || typeof product.imageKey !== "string") return null;
  return <V3Picture image={v3Image(product.imageKey)} sizes="64px" decorative className={styles.thumbnail} />;
}
