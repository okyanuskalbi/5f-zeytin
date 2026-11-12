"use client";

import { forwardRef, useEffect, useId, useRef, useState, useSyncExternalStore, type JSX, type ReactElement, type RefObject } from "react";
import { X } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { AnimatePresence, motion, useIsPresent, useReducedMotion, type HTMLMotionProps } from "motion/react";
import { PillButton } from "@/components/storefront/ui/PillButton";
import { PaymentUnavailable } from "@/components/storefront/cart/PaymentUnavailable";
import { InteractiveCheckout } from "@/components/ui/interactive-checkout";
import { CartEmpty, CartLineItem, CartTotals, CartTrust } from "./CartPresentation";
import {
  Dialog, DialogClose, DialogDescription, DialogOverlay, DialogPortal, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Upsell, type UpsellConfiguration } from "@/components/cart/Upsell";
import { motionTokens, springs } from "@/lib/ui-motion";
import styles from "./CartExperience.module.css";
import type { CartStore } from "@/lib/cart/types";
import type { Product } from "@/types/catalog";

type CartDrawerProps = {
  store: CartStore;
  products: readonly Product[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Optional local trigger; Task 038 can also open the drawer from its provider. */
  trigger?: ReactElement;
  /** Explicit external opener also restores mouse focus correctly in Safari. */
  returnFocusRef?: RefObject<HTMLElement | null>;
  upsell?: UpsellConfiguration | null;
  checkoutHref?: string | null;
};

// Exiting content stays visible for its animation, but cannot receive focus.
const CartPanel = forwardRef<HTMLDivElement, HTMLMotionProps<"div">>(function CartPanel(props, ref) {
  const present = useIsPresent();
  return <motion.div {...props} ref={ref} aria-hidden={!present} inert={!present} />;
});
const mobileCartQuery = "(max-width: 767px), (max-width: 900px) and (max-height: 500px) and (orientation: landscape)";
function subscribeMobileCart(notify: () => void): () => void {
  if (typeof window.matchMedia !== "function") return () => {};
  const media = window.matchMedia(mobileCartQuery);
  media.addEventListener("change", notify);
  return () => media.removeEventListener("change", notify);
}
const mobileCartSnapshot = () => typeof window.matchMedia === "function" && window.matchMedia(mobileCartQuery).matches;
// 21st ddoemonn/Drawer 23558: right panel, scroll body and anchored footer.
// Radix retains the modal/focus/scroll behavior; mobile uses the full viewport.
export function CartDrawer({ store, products, open, onOpenChange, trigger, returnFocusRef, upsell, checkoutHref = null }: CartDrawerProps): JSX.Element {
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  const mobile = useSyncExternalStore(subscribeMobileCart, mobileCartSnapshot, () => false);
  const id = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const [feedback, setFeedback] = useState({ error: false, message: "" });
  const reduced = useReducedMotion();
  const transition = reduced ? { duration: 0 } : springs.drawer;
  useEffect(() => { store.hydrate(); }, [store]);

  const lines = state.items.map((item) => ({ ...item, product: products.find((product) => product.id === item.productId) }));
  const itemCount = lines.reduce((count, line) => count + line.quantity, 0);
  const validCart = state.hydrated && lines.length > 0
    && lines.every(({ product, quantity }) => product && product.stock >= quantity);
  const subtotal = lines.reduce((total, { product, quantity }) => total + (product?.priceKurus ?? 0) * quantity, 0);

  function changeQuantity(productId: string, quantity: number): void {
    try {
      store.setQuantity(productId, quantity);
      setFeedback({ error: false, message: `Adet ${quantity} olarak güncellendi.` });
    } catch {
      setFeedback({ error: true, message: "Adet güncellenemedi. Stok değişmiş olabilir. Sepeti kontrol edip tekrar deneyin." });
    }
  }

  function removeItem(productId: string): void {
    // The focused line is about to disappear; keep focus inside the modal.
    closeRef.current?.focus();
    store.removeItem(productId);
    setFeedback({ error: false, message: "Ürün sepetten silindi." });
  }

  function addSuggestion(productId: string): void {
    if (!validCart) return;
    try {
      store.addItem(productId, 1);
      closeRef.current?.focus();
      setFeedback({ error: false, message: `${products.find(product => product.id === productId)?.name} sepetinize eklendi.` });
    } catch {
      setFeedback({ error: true, message: "Ürün eklenemedi. Stok değişmiş olabilir. Sepeti kontrol edip tekrar deneyin." });
    }
  }

  const viewCart = <PillButton variant="quiet" href="/sepet" onClick={() => onOpenChange(false)}>Sepeti görüntüle</PillButton>;

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => {
      // Safari does not focus clicked buttons. Remember the trigger explicitly.
      if (nextOpen) openerRef.current = triggerRef.current;
      setFeedback({ error: false, message: "" });
      onOpenChange(nextOpen);
    }}>
      {trigger && <DialogTrigger ref={triggerRef} asChild>{trigger}</DialogTrigger>}
      <AnimatePresence>
      {open && <DialogPortal forceMount>
      <DialogOverlay forceMount asChild><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={reduced ? { duration: 0 } : { duration: motionTokens.duration.fast }} /></DialogOverlay>
      <DialogPrimitive.Content forceMount asChild aria-modal="true"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          // Also cover programmatic opens, whose opener is outside DialogTrigger.
          if (!openerRef.current) openerRef.current = returnFocusRef?.current ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
          closeRef.current?.focus();
        }}
        onCloseAutoFocus={(event) => {
          const opener = openerRef.current;
          openerRef.current = null;
          if (returnFocusRef) returnFocusRef.current = null;
          if (opener?.isConnected && opener !== document.body) {
            event.preventDefault();
            opener.focus();
          }
        }}>
      <CartPanel data-slot="dialog-content" data-cart-drawer="" data-empty={state.hydrated && lines.length === 0}
        className={styles.drawer} layoutRoot
        initial={reduced ? false : { x: "100%" }}
        animate={{ x: 0 }} exit={reduced ? { opacity: 0 } : { x: "100%" }} transition={transition}>
        <div className={styles.drawerHeader}>
          <div className={styles.drawerHeading}>
            <DialogTitle className={styles.drawerTitle}>Sepetim ({itemCount})</DialogTitle>
            <DialogDescription className={styles.drawerDescription}>Sofranız için seçtikleriniz.</DialogDescription>
          </div>
          <DialogClose asChild><button ref={closeRef} type="button" className={styles.close} aria-label="Sepeti kapat"><X size={22} strokeWidth={1.7} aria-hidden="true" /></button></DialogClose>
        </div>

        {/* Firefox otherwise inserts an implicit tab stop on this scroll container. */}
        <InteractiveCheckout variant="drawer">
        <motion.div layoutScroll tabIndex={-1} className={styles.drawerBody}>
          {!state.hydrated ? <p role="status">Sepet yükleniyor…</p> : lines.length === 0 ? (
            <CartEmpty onBrowse={() => onOpenChange(false)} />
          ) : (
            <ul aria-label="Sepetteki ürünler" className={styles.lines}>
              <AnimatePresence initial={false} mode="popLayout">
              {lines.map(({ productId, product, quantity }) => {
                const unavailable = !product || product.stock < quantity;
                return (
                  <CartLineItem key={productId} product={product} quantity={quantity} unavailable={unavailable} disabled={unavailable}
                    onQuantity={next => changeQuantity(productId, next)} onRemove={() => removeItem(productId)} />
                );
              })}
              </AnimatePresence>
            </ul>
          )}
          {validCart && <Upsell products={products} items={state.items} configuration={upsell} onAdd={addSuggestion} />}
          {state.storageError && <p role="alert" className={styles.error}>Sepet bu tarayıcıya kaydedilemiyor. Sayfayı yenilerseniz sepetiniz korunmayabilir.</p>}
          <p role={feedback.error ? "alert" : "status"} aria-atomic="true" className={feedback.error ? styles.error : styles.feedback}>
            {feedback.message}
          </p>
          {mobile && state.hydrated && lines.length > 0 && <div className={styles.drawerBodyTrust}><CartTrust /></div>}
        </motion.div>

        <div className={styles.drawerFooter} data-cart-footer="">
          <CartTotals subtotal={state.hydrated && (lines.length === 0 || validCart) ? subtotal : null} itemCount={itemCount} />
          <p className={styles.estimate}>Kargo ve indirimler dahil değildir.</p>
          {validCart && checkoutHref
            ? <PillButton fullWidth href={checkoutHref} onClick={() => onOpenChange(false)}>Ödemeye geç</PillButton>
            : <PillButton fullWidth disabled aria-describedby={`${id}-payment-help`}>Ödemeye geç</PillButton>}
          {checkoutHref
            ? <><p id={`${id}-payment-help`} className={styles.paymentHelp}>Kesin tutar ödeme öncesinde doğrulanır.</p><div className={styles.viewCart}>{viewCart}</div></>
            : <PaymentUnavailable compact id={`${id}-payment-help`} onNavigate={() => onOpenChange(false)}>{viewCart}</PaymentUnavailable>}
          {!mobile && <CartTrust />}
        </div>
        </InteractiveCheckout>
      </CartPanel>
      </DialogPrimitive.Content>
      </DialogPortal>}
      </AnimatePresence>
    </Dialog>
  );
}
