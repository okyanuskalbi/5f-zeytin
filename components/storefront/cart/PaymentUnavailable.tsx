import Link from "next/link";
import styles from "./PaymentUnavailable.module.css";

/** Shared explanation only. Payment eligibility remains owned by checkout. */
export function PaymentUnavailable({ id, onNavigate, showDetails = false }: { id?: string; onNavigate?: () => void; showDetails?: boolean }) {
  return <div className={styles.notice}>
    <p id={id}>Online ödeme yakında açılıyor. Şimdilik ürünleriniz için teklif isteyebilirsiniz.</p>
    <Link prefetch={false} href="/toptan-satis" onClick={onNavigate}>Teklif iste</Link>
    {showDetails && <Link prefetch={false} href="/odeme" onClick={onNavigate}>Ödeme bilgileri</Link>}
  </div>;
}
