"use client";

import { useEffect } from "react";
import type { ProductVariant } from "@/types/catalog";
import { useQuoteJourney } from "./QuoteJourneyProvider";

/** Consume only known catalogue choices after hydration, keeping home static. */
export function QuoteQuerySelection({ products }: { products: readonly ProductVariant[] }): null {
  const { chooseProduct } = useQuoteJourney();
  useEffect(() => {
    const url = new URL(window.location.href);
    const id = url.searchParams.get("teklif");
    if (!id || !products.some(product => product.id === id)) return;
    chooseProduct(id);
    url.searchParams.delete("teklif");
    url.hash = "toptan";
    history.replaceState(history.state, "", url);
    document.getElementById("toptan")?.scrollIntoView();
    document.querySelector<HTMLElement>('#toptan input, #toptan button, #toptan select')?.focus({ preventScroll: true });
  }, [products, chooseProduct]);
  return null;
}
