"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore, type JSX, type ReactElement, type RefObject } from "react";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
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
};

const money = new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
function formatPrice(kurus: number): string { return `${money.format(kurus / 100)} ₺`; }

// Adapted from 21st efferd/Drawer — Shopping Cart (4485): header, scrollable
// lines and footer. Reuse AFİNA's Radix Dialog instead of adding another modal.
export function CartDrawer({ store, products, open, onOpenChange, trigger, returnFocusRef }: CartDrawerProps): JSX.Element {
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  const id = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const [feedback, setFeedback] = useState({ error: false, message: "" });
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

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => {
      // Safari does not focus clicked buttons. Remember the trigger explicitly.
      if (nextOpen) openerRef.current = triggerRef.current;
      setFeedback({ error: false, message: "" });
      onOpenChange(nextOpen);
    }}>
      {trigger && <DialogTrigger ref={triggerRef} asChild>{trigger}</DialogTrigger>}
      <DialogContent showCloseButton={false} aria-modal="true"
        className="top-0 right-0 left-auto flex h-dvh max-h-dvh w-[calc(100%-1rem)] max-w-md translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-none border-y-0 border-r-0 p-0 sm:p-0"
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
        <DialogHeader className="shrink-0 flex-row items-start justify-between gap-3 border-b p-5 pr-5">
          <div className="min-w-0 space-y-2">
            <DialogTitle className="flex items-center gap-2"><ShoppingBag aria-hidden="true" className="size-5 shrink-0 text-gold-ink" />Sepetim</DialogTitle>
            <DialogDescription className="text-sm">Ürünlerinizi gözden geçirin, adetleri düzenleyin.</DialogDescription>
          </div>
          <DialogClose asChild><Button ref={closeRef} variant="ghost" size="icon" aria-label="Sepeti kapat"><X aria-hidden="true" /></Button></DialogClose>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-5">
          {!state.hydrated ? <p role="status">Sepet yükleniyor…</p> : lines.length === 0 ? (
            <p role="status" className="py-8 text-center text-muted-foreground">Sepetiniz henüz boş.</p>
          ) : (
            <ul aria-label="Sepetteki ürünler" className="space-y-4">
              {lines.map(({ productId, product, quantity }, index) => {
                const unavailable = !product || product.stock < quantity;
                return (
                  <li key={productId} className="rounded-lg border border-border bg-background p-4">
                    <div role="group" aria-labelledby={`${id}-line-${index}`} className="space-y-3">
                      <h3 id={`${id}-line-${index}`} className="text-lg break-words">{product?.name ?? "Kullanılamayan ürün"}</h3>
                      {product && <>
                        <p className="text-sm text-gold-ink">{product.weight}</p>
                        <p className="text-sm tabular-nums">{formatPrice(product.priceKurus)} / adet</p>
                      </>}
                      {unavailable && <p className="text-sm text-destructive">Bu ürün artık kullanılamıyor.</p>}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1">
                          <Button variant="outline" size="icon" aria-label="Adedi azalt" disabled={unavailable || quantity <= 1}
                            onClick={() => changeQuantity(productId, quantity - 1)}><Minus aria-hidden="true" /></Button>
                          <output aria-label="Adet" className="min-w-9 text-center tabular-nums">{quantity}</output>
                          <Button variant="outline" size="icon" aria-label="Adedi artır" disabled={unavailable || quantity >= (product?.stock ?? 0)}
                            onClick={() => changeQuantity(productId, quantity + 1)}><Plus aria-hidden="true" /></Button>
                        </div>
                        <Button variant="ghost" size="icon" aria-label="Sepetten sil" onClick={() => removeItem(productId)}><Trash2 aria-hidden="true" /></Button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          {state.storageError && <p role="alert" className="text-sm text-destructive">Sepet bu tarayıcıya kaydedilemiyor. Sayfayı yenilerseniz sepetiniz korunmayabilir.</p>}
          <p role={feedback.error ? "alert" : "status"} aria-atomic="true" className={`text-sm ${feedback.error ? "text-destructive" : "text-muted-foreground"}`}>
            {feedback.message}
          </p>
        </div>

        <div className="grid shrink-0 gap-3 border-t border-border bg-background p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
            <p>Ara toplam (tahmini) · {itemCount} adet</p>
            <p className="text-lg font-medium tabular-nums">{state.hydrated && (lines.length === 0 || validCart) ? formatPrice(subtotal) : "—"}</p>
          </div>
          <p className="text-sm text-muted-foreground">Kargo ve indirimler dahil değildir.</p>
          <DialogClose asChild><Button asChild variant="outline"><Link href="/sepet" prefetch={false}>Sepeti görüntüle</Link></Button></DialogClose>
          {validCart ? (
            <DialogClose asChild><Button asChild><Link href="/odeme" prefetch={false}>Ödemeye geç</Link></Button></DialogClose>
          ) : <Button disabled>Ödemeye geç</Button>}
          <DialogClose asChild><Button variant="ghost">Alışverişe devam et</Button></DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
