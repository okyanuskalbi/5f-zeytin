"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore, type JSX, type ReactElement, type RefObject } from "react";
import Link from "next/link";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { AnimatePresence, motion, useDragControls, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogClose, DialogDescription, DialogOverlay, DialogPortal, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Upsell, type UpsellConfiguration } from "@/components/cart/Upsell";
import { useCartViewport } from "@/components/cart/useCartViewport";
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

const money = new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
function formatPrice(kurus: number): string { return `${money.format(kurus / 100)} ₺`; }

// 21st ddoemonn/Drawer 23558 (modal/focus/scroll) + wensity/Drawer 31360
// (bottom sheet/snap/scroll body), adapted to the existing Radix and Motion stack.
export function CartDrawer({ store, products, open, onOpenChange, trigger, returnFocusRef, upsell, checkoutHref = "/odeme" }: CartDrawerProps): JSX.Element {
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  const id = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const [feedback, setFeedback] = useState({ error: false, message: "" });
  const mobile = useCartViewport();
  const reduced = useReducedMotion();
  const controls = useDragControls();
  const [expanded, setExpanded] = useState(false);
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

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => {
      // Safari does not focus clicked buttons. Remember the trigger explicitly.
      if (nextOpen) openerRef.current = triggerRef.current;
      if (!nextOpen) setExpanded(false);
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
      <motion.div data-slot="dialog-content" data-cart-drawer="" data-snap={expanded ? "expanded" : "compact"} aria-hidden={!open} inert={!open}
        className={styles.drawer} layoutRoot
        initial={reduced ? false : mobile ? { y: "100%" } : { x: "100%" }}
        animate={{ x: 0, y: 0 }} exit={reduced ? { opacity: 0 } : mobile ? { y: "100%" } : { x: "100%" }} transition={transition}
        drag={mobile && !reduced ? "y" : false} dragControls={controls} dragListener={false} dragMomentum={false}
        dragConstraints={{ top: 0, bottom: 0 }} dragElastic={0.2} dragSnapToOrigin
        onDragEnd={(_, info) => {
          if (info.offset.y < -48 || (info.offset.y < -12 && info.velocity.y < -400)) setExpanded(true);
          else if (info.offset.y > 96 || (info.offset.y > 24 && info.velocity.y > 650)) {
            if (expanded) setExpanded(false); else onOpenChange(false);
          } else if (info.offset.y > 48) setExpanded(false);
        }}>
        <div className={styles.drawerHeader}>
          <div className="min-w-0 space-y-2">
            <DialogTitle className="flex items-center gap-2">Sepetim</DialogTitle>
            <DialogDescription className="text-base">Ürünlerinizi gözden geçirin, adetleri düzenleyin.</DialogDescription>
          </div>
          <DialogClose asChild><Button ref={closeRef} variant="ghost" size="icon" aria-label="Sepeti kapat"><X aria-hidden="true" /></Button></DialogClose>
        </div>

        {/* Firefox otherwise inserts an implicit tab stop on this scroll container. */}
        <div tabIndex={-1} className={`${styles.drawerBody} min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain`}>
          {!state.hydrated ? <p role="status">Sepet yükleniyor…</p> : lines.length === 0 ? (
            <p role="status" className="py-8 text-muted-foreground">Sepetiniz henüz boş.</p>
          ) : (
            <ul aria-label="Sepetteki ürünler">
              <AnimatePresence initial={false} mode="popLayout">
              {lines.map(({ productId, product, quantity }, index) => {
                const unavailable = !product || product.stock < quantity;
                return (
                  <motion.li key={productId} className={styles.line} layout={reduced ? false : "position"}
                    initial={reduced ? false : { opacity: 0, x: motionTokens.distance.lg }} animate={{ opacity: 1, x: 0 }}
                    exit={reduced ? { opacity: 0 } : { opacity: 0, x: motionTokens.distance.lg }} transition={transition}>
                    <div role="group" aria-labelledby={`${id}-line-${index}`} className="space-y-3">
                      <h3 id={`${id}-line-${index}`} className="text-lg break-words">{product?.name ?? "Kullanılamayan ürün"}</h3>
                      {product && <>
                        <p className="text-base text-foreground">{product.weight}</p>
                        <p className="text-base tabular-nums">{formatPrice(product.priceKurus)} / adet</p>
                      </>}
                      {unavailable && <p className="text-base text-destructive">Bu ürün artık kullanılamıyor.</p>}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1">
                          <Button variant="outline" size="icon" aria-label="Adedi azalt" disabled={unavailable || quantity <= 1}
                            onClick={() => changeQuantity(productId, quantity - 1)}><Minus aria-hidden="true" /></Button>
                          <output aria-label="Adet" className="min-w-9 text-center tabular-nums"><AnimatePresence initial={false} mode="popLayout"><motion.span key={quantity} className="inline-block" initial={reduced ? false : { opacity: 0, y: motionTokens.distance.xs }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={transition}>{quantity}</motion.span></AnimatePresence></output>
                          <Button variant="outline" size="icon" aria-label="Adedi artır" disabled={unavailable || quantity >= (product?.stock ?? 0)}
                            onClick={() => changeQuantity(productId, quantity + 1)}><Plus aria-hidden="true" /></Button>
                        </div>
                        <Button variant="ghost" size="icon" aria-label="Sepetten sil" onClick={() => removeItem(productId)}><Trash2 aria-hidden="true" /></Button>
                      </div>
                    </div>
                  </motion.li>
                );
              })}
              </AnimatePresence>
            </ul>
          )}
          {validCart && <Upsell products={products} items={state.items} configuration={upsell} onAdd={addSuggestion} />}
          {state.storageError && <p role="alert" className="text-base text-destructive">Sepet bu tarayıcıya kaydedilemiyor. Sayfayı yenilerseniz sepetiniz korunmayabilir.</p>}
          <p role={feedback.error ? "alert" : "status"} aria-atomic="true" className={`text-base ${feedback.error ? "text-destructive" : "text-muted-foreground"}`}>
            {feedback.message}
          </p>
        </div>

        <div className={styles.drawerFooter}>
          <div className="flex flex-wrap items-baseline justify-between gap-2 text-base">
            <p>Ara toplam (tahmini) · {itemCount} adet</p>
            <p className="text-lg font-medium tabular-nums">{state.hydrated && (lines.length === 0 || validCart) ? formatPrice(subtotal) : "—"}</p>
          </div>
          <p className="text-sm text-muted-foreground">Kargo ve indirimler dahil değildir.</p>
          <div className={styles.drawerActions}>
          <DialogClose asChild><Button asChild variant="outline"><Link href="/sepet" prefetch={false}>Sepeti görüntüle</Link></Button></DialogClose>
          {validCart && checkoutHref ? (
            <DialogClose asChild><Button asChild><Link href={checkoutHref} prefetch={false}>Ödemeye geç</Link></Button></DialogClose>
          ) : <Button disabled>Ödemeye geç</Button>}
          </div>
          {!checkoutHref && <p className="text-sm text-muted-foreground">Ödeme henüz kullanıma açık değil.</p>}
          <button type="button" className={styles.resize} aria-label={expanded ? "Sepeti daralt" : "Sepeti genişlet"} aria-expanded={expanded}
            onPointerDown={event => { if (!reduced) controls.start(event); }}
            onClick={() => setExpanded(value => !value)}><span aria-hidden="true" /></button>
          <DialogClose asChild><Button variant="ghost">Alışverişe devam et</Button></DialogClose>
        </div>
      </motion.div>
      </DialogPrimitive.Content>
      </DialogPortal>}
      </AnimatePresence>
    </Dialog>
  );
}
