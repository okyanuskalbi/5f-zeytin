"use client";

import dynamic from "next/dynamic";
import type { JSX } from "react";
import type { DealershipConfiguration } from "@/components/dealership/DealershipFormClient";
import styles from "../StoreHome.module.css";

const DealershipFormClient = dynamic(() => import("@/components/dealership/DealershipFormClient").then(module => module.DealershipFormClient), {
  ssr: false,
  loading: () => <p role="status" className={styles.formLoading}>Başvuru formu yükleniyor.</p>,
});

/** The unchanged dealership form, fetched when the visitor opens its pill. */
export function DeferredDealershipForm({ configuration }: { configuration: DealershipConfiguration }): JSX.Element {
  return <DealershipFormClient configuration={configuration} />;
}
