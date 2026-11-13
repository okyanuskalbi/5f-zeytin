"use client";

import { useState, type JSX, type RefCallback } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { businessCopy, type BusinessKind } from "./business-copy";
import styles from "../StoreHome.module.css";

/**
 * The phone's full-screen sheet around the wholesale or dealership form (docs/tasks/209).
 * It is only a shell: the page's one form panel is moved into `onSlot`'s element while the sheet is open,
 * so nothing is mounted twice. Radix owns focus, Escape and the scroll lock. Loaded on first use.
 */
export function BusinessSheet({ kind, onClose, onSlot, onClosed }: {
  kind: BusinessKind | null;
  onClose: () => void;
  /** Receives the element that hosts the form panel while the sheet is open. */
  onSlot: RefCallback<HTMLDivElement>;
  /** After the sheet has closed: return focus to the card that leads to this form. */
  onClosed: (kind: BusinessKind) => void;
}): JSX.Element {
  // The title stays readable while the sheet closes.
  const [shown, setShown] = useState<BusinessKind>(kind ?? "toptan");
  if (kind && kind !== shown) setShown(kind);
  return <Sheet open={kind !== null} onOpenChange={open => { if (!open) onClose(); }}>
    <SheetContent side="bottom" title={businessCopy[shown].sheetTitle} aria-describedby={undefined} className={styles.businessSheet} data-business-sheet={shown}
      // The sheet covers the screen and the moved form is outside Radix's React tree: a tap in it is never "outside".
      onInteractOutside={event => event.preventDefault()}
      onCloseAutoFocus={event => { event.preventDefault(); onClosed(shown); }}>
      <div ref={onSlot} className={styles.businessSheetSlot} />
    </SheetContent>
  </Sheet>;
}
