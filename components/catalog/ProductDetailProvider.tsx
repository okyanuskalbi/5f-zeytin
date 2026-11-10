"use client";

import { createContext, useContext, useRef, useSyncExternalStore, type JSX, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { ProductVariant } from "@/types/catalog";
import { useQuoteJourney } from "@/components/landing/QuoteJourneyProvider";

const changeEvent = "afina:product-detail-change";
const ProductDetail = dynamic(() => import("./ProductDetail").then(module => module.ProductDetail));
const DetailContext = createContext<((id: string, opener: HTMLElement) => void) | null>(null);

function subscribe(notify: () => void): () => void {
  window.addEventListener("popstate", notify);
  window.addEventListener(changeEvent, notify);
  return () => {
    window.removeEventListener("popstate", notify);
    window.removeEventListener(changeEvent, notify);
  };
}
const snapshot = () => new URL(window.location.href).searchParams.get("urun");
const serverSnapshot = () => null;

function replaceProduct(id: string | null): void {
  const url = new URL(window.location.href);
  if (id) url.searchParams.set("urun", id);
  else url.searchParams.delete("urun");
  history.replaceState(history.state, "", url);
  window.dispatchEvent(new Event(changeEvent));
}

/** Only the small URL/trigger owner loads initially; the entire detail UI is on demand. */
export function ProductDetailProvider({ products, children, quoteEnabled = false }: {
  products: readonly ProductVariant[]; children: ReactNode; quoteEnabled?: boolean;
}): JSX.Element {
  const selectedId = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const product = products.find(item => item.id === selectedId);
  const returnFocus = useRef<HTMLElement | null>(null);
  const quoteAfterClose = useRef(false);
  const journey = useQuoteJourney();

  function open(id: string, opener: HTMLElement): void {
    if (!products.some(item => item.id === id)) return;
    returnFocus.current = opener;
    replaceProduct(id);
  }

  return <DetailContext.Provider value={open}>
    {children}
    {product && <ProductDetail product={product} products={products}
      onSelect={replaceProduct} onClose={() => replaceProduct(null)}
      onQuote={quoteEnabled ? () => {
        journey.chooseProduct(product.id);
        quoteAfterClose.current = true;
      } : undefined}
      onRestoreFocus={() => {
        if (quoteAfterClose.current) {
          quoteAfterClose.current = false;
          window.location.hash = "toptan";
          document.querySelector<HTMLElement>('#toptan input, #toptan button, #toptan select')?.focus({ preventScroll: true });
          return;
        }
        const target = returnFocus.current?.isConnected ? returnFocus.current : document.getElementById("ana-icerik");
        target?.focus({ preventScroll: true });
      }} />}
  </DetailContext.Provider>;
}

export function useProductDetail(): ((id: string, opener: HTMLElement) => void) | null { return useContext(DetailContext); }
