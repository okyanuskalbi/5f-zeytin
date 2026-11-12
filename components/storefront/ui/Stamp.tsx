import { useId, type JSX } from "react";
import ui from "./ui.module.css";

const RING_CHARACTERS = 48;
const SEPARATOR = " • ";

/**
 * A still seal for the customer's one permitted claim. Circular text on a path
 * after 21st.dev Stamp (#3417); it never turns or blinks.
 */
export function Stamp({ label, tone = "light", size = 104 }: { label: string; tone?: "light" | "dark"; size?: number }): JSX.Element {
  const ring = useId();
  const text = label.toLocaleUpperCase("tr-TR");
  const repeats = Math.max(1, Math.round(RING_CHARACTERS / (text.length + SEPARATOR.length)));
  const around = `${text}${SEPARATOR}`.repeat(repeats);
  return <svg role="img" aria-label={label} data-stamp="" data-tone={tone} className={ui.stamp} width={size} height={size} viewBox="0 0 120 120">
    <defs><path id={ring} d="M 17 60 a 43 43 0 1 1 86 0 a 43 43 0 1 1 -86 0" /></defs>
    <circle cx="60" cy="60" r="58.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="60" cy="60" r="55" fill="none" stroke="currentColor" strokeWidth=".6" />
    <text className={ui.stampText} fill="currentColor" aria-hidden="true">
      <textPath href={`#${ring}`} startOffset="0" textLength="268" lengthAdjust="spacing">{around}</textPath>
    </text>
    <circle cx="60" cy="60" r="31" fill="currentColor" />
    <g className={ui.stampLeaf} fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M49 71 C 47 55, 57 45, 73 46 C 74 62, 65 72, 49 71 Z" />
      <path d="M46.5 74.5 C 54 66, 61 59, 68 52" />
    </g>
  </svg>;
}
