"use client";

import type { JSX } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { WholesaleForm } from "./WholesaleForm";
import styles from "./WholesaleFaq.module.css";

export function WholesaleDialog({ onClose, onRestoreFocus }: { onClose: () => void; onRestoreFocus: () => void }): JSX.Element {
  return <Dialog open onOpenChange={open => { if (!open) onClose(); }}>
    <DialogContent className={styles.dialog} onCloseAutoFocus={event => { event.preventDefault(); onRestoreFocus(); }}>
      <DialogHeader>
        <DialogTitle>Toptan teklif isteyin</DialogTitle>
        <DialogDescription>Miktar ve teslimat bilgilerinizi talep mesajına yazın.</DialogDescription>
      </DialogHeader>
      <WholesaleForm />
    </DialogContent>
  </Dialog>;
}
