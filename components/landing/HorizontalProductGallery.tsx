"use client";

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type FocusEvent, type ReactNode } from "react";
import { m as motion, useMotionValue, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "framer-motion";
import { ArrowDownRightIcon, ArrowUpRightIcon, CheckIcon } from "lucide-react";
import { ProductCard } from "@/components/catalog/ProductCard";
import { PendantLampRail } from "@/components/ui/pendant-lamp-rail";
import { v3Image } from "@/lib/media/v3-assets";
import type { ProductVariant } from "@/types/catalog";
import { useDesktopMotion } from "./ScrollStage";
import { useQuoteJourney } from "./QuoteJourneyProvider";
import styles from "./HorizontalProductGallery.module.css";
const subscribeReady = () => () => {};
const clientReady = () => true;
const serverReady = () => false;

/** Distance from the viewport's centre controls the light, never availability. */
export function gallerySpotlight(centre: number, viewportWidth: number): number {
  if (viewportWidth <= 0) return 1;
  return Math.max(0, 1 - Math.abs(centre - viewportWidth / 2) / (viewportWidth * .55));
}

export function galleryFocusProgress(left: number, width: number, viewportWidth: number, travel: number): number {
  if (travel <= 0) return 0;
  return Math.max(0, Math.min(1, (left - (viewportWidth - width) / 2) / travel));
}

function GalleryProduct({ product, index, total, active, railX, windowWidth, children }: {
  product: ProductVariant; index: number; total: number; active: boolean;
  railX: MotionValue<number>; windowWidth: MotionValue<number>; children: ReactNode;
}) {
  const item = useRef<HTMLDivElement>(null);
  const centre = useMotionValue(0);
  const focus = useTransform(() => active ? gallerySpotlight(centre.get() + railX.get(), windowWidth.get()) : 1);
  const scale = useTransform(focus, [0, 1], [.88, 1]);
  const y = useTransform(focus, [0, 1], [32, 0]);
  const light = useTransform(() => active ? .15 + focus.get() * .85 : .18);
  useEffect(() => {
    const element = item.current;
    if (!element) return;
    const measure = () => centre.set(element.offsetLeft + element.offsetWidth / 2);
    measure();
    const observer = typeof ResizeObserver === "function" ? new ResizeObserver(measure) : undefined;
    observer?.observe(element);
    if (element.parentElement) observer?.observe(element.parentElement);
    return () => observer?.disconnect();
  }, [active, centre]);
  return <motion.div ref={item} data-gallery-item={product.id} data-rail-item={product.id} className={styles.item}
    initial={false} style={active ? { scale, y } : { transform: "none" }}>
    <motion.div className={styles.spotlight} aria-hidden="true" style={{ opacity: light }} />
    <span className={styles.number} aria-hidden="true">{String(index + 1).padStart(2, "0")} <span>/ {String(total).padStart(2, "0")}</span></span>
    {children}
  </motion.div>;
}

/** 21st 24623 / motiondotdev: a sticky viewport with direct scroll→x mapping.
 * AFİNA adds measured overflow, keyboard travel, native fallbacks and an actual
 * SKU-to-enquiry handoff. Product-rail pointer intent writes to the same scroll
 * position; it does not introduce a second scroll engine or body input lock. */
export function HorizontalProductGallery({ products }: { products: readonly ProductVariant[] }) {
  const ordered = [...products].sort((a, b) => a.imageKey.localeCompare(b.imageKey));
  const section = useRef<HTMLElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [travel, setTravel] = useState(0);
  const distance = useMotionValue(0);
  const windowWidth = useMotionValue(0);
  const desktop = useDesktopMotion("(min-width: 1024px) and (min-height: 860px) and (hover: hover) and (pointer: fine)");
  const scrub = desktop && travel > 1;
  const journey = useQuoteJourney();
  const ready = useSyncExternalStore(subscribeReady, clientReady, serverReady);
  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const x = useTransform(() => -distance.get() * scrollYProgress.get());
  useLayoutEffect(() => {
    if (!scrub || !section.current) return;
    const element = section.current;
    const span = element.clientHeight - window.innerHeight;
    scrollYProgress.set(span > 0 ? Math.max(0, Math.min(1, -element.getBoundingClientRect().top / span)) : 0);
  }, [scrub, travel, scrollYProgress]);
  useMotionValueEvent(scrollYProgress, "change", p => {
    if (!section.current || !scrub) return;
    section.current.style.setProperty("--sc-p", String(p));
  });
  useEffect(() => {
    const rail = track.current, windowElement = viewport.current;
    if (!rail || !windowElement) return;
    const measure = () => {
      const next = Math.max(0, rail.scrollWidth - windowElement.clientWidth);
      windowWidth.set(windowElement.clientWidth);
      distance.set(next); setTravel(next);
    };
    measure();
    const observer = typeof ResizeObserver === "function" ? new ResizeObserver(measure) : undefined;
    observer?.observe(rail); observer?.observe(windowElement);
    let current = true;
    void document.fonts?.ready.then(() => { if (current) measure(); });
    rail.addEventListener("load", measure, true);
    return () => { current = false; observer?.disconnect(); rail.removeEventListener("load", measure, true); };
  }, [distance, windowWidth]);

  function revealFocus(event: FocusEvent<HTMLDivElement>) {
    if (!scrub || !section.current || !viewport.current || !track.current) return;
    const item = (event.target as HTMLElement).closest<HTMLElement>("[data-gallery-item]");
    if (!item) return;
    const viewportRect = viewport.current.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    if (itemRect.left >= viewportRect.left - 2 && itemRect.right <= viewportRect.right + 2) return;
    const progress = galleryFocusProgress(item.offsetLeft, item.offsetWidth, viewport.current.clientWidth, travel);
    const sceneRect = section.current.getBoundingClientRect();
    const span = Math.max(0, section.current.clientHeight - window.innerHeight);
    window.scrollTo({ top: sceneRect.top + scrollY + progress * span, behavior: "instant" });
  }
  function seekGallery(offset: number) {
    if (!section.current || travel <= 0) return;
    const span = Math.max(0, section.current.clientHeight - window.innerHeight);
    const top = section.current.getBoundingClientRect().top + window.scrollY;
    const progress = Math.max(0, Math.min(1, offset / travel));
    scrollYProgress.set(progress);
    window.scrollTo({ top: top + progress * span, behavior: "instant" });
  }
  return <section ref={section} id="urunler" aria-labelledby="urunler-title" className={styles.section}
    data-sc-scene="urunler" data-sc-device="pan" data-sc-engine="motion" data-21st-source="24623"
    data-gallery-mode={scrub ? "scrub" : "native"} style={{ "--gallery-span": `${travel}px` } as CSSProperties}>
    <noscript><span className={styles.noJs} /><p className={styles.noJsMessage}>Ürün bilgilerini inceleyebilir, sipariş ve toptan talep için <a href="#iletisim">iletişim bilgilerine ulaşabilirsiniz.</a></p></noscript>
    <div className={styles.stage}>
      <div className={styles.heading} id="kiler">
        <div><p className={styles.eyebrow}>AFİNA KOLEKSİYONU</p><h2 id="urunler-title">Sofranızdan{" "}<em>işletmenize.</em></h2><p>Her sofraya bir AFİNA. Zeytin, salamura ve zeytinyağı.</p></div>
        <p className={styles.explanation}>Ambalajı seçin. Sofranız için sepete,<br className={styles.desktopBreak} /> işletmeniz için teklifinize ekleyin.<ArrowDownRightIcon aria-hidden="true" size={24} /></p>
      </div>
      {ordered.length ? <>
        <PendantLampRail variant="product" label="Ürün galerisi" x={x} scrub={scrub} travel={travel}
          viewportRef={viewport} trackRef={track} viewportClassName={styles.viewport} trackClassName={styles.track}
          onOffsetChange={seekGallery} onFocusCapture={revealFocus}>
            {ordered.map((product, index) => <GalleryProduct key={product.id} product={product} index={index} total={ordered.length}
              active={scrub} railX={x} windowWidth={windowWidth}>
              <ProductCard product={product} image={v3Image(product.imageKey)} index={index} featured={false} quoteAction={
              <button type="button" disabled={!ready} className={styles.quote} data-selected={journey.productId === product.id}
                aria-label={`Teklife ekle: ${product.name}, ${product.weight}`}
                onClick={() => { journey.chooseProduct(product.id); window.location.hash = "teklif"; }}>
                {journey.productId === product.id ? <CheckIcon size={18} aria-hidden="true" /> : <ArrowUpRightIcon size={18} aria-hidden="true" />}
                Teklife ekle
              </button>} />
            </GalleryProduct>)}
        </PendantLampRail>
        <div className={styles.foot}><span>{ordered.length} ambalaj. Aynı üretici.</span><span>{scrub ? "Kaydırdıkça keşfedin." : "Ürünleri yatay kaydırarak keşfedin."}</span></div>
      </> : <p role="status">Görüntülenecek ürün bulunmuyor.</p>}
    </div>
  </section>;
}
