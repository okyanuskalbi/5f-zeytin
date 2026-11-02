"use client";

import { useSyncExternalStore } from "react";
import { usePrefersReducedMotion } from "./use-deferred-enhancement";

type MotionConnection = EventTarget & { saveData?: boolean };
type MotionNavigator = Navigator & { connection?: MotionConnection };

function subscribe(notify: () => void) {
  const connection = (navigator as MotionNavigator).connection;
  connection?.addEventListener?.("change", notify);
  return () => connection?.removeEventListener?.("change", notify);
}

function clientSnapshot() {
  return !(navigator as MotionNavigator).connection?.saveData && (navigator.hardwareConcurrency ?? 4) >= 4;
}

const serverSnapshot = () => false;

/** Optional transforms begin after hydration. Missing Network Information API
 * is normal (including Safari); a known data-saving or low-CPU device stays still. */
export function useLightweightMotion(): boolean {
  const reduced = usePrefersReducedMotion();
  const resources = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  return !reduced && resources;
}
