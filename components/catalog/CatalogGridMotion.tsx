"use client";

import { createContext, useContext, type JSX, type ReactNode } from "react";
import { m } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/media/use-deferred-enhancement";
import { motionTokens } from "@/lib/ui-motion";

export const CatalogTransitionContext = createContext({ pathname: "", changed: false });

/** These variants attach to the existing card root; no layout wrapper is added. */
export const catalogCardVariants = {
  hidden: { opacity: 0, y: motionTokens.storefront.category.distance },
  visible: { opacity: 1, y: 0, transition: { duration: motionTokens.storefront.category.duration } },
};

export function CatalogGridMotion({ routeKey, className, children }: { routeKey: string; className: string; children: ReactNode }): JSX.Element {
  const navigation = useContext(CatalogTransitionContext);
  const reduced = usePrefersReducedMotion();
  // A pathname may update before its streamed page. Only the matching new list
  // enters; the old products stay readable while navigation is still pending.
  const enter = navigation.changed && navigation.pathname === routeKey && !reduced;
  return <m.div key={routeKey} className={className} data-category-transition={enter ? "navigation" : "static"}
    initial={enter ? "hidden" : false} animate="visible"
    variants={{ hidden: {}, visible: { transition: { staggerChildren: reduced ? 0 : motionTokens.storefront.category.stagger } } }}>
    {children}
  </m.div>;
}
