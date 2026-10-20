"use client";

import { useRef, useState, type JSX } from "react";
import Image from "next/image";
import { FeaturedMediaMotion } from "./FeaturedMediaMotion";
import { FeaturedPurchase } from "./FeaturedPurchase";
import type { Product } from "@/types/catalog";
import styles from "./FeaturedProduct.module.css";

const productName = "Doğal Kırma Yeşil Zeytin";
const sizes = ["1 kg", "5 kg", "10 kg"] as const;

/** Only catalog entries for this product family may become purchasable sizes. */
export function FeaturedProduct({ products }: { products: readonly Product[] }): JSX.Element {
  const variants = sizes.flatMap(weight => {
    const product = products.find(p => p.name === productName && p.category === "sofralik-zeytin" && p.weight === weight);
    return product ? [product] : [];
  });
  // Reset selection when the server sends a different variant set.
  return <FeaturedStage key={variants.map(p => p.id).join(":")} variants={variants} />;
}

function FeaturedStage({ variants }: { variants: Product[] }): JSX.Element {
  const scope = useRef<HTMLElement>(null);
  const [selectedId, setSelectedId] = useState(() => (variants.find(p => p.weight === "10 kg") ?? variants[0])?.id);
  const selected = variants.find(p => p.id === selectedId);

  return <section ref={scope} id="one-cikan" data-scene="featured" aria-labelledby="featured-title" className={styles.stage}>
    <FeaturedMediaMotion target={scope}>
      <Image src="/media/featured/referans-teneke.jpg" width={923} height={920}
        sizes="(min-width: 1024px) 50vw, 100vw" alt="AFİNA Doğal Kırma Yeşil Zeytin 10 kg teneke ambalaj referansı"
        className={styles.image} />
    </FeaturedMediaMotion>
    <div className={styles.content}>
      <div className={styles.story}>
        <h2 id="featured-title" data-scene-reveal="">{productName}</h2>
        <p data-scene-reveal="">Zeytinin hikâyesi toprakta başlar, sofrada tamamlanır. Afina Zeytin, bu köklü lezzeti doğallığına saygı duyan bir anlayışla sunuyor.</p>
        <p data-scene-reveal="">Sofralık zeytin, salamura zeytin ve zeytinyağı; perakende ve toptan.</p>
      </div>
      <div className={styles.purchase}>
        {selected ? <>
          <fieldset className={styles.sizes}>
            <legend>Boy seçin</legend>
            <div>{variants.map(product => <label key={product.id} className={styles.size}>
              <input type="radio" name="featured-size" value={product.id} checked={selectedId === product.id}
                onChange={() => setSelectedId(product.id)} />
              <span>{product.weight}</span>
            </label>)}</div>
          </fieldset>
          <FeaturedPurchase key={selected.id} product={selected} />
          {selected.id.startsWith("sample-") && <p className={styles.note}>Temsili ürün, fiyat ve stok bilgisi. Gerçek satış kataloğu değildir.</p>}
        </> : <p role="status">Görüntülenecek ürün bulunmuyor.</p>}
        <a className={styles.wholesale} href="#toptan">Toptan alım için teklif isteyin</a>
      </div>
    </div>
  </section>;
}
