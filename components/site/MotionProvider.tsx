"use client";

import { LazyMotion, MotionConfig } from "motion/react";
import type { JSX, ReactNode } from "react";

const loadFeatures = () => import("@/lib/motion-features").then(module => module.default);

/** Static SSR remains visible while optional animation features load. */
export function MotionProvider({ children }: { children: ReactNode }): JSX.Element {
  return <MotionConfig reducedMotion="user"><LazyMotion features={loadFeatures}>{children}</LazyMotion></MotionConfig>;
}
