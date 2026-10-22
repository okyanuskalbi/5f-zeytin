"use client";

import { useCallback, useEffect, useId, useRef, useState, type CSSProperties, type JSX } from "react";
import { useAnimate } from "motion/react-mini";
import { XIcon } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { useCartViewport } from "@/components/cart/useCartViewport";
import { V3Picture } from "@/components/media/V3Picture";
import { PaymentLogos } from "@/components/site/PaymentLogos";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { getProductDetails } from "@/lib/catalog/product-details";
import { productImageFocus } from "@/lib/catalog/product-image-focus";
import { usePrefersReducedMotion } from "@/lib/media/use-deferred-enhancement";
import { v3Image } from "@/lib/media/v3-assets";
import { motionTokens } from "@/lib/ui-motion";
import type { ProductVariant } from "@/types/catalog";
import { AddToCart } from "./AddToCart";
import styles from "./ProductDetail.module.css";

const money = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", minimumFractionDigits: 0, maximumFractionDigits: 2 });

// 21st shadcn / Calendar picker in a drawer (demo 2808, component 2679):
// adapt its controlled drawer and labelled content to our shared Dialog/Sheet,
// keeping catalog choices open after selection and all styling in brand tokens.
export function ProductDetail({ product, products, onSelect, onClose, onRestoreFocus }: {
  product: ProductVariant; products: readonly ProductVariant[]; onSelect: (id: string) => void;
  onClose: () => void; onRestoreFocus: () => void;
}): JSX.Element {
  const mobile = useCartViewport();
  const reduced = usePrefersReducedMotion();
  const [panel, animate] = useAnimate<HTMLDivElement>();
  const [content, setContent] = useState<HTMLDivElement | null>(null);
  const attachContent = useCallback((node: HTMLDivElement | null) => { setContent(node); }, []);
  const closing = useRef(false);
  const mounted = useRef(false);
  const Root = mobile ? Sheet : Dialog;
  const Content = mobile ? SheetContent : DialogContent;

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    if (reduced || !content || !panel.current) return;
    const controls = animate(panel.current, { y: [mobile ? "100%" : motionTokens.distance.lg, 0], opacity: [0, 1] },
      { duration: motionTokens.duration.crossfade });
    return () => controls.stop();
  }, [animate, content, mobile, panel, reduced]);

  function close(): void {
    if (closing.current) return;
    closing.current = true;
    if (reduced || !panel.current) { onClose(); return; }
    // Retain Radix focus/scroll locks and the mobile buy-bar exclusion through exit.
    void animate(panel.current, { y: mobile ? "100%" : motionTokens.distance.lg, opacity: 0 },
      { duration: motionTokens.duration.fast }).then(() => { if (mounted.current) onClose(); });
  }

  return <Root open onOpenChange={open => { if (!open) close(); }}>
    <Content ref={attachContent} data-product-detail="" aria-modal="true"
      data-slot={mobile ? "sheet-content" : "dialog-content"} data-reduced-motion={reduced}
      placement={mobile ? "fullscreen" : "center"} showCloseButton={false}
      className={mobile ? styles.sheet : styles.dialog}
      onOpenAutoFocus={event => { event.preventDefault(); content?.querySelector<HTMLElement>("h2")?.focus({ preventScroll: true }); }}
      onCloseAutoFocus={event => { event.preventDefault(); onRestoreFocus(); }}>
      <div ref={panel} className={styles.panel}>
        <DetailBody product={product} products={products} mobile={mobile} onSelect={onSelect} />
        <DialogClose asChild><Button variant="ghost" size="icon" className={styles.close}>
          <XIcon aria-hidden="true" /><span className="sr-only">Kapat</span>
        </Button></DialogClose>
      </div>
    </Content>
  </Root>;
}

function DetailBody({ product, products, mobile, onSelect }: {
  product: ProductVariant; products: readonly ProductVariant[]; mobile: boolean; onSelect: (id: string) => void;
}): JSX.Element {
  const cart = useCart();
  const reduced = usePrefersReducedMotion();
  const [mainImage, animateImage] = useAnimate<HTMLDivElement>();
  const sizeGroup = useId();
  const [selection, setSelection] = useState({ id: product.id, quantity: 1, scene: false });
  // Reset variant-local choices without remounting the focused size radio.
  if (selection.id !== product.id) setSelection({ id: product.id, quantity: 1, scene: false });
  const requested = selection.quantity;
  const scene = selection.scene;
  const details = getProductDetails(product);
  const variants = products.filter(item => item.familyId === product.familyId);
  const inCart = cart?.state.items.find(item => item.productId === product.id)?.quantity ?? 0;
  const remaining = Math.max(0, product.stock - inCart);
  const quantity = Math.min(requested, Math.max(1, remaining));
  const studioKey = product.galleryKeys.find(key => key.endsWith("-studyo")) ?? product.imageKey;
  const sceneKey = product.galleryKeys.find(key => key.endsWith("-sahne"));
  const activeImageKey = scene && sceneKey ? sceneKey : studioKey;
  const previousImageKey = useRef(activeImageKey);
  const gallery = [{ key: studioKey, label: "Stüdyo görseli" }, ...(sceneKey ? [{ key: sceneKey, label: "Sofra görseli" }] : [])];

  useEffect(() => {
    const changed = previousImageKey.current !== activeImageKey;
    previousImageKey.current = activeImageKey;
    if (!changed || reduced || !mainImage.current) return;
    const node = mainImage.current;
    const controls = animateImage(node, { opacity: [0, 1] }, { duration: motionTokens.duration.crossfade });
    return () => { controls.stop(); node.style.opacity = "1"; };
  }, [activeImageKey, animateImage, mainImage, reduced]);

  const purchase = <div data-product-detail-purchase="" className={styles.purchase}>
    {product.stock > 0 && <div className={styles.quantityRow}>
      <span>Adet</span>
      <div role="group" aria-label="Adet seçimi" className={styles.quantity}>
        <button type="button" aria-label="Adedi azalt" disabled={quantity <= 1 || remaining === 0}
          onClick={() => setSelection({ ...selection, quantity: quantity - 1 })}>−</button>
        <output aria-label="Adet" aria-live="polite">{quantity}</output>
        <button type="button" aria-label="Adedi artır" disabled={quantity >= remaining}
          onClick={() => setSelection({ ...selection, quantity: quantity + 1 })}>+</button>
      </div>
    </div>}
    <AddToCart key={product.id} product={product} quantity={quantity} disabled={remaining === 0} />
    {product.stock > 0 && remaining === 0 && <p className={styles.stock} role="status">Stok sınırına ulaştınız. Ürünün tamamı sepetinizde.</p>}
  </div>;

  return <>
    <div className={styles.scroller} data-product-detail-scroll="">
      <div className={styles.gallery} data-product-detail-gallery="">
        <div ref={mainImage} data-product-detail-image="" className={styles.image}
          style={{ "--product-image-position": productImageFocus[activeImageKey] ?? "center" } as CSSProperties}>
          <V3Picture image={v3Image(activeImageKey)} sizes="(max-width: 767px) 100vw, (max-width: 1088px) calc((100vw - 48px) / 2), 520px" />
        </div>
        <div role="group" aria-label="Ürün görselleri" className={styles.thumbnails}>
          {gallery.map((image, index) => <button key={image.key} type="button" aria-label={image.label}
            aria-pressed={scene === (index === 1)} onClick={() => setSelection({ ...selection, scene: index === 1 })}>
            <V3Picture image={v3Image(image.key)} sizes="64px" decorative />
          </button>)}
        </div>
      </div>
      <div className={styles.info} data-product-detail-info="">
        <span className={styles.category}>{details?.information.find(row => row.label === "Kategori")?.value}</span>
        <DialogTitle tabIndex={-1} className={styles.title}>{product.name}</DialogTitle>
        {variants.length > 1 ? <div role="radiogroup" aria-label="Boy" className={styles.sizes}>
          {variants.map(variant => <label key={variant.id} className={styles.size} data-state={variant.id === product.id ? "checked" : "unchecked"}>
            <input className="sr-only" type="radio" name={sizeGroup} value={variant.id} checked={variant.id === product.id}
              onChange={() => onSelect(variant.id)} />{variant.weight}
          </label>)}
        </div> : <p className={styles.weight}>{product.weight}</p>}
        <p aria-label="Fiyat" className={styles.price}>{money.format(product.priceKurus / 100)}</p>
        {!mobile && purchase}
        <DialogDescription className={styles.description}>{details?.description}</DialogDescription>
        {details && <table aria-label="Ürün bilgileri" className={styles.facts}><tbody>
          {details.information.map(row => <tr key={row.label}><th scope="row">{row.label}</th><td>{row.value}</td></tr>)}
        </tbody></table>}
        <div className={styles.payment}>
          <span>Güvenli Ödeme</span>
          <PaymentLogos tone="light" brands={["visa", "mastercard", "troy"]} />
        </div>
      </div>
    </div>
    {mobile && purchase}
  </>;
}
