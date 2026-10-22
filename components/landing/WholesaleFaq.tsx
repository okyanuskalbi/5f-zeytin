import type { JSX } from "react";
import { Faq } from "./Faq";
import { WholesaleOffer } from "./WholesaleOffer";
import styles from "./WholesaleFaq.module.css";

export function WholesaleFaq(): JSX.Element {
  return <div className={styles.sections} data-wholesale-faq="">
    <WholesaleOffer />
    <Faq />
  </div>;
}
