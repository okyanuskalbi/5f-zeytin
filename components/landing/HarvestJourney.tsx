"use client";

import { useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { m as motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { ArrowDownIcon, ArrowUpRightIcon } from "lucide-react";
import { CinematicScrub } from "@/components/media/CinematicScrub";
import { V3Picture } from "@/components/media/V3Picture";
import { v3Image } from "@/lib/media/v3-assets";
import facility from "@/lib/media/renewal-assets.json";
import { seller } from "@/lib/site/seller";
import { useDesktopMotion } from "./ScrollStage";
import { MOBILE_SCROLL_QUERY } from "@/lib/media/mobile-motion";
import styles from "./HarvestJourney.module.css";

const destinations = [
  { id: "baslangic", label: "Zeytinlik", progress: 0 },
  { id: "tesisimiz", label: "Üretim", progress: .55 },
  { id: "uretim-yolculugu", label: "Sofra", progress: .9 },
] as const;
type Connection = EventTarget & { saveData?: boolean };
function subscribeResources(notify: () => void) {
  const connection = (navigator as Navigator & { connection?: Connection }).connection;
  connection?.addEventListener("change", notify);
  return () => connection?.removeEventListener("change", notify);
}
const resourcePolicy = () => !(navigator as Navigator & { connection?: Connection }).connection?.saveData && (navigator.hardwareConcurrency || 4) >= 4;
const serverResources = () => false;

/** One held scene: orchard → real facility → genuine packaging. Scroll owns
 * camera, type and media together; no wheel handler, autoplay or scroll lock.
 * The same semantic sections form the complete native/mobile document. */
export function HarvestJourney() {
  const journey = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const eligibleScreen = useDesktopMotion("(min-width: 1024px) and (min-height: 760px) and (hover: hover) and (pointer: fine)");
  const mobile = useDesktopMotion(MOBILE_SCROLL_QUERY);
  const resources = useSyncExternalStore(subscribeResources, resourcePolicy, serverResources);
  const cinematic = (eligibleScreen || mobile) && resources;
  const [filmReady, setFilmReady] = useState(false);
  const [chapter, setChapter] = useState(0);
  const [stageHeight, setStageHeight] = useState(0);
  const { scrollYProgress } = useScroll({ target: journey, offset: cinematic ? ["start start", stageHeight > 0 ? `end ${stageHeight}px` : "end end"] : ["start start", "end start"] });
  // A function transform keeps scene styles on the same JS timeline. It does
  // not inherit stale native acceleration when offsets change after hydration.
  const p = useTransform(() => scrollYProgress.get());
  const filmProgress = useTransform(p, [0, .35], [0, 1]);
  const orchardScale = useTransform(p, [0, .4], [1, 1.12]);
  const orchardOpacity = useTransform(p, [.35, .48], [1, 0]);
  const openingOpacity = useTransform(p, [0, .12, .21], [1, 1, 0]);
  const openingY = useTransform(p, [0, .23], [0, -96]);
  const openingPointer = useTransform(p, value => value < .18 ? "auto" : "none");
  const branchOpacity = useTransform(p, [.18, .24, .32, .39], [0, 1, 1, 0]);
  const branchY = useTransform(p, [.18, .39], [64, -48]);
  const factoryY = useTransform(p, [.34, .46, .65, .76], ["100%", "0%", "0%", "-12%"]);
  const factoryOpacity = useTransform(p, [.34, .36, .68, .79], [0, 1, 1, 0]);
  const factoryScale = useTransform(p, [.36, .62, .78], [1.15, 1, .92]);
  const factoryCopyY = useTransform(p, [.4, .5, .68], [72, 0, -24]);
  const factoryPointer = useTransform(p, value => value >= .44 && value < .73 ? "auto" : "none");
  const tableOpacity = useTransform(p, [.68, .78], [0, 1]);
  const tableY = useTransform(p, [.68, .82], ["34%", "0%"]);
  const bottleY = useTransform(p, [.7, .86, 1], [180, 0, -12]);
  const bottleRotate = useTransform(p, [.7, .9], [12, -5]);
  const jarY = useTransform(p, [.73, .91, 1], [240, 0, -6]);
  const jarRotate = useTransform(p, [.73, .92], [-10, 4]);
  const tablePointer = useTransform(p, value => value >= .78 ? "auto" : "none");
  const wordLeft = useTransform(p, [.7, .9], [-100, 0]);
  const wordRight = useTransform(p, [.7, .9], [100, 0]);

  useLayoutEffect(() => {
    const element = stage.current;
    if (!cinematic || !element) return;
    const measure = () => setStageHeight(element.clientHeight || window.innerHeight);
    measure();
    const observer = typeof ResizeObserver === "function" ? new ResizeObserver(measure) : undefined;
    observer?.observe(element);
    window.addEventListener("resize", measure);
    return () => { observer?.disconnect(); window.removeEventListener("resize", measure); };
  }, [cinematic]);

  useLayoutEffect(() => {
    const element = journey.current;
    const height = stage.current?.clientHeight || stageHeight || window.innerHeight;
    const range = element ? element.clientHeight - height : 0;
    // Native SSR IDs become position markers when the common stage pins.
    // Re-resolve a deep link after that layout change, in both directions.
    const hash = window.location.hash.slice(1);
    const destination = destinations.find(item => item.id === (hash === "kurumsal" ? "tesisimiz" : hash));
    if (destination && element) {
      if (cinematic) {
        window.scrollTo({ top: element.getBoundingClientRect().top + window.scrollY + Math.max(0, range) * destination.progress, behavior: "instant" });
        scrollYProgress.set(destination.progress); p.set(destination.progress);
        return;
      }
      document.getElementById(hash)?.scrollIntoView?.({ block: "start", behavior: "instant" });
    }
    const progress = cinematic && element && range > 0 ? Math.max(0, Math.min(1, -element.getBoundingClientRect().top / range)) : 0;
    scrollYProgress.set(progress); p.set(progress);
  }, [cinematic, stageHeight, scrollYProgress, p]);
  useMotionValueEvent(p, "change", value => setChapter(value < .4 ? 0 : value < .75 ? 1 : 2));

  function showScene(progress: number) {
    if (!cinematic || !journey.current) return;
    const element = journey.current;
    const top = element.getBoundingClientRect().top + window.scrollY;
    const height = stage.current?.clientHeight || stageHeight || window.innerHeight;
    window.scrollTo({ top: top + Math.max(0, element.clientHeight - height) * progress, behavior: "instant" });
    scrollYProgress.set(progress); p.set(progress);
  }
  function revealFocusedScene(index: number) {
    const value = p.get();
    // A visible link must not move between pointer-down and click. Reposition
    // only when keyboard or programmatic focus reaches an off-stage panel.
    const readable = index === 0 ? value < .18 : index === 1 ? value >= .44 && value < .73 : value >= .78;
    if (!readable) showScene(destinations[index].progress);
  }

  return <div ref={journey} className={styles.journey} data-harvest-journey="" data-mode={cinematic ? "cinematic" : "native"} data-motion-device={cinematic && mobile && !eligibleScreen ? "touch" : "desktop"} data-film-ready={filmReady}>
    <link rel="preload" as="image" type="image/avif" href="/frames/afina-agac-dal/poster-mobile.avif" media="(max-width: 767px)" fetchPriority="high" />
    <link rel="preload" as="image" type="image/avif" href="/frames/afina-agac-dal/poster-desktop.avif" media="(min-width: 768px)" fetchPriority="high" />
    {cinematic && <div className={styles.markers} aria-hidden="true">
      <span id="baslangic" style={{ top: 0 }} />
      <span id="kurumsal" style={{ top: `calc((100% - ${stageHeight > 0 ? `${stageHeight}px` : "100svh"}) * .55)` }} />
      <span id="tesisimiz" style={{ top: `calc((100% - ${stageHeight > 0 ? `${stageHeight}px` : "100svh"}) * .55)` }} />
      <span id="uretim-yolculugu" style={{ top: `calc((100% - ${stageHeight > 0 ? `${stageHeight}px` : "100svh"}) * .9)` }} />
    </div>}
    <div ref={stage} data-harvest-stage="" className={styles.stage}>
      <motion.section id={cinematic ? undefined : "baslangic"} className={styles.orchard}
        data-sc-scene="baslangic" data-sc-device="cinematic" data-sc-engine="framer-motion" data-21st-source="32829"
        aria-labelledby="renewal-hero-title" onFocusCapture={() => revealFocusedScene(0)}
        style={cinematic ? { opacity: orchardOpacity } : undefined}>
        <motion.div className={styles.film} style={cinematic ? { scale: orchardScale } : undefined}>
          <CinematicScrub progress={filmProgress} scene={journey} onMode={setFilmReady} />
        </motion.div>
        <div className={styles.heroShade} />
        <motion.div className={styles.heroCopy} style={cinematic ? { opacity: openingOpacity, y: openingY } : undefined}>
          <p className={styles.eyebrow}>AFİNA ZEYTİN · OSMANİYE</p>
          <h1 id="renewal-hero-title"><span>Kökü toprakta.</span>{" "}<em>Yeri sofrada.</em></h1>
          <p className={styles.heroDescription}>Zeytinliğin içinden, hayatın tam ortasına.</p>
        </motion.div>
        <motion.div className={styles.heroActions} style={cinematic ? { opacity: openingOpacity, pointerEvents: openingPointer } : undefined}>
          <a href="#urunler" className={styles.lightAction}>Ürünleri Keşfet <ArrowUpRightIcon size={20} aria-hidden="true" /></a>
          <a href="#teklif" className={styles.subtleAction}>Kurumsal Teklif Al <ArrowUpRightIcon size={17} aria-hidden="true" /></a>
        </motion.div>
        <motion.div className={styles.branchCopy} aria-hidden="true" style={cinematic ? { opacity: branchOpacity, y: branchY } : { display: "none" }}>
          <p>Bir dalda başlar.</p><span>Toprağın hikâyesi, sofranıza uzanır.</span>
        </motion.div>
        <div className={styles.heroFoot}><span>Ellek · Düziçi · Osmaniye</span><a href="#tesisimiz">Hikâyeyi kaydırarak keşfedin <ArrowDownIcon size={16} aria-hidden="true" /></a></div>
      </motion.section>

      <motion.section id={cinematic ? undefined : "tesisimiz"} className={styles.factory}
        data-sc-scene="tesisimiz" data-sc-device="cinematic" data-sc-engine="framer-motion" data-21st-source="20023"
        aria-labelledby="tesisimiz-title" onFocusCapture={() => revealFocusedScene(1)}
        style={cinematic ? { y: factoryY, opacity: factoryOpacity, pointerEvents: factoryPointer } : undefined}>
        {!cinematic && <span id="kurumsal" />}
        <motion.figure className={styles.factoryPhoto} style={cinematic ? { scale: factoryScale } : undefined}>
          <V3Picture image={facility} sizes="(max-width: 1023px) 100vw, 65vw" />
          <figcaption>AFİNA ZEYTİN · ÜRETİM TESİSİ</figcaption>
        </motion.figure>
        <motion.div className={styles.factoryCopy} style={cinematic ? { y: factoryCopyY } : undefined}>
          <p className={styles.eyebrow}>TOPRAĞINDAN AYRILMADAN</p>
          <h2 id="tesisimiz-title">Üretimin<br />{" "}adresi: <em>Ellek.</em></h2>
          <p>Zeytinin seçimi, hazırlanması ve dolumu. Osmaniye’deki kendi üretim tesisimizde.</p>
          <address>{seller.address}</address>
          <a href="https://afina.com.tr" target="_blank" rel="noopener noreferrer" className={styles.textLink}>Bir AFİNA Şirketler Topluluğu markası <ArrowUpRightIcon size={16} aria-hidden="true" /></a>
        </motion.div>
        <p className={styles.place} aria-hidden="true">Ellek.</p>
      </motion.section>

      <motion.section id={cinematic ? undefined : "uretim-yolculugu"} className={styles.table}
        data-sc-scene="uretim-yolculugu" data-sc-device="cinematic" data-sc-engine="framer-motion" data-21st-source="18041"
        aria-labelledby="yolculuk-title" onFocusCapture={() => revealFocusedScene(2)}
        style={cinematic ? { opacity: tableOpacity, y: tableY, pointerEvents: tablePointer } : undefined}>
        <p className={styles.tableLabel}>ZEYTİN · SALAMURA · ZEYTİNYAĞI</p>
        <h2 id="yolculuk-title" className={styles.tableTitle}>
          <motion.span style={cinematic ? { x: wordLeft } : undefined}>Yeri</motion.span>{" "}
          <motion.em style={cinematic ? { x: wordRight } : undefined}>sofrada.</motion.em>
        </h2>
        <div className={styles.productStage}>
          <div className={styles.tableLight} />
          <motion.div className={styles.bottle} style={cinematic ? { y: bottleY, rotate: bottleRotate } : undefined}>
            <V3Picture image={v3Image("urun-04-yag-1l")} sizes="(max-width: 767px) 35vw, 22vw" />
          </motion.div>
          <motion.div className={styles.jar} style={cinematic ? { y: jarY, rotate: jarRotate } : undefined}>
            <V3Picture image={v3Image("urun-02-kirma-1kg")} sizes="(max-width: 767px) 38vw, 20vw" />
          </motion.div>
        </div>
        <div className={styles.tableFoot}>
          <p>Kahvaltıdan akşam sofrasına.<br />Eviniz ve işletmeniz için AFİNA.</p>
          <a href="#urunler" className={styles.darkAction} aria-label="Sofranız için ürünleri keşfedin">Sofranız için keşfedin <ArrowUpRightIcon size={20} aria-hidden="true" /></a>
        </div>
      </motion.section>
      {cinematic && <nav className={`${styles.sceneNav} ${chapter > 0 ? styles.darkNav : ""}`} aria-label="Hasat yolculuğu">
        <span className={styles.rule}><motion.span style={{ scaleX: p }} /></span>
        {destinations.map((item, index) => <a key={item.id} href={`#${item.id}`} aria-current={chapter === index ? "step" : undefined}
          onClick={event => { event.preventDefault(); history.replaceState(null, "", `#${item.id}`); showScene(item.progress); }}>{item.label}</a>)}
      </nav>}
    </div>
  </div>;
}
