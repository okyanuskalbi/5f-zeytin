import type { JSX } from "react";
import type { LucideIcon } from "lucide-react";
import ui from "./ui.module.css";

/** A gold-ringed icon disc; its neighbouring text carries the meaning. */
export function Medallion({ icon: Icon, tone = "light" }: { icon: LucideIcon; tone?: "light" | "dark" }): JSX.Element {
  return <span data-medallion="" data-tone={tone} aria-hidden="true" className={ui.medallion}>
    <Icon size={22} strokeWidth={1.6} />
  </span>;
}
