"use client";

// Adapted from David Haz / React Bits BlurText, commit 4dc7b5b7772e1217c8fb8d2a7aa074302180e5b4.
// Copyright (c) 2026 David Haz. MIT + Commons Clause; see LICENSE.md.
// AFİNA uses the word/keyframe/once-in-view core. SSR stays visible, filters and
// looping are removed, and the already shared Framer Motion runtime is reused.
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { m as motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/media/use-deferred-enhancement";
import { motionTokens } from "@/lib/ui-motion";

type Snapshot = Record<string, number>;
function buildKeyframes(from: Snapshot, steps: Snapshot[]) {
  const keys = new Set([...Object.keys(from), ...steps.flatMap(step => Object.keys(step))]);
  const keyframes: Record<string, number[]> = {};
  keys.forEach(key => { keyframes[key] = [from[key], ...steps.map(step => step[key])]; });
  return keyframes;
}

export function BlurText({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [inView, setInView] = useState(false);
  const reduced = usePrefersReducedMotion();
  const words = useMemo(() => text.split(" "), [text]);
  const frames = useMemo(() => buildKeyframes(
    { y: motionTokens.entrance.distance, opacity: 1 }, [{ y: 0, opacity: 1 }],
  ), []);

  useEffect(() => {
    const element = ref.current;
    if (!element || reduced || typeof IntersectionObserver !== "function") return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); observer.disconnect(); }
    }, { threshold: .2, rootMargin: "0px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, [reduced]);

  return <span ref={ref} className={className} data-react-bits="BlurText" data-text-entered={inView}>
    {words.map((word, index) => <Fragment key={`${word}-${index}`}>
      <motion.span initial={false} animate={inView && !reduced ? frames : undefined}
        transition={{ duration: motionTokens.duration.landing, delay: index * motionTokens.entrance.stagger }}
        style={{ display: "inline-block", ...(reduced ? { transform: "none" } : {}) }}>{word}</motion.span>
      {index < words.length - 1 ? " " : null}
    </Fragment>)}
  </span>;
}
