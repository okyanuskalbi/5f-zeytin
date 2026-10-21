"use client";

import { useId, type JSX } from "react";
import { RadioGroup } from "radix-ui";
import type { ProductFamily } from "@/types/catalog";
import styles from "./Pantry.module.css";

export function VariantChips({ family, selected, onChange }: { family: ProductFamily; selected: number; onChange: (index: number) => void }): JSX.Element {
  const id = useId();
  return <RadioGroup.Root aria-label="Boy" className={styles.chips} value={String(selected)} onValueChange={value => onChange(Number(value))}
    onKeyDownCapture={event => {
      const delta = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 0;
      if (!delta && event.key !== "Home" && event.key !== "End") return;
      event.preventDefault(); event.stopPropagation();
      const next = event.key === "Home" ? 0 : event.key === "End" ? family.variants.length - 1 : (selected + delta + family.variants.length) % family.variants.length;
      onChange(next);
      event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]')[next]?.focus();
    }}>
    {family.variants.map((variant, index) => <RadioGroup.Item key={variant.id} id={`${id}-${index}`} value={String(index)} className={styles.chip}>
      {variant.weight}
    </RadioGroup.Item>)}
  </RadioGroup.Root>;
}
