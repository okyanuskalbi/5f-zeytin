"use client";

import { useEffect, useState, type JSX, type RefObject } from "react";
import { useMotionValue, useMotionValueEvent, useScroll, useTransform } from "motion/react";

const motionTokens = { stubWidth: 120, scrollDistance: 0.7 } as const;

export function HeroLabelMotion({ root, anchor, stub, staticLabel, setCollapsed: reportCollapsed }: {
  root: RefObject<HTMLElement | null>;
  anchor: RefObject<HTMLDivElement | null>;
  stub: RefObject<HTMLElement | null>;
  staticLabel: boolean;
  setCollapsed: (value: boolean) => void;
}): JSX.Element | null {
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => { reportCollapsed(collapsed); }, [collapsed, reportCollapsed]);
  const { scrollY } = useScroll();
  const geometry = useMotionValue({ start: 0, left: 0, top: 0, width: 0, bottom: 0, distance: 1 });
  const progress = useTransform(() => staticLabel ? 0 : Math.max(0, Math.min(1,
    (scrollY.get() - geometry.get().start) / geometry.get().distance)));
  const scale = useTransform(() => 1 + (motionTokens.stubWidth / (geometry.get().width || motionTokens.stubWidth) - 1) * progress.get());
  const x = useTransform(() => (16 - geometry.get().left) * progress.get());
  const y = useTransform(() => (geometry.get().bottom - geometry.get().top) * progress.get());
  const opacity = useTransform(progress, [0.85, 1], [1, 0]);
  const compact = collapsed && !staticLabel;

  useMotionValueEvent(progress, "change", (value) => setCollapsed(value >= 0.995));

  // Keep the compact label in the lower-left safe area, moving it only when
  // a heading or control would otherwise pass beneath its paper surface.
  useEffect(() => {
    if (!compact) return;
    const element = stub.current!;
    if (root.current?.querySelector("[data-hero-card]")?.contains(document.activeElement)) {
      element.querySelector("a")?.focus({ preventScroll: true });
    }
    let frame: number | undefined;
    function place(): void {
      frame = undefined;
      element.style.removeProperty("--stub-left");
      element.style.removeProperty("--stub-bottom");
      element.style.removeProperty("visibility");
      element.inert = false;
      const box = element.getBoundingClientRect();
      const headerBottom = document.querySelector("header")?.getBoundingClientRect().bottom ?? 64;
      const footer = document.querySelector("footer")?.getBoundingClientRect();
      if (footer && footer.top < innerHeight && footer.bottom > headerBottom) {
        if (element.contains(document.activeElement)) {
          document.querySelector<HTMLButtonElement>('header button[aria-label^="Sepetim,"]')?.focus({ preventScroll: true });
        }
        element.style.visibility = "hidden";
        element.inert = true;
        return;
      }
      if (element.contains(document.activeElement)) return;
      const obstacles = [...document.querySelectorAll<HTMLElement>("h1,h2,h3,p,a,button,input,select,textarea,[data-product-slip],[data-showcase-copy],[data-facility-safe],[data-moments-safe],[data-reading-safe]")]
        .filter((node) => !root.current?.contains(node) && node.getClientRects().length > 0)
        .flatMap((node) => {
          // A showcase slip is one paper object, including the space around
          // its purchase controls. Keep the stub outside the whole panel.
          if (node.matches("[data-product-slip],[data-showcase-copy],[data-facility-safe],[data-moments-safe],[data-reading-safe]")) return [node.getBoundingClientRect()];
          const range = document.createRange();
          range.selectNodeContents(node);
          return [...range.getClientRects()];
        }).filter((rect) => rect.bottom > headerBottom && rect.top < innerHeight && rect.width > 0);
      const overlaps = (left: number, top: number): boolean => obstacles.some((rect) =>
        left < rect.right + 8 && left + box.width > rect.left - 8 && top < rect.bottom + 8 && top + box.height > rect.top - 8);
      if (!overlaps(box.left, box.top)) return;
      const xs = [box.left, ...obstacles.map((rect) => rect.right + 8)]
        .filter((left) => left >= box.left && left + box.width <= innerWidth - 16);
      const ys = [box.top, ...obstacles.map((rect) => rect.top - box.height - 8)]
        .filter((top) => top >= headerBottom + 16 && top <= box.top);
      const candidates = ys.flatMap((top) => xs.map((left) => ({ top, left })))
        .sort((a, b) => (a.left - box.left + box.top - a.top) - (b.left - box.left + box.top - b.top));
      const space = candidates.find(({ left, top }) => !overlaps(left, top));
      if (space) {
        element.style.setProperty("--stub-left", `${space.left}px`);
        element.style.setProperty("--stub-bottom", `${innerHeight - space.top - box.height}px`);
      } else {
        const readingSectionVisible = [...document.querySelectorAll("#urunler, #tesisimiz, #topraktan-sofraya, #sik-sorulanlar, #toptan-iletisim, footer")]
          .some(section => { const rect = section.getBoundingClientRect(); return rect.top < innerHeight && rect.bottom > headerBottom; });
        if (readingSectionVisible) {
          // A narrow reading column can leave no safe 120px space. The header
          // cart stays available; temporarily remove the duplicate stub rather
          // than covering official copy, facility facts or the draggable strip.
          element.style.visibility = "hidden";
          element.inert = true;
        }
      }
    }
    function schedule(): void { if (frame === undefined) frame = requestAnimationFrame(place); }
    const stop = scrollY.on("change", schedule);
    // Native animation completion can follow the last scroll frame. Reuse the
    // same placement scheduler once the slips have reached their final bounds.
    window.addEventListener("afina:product-card-settled", schedule);
    window.addEventListener("afina:facility-settled", schedule);
    window.addEventListener("resize", schedule);
    schedule();
    return () => {
      stop(); window.removeEventListener("afina:product-card-settled", schedule); window.removeEventListener("afina:facility-settled", schedule); window.removeEventListener("resize", schedule);
      if (frame !== undefined) cancelAnimationFrame(frame);
      element.style.removeProperty("--stub-left"); element.style.removeProperty("--stub-bottom");
      element.style.removeProperty("visibility"); element.inert = false;
    };
  }, [compact, root, scrollY, stub]);

  // 21st danielpetho/stacking-cards (25275): a stable anchor and scroll-driven
  // transforms. The 120px stub outlives the scene; it shares the existing cart.
  useEffect(() => {
    const section = root.current!;
    if (staticLabel || typeof ResizeObserver === "undefined") {
      section.removeAttribute("data-enhanced");
      return;
    }
    function measure(): void {
      const anchored = anchor.current;
      const ticket = stub.current;
      // A queued ResizeObserver delivery can run during a client navigation.
      if (!section.isConnected || !anchored || !ticket) return;
      const box = anchored.getBoundingClientRect();
      const start = section.getBoundingClientRect().top + window.scrollY;
      const top = box.top + window.scrollY;
      const bottom = innerHeight - ticket.getBoundingClientRect().height - parseFloat(getComputedStyle(ticket).bottom);
      geometry.set({ start, left: box.left, top, width: box.width, bottom, distance: innerHeight * motionTokens.scrollDistance });
      section.style.setProperty("--dock-left", `${box.left}px`);
      section.style.setProperty("--dock-top", `${top}px`);
      section.style.setProperty("--dock-width", `${box.width}px`);
      section.style.setProperty("--dock-height", `${box.height}px`);
      section.setAttribute("data-enhanced", "true");
    }
    const observer = new ResizeObserver(measure);
    observer.observe(anchor.current!);
    window.addEventListener("resize", measure);
    measure();
    return () => { observer.disconnect(); window.removeEventListener("resize", measure); section.removeAttribute("data-enhanced"); };
  }, [anchor, geometry, root, staticLabel, stub]);


  useEffect(() => {
    const card = root.current?.querySelector<HTMLElement>("[data-hero-card]");
    if (!card) return;
    function draw(): void {
      card!.style.transform = `translate(${x.get()}px, ${y.get()}px) scale(${scale.get()})`;
      card!.style.opacity = String(opacity.get());
    }
    const stop = [x, y, scale, opacity].map((value) => value.on("change", draw));
    draw();
    return () => { stop.forEach((dispose) => dispose()); card.style.removeProperty("transform"); card.style.removeProperty("opacity"); };
  }, [root, x, y, scale, opacity]);
  return null;
}
