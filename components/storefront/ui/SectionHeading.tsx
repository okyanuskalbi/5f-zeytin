import type { JSX } from "react";
import { Leaf } from "lucide-react";
import ui from "./ui.module.css";

/** Optional leaf eyebrow, Cormorant title, optional lead; `tone="dark"` for green bands. */
export function SectionHeading({ eyebrow, title, lead, tone = "light", align = "start", as: Heading = "h2" }: {
  eyebrow?: string; title: string; lead?: string; tone?: "light" | "dark"; align?: "start" | "center"; as?: "h1" | "h2";
}): JSX.Element {
  return <div className={ui.heading} data-tone={tone} data-align={align}>
    {eyebrow && <p data-eyebrow="" className={ui.eyebrow}><Leaf aria-hidden="true" size={16} strokeWidth={1.8} />{eyebrow}</p>}
    <Heading className={ui.title}>{title}</Heading>
    {lead && <p className={ui.lead}>{lead}</p>}
  </div>;
}
