"use client";

import { useEffect } from "react";
import type { ProductVariant } from "@/types/catalog";
import { useQuoteJourney } from "./QuoteJourneyProvider";

/** Consume only known catalogue choices after hydration, keeping the wholesale page static. */
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
    const focusFirstField = (): boolean => {
      const field = document.querySelector<HTMLElement>('#toptan input:not([type="hidden"]), #toptan button, #toptan select');
      // The form is intentionally disabled in server HTML until it hydrates.
      // :disabled also accounts for the containing fieldset, unlike .disabled.
      if (!field || field.matches(":disabled") || field.closest("[hidden], [inert]")) return false;
      field.focus({ preventScroll: true });
      return document.activeElement === field;
    };
    if (focusFirstField()) return;
    const observer = new MutationObserver(() => {
      if (focusFirstField()) observer.disconnect();
    });
    observer.observe(document.getElementById("toptan") ?? document.body, {
      subtree: true, childList: true, attributes: true, attributeFilter: ["disabled", "hidden", "inert"],
    });
    return () => observer.disconnect();
  }, [products, chooseProduct]);
  return null;
}
