"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState, type JSX, type ReactNode } from "react";
import { useCartViewport as usePhoneViewport } from "@/components/cart/useCartViewport";
import { PillSwitch } from "@/components/storefront/ui/PillSwitch";
import { BusinessChooser } from "./BusinessChooser";
import { businessCopy, type BusinessKind } from "./business-copy";
import { announceSearchChange, replaceSearchParam, useLocationHash, useLocationSearch } from "./location-search";
import styles from "../StoreHome.module.css";

const WHOLESALE = "toptan";
const DEALERSHIP = "bayilik";
const SECTION = "toptan-bayilik";
const SWITCH_FADE_MS = 160;
/** Marks the history entry a card created, so closing its sheet is one step back. */
const SHEET_ENTRY = "afinaBusinessSheet";
const options = [{ value: WHOLESALE, label: businessCopy.toptan.title }, { value: DEALERSHIP, label: businessCopy.bayilik.title }] as const;
/** The anchors inside the two forms. */
const formAnchors: Readonly<Record<string, BusinessKind>> = { "#toptan": WHOLESALE, "#teklif": WHOLESALE, "#basvuru": DEALERSHIP };

const BusinessSheet = dynamic(() => import("./BusinessSheet").then(module => module.BusinessSheet), { ssr: false });

/** Which form a phone shows in its sheet, read from the address; null while the two cards are enough. */
function requestedSheet(search: URLSearchParams, hash: string): BusinessKind | null {
  // A product sent for a quote always belongs to the wholesale form.
  if (search.has("teklif")) return WHOLESALE;
  if (Object.hasOwn(formAnchors, hash)) return formAnchors[hash];
  const tab = search.get("sekme");
  return tab === WHOLESALE || tab === DEALERSHIP ? tab : null;
}

/**
 * Two pills over one panel; on a phone two cards and the same panel in a full-screen sheet (docs/tasks/209).
 * The forms are rendered once. The dealership side mounts on first use, so its form loads only when asked for.
 */
export function BusinessTabs({ heading, wholesale, dealership }: { heading?: ReactNode; wholesale: ReactNode; dealership: ReactNode }): JSX.Element {
  const search = new URLSearchParams(useLocationSearch());
  const hash = useLocationHash();
  const phone = usePhoneViewport();
  const sheet = phone ? requestedSheet(search, hash) : null;
  const tab = search.get("sekme") === DEALERSHIP && !search.has("teklif") ? DEALERSHIP : WHOLESALE;
  const active = phone ? sheet ?? WHOLESALE : tab;
  const [dealershipOpened, setDealershipOpened] = useState(false);
  const [sheetUsed, setSheetUsed] = useState(false);
  const home = useRef<HTMLDivElement>(null);
  const panels = useRef<HTMLDivElement>(null);
  const showDealership = active === DEALERSHIP;
  // Once shown (by a pill, a card or the address) the dealership form stays mounted, so typed values survive a switch.
  if (showDealership && !dealershipOpened) setDealershipOpened(true);
  if (sheet && !sheetUsed) setSheetUsed(true);

  // Another component may rewrite the address during its own mount (a product sent for a quote): read it once more.
  useEffect(() => { announceSearchChange(); }, []);

  // The one panel goes into the open sheet and comes home when the sheet goes away: moved, never rendered twice.
  // It moves as the sheet's slot is attached, before the dialog hides the rest of the page from assistive technology;
  // the callback keeps one identity so a re-render never moves the panel (and the visitor's focus) again.
  const hostPanel = useCallback((slot: HTMLDivElement | null) => {
    const panel = panels.current, origin = home.current;
    if (!slot || !panel || !origin) return;
    slot.appendChild(panel);
    return () => { origin.appendChild(panel); };
  }, []);

  function choose(next: string): void {
    replaceSearchParam("sekme", next === DEALERSHIP ? DEALERSHIP : null);
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) panels.current?.animate?.([{ opacity: 0 }, { opacity: 1 }], { duration: SWITCH_FADE_MS, easing: "ease-out" });
  }

  /** A card opens its sheet as a history step of its own, so the phone's back button closes it. */
  function openSheet(kind: BusinessKind): void {
    const url = new URL(window.location.href);
    url.searchParams.set("sekme", kind);
    url.searchParams.delete("teklif");
    url.hash = SECTION;
    window.history.pushState({ ...window.history.state, [SHEET_ENTRY]: true }, "", `${url.pathname}${url.search}${url.hash}`);
    announceSearchChange();
  }

  function closeSheet(): void {
    if (window.history.state?.[SHEET_ENTRY]) { window.history.back(); return; }
    // Opened by a link: nothing to step back to, so the address itself is tidied.
    const url = new URL(window.location.href);
    url.searchParams.delete("sekme");
    url.searchParams.delete("teklif");
    url.hash = SECTION;
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
    announceSearchChange();
  }

  function focusCard(kind: BusinessKind): void {
    home.current?.parentElement?.querySelector<HTMLElement>(`[data-business-card="${kind}"] button`)?.focus();
  }

  return <>
    <div className={styles.businessHead}>{heading}<PillSwitch label="Toptan satış ya da bayilik" options={options} value={tab} onChange={choose} /></div>
    <BusinessChooser onChoose={openSheet} />
    <div ref={home} className={styles.businessSlot}>
      <div ref={panels}>
        <div role="group" aria-label={businessCopy.toptan.title} hidden={showDealership} data-business-panel={WHOLESALE}>{wholesale}</div>
        <div role="group" aria-label={businessCopy.bayilik.title} hidden={!showDealership} data-business-panel={DEALERSHIP}>{(showDealership || dealershipOpened) && dealership}</div>
      </div>
    </div>
    {sheetUsed && <BusinessSheet kind={sheet} onClose={closeSheet} onSlot={hostPanel} onClosed={focusCard} />}
  </>;
}
