"use client";

import type { ReactNode } from "react";
import { m as motion, useReducedMotion } from "framer-motion";
import styles from "./interactive-checkout.module.css";

/** Adapted from the user's InteractiveCheckout, Task165.
 * Source SHA256: 7b21edf0490e85e81016d539a23b96f65805ca2a7fd65311909d5045d926d75e.
 * Composition/animated numbers are shared; CartProvider remains the sole owner
 * of items, TRY-kuruş estimates and stock. No demo catalogue or payment state. */
export function InteractiveCheckout({ children, variant = "page", className = "" }: {
  children: ReactNode;
  variant?: "page" | "drawer";
  className?: string;
}) {
  return <div data-slot="interactive-checkout" data-variant={variant}
    className={`${styles.checkout} ${styles[variant]} ${className}`}>{children}</div>;
}

/** One current text node avoids announcing or copying outgoing animated digits. */
export function CheckoutValue({ value }: { value: string | number }) {
  const reduced = useReducedMotion();
  return <motion.span key={value} className={styles.value}
    initial={reduced ? false : { opacity: .65, y: 6 }} animate={{ opacity: 1, y: 0 }}
    transition={{ duration: reduced ? 0 : .2, ease: [.22, 1, .36, 1] }}>{value}</motion.span>;
}

export default InteractiveCheckout;
