"use client";

import { useRef, type JSX, type KeyboardEvent } from "react";
import ui from "./ui.module.css";

export type PillSwitchOption = Readonly<{ value: string; label: string }>;

const steps: Readonly<Record<string, number>> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };

/**
 * Side-by-side pill choice for a few options (docs/DESIGN.md → Formlar, Ürün ayrıntısı).
 * A radiogroup: arrow keys move the selection and only the chosen pill is a tab stop
 * (keyboard model after 21st.dev Segmented Control #43311).
 */
export function PillSwitch({ label, options, value, onChange }: {
  label: string; options: readonly PillSwitchOption[]; value: string; onChange: (value: string) => void;
}): JSX.Element {
  const pills = useRef<(HTMLButtonElement | null)[]>([]);

  function move(event: KeyboardEvent<HTMLButtonElement>, index: number): void {
    const step = steps[event.key];
    if (!step) return;
    event.preventDefault();
    const next = (index + step + options.length) % options.length;
    onChange(options[next].value);
    pills.current[next]?.focus();
  }

  return <div role="radiogroup" aria-label={label} data-pill-switch="" className={ui.switch}>
    {options.map((option, index) => {
      const checked = option.value === value;
      return <button key={option.value} ref={node => { pills.current[index] = node; }} type="button" role="radio" aria-checked={checked}
        tabIndex={checked ? 0 : -1} data-state={checked ? "checked" : "unchecked"}
        onClick={() => onChange(option.value)} onKeyDown={event => move(event, index)}>{option.label}</button>;
    })}
  </div>;
}
