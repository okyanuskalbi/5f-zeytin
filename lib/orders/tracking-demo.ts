import { getMembershipAdapters } from "@/lib/auth/demo";
import { createDemoAttemptLimiter, createMockTrackingAdapter, isTrackingDemoEnabled, type TrackingAdapter } from "./tracking-adapter";

let adapter: TrackingAdapter | undefined;
export function getTrackingAdapter(): TrackingAdapter {
  if (!isTrackingDemoEnabled() || typeof window === "undefined") throw new Error("Tracking demo is disabled.");
  if (!adapter) {
    let storage: Storage | undefined;
    try { storage = window.sessionStorage; } catch { /* Rate limit retains an in-memory fallback. */ }
    adapter = createMockTrackingAdapter(getMembershipAdapters().auth, createDemoAttemptLimiter(storage));
  }
  return adapter;
}
