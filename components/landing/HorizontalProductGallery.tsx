"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type FocusEvent } from "react";
import { m as motion, useMotionValue, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { ArrowDownRightIcon, ArrowUpRightIcon, CheckIcon } from "lucide-react";
import { ProductCard } from "@/components/catalog/ProductCard";
import { v3Image } from "@/lib/media/v3-assets";
import type { ProductVariant } from "@/types/catalog";
import { useDesktopMotion } from "./ScrollStage";
import { useQuoteJourney } from "./QuoteJourneyProvider";
import styles from "./HorizontalProductGallery.module.css";
const subscribeReady = () => () => {};
const clientReady = () => true;
const serverReady = () => false;

/** 21st 24623 / motiondotdev: a sticky viewport with direct scroll→x mapping.
 * AFİNA adds measured overflow, keyboard travel, native fallbacks and an actual
 * SKU-to-enquiry handoff. No spring, input capture or duplicate scroll engine. */
export function HorizontalProductGallery({ products }: { products: readonly ProductVariant[] }) {
  const ordered = [...products].sort((a, b) => a.imageKey.localeCompare(b.imageKey));
  const section = useRef<HTMLElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [travel, setTravel] = useState(0);
  const distance = useMotionValue(0);
  const desktop = useDesktopMotion("(min-width: 1024px) and (min-height: 860px)");
  const scrub = desktop && travel > 1;
  const journey = useQuoteJourney();
  const ready = useSyncExternalStore(subscribeReady, clientReady, serverReady);
  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const x = useTransform(() => -distance.get() * scrollYProgress.get());
  useMotionValueEvent(scrollYProgress, "change", p => {
    if (!section.current || !scrub) return;
    section.current.style.setProperty("--sc-p", String(p));
  });
  useEffect(() => {
    const rail = track.current, windowElement = viewport.current;
    if (!rail || !windowElement) return;
    const measure = () => {
      const next = Math.max(0, rail.scrollWidth - windowElement.clientWidth);
      distance.set(next); setTravel(next);
    };
    measure();
    const observer = typeof ResizeObserver === "function" ? new ResizeObserver(measure) : undefined;
    observer?.observe(rail); observer?.observe(windowElement);
    let current = true;
    void document.fonts?.ready.then(() => { if (current) measure(); });
    rail.addEventListener("load", measure, true);
    return () => { current = false; observer?.disconnect(); rail.removeEventListener("load", measure, true); };
  }, [distance]);

  function revealFocus(event: FocusEvent<HTMLDivElement>) {
    if (!scrub || !section.current || !viewport.current || !track.current) return;
    const item = (event.target as HTMLElement).closest<HTMLElement>("[data-gallery-item]");
    if (!item) return;
    const viewportRect = viewport.current.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    if (itemRect.left >= viewportRect.left - 2 && itemRect.right <= viewportRect.right + 2) return;
    const desired = Math.min(travel, Math.max(0, item.offsetLeft - (viewport.current.clientWidth - item.offsetWidth) / 2));
    const sceneRect = section.current.getBoundingClientRect();
    const span = Math.max(0, section.current.clientHeight - window.innerHeight);
    window.scrollTo({ top: sceneRect.top + scrollY + (desired / travel) * span, behavior: "instant" });
  }
  return <section ref={section} id="urunler" aria-labelledby="urunler-title" className={styles.section}
    data-sc-scene="urunler" data-sc-device="pan" data-sc-engine="motion" data-21st-source="24623"
    data-gallery-mode={scrub ? "scrub" : "native"} style={{ "--gallery-span": `${travel}px` } as CSSProperties}>
    <noscript><span className={styles.noJs} /></noscript>
    <div className={styles.stage}>
      <div className={styles.heading} id="kiler">
        <div><h2 id="urunler-title">Sofranızdan{" "}<br />işletmenize.</h2><p>Her sofraya bir AFİNA. Zeytin, salamura ve zeytinyağı.</p></div>
        <p className={styles.explanation}>Ambalajı seçin. Sofranız için sepete,<br className={styles.desktopBreak} /> işletmeniz için teklifinize ekleyin.<ArrowDownRightIcon aria-hidden="true" size={24} /></p>
      </div>
      {ordered.length ? <>
        <div ref={viewport} className={styles.viewport} data-gallery-viewport="" role="region" aria-label="Ürün galerisi" tabIndex={0}>
          <motion.div ref={track} data-gallery-track="" className={styles.track} onFocusCapture={revealFocus} style={scrub ? { x } : { transform: "none" }}>
            {ordered.map((product, index) => <motion.div key={product.id} data-gallery-item={product.id} className={styles.item}
              initial={false} whileHover={desktop ? { scale: 1.015 } : undefined} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
              <ProductCard product={product} image={v3Image(product.imageKey)} index={index} featured={false} quoteAction={
              <button type="button" disabled={!ready} className={styles.quote} data-selected={journey.productId === product.id}
                aria-label={`Teklife ekle: ${product.name}, ${product.weight}`}
                onClick={() => { journey.chooseProduct(product.id); window.location.hash = "teklif"; }}>
                {journey.productId === product.id ? <CheckIcon size={18} aria-hidden="true" /> : <ArrowUpRightIcon size={18} aria-hidden="true" />}
                Teklife ekle
              </button>} />
            </motion.div>)}
          </motion.div>
        </div>
        <div className={styles.foot}><span>{ordered.length} ambalaj. Aynı üretici.</span><span>{scrub ? "Kaydırdıkça keşfedin." : "Ürünleri yatay kaydırarak keşfedin."}</span></div>
      </> : <p role="status">Görüntülenecek ürün bulunmuyor.</p>}
    </div>
  </section>;
}
