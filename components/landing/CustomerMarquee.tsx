"use client";

import { useState, type JSX } from "react";
import { Leaf } from "lucide-react";
import styles from "./CustomerHome.module.css";

const words = ["Zeytin", "Zeytinyağı", "Geleneksel Salamura", "%100 Doğal", "Katkısız"];
function MarqueeGroup({ hidden = false }: { hidden?: boolean }): JSX.Element {
  return <span className={styles.marqueeGroup} aria-hidden={hidden || undefined} data-marquee-copy={hidden ? "" : undefined}>{words.map(word => <span className={styles.marqueeWord} key={word}>{word}<Leaf aria-hidden="true" /></span>)}</span>;
}

export function CustomerMarquee(): JSX.Element {
  const [paused, setPaused] = useState(false);
  return <section data-home-section="marquee" data-home-marquee className={styles.marquee} aria-label="Zeytinin doğasından" data-paused={paused}>
    <div className={styles.marqueeWindow}><div className={styles.marqueeTrack}><MarqueeGroup /><MarqueeGroup hidden /></div></div>
    <button type="button" aria-pressed={paused} onClick={() => setPaused(previous => !previous)}>{paused ? "Şeridi oynat" : "Şeridi duraklat"}</button>
  </section>;
}
