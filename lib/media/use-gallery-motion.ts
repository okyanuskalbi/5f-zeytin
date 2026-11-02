"use client";

import { useSyncExternalStore } from "react";
import { MOBILE_SCROLL_QUERY } from "./mobile-motion";

const DESKTOP_QUERY = "(min-width: 1024px) and (min-height: 680px) and (hover: hover) and (pointer: fine)";
const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";
type GalleryMotion = "desktop" | "touch" | "native";
type Connection = EventTarget & { saveData?: boolean };
const connection = () => (navigator as Navigator & { connection?: Connection }).connection;

function subscribe(notify: () => void) {
  const media = [DESKTOP_QUERY, MOBILE_SCROLL_QUERY, REDUCED_QUERY].map(query => window.matchMedia?.(query));
  for (const query of media) query?.addEventListener("change", notify);
  const network = connection();
  network?.addEventListener?.("change", notify);
  return () => {
    for (const query of media) query?.removeEventListener("change", notify);
    network?.removeEventListener?.("change", notify);
  };
}

function snapshot(): GalleryMotion {
  if (!window.matchMedia || window.matchMedia(REDUCED_QUERY).matches || connection()?.saveData || (navigator.hardwareConcurrency || 4) < 4) return "native";
  if (window.matchMedia(DESKTOP_QUERY).matches) return "desktop";
  return window.matchMedia(MOBILE_SCROLL_QUERY).matches ? "touch" : "native";
}

/** SSR and short/restricted viewports retain the complete native product rail. */
export function useGalleryMotion(): GalleryMotion {
  return useSyncExternalStore(subscribe, snapshot, () => "native");
}
