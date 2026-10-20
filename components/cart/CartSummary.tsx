"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore, useTransition, type JSX } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Minus, Plus, RefreshCw, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart/CartProvider";
import { Upsell, QuantityDiscount, type UpsellConfiguration, type QuantityDiscountConfiguration } from "@/components/cart/Upsell";
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
};

const money = new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
function formatPrice(kurus: number): string { return `${money.format(kurus / 100)} ₺`; }

/** The route, navbar, product cards and drawer share the layout's owner. */
export function CartPage({ products }: { products: readonly Product[] | null }): JSX.Element {
  const cart = useCart();
  const router = useRouter();
  const [refreshing, startTransition] = useTransition();
  if (!cart) throw new Error("CartPage requires CartProvider.");
  return <CartSummary store={cart.store} products={products} refreshing={refreshing}
    onRefresh={() => startTransition(() => { router.refresh(); })} />;
}

// Adapted from 21st astralyxdev/Checkout Summary (36084): semantic amount rows
// and explicit unknown charges. AFİNA uses estimates, never a client final quote.
export function CartSummary({ store, products, onRefresh, refreshing = false, upsell, quantityDiscount }: CartSummaryProps): JSX.Element {
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

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16">
      <div className="mb-8 space-y-4">
        <p className="text-xs font-medium tracking-widest text-gold-ink">TOPRAKTAN SOFRAYA</p>
        <h1 ref={headingRef} tabIndex={-1} className="flex items-center gap-3 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
          <ShoppingBag aria-hidden="true" className="size-7 shrink-0 text-gold-ink" />Sepetim
        </h1>
        <p className="max-w-xl text-muted-foreground">Ürünlerinizi gözden geçirin, sofranız için adetleri düzenleyin.</p>
        <Button asChild variant="link" className="px-0"><Link href="/#urunler" prefetch={false}><ArrowLeft aria-hidden="true" />Alışverişe devam et</Link></Button>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section aria-label="Sepet içeriği" className="min-w-0 space-y-5">
          {products === null ? <p role="alert" className="rounded-lg border border-destructive p-5 text-destructive">Katalog yüklenemedi. Sepetiniz korunuyor. Fiyat ve stokları yenileyip tekrar deneyin.</p>
            : !state.hydrated ? <p role="status">Sepet yükleniyor…</p>
            : lines.length === 0 ? <p role="status" className="rounded-lg border bg-card px-5 py-12 text-center text-muted-foreground">Sepetiniz henüz boş.</p>
            : <ul aria-label="Sepetteki ürünler" className="space-y-4">
              {lines.map(({ productId, product, quantity }, index) => {
                const unavailable = !product || product.stock < quantity;
                return <li key={productId} className="rounded-lg border bg-card p-5 sm:p-6">
                  <div role="group" aria-labelledby={`${id}-line-${index}`} className="space-y-4">
                    <div className="space-y-2">
                      <h2 id={`${id}-line-${index}`} className="text-xl break-words">{product?.name ?? "Kullanılamayan ürün"}</h2>
                      {product && <><p className="text-sm text-gold-ink">{product.weight}</p><p className="text-sm tabular-nums">{formatPrice(product.priceKurus)} / adet</p></>}
                      {unavailable && <p className="text-sm text-destructive">Stok değişti. {product ? `Güncel stok: ${product.stock} adet.` : "Bu ürün artık kullanılamıyor."}</p>}
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-1">
                        <Button variant="outline" size="icon" aria-label="Adedi azalt" disabled={invalidStock || quantity <= 1 || refreshing}
                          onClick={() => changeQuantity(productId, quantity - 1)}><Minus aria-hidden="true" /></Button>
                        <output aria-label="Adet" className="min-w-10 text-center tabular-nums">{quantity}</output>
                        <Button variant="outline" size="icon" aria-label="Adedi artır" disabled={invalidStock || quantity >= (product?.stock ?? 0) || refreshing}
                          onClick={() => changeQuantity(productId, quantity + 1)}><Plus aria-hidden="true" /></Button>
                      </div>
                      <Button variant="ghost" size="icon" aria-label="Sepetten sil" onClick={() => removeItem(productId)}><Trash2 aria-hidden="true" /></Button>
                    </div>
                  </div>
                </li>;
              })}
            </ul>}
          {products !== null && state.hydrated && invalidStock && <div className="space-y-3 rounded-lg border border-destructive p-5">
            <p role="alert" className="text-sm text-destructive">Sepetteki bazı ürünlerin stoğu değişti. Devam etmeden önce adetleri ve ürünleri güncelleyin.</p>
            <Button variant="outline" disabled={refreshing} onClick={reconcileStock}>Stok değişikliklerini uygula</Button>
          </div>}
          {showOffers && <Upsell products={products} items={state.items} configuration={upsell} onAdd={addSuggestion} />}
          {state.storageError && <p role="alert" className="text-sm text-destructive">Sepet bu tarayıcıya kaydedilemiyor. Sayfayı yenilerseniz sepetiniz korunmayabilir.</p>}
          <p aria-label="Sepet bildirimi" role={feedback.error ? "alert" : "status"} aria-atomic="true" className={`text-sm ${feedback.error ? "text-destructive" : "text-muted-foreground"}`}>{feedback.message}</p>
        </section>

        <aside aria-labelledby={`${id}-summary`} className="min-w-0 space-y-5 rounded-lg border border-border bg-card p-5 sm:p-6">
          <h2 id={`${id}-summary`} className="text-2xl">Sepet özeti</h2>
          <dl className="space-y-4 text-sm">
            <div className="flex flex-wrap items-baseline justify-between gap-2"><dt>Ara toplam (tahmini) · {itemCount} adet</dt><dd className="text-xl font-medium tabular-nums">{knownSubtotal ? formatPrice(subtotal) : "—"}</dd></div>
            <div className="flex flex-wrap justify-between gap-2 border-t pt-4"><dt>Kargo</dt><dd className="text-muted-foreground">Ödemede hesaplanacak</dd></div>
            <div className="flex flex-wrap justify-between gap-2"><dt>İndirimler</dt><dd className="text-muted-foreground">Henüz hesaplanmadı</dd></div>
          </dl>
          <p className="text-sm text-muted-foreground">Kargo ve indirimler ara toplama dahil değildir. Kesin tutar ödeme öncesinde sunucuda doğrulanır.</p>
          {showOffers && <QuantityDiscount products={products} items={state.items} configuration={quantityDiscount} />}
          <Button variant="outline" className="w-full" onClick={onRefresh} disabled={refreshing} aria-busy={refreshing}>
            <RefreshCw aria-hidden="true" />Fiyat ve stokları yenile
          </Button>
          <p role="status" className="text-sm text-muted-foreground">{refreshing ? "Fiyat ve stok bilgileri yenileniyor…" : "Sepet açıldığında adetler mevcut stokla sınırlandırılır."}</p>
          <div className="space-y-3 border-t pt-5">
            <label htmlFor={`${id}-coupon`} className="block text-sm font-medium">Kupon kodu</label>
            <input id={`${id}-coupon`} type="text" readOnly value="" aria-describedby={`${id}-coupon-help`}
              className="min-h-11 w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring" />
            <p id={`${id}-coupon-help`} className="text-sm text-muted-foreground">Kupon kullanımı henüz kullanıma açık değil.</p>
            <Button variant="outline" className="w-full" disabled aria-describedby={`${id}-coupon-help`}>Kuponu uygula</Button>
          </div>
          <div className="space-y-3 border-t pt-5">
            <Button className="w-full" disabled aria-describedby={`${id}-payment-help`}>Ödemeye geç</Button>
            <p id={`${id}-payment-help`} className="text-sm text-muted-foreground">Ödeme henüz kullanıma açık değil. Fiyat ve stoklar kesinleşmeden ödeme başlatılmaz.</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
