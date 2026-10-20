"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { motionTokens } from "@/lib/ui-motion";
import styles from "./Membership.module.css";

// Google Identity's official light button colours and unmodified G asset.
// https://developers.google.com/identity/branding-guidelines
export function GoogleButton({ busy, onClick }: { busy: boolean; onClick: () => void }) {
  const reduced = useReducedMotion();
  return <motion.button type="button" disabled={busy} onClick={onClick} className={styles.google}
    whileTap={reduced ? undefined : { scale: motionTokens.scale.press }} transition={{ duration: reduced ? 0 : motionTokens.duration.fast }}>
    <Image src="/icons/google-g.png" alt="" width={20} height={20} unoptimized />
    <span>Google ile devam et</span>
  </motion.button>;
}
