import type { JSX } from "react";
import Link from "next/link";
import { CreditCard } from "lucide-react";
import { V3Picture } from "@/components/media/V3Picture";
import { PaymentLogos } from "@/components/site/PaymentLogos";
import { PaymentUnavailable } from "@/components/storefront/cart/PaymentUnavailable";
import { Medallion } from "@/components/storefront/ui/Medallion";
import { PillButton } from "@/components/storefront/ui/PillButton";
import { SectionHeading } from "@/components/storefront/ui/SectionHeading";
import customer from "@/lib/media/customer-home.json";
import styles from "./Checkout.module.css";

/** /odeme while online payment is closed: the same sentence as the cart, the way to a quotation and the way back. */
export function CheckoutUnavailable(): JSX.Element {
  return <main className={styles.closed}>
    <div className={styles.closedInner}>
      <nav aria-label="İçerik yolu" className={styles.crumbs}><Link prefetch={false} href="/">Ana Sayfa</Link><span aria-hidden="true">/</span><span aria-current="page">Ödeme</span></nav>
      <div className={styles.closedGrid}>
        <div className={styles.closedCopy}>
          <SectionHeading as="h1" title="Ödeme" />
          <section data-checkout-panel="" className={styles.panel} aria-label="Ödeme durumu">
            <Medallion icon={CreditCard} />
            <p className={styles.panelTitle}>Ödeme hazırlıkları sürüyor.</p>
            <PaymentUnavailable emphasis="primary">
              <PillButton variant="outline" href="/sepet">Sepetime dön</PillButton>
            </PaymentUnavailable>
          </section>
          <div className={styles.marksRow}>
            <span id="odeme-secenekleri">Ödeme seçenekleri</span>
            <div role="group" aria-labelledby="odeme-secenekleri" data-payment-pill="" className={styles.marks}><PaymentLogos tone="dark" /></div>
          </div>
        </div>
        <V3Picture image={customer.assets["her-tanede-ayni-ozen-el"]} sizes="(max-width: 899px) calc(100vw - 32px), 460px" decorative className={styles.closedPhoto} />
      </div>
    </div>
  </main>;
}
