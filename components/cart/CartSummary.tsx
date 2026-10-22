"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore, useTransition, type JSX } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, RefreshCw } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { CartAmount, CartEmpty, CartLineItem, CartTotals, CartTrust } from "./CartPresentation";
import { useCart } from "@/components/cart/CartProvider";
import { Upsell, QuantityDiscount, type UpsellConfiguration, type QuantityDiscountConfiguration } from "@/components/cart/Upsell";
import styles from "./CartExperience.module.css";
import type { CartStore } from "@/lib/cart/types";
import type { Product } from "@/types/catalog";

type CartSummaryProps = {
  store: CartStore;
  /** null means a failed read, not an empty catalog. Preserve the saved cart. */
  products: readonly Product[] | null;
  onRefresh: () => void;
  refreshing?: boolean;
  /** Absent until approved configuration is supplied; never infer a campaign. */
  upsell?: UpsellConfiguration | null;
  quantityDiscount?: QuantityDiscountConfiguration | null;
  checkoutHref?: string | null;
};

/** The route, navbar, product cards and drawer share the layout's owner. */
export function CartPage({ products }: { products: readonly Product[] | null }): JSX.Element {
  const cart = useCart();
  const router = useRouter();
  const [refreshing, startTransition] = useTransition();
  if (!cart) throw new Error("CartPage requires CartProvider.");
  return <CartSummary store={cart.store} products={products} refreshing={refreshing} checkoutHref={cart.checkoutHref}
    onRefresh={() => startTransition(() => { router.refresh(); })} />;
}

// Adapted from 21st astralyxdev/Checkout Summary (36084): semantic amount rows
// and explicit unknown charges. AFİNA uses estimates, never a client final quote.
export function CartSummary({ store, products, onRefresh, refreshing = false, upsell, quantityDiscount, checkoutHref = null }: CartSummaryProps): JSX.Element {
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  const id = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [feedback, setFeedback] = useState({ error: false, message: "" });
  useEffect(() => {
    // A failed catalog read must not prune the unread localStorage cart.
    if (products !== null && !store.getSnapshot().hydrated) store.setProducts(products);
  }, [store, products]);

  const lines = state.items.map((item) => ({ ...item, product: products?.find((product) => product.id === item.productId) }));
  const invalidStock = lines.some(({ product, quantity }) => !product || product.stock < quantity);
  const subtotal = lines.reduce((sum, { product, quantity }) => sum + (product?.priceKurus ?? 0) * quantity, 0);
  const itemCount = lines.reduce((sum, { quantity }) => sum + quantity, 0);
  const knownSubtotal = products !== null && state.hydrated && !invalidStock;
  const showOffers = knownSubtotal && lines.length > 0 && !refreshing;

  function addSuggestion(productId: string): void {
    if (!showOffers) return;
    try {
      // Offers are hidden until every existing line matches current stock.
      // Updating this guard therefore preserves lines and admits restocked IDs.
      store.setProducts(products);
      store.addItem(productId, 1);
      headingRef.current?.focus();
      const name = products?.find((product) => product.id === productId)?.name;
      setFeedback({ error: false, message: `${name} sepetinize eklendi.` });
    } catch {
      setFeedback({ error: true, message: "Ürün eklenemedi. Stok değişmiş olabilir. Fiyat ve stokları yenileyip tekrar deneyin." });
    }
  }

  function changeQuantity(productId: string, quantity: number): void {
    try {
      // Refresh the store's transient stock guard before validating an edit.
      store.setProducts(products!);
      store.setQuantity(productId, quantity);
      setFeedback({ error: false, message: `Adet ${quantity} olarak güncellendi.` });
    } catch {
      setFeedback({ error: true, message: "Adet güncellenemedi. Stok değişmiş olabilir. Fiyat ve stokları yenileyip tekrar deneyin." });
    }
  }
  function removeItem(productId: string): void {
    headingRef.current?.focus();
    store.removeItem(productId);
    setFeedback({ error: false, message: "Ürün sepetten silindi." });
  }
  function reconcileStock(): void {
    headingRef.current?.focus();
    store.setProducts(products!);
    setFeedback({ error: false, message: "Stok değişiklikleri uygulandı. Adetler güncellendi; kullanılamayan ürünler çıkarıldı." });
  }

  function checkout(): JSX.Element {
    return checkoutHref && showOffers
      ? <Button asChild className={styles.checkout}><Link href={checkoutHref} prefetch={false}>Ödemeye geç<ArrowRight aria-hidden="true" /></Link></Button>
      : <Button className={styles.checkout} disabled aria-describedby={`${id}-payment-help`}>Ödemeye geç</Button>;
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 ref={headingRef} tabIndex={-1} className="flex items-center gap-3 rounded-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
          Sepetim
        </h1>
        <p className="max-w-xl text-muted-foreground">Ürünlerinizi gözden geçirin, sofranız için adetleri düzenleyin.</p>
        <Button asChild variant="link" className="px-0"><Link href="/#urunler" prefetch={false}><ArrowLeft aria-hidden="true" />Alışverişe devam et</Link></Button>
      </header>

      <div className={styles.layout}>
        <section aria-label="Sepet içeriği" className={styles.contents}>
          {products === null ? <p role="alert" className="rounded-none p-5 text-destructive">Katalog yüklenemedi. Sepetiniz korunuyor. Fiyat ve stokları yenileyip tekrar deneyin.</p>
            : !state.hydrated ? <p role="status">Sepet yükleniyor…</p>
            : lines.length === 0 ? <CartEmpty />
            : <ul aria-label="Sepetteki ürünler" className={styles.pageLines}>
              <AnimatePresence initial={false} mode="popLayout">
              {lines.map(({ productId, product, quantity }) => {
                const unavailable = !product || product.stock < quantity;
                return <CartLineItem key={productId} product={product} quantity={quantity} headingLevel={2}
                  unavailable={unavailable} disabled={invalidStock || refreshing}
                  stockMessage={`Stok değişti. ${product ? `Güncel stok: ${product.stock} adet.` : "Bu ürün artık kullanılamıyor."}`}
                  onQuantity={next => changeQuantity(productId, next)} onRemove={() => removeItem(productId)} />;
              })}
              </AnimatePresence>
            </ul>}
          {products !== null && state.hydrated && invalidStock && <div className="space-y-3 rounded-none p-5">
            <p role="alert" className="text-base text-destructive">Sepetteki bazı ürünlerin stoğu değişti. Devam etmeden önce adetleri ve ürünleri güncelleyin.</p>
            <Button variant="outline" disabled={refreshing} onClick={reconcileStock}>Stok değişikliklerini uygula</Button>
          </div>}
          {showOffers && <Upsell products={products} items={state.items} configuration={upsell} onAdd={addSuggestion} />}
          {state.storageError && <p role="alert" className="text-base text-destructive">Sepet bu tarayıcıya kaydedilemiyor. Sayfayı yenilerseniz sepetiniz korunmayabilir.</p>}
          <p aria-label="Sepet bildirimi" role={feedback.error ? "alert" : "status"} aria-atomic="true" className={`text-base ${feedback.error ? "text-destructive" : "text-muted-foreground"}`}>{feedback.message}</p>
        </section>

        <aside aria-labelledby={`${id}-summary`} className={styles.summary}>
          <h2 id={`${id}-summary`}>Sepet özeti</h2>
          <CartTotals subtotal={knownSubtotal ? subtotal : null} itemCount={itemCount} />
          <p className={styles.estimate}>İndirimler: <span>Henüz hesaplanmadı</span></p>
          <p className="text-base text-muted-foreground">Kargo ve indirimler ara toplama dahil değildir. Kesin tutar ödeme öncesinde sunucuda doğrulanır.</p>
          {showOffers && <QuantityDiscount products={products} items={state.items} configuration={quantityDiscount} />}
          <Button variant="outline" className="w-full" onClick={onRefresh} disabled={refreshing} aria-busy={refreshing}>
            <RefreshCw aria-hidden="true" />Fiyat ve stokları yenile
          </Button>
          <p role="status" className="text-base text-muted-foreground">{refreshing ? "Fiyat ve stok bilgileri yenileniyor…" : "Sepet açıldığında adetler mevcut stokla sınırlandırılır."}</p>
          <div className={styles.coupon}>
            <label htmlFor={`${id}-coupon`} className="block text-base font-medium">Kupon kodu</label>
            <input id={`${id}-coupon`} type="text" readOnly value="" aria-describedby={`${id}-coupon-help`}
              className="min-h-11 w-full min-w-0 rounded-none border border-input bg-background px-3 py-2 text-base focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring" />
            <p id={`${id}-coupon-help`} className="text-base text-muted-foreground">Kupon ekleme hazırlıkları sürüyor.</p>
            <Button variant="outline" className="w-full" disabled aria-describedby={`${id}-coupon-help`}>Kuponu uygula</Button>
          </div>
          <div className={styles.summaryCheckout}>
            {checkout()}
            <p id={`${id}-payment-help`} className="text-base text-muted-foreground">{checkoutHref ? "Yerel test ödemesi sepetinizden tahsilat yapmaz." : "Fiyat ve stoklar kesinleştiğinde ödeme adımına geçebilirsiniz."}</p>
          </div>
          <CartTrust />
        </aside>
      </div>
      {products !== null && state.hydrated && lines.length > 0 && <section aria-label="Mobil ödeme" className={styles.mobileCheckout}>
        <p>Toplam (tahmini)<strong><CartAmount amount={knownSubtotal ? subtotal : null} label="Mobil toplam (tahmini)" /></strong></p>
        {checkout()}
      </section>}
    </main>
  );
}
