"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { isCountablePath } from "@/lib/contracts/visits";

type IdleWindow = Window & { requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
const IDLE_TIMEOUT_MS = 5000;
const FALLBACK_DELAY_MS = 3000;
let lastPath: string | null = null;

function optedOut(): boolean {
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean; msDoNotTrack?: string };
  return nav.doNotTrack === "1" || nav.msDoNotTrack === "1" || nav.globalPrivacyControl === true;
}

/** Çerezsiz sayaç: görünür bir şey çizmez, depolama kullanmaz. Gönderim tarayıcı boştayken yapılır; ağ hatası sessizdir. */
export function VisitBeacon() {
  const pathname = usePathname();
  useEffect(() => {
    if (!pathname || pathname === lastPath || !isCountablePath(pathname) || optedOut()) return;
    const win = window as IdleWindow;
    const send = () => {
      if (lastPath === pathname) return;
      lastPath = pathname;
      const params = new URLSearchParams(window.location.search);
      try {
        void fetch("/api/visit", {
          method: "POST", keepalive: true, credentials: "omit", cache: "no-store",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ path: pathname, ref: document.referrer.slice(0, 500), us: params.get("utm_source"), um: params.get("utm_medium"), uc: params.get("utm_campaign") }),
        }).catch(() => undefined);
      } catch { /* sayaç sayfayı asla etkilemez */ }
    };
    if (win.requestIdleCallback) {
      const id = win.requestIdleCallback(send, { timeout: IDLE_TIMEOUT_MS });
      return () => win.cancelIdleCallback?.(id);
    }
    const timer = window.setTimeout(send, FALLBACK_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [pathname]);
  return null;
}
