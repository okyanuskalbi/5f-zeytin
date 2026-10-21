"use client";

import { useId, useRef, useState, useSyncExternalStore, type JSX } from "react";
import dynamic from "next/dynamic";
import { motion } from "motion/react";
import { V3Picture } from "@/components/media/V3Picture";
import { KraftTag } from "@/components/catalog/KraftTag";
import { usePrefersReducedMotion } from "@/lib/media/use-deferred-enhancement";
import { motionTokens, springs } from "@/lib/ui-motion";
import type { V3Image } from "@/lib/media/v3-assets";
import type { ProductFamily } from "@/types/catalog";
import styles from "@/components/catalog/Pantry.module.css";

const QuickView = dynamic(() => import("@/components/catalog/QuickView").then(module => module.QuickView));
const changeEvent = "afina:quick-view";
function subscribe(listener: () => void): () => void {
  window.addEventListener("popstate", listener);
  window.addEventListener(changeEvent, listener);
  return () => { window.removeEventListener("popstate", listener); window.removeEventListener(changeEvent, listener); };
}
const slugSnapshot = (): string | null => new URLSearchParams(window.location.search).get("urun");
const serverSlug = (): null => null;

export function PantryFamily({ family, images, galleries = [], index = 0 }: {
  family: ProductFamily; images: readonly V3Image[]; galleries?: readonly (readonly V3Image[])[]; index?: number;
}): JSX.Element {
  const id = useId();
  const opener = useRef<HTMLElement | null>(null);
  const [selected, setSelected] = useState(0);
  const reduced = usePrefersReducedMotion();
  const slug = useSyncExternalStore(subscribe, slugSnapshot, serverSlug);
  const delay = index * motionTokens.stagger.shelf;
  function open(target: HTMLElement): void {
    opener.current = target;
    const url = new URL(window.location.href);
    url.searchParams.set("urun", family.id);
    history.pushState({ ...history.state, pantryQuickView: family.id }, "", url);
    window.dispatchEvent(new Event(changeEvent));
  }
  function close(wholesale = false): void {
    if (!wholesale && history.state?.pantryQuickView === family.id) { history.back(); return; }
    const url = new URL(window.location.href);
    url.searchParams.delete("urun");
    if (wholesale) url.hash = "toptan";
    history.replaceState({ ...history.state, pantryQuickView: null }, "", url);
    window.dispatchEvent(new Event(changeEvent));
    if (wholesale) document.getElementById("toptan")?.scrollIntoView({ behavior: "instant" });
  }
  return <article aria-labelledby={`${id}-name`} className={styles.family} data-pantry-family={family.id}>
    <motion.button type="button" className={styles.product} aria-label={`${family.name} hızlı görünüm`} onClick={event => open(event.currentTarget)}
      initial={false} whileInView={reduced ? undefined : { y: [-motionTokens.distance.shelf, 0] }} viewport={{ once: true, amount: 0.25 }}
      transition={{ ...springs.shelf, delay }}>
      <V3Picture image={images[selected]} sizes="(max-width: 767px) 40vw, (max-width: 1023px) 20vw, 13vw" />
    </motion.button>
    <KraftTag family={family} selected={selected} onChange={setSelected} onOpen={open} nameId={`${id}-name`} delay={delay} />
    {slug === family.id && <QuickView family={family} selected={selected} onChange={setSelected} images={galleries[selected] ?? []} onClose={close} opener={opener} />}
  </article>;
}
