import type { JSX, ReactNode } from "react";
import { PillButton } from "@/components/storefront/ui/PillButton";
import styles from "./PaymentUnavailable.module.css";

/** Shared explanation only. Payment eligibility remains owned by checkout. */
export function PaymentUnavailable({ id, onNavigate, showDetails = false, emphasis = "outline", compact = false, children }: {
  id?: string; onNavigate?: () => void; showDetails?: boolean;
  /** The 44 px pill, for the drawer's short footer. */
  compact?: boolean;
  /** Further actions for the same row, after the quotation. */
  children?: ReactNode;
  /** "primary" only where no other main action shares the view (the closed checkout page). */
  emphasis?: "outline" | "primary";
}): JSX.Element {
  return <div className={styles.notice}>
    <p id={id}>Online ödeme yakında açılıyor. Şimdilik ürünleriniz için teklif isteyebilirsiniz.</p>
    <div className={styles.actions}>
      <PillButton variant={emphasis} size={compact ? "md" : "lg"} href="/toptan-satis" onClick={onNavigate}>Teklif İste</PillButton>
      {showDetails && <PillButton variant="quiet" href="/odeme" onClick={onNavigate}>Ödeme bilgileri</PillButton>}
      {children}
    </div>
  </div>;
}
