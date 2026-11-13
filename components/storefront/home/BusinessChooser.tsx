"use client";

import type { JSX } from "react";
import { Handshake, Package } from "lucide-react";
import { Medallion } from "@/components/storefront/ui/Medallion";
import { PillButton } from "@/components/storefront/ui/PillButton";
import { businessCopy, businessKinds, type BusinessKind } from "./business-copy";
import styles from "../StoreHome.module.css";

const icons = { toptan: Package, bayilik: Handshake } as const;

/** Phones only (hidden by CSS from 768 px): two cards, each opening its form in a sheet. */
export function BusinessChooser({ onChoose }: { onChoose: (kind: BusinessKind) => void }): JSX.Element {
  return <div className={styles.businessChooser} data-business-chooser="">
    {businessKinds.map(kind => <div key={kind} className={styles.chooserCard} data-business-card={kind}>
      <div className={styles.chooserHead}><Medallion icon={icons[kind]} /><h3>{businessCopy[kind].title}</h3></div>
      <p>{businessCopy[kind].note}</p>
      {/* The pill's stretched hit area (CSS) makes the whole card the target. */}
      <PillButton variant="outline" fullWidth aria-haspopup="dialog" onClick={() => onChoose(kind)}>{businessCopy[kind].action}</PillButton>
    </div>)}
  </div>;
}
