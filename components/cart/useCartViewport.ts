"use client";

import { useSyncExternalStore } from "react";

const query = "(max-width: 767px)";
function subscribe(listener: () => void): () => void {
  if (typeof window.matchMedia !== "function") return () => {};
  const media = window.matchMedia(query);
  media.addEventListener("change", listener);
  return () => media.removeEventListener("change", listener);
}
function snapshot(): boolean { return typeof window.matchMedia === "function" && window.matchMedia(query).matches; }
export function useCartViewport(): boolean { return useSyncExternalStore(subscribe, snapshot, () => false); }
