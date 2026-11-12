import type { JSX } from "react";
import ui from "./ui.module.css";

/** One-line olive branch drawn from the logo's stroke; decoration only, at most twice per page. */
export function OliveBranch({ tone = "olive", className }: { tone?: "olive" | "gold"; className?: string }): JSX.Element {
  return <svg data-olive-branch="" data-tone={tone} aria-hidden="true" focusable="false" viewBox="0 0 280 74" width="280" height="74"
    className={[ui.branch, className].filter(Boolean).join(" ")} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 42 C 74 22, 150 54, 274 26" />
    <path d="M26.7 37.4 Q47.4 33.6 50 12.7 Q29.3 16.6 26.7 37.4 Z" />
    <path d="M48.1 35.3 Q55.7 55.8 77.5 56 Q69.9 35.6 48.1 35.3 Z" />
    <path d="M75 35.1 Q98.5 33.1 107.1 11.2 Q83.7 13.2 75 35.1 Z" />
    <path d="M108.8 36.5 Q115.1 58.3 137.6 61.4 Q131.3 39.5 108.8 36.5 Z" />
    <path d="M140.2 37.8 Q163.7 36 172.4 14.1 Q149 16 140.2 37.8 Z" />
    <path d="M180.3 37.9 Q187.5 58.5 209.3 59.1 Q202.1 38.5 180.3 37.9 Z" />
    <path d="M218 35.3 Q238.8 32.4 242.4 11.6 Q221.6 14.6 218 35.3 Z" />
    <path d="M91.6 35.7 Q93.8 40 93.4 45" />
    <ellipse cx="93.4" cy="55.6" rx="7.4" ry="10.4" transform="rotate(-8 93.4 55.6)" />
    <path d="M162.6 38.2 Q164.8 42 164.4 46.6" />
    <ellipse cx="164.4" cy="57.2" rx="7.4" ry="10.4" transform="rotate(8 164.4 57.2)" />
  </svg>;
}
