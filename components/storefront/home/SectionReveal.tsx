"use client";

import { useEffect } from "react";

const PENDING = "pending";
const SHOWN = "shown";

/**
 * One soft arrival per section below the first screen (docs/tasks/208 → Hareket).
 * Server HTML is fully visible: without script, without IntersectionObserver or with
 * reduced motion nothing is ever hidden. Nothing here follows the scroll position.
 */
export function SectionReveal(): null {
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const sections = [...document.querySelectorAll<HTMLElement>("[data-reveal]")];
    const waiting = sections.filter(section => section.getBoundingClientRect().top >= window.innerHeight);
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.setAttribute("data-reveal", SHOWN);
        observer.unobserve(entry.target);
      }
    }, { rootMargin: "0px 0px -8% 0px" });
    for (const section of waiting) { section.setAttribute("data-reveal", PENDING); observer.observe(section); }
    return () => { observer.disconnect(); for (const section of sections) section.setAttribute("data-reveal", ""); };
  }, []);
  return null;
}
