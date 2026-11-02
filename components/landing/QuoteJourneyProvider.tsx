"use client";

import { createContext, useCallback, useContext, useMemo, useState, useSyncExternalStore, type JSX, type ReactNode } from "react";
import { m as motion } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/media/use-deferred-enhancement";
import { motionTokens, springs } from "@/lib/ui-motion";

export type BusinessSegment = "hospitality" | "retail" | "bulk" | "";
type QuoteJourney = {
  quantities: Readonly<Record<string, string>>;
  setQuantities: (next: Record<string, string>) => void;
  productId: string;
  segment: BusinessSegment;
  chooseProduct: (id: string) => void;
  chooseSegment: (segment: BusinessSegment) => void;
};

const QuoteJourneyContext = createContext<QuoteJourney>({
  quantities: {}, setQuantities: () => {}, productId: "", segment: "", chooseProduct: () => {}, chooseSegment: () => {},
});
const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

export function QuoteJourneyProvider({ children }: { children: ReactNode }): JSX.Element {
  const [quantities, updateQuantities] = useState<Record<string, string>>({});
  const [lastProductId, setLastProductId] = useState("");
  const [segment, setSegment] = useState<BusinessSegment>("");
  const setQuantities = useCallback((next: Record<string, string>) => updateQuantities({ ...next }), []);
  const chooseProduct = useCallback((id: string) => {
    if (!id) return;
    setLastProductId(id);
    updateQuantities(previous => Object.hasOwn(previous, id) ? previous : { ...previous, [id]: "1" });
  }, []);
  const chooseSegment = useCallback((value: BusinessSegment) => setSegment(value), []);
  const productId = Object.hasOwn(quantities, lastProductId) ? lastProductId : Object.keys(quantities)[0] ?? "";
  const value = useMemo(() => ({ quantities, setQuantities, productId, segment, chooseProduct, chooseSegment }), [quantities, setQuantities, productId, segment, chooseProduct, chooseSegment]);
  return <QuoteJourneyContext.Provider value={value}>{children}</QuoteJourneyContext.Provider>;
}

export function useQuoteJourney(): QuoteJourney { return useContext(QuoteJourneyContext); }

/** An unhydrated action cannot silently navigate before its choice is stored.
 * The page's ordinary quote anchors remain the JavaScript-free destination. */
export function BusinessSegmentChoice({ segment, className, children }: {
  segment: Exclude<BusinessSegment, "">; className?: string; children: ReactNode;
}): JSX.Element {
  const journey = useQuoteJourney();
  const reduced = usePrefersReducedMotion();
  const hydrated = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  const selected = journey.segment === segment;
  return <motion.button type="button" disabled={!hydrated} className={className} data-selected={selected} aria-pressed={selected}
    whileHover={reduced ? undefined : { y: motionTokens.interaction.hoverY }}
    whileTap={reduced ? undefined : { scale: motionTokens.interaction.tapScale }} transition={springs.action}
    style={reduced ? { transform: "none" } : undefined}
    onClick={() => {
      journey.chooseSegment(segment);
      window.location.hash = "teklif";
    }}>{children}</motion.button>;
}
