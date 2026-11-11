"use client";

import { useState } from "react";
import styles from "./AboutPage.module.css";

const words = ["Zeytin", "Zeytinyağı", "Geleneksel Salamura", "%100 Doğal", "Katkısız"];

/** The one customer-requested moving strip; pause is available without hover. */
export function AboutStrip() {
  const [paused, setPaused] = useState(false);
  return <section className={styles.strip} aria-label="Ürünlerimiz ve üretim anlayışımız" data-about-strip data-paused={paused}>
    <div className={styles.stripWindow}><div className={styles.stripTrack}>
      <ul>{words.map(word => <li key={word}>{word}</li>)}</ul>
      <ul aria-hidden="true">{words.map(word => <li key={word}>{word}</li>)}</ul>
    </div></div>
    <button type="button" aria-pressed={paused} onClick={() => setPaused(value => !value)}>{paused ? "Şeridi oynat" : "Şeridi duraklat"}</button>
  </section>;
}
