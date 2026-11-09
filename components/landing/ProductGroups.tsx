"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type JSX } from "react";
import { ArrowRight, Check, Grid2X2 } from "lucide-react";
import { V3Picture } from "@/components/media/V3Picture";
import { ProductCard } from "@/components/catalog/ProductCard";
import { useProductDetail } from "@/components/catalog/ProductDetailProvider";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { v3Image } from "@/lib/media/v3-assets";
import photos from "@/lib/media/classic-photos.json";
import type { ProductVariant } from "@/types/catalog";
import { useQuoteJourney } from "./QuoteJourneyProvider";
import styles from "./ProductGroups.module.css";

const subscribe = () => () => {};
const clientReady = () => true;
const serverReady = () => false;
function clearShopDestination(): void {
  const url = new URL(window.location.href);
  if (!url.searchParams.has("magaza")) return;
  url.searchParams.delete("magaza");
  history.replaceState(history.state, "", url);
}
const groups = [
  { family: "salamura-siyah", name: "Siyah Zeytin", photo: "siyah-zeytin" },
  { family: "salamura-yesil", name: "Yeşil Zeytin", photo: "yesil-zeytin" },
  { family: "dogal-kirma", name: "Kırma Zeytin", photo: "kirma-zeytin" },
  { family: "naturel-sizma", name: "Zeytinyağı", photo: "zeytinyagi" },
] as const;

/** The existing catalogue and checkout keep variant ownership. These four
 * photographs select a family; the existing detail owns its size selection. */
export function ProductGroups({ products }: { products: readonly ProductVariant[] }): JSX.Element {
  const openDetail = useProductDetail();
  const ready = useSyncExternalStore(subscribe, clientReady, serverReady);
  const journey = useQuoteJourney();
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const quoteAfterClose = useRef(false);
  const ordered = [...products].sort((a, b) => a.imageKey.localeCompare(b.imageKey));

  useEffect(() => {
    function requestShop() {
      opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setOpen(true);
    }
    window.addEventListener("afina:open-shop", requestShop);
    if (new URL(window.location.href).searchParams.get("magaza") === "ac") requestShop();
    return () => window.removeEventListener("afina:open-shop", requestShop);
  }, []);

  useEffect(() => {
    if (!open) return;
    // A product detail can sit above this shop. A quote choice closes both
    // layers; neither dialog may restore focus to the obscured shop controls.
    const finishQuote = () => {
      quoteAfterClose.current = true;
      clearShopDestination();
      setOpen(false);
    };
    window.addEventListener("afina:quote-selected", finishQuote);
    return () => window.removeEventListener("afina:quote-selected", finishQuote);
  }, [open]);

  function changeOpen(next: boolean): void {
    setOpen(next);
    if (!next) clearShopDestination();
  }

  return <section id="urunler" aria-labelledby="urunler-title" className={styles.section}>
    <span id="kiler" className={styles.anchor} aria-hidden="true" />
    <h2 id="urunler-title" className={styles.heading}>ÜRÜN GRUPLARIMIZ</h2>
    <div className={styles.groups}>
      {groups.map(group => {
        const product = products.find(item => item.familyId === group.family);
        return <button key={group.family} type="button" className={styles.group} disabled={!ready || !product} aria-haspopup="dialog"
          onClick={event => { if (product) openDetail?.(product.id, event.currentTarget); }}>
          <V3Picture image={photos.assets[group.photo]} sizes="(max-width: 767px) calc((100vw - 56px) / 2), (max-width: 1304px) 24vw, 292px" decorative />
          <span>{group.name}<ArrowRight size={22} aria-hidden="true" /></span>
        </button>;
      })}
    </div>
    <div className={styles.allActions}>
      <Dialog open={open} onOpenChange={changeOpen}>
        <DialogTrigger asChild><button ref={trigger} className={styles.allButton} disabled={!ready || !products.length}
          onClick={() => { opener.current = trigger.current; }}><Grid2X2 size={18} aria-hidden="true" />Tüm ürünleri gör<ArrowRight size={18} aria-hidden="true" /></button></DialogTrigger>
        <DialogContent className={styles.panel} showCloseButton={false} onCloseAutoFocus={event => {
          event.preventDefault();
          if (quoteAfterClose.current) {
            quoteAfterClose.current = false;
            window.location.hash = "toptan";
            document.querySelector<HTMLElement>('#toptan input, #toptan button, #toptan select')?.focus({ preventScroll: true });
          } else (opener.current?.isConnected ? opener.current : trigger.current)?.focus({ preventScroll: true });
        }}>
          <div className={styles.panelHeading}><DialogHeader><DialogTitle>Tüm ürünler</DialogTitle><DialogDescription>Ambalajınızı seçin, sepetinize veya teklifinize ekleyin.</DialogDescription></DialogHeader>
            <DialogClose asChild><Button variant="outline">Kapat</Button></DialogClose>
          </div>
          <div className={styles.productGrid}>
            {ordered.map(product => <ProductCard key={product.id} product={product} image={v3Image(product.imageKey)} featured={false} staticPresentation
              imageSizes="(max-width: 380px) 90vw, (max-width: 767px) 45vw, 30vw"
              quoteAction={<button type="button" disabled={!ready} className={styles.quoteButton} data-selected={Object.hasOwn(journey.quantities, product.id)}
                aria-label={`Teklife ekle: ${product.name}, ${product.weight}`} onClick={() => {
                  journey.chooseProduct(product.id); quoteAfterClose.current = true; changeOpen(false);
                }}>{Object.hasOwn(journey.quantities, product.id) ? <Check size={18} aria-hidden="true" /> : <ArrowRight size={18} aria-hidden="true" />}Teklife ekle</button>} />)}
          </div>
          {!products.length && <p role="status">Görüntülenecek ürün bulunmuyor.</p>}
        </DialogContent>
      </Dialog>
    </div>
    <noscript><p>Ürün seçimi ve alışveriş için JavaScript gerekir. Ürün bilgisi için <a href="#iletisim">bizimle iletişime geçin.</a></p></noscript>
  </section>;
}
