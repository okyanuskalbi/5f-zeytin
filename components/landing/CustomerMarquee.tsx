"use client";

import { useState, type JSX } from "react";
import styles from "./CustomerHome.module.css";

const words = "Zeytin · Zeytinyağı · Geleneksel Salamura · %100 Doğal · Katkısız · ";
export function CustomerMarquee(): JSX.Element {
  const [paused, setPaused] = useState(false);
  return <section data-home-section="marquee" data-home-marquee className={styles.marquee} aria-label="Zeytinin doğasından" data-paused={paused}>
    <div className={styles.marqueeWindow}><div className={styles.marqueeTrack}><span>{words}</span><span aria-hidden="true">{words}</span></div></div>
    <button type="button" aria-pressed={paused} onClick={() => setPaused(previous => !previous)}>{paused ? "Şeridi oynat" : "Şeridi duraklat"}</button>
  </section>;
}
