"use client";

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type FocusEvent, type ReactNode } from "react";
import { m as motion, useMotionValue, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "framer-motion";
import { ArrowDownRightIcon, ArrowUpRightIcon, CheckIcon } from "lucide-react";
import { ProductCard } from "@/components/catalog/ProductCard";
import { PendantLampRail } from "@/components/ui/pendant-lamp-rail";
import { v3Image } from "@/lib/media/v3-assets";
import { useGalleryMotion } from "@/lib/media/use-gallery-motion";
import type { ProductVariant } from "@/types/catalog";
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

function GalleryProduct({ product, index, total, active, touch, railX, windowWidth, children }: {
  product: ProductVariant; index: number; total: number; active: boolean; touch: boolean;
  railX: MotionValue<number>; windowWidth: MotionValue<number>; children: ReactNode;
}) {
  const item = useRef<HTMLDivElement>(null);
  const centre = useMotionValue(0);
  const focus = useTransform(() => active ? gallerySpotlight(centre.get() + railX.get(), windowWidth.get()) : 1);
  const scale = useTransform(focus, [0, 1], [.88, 1]);
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
    initial={false} style={active && !touch ? { scale } : { transform: "none" }}>
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
  const stage = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const wasScrub = useRef(false);
  const previousGeometry = useRef({ travel: 0, stageHeight: 0 });
  const [travel, setTravel] = useState(0);
  const [stageHeight, setStageHeight] = useState(0);
  const distance = useMotionValue(0);
  const windowWidth = useMotionValue(0);
  const layout = useGalleryMotion();
  const scrub = layout !== "native" && travel > 1;
  const journey = useQuoteJourney();
  const ready = useSyncExternalStore(subscribeReady, clientReady, serverReady);
  // A phone's visible viewport may grow when browser chrome retracts, while
  // 100svh remains stable. The last package meets the actual sticky stage end.
  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", stageHeight > 0 ? `end ${stageHeight}px` : "end end"] });
  // The rail subscribes to x to update its active product. Deriving x during
  // render can notify that child while this component is rendering on rotation.
  // Input/measurement events update the same value without a render-time write.
  const x = useMotionValue(0);
  useMotionValueEvent(distance, "change", next => x.set(-next * scrollYProgress.get()));
  useLayoutEffect(() => {
    const previous = wasScrub.current;
    const resized = previousGeometry.current.travel !== travel || previousGeometry.current.stageHeight !== stageHeight;
    wasScrub.current = scrub;
    previousGeometry.current = { travel, stageHeight };
    if (!section.current || !viewport.current) return;
    const element = section.current;
    const windowElement = viewport.current;
    const focused = windowElement.contains(document.activeElement)
      ? document.activeElement?.closest<HTMLElement>("[data-gallery-item]") : null;
    if (!scrub) {
      if (previous) windowElement.scrollLeft = focused
        ? galleryFocusProgress(focused.offsetLeft, focused.offsetWidth, windowElement.clientWidth, travel) * travel
        : Math.max(0, -x.get());
      return;
    }
    const span = element.clientHeight - (stage.current?.clientHeight ?? window.innerHeight);
    // overflow:clip may have already cleared native scrollLeft at this point.
    // The focused SKU remains the reliable source for preserving visibility.
    // A native→pin commit first carries the old travel; re-reveal after the
    // new card width is measured, never on ordinary scroll progress updates.
    const revealFocused = focused && (!previous || resized);
    const progress = revealFocused
      ? galleryFocusProgress(focused.offsetLeft, focused.offsetWidth, windowElement.clientWidth, travel)
      : span > 0 ? Math.max(0, Math.min(1, -element.getBoundingClientRect().top / span)) : 0;
    windowElement.scrollLeft = 0;
    scrollYProgress.set(progress);
    if (revealFocused) window.scrollTo({ top: element.getBoundingClientRect().top + window.scrollY + progress * span, behavior: "instant" });
  }, [scrub, travel, stageHeight, scrollYProgress, x]);
  useMotionValueEvent(scrollYProgress, "change", p => {
    x.set(-distance.get() * p);
    if (!section.current || !scrub) return;
    section.current.style.setProperty("--sc-p", String(p));
  });
  useEffect(() => {
    const rail = track.current, windowElement = viewport.current;
    if (!rail || !windowElement) return;
    const measure = () => {
      // Decorative spotlight paint overhangs the last narrow phone card.
      // scrollWidth counts that paint and would push the final controls left.
      const next = Math.max(0, rail.offsetWidth - windowElement.clientWidth);
      windowWidth.set(windowElement.clientWidth);
      distance.set(next); setTravel(next);
      setStageHeight(scrub ? stage.current?.clientHeight ?? 0 : 0);
    };
    measure();
    const observer = typeof ResizeObserver === "function" ? new ResizeObserver(measure) : undefined;
    observer?.observe(rail); observer?.observe(windowElement);
    if (stage.current) observer?.observe(stage.current);
    let current = true;
    void document.fonts?.ready.then(() => { if (current) measure(); });
    rail.addEventListener("load", measure, true);
    return () => { current = false; observer?.disconnect(); rail.removeEventListener("load", measure, true); };
  }, [distance, windowWidth, scrub]);

  function revealFocus(event: FocusEvent<HTMLDivElement>) {
    if (!scrub || !section.current || !viewport.current || !track.current) return;
    const item = (event.target as HTMLElement).closest<HTMLElement>("[data-gallery-item]");
    if (!item) return;
    const viewportRect = viewport.current.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    if (itemRect.left >= viewportRect.left - 2 && itemRect.right <= viewportRect.right + 2) return;
    const progress = galleryFocusProgress(item.offsetLeft, item.offsetWidth, viewport.current.clientWidth, travel);
    const sceneRect = section.current.getBoundingClientRect();
    const span = Math.max(0, section.current.clientHeight - (stage.current?.clientHeight ?? window.innerHeight));
    window.scrollTo({ top: sceneRect.top + scrollY + progress * span, behavior: "instant" });
  }
  function seekGallery(offset: number) {
    if (!section.current || travel <= 0) return;
    const span = Math.max(0, section.current.clientHeight - (stage.current?.clientHeight ?? window.innerHeight));
    const top = section.current.getBoundingClientRect().top + window.scrollY;
    const progress = Math.max(0, Math.min(1, offset / travel));
    scrollYProgress.set(progress);
    window.scrollTo({ top: top + progress * span, behavior: "instant" });
  }
  return <section ref={section} id="urunler" aria-labelledby="urunler-title" className={styles.section}
    data-sc-scene="urunler" data-sc-device="pan" data-sc-engine="motion" data-21st-source="24623"
    data-gallery-mode={scrub ? "scrub" : "native"} data-gallery-layout={layout} style={{ "--gallery-span": `${travel}px` } as CSSProperties}>
    <noscript><span className={styles.noJs} /><p className={styles.noJsMessage}>Ürün bilgilerini inceleyebilir, sipariş ve toptan talep için <a href="#iletisim">iletişim bilgilerine ulaşabilirsiniz.</a></p></noscript>
    <div ref={stage} className={styles.stage}>
      <div className={styles.heading} id="kiler">
        <div><p className={styles.eyebrow}>AFİNA KOLEKSİYONU</p><h2 id="urunler-title">Sofranızdan{" "}<em>işletmenize.</em></h2><p>Her sofraya bir AFİNA. Zeytin, salamura ve zeytinyağı.</p></div>
        <p className={styles.explanation}>Ambalajı seçin. Sofranız için sepete,<br className={styles.desktopBreak} /> işletmeniz için teklifinize ekleyin.<ArrowDownRightIcon aria-hidden="true" size={24} /></p>
      </div>
      {ordered.length ? <>
        <PendantLampRail variant="product" label="Ürün galerisi" x={x} scrub={scrub} travel={travel}
          viewportRef={viewport} trackRef={track} viewportClassName={styles.viewport} trackClassName={styles.track}
          onOffsetChange={seekGallery} onFocusCapture={revealFocus}>
            {ordered.map((product, index) => <GalleryProduct key={product.id} product={product} index={index} total={ordered.length}
              active={scrub} touch={layout === "touch"} railX={x} windowWidth={windowWidth}>
              <ProductCard product={product} image={v3Image(product.imageKey)} imageSizes={layout === "touch" ? "(max-width: 767px) 90vw, 420px" : undefined} index={index} featured={false} quoteAction={
              <button type="button" disabled={!ready} className={styles.quote} data-selected={Object.hasOwn(journey.quantities, product.id)}
                aria-label={`Teklife ekle: ${product.name}, ${product.weight}`}
                onClick={() => { journey.chooseProduct(product.id); window.location.hash = "teklif"; }}>
                {Object.hasOwn(journey.quantities, product.id) ? <CheckIcon size={18} aria-hidden="true" /> : <ArrowUpRightIcon size={18} aria-hidden="true" />}
                Teklife ekle
              </button>} />
            </GalleryProduct>)}
        </PendantLampRail>
        <div className={styles.foot}><span>{ordered.length} ambalaj. Aynı üretici.</span><span>{scrub ? "Kaydırdıkça keşfedin." : "Ürünleri yatay kaydırarak keşfedin."}</span></div>
      </> : <p role="status">Görüntülenecek ürün bulunmuyor.</p>}
    </div>
  </section>;
}
