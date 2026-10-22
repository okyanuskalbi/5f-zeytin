"use client";

import { LazyMotion } from "motion/react";
import type { JSX, ReactNode } from "react";

const loadFeatures = () => import("@/lib/motion-features").then(module => module.default);

/** Static SSR remains visible while optional animation features load. */
export function MotionProvider({ children }: { children: ReactNode }): JSX.Element {
  return <LazyMotion features={loadFeatures}>{children}</LazyMotion>;
}
