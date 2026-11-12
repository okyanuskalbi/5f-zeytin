import type { JSX, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import ui from "./ui.module.css";

/** The poster's small pill label ("Zeytin / Zeytinyağı"); pill shape after 21st.dev Pill (#1600). */
export function Tag({ tone = "sage", icon: Icon, children }: { tone?: "sage" | "gold"; icon?: LucideIcon; children: ReactNode }): JSX.Element {
  return <span data-tag="" data-tone={tone} className={ui.tag}>
    {Icon && <Icon aria-hidden="true" size={16} strokeWidth={1.8} />}{children}
  </span>;
}
