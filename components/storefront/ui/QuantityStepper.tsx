import type { JSX, ReactNode } from "react";
import { Minus, Plus } from "lucide-react";
import ui from "./ui.module.css";

/**
 * Pill quantity control: minus, current value, plus; 44 px targets (docs/DESIGN.md köşe tablosu).
 * The caller owns the limits and the stock rules; this only draws and reports the next value.
 */
export function QuantityStepper({ quantity, canDecrease, canIncrease, onChange, label, live, children }: {
  quantity: number; canDecrease: boolean; canIncrease: boolean; onChange: (next: number) => void;
  /** Names the control as a group where no surrounding group already does. */
  label?: string;
  live?: "polite" | "off";
  /** Shown inside the value; defaults to the number itself. */
  children?: ReactNode;
}): JSX.Element {
  return <div data-stepper="" role={label ? "group" : undefined} aria-label={label} className={ui.stepper}>
    <button type="button" aria-label="Adedi azalt" disabled={!canDecrease} onClick={() => onChange(quantity - 1)}><Minus size={18} strokeWidth={1.8} aria-hidden="true" /></button>
    <output aria-label="Adet" aria-live={live}>{children ?? quantity}</output>
    <button type="button" aria-label="Adedi artır" disabled={!canIncrease} onClick={() => onChange(quantity + 1)}><Plus size={18} strokeWidth={1.8} aria-hidden="true" /></button>
  </div>;
}
