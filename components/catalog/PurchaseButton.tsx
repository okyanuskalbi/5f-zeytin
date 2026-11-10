"use client";

import * as motion from "motion/react-m";
import type { HTMLMotionProps } from "motion/react";
import type { Ref } from "react";
import { usePrefersReducedMotion } from "@/lib/media/use-deferred-enhancement";
import { motionTokens, springs } from "@/lib/ui-motion";
import styles from "./AddToCart.module.css";

/** Shared purchase appearance and interaction, without cart behavior. */
export function PurchaseButton({ disabled, ref, className, ...props }: HTMLMotionProps<"button"> & { ref?: Ref<HTMLButtonElement> }) {
  const reduced = usePrefersReducedMotion();
  const motionEnabled = !reduced && !disabled;
  return <motion.button {...props} ref={ref} type="button" className={[styles.add, className].filter(Boolean).join(" ")}
    initial={false} disabled={disabled}
    whileHover={motionEnabled ? { y: motionTokens.interaction.hoverY } : undefined}
    whileTap={motionEnabled ? { scale: motionTokens.interaction.tapScale } : undefined}
    transition={motionEnabled ? springs.action : { duration: 0 }}
    style={motionEnabled ? undefined : { transform: "none" }} />;
}
