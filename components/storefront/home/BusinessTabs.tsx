"use client";

import { useRef, useState, type JSX, type ReactNode } from "react";
import { PillSwitch } from "@/components/storefront/ui/PillSwitch";
import { replaceSearchParam, useLocationSearch } from "./location-search";
import styles from "../StoreHome.module.css";

const WHOLESALE = "toptan";
const DEALERSHIP = "bayilik";
const SWITCH_FADE_MS = 160;
const options = [{ value: WHOLESALE, label: "Toptan Satış" }, { value: DEALERSHIP, label: "Bayilik" }] as const;

/** Two pills over one panel. The dealership side mounts on first use, so its form loads only when asked for. */
export function BusinessTabs({ heading, wholesale, dealership }: { heading?: ReactNode; wholesale: ReactNode; dealership: ReactNode }): JSX.Element {
  const search = new URLSearchParams(useLocationSearch());
  // A product sent for a quote always belongs to the wholesale form.
  const active = search.get("sekme") === DEALERSHIP && !search.has("teklif") ? DEALERSHIP : WHOLESALE;
  const [dealershipOpened, setDealershipOpened] = useState(false);
  const panels = useRef<HTMLDivElement>(null);
  const showDealership = active === DEALERSHIP;
  // Once shown (by a pill or by the address) the dealership form stays mounted, so typed values survive a switch.
  if (showDealership && !dealershipOpened) setDealershipOpened(true);

  function choose(next: string): void {
    replaceSearchParam("sekme", next === DEALERSHIP ? DEALERSHIP : null);
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) panels.current?.animate?.([{ opacity: 0 }, { opacity: 1 }], { duration: SWITCH_FADE_MS, easing: "ease-out" });
  }

  return <>
    <div className={styles.businessHead}>{heading}<PillSwitch label="Toptan satış ya da bayilik" options={options} value={active} onChange={choose} /></div>
    <div ref={panels}>
      <div role="group" aria-label="Toptan Satış" hidden={showDealership} data-business-panel={WHOLESALE}>{wholesale}</div>
      <div role="group" aria-label="Bayilik" hidden={!showDealership} data-business-panel={DEALERSHIP}>{(showDealership || dealershipOpened) && dealership}</div>
    </div>
  </>;
}
