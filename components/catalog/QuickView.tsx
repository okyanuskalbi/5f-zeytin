"use client";

import { useId, useRef, useState, type JSX, type RefObject } from "react";
import { Dialog } from "radix-ui";
import { motion, useDragControls } from "motion/react";
import { X } from "lucide-react";
import { V3Picture } from "@/components/media/V3Picture";
import { useCartViewport } from "@/components/cart/useCartViewport";
import { usePrefersReducedMotion } from "@/lib/media/use-deferred-enhancement";
import { springs } from "@/lib/ui-motion";
import { VariantChips } from "./VariantChips";
import { RollingPrice } from "./RollingPrice";
import { AddToCart } from "./AddToCart";
import type { ProductFamily } from "@/types/catalog";
import type { V3Image } from "@/lib/media/v3-assets";
import styles from "./Pantry.module.css";

// 21st Drawer 23558 + 31360, using the project's Radix focus/scroll lock
// and Motion drag controls. Gallery's roving thumbnails adapt viewer 37501.
export function QuickView({ family, selected, onChange, images, onClose, opener }: {
  family: ProductFamily; selected: number; onChange: (index: number) => void; images: readonly V3Image[]; onClose: (wholesale?: boolean) => void; opener: RefObject<HTMLElement | null>;
}): JSX.Element {
  const mobile = useCartViewport();
  const reduced = usePrefersReducedMotion();
  const controls = useDragControls();
  const closeButton = useRef<HTMLButtonElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [active, setActive] = useState(0);
  const [quantity, setQuantity] = useState("1");
  const [invalid, setInvalid] = useState(false);
  const id = useId();
  const product = family.variants[selected];
  const ordered = [...images].sort((a, b) => Number(b.outputs[0].height > b.outputs[0].width) - Number(a.outputs[0].height > a.outputs[0].width));
  const image = ordered[active] ?? ordered[0];
  return <Dialog.Root open onOpenChange={open => { if (!open) onClose(); }}>
    <Dialog.Portal>
      <Dialog.Overlay className={styles.overlay} />
      <Dialog.Content asChild onOpenAutoFocus={event => { event.preventDefault(); closeButton.current?.focus(); }}
        onCloseAutoFocus={event => { event.preventDefault(); opener.current?.focus({ preventScroll: true }); }}>
        <motion.div className={styles.quickView} data-quick-view="" data-snap={expanded ? "expanded" : "compact"}
          initial={reduced ? false : mobile ? { y: "100%" } : { x: "100%" }} animate={{ x: 0, y: 0 }} transition={reduced ? { duration: 0 } : springs.drawer}
          drag={mobile && !reduced ? "y" : false} dragControls={controls} dragListener={false} dragMomentum={false} dragConstraints={{ top: 0, bottom: 0 }} dragElastic={0.4} dragSnapToOrigin
          onDragEnd={(_, info) => {
            if (info.offset.y > 96 || (info.offset.y > 24 && info.velocity.y > 650)) onClose();
            else if (info.offset.y < -48) setExpanded(true);
          }}>
          <div className={styles.quickHeader}>
            <Dialog.Title>{family.name}</Dialog.Title>
            <Dialog.Close asChild><button ref={closeButton} type="button" className={styles.close} aria-label="Hızlı görünümü kapat"><X aria-hidden="true" /></button></Dialog.Close>
          </div>
          <div className={styles.quickBody} tabIndex={-1}>
            {image && <div className={styles.gallery}>
              <div id={`${id}-photo`} role="tabpanel" aria-labelledby={`${id}-thumb-${active}`} className={styles.galleryStage}>
                <V3Picture image={image} sizes="(max-width: 767px) 80vw, 430px" />
              </div>
              <div role="tablist" aria-label="Ürün görselleri" className={styles.thumbnails} onKeyDown={event => {
                const delta = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
                const next = event.key === "Home" ? 0 : event.key === "End" ? ordered.length - 1 : (active + delta + ordered.length) % ordered.length;
                if (!delta && event.key !== "Home" && event.key !== "End") return;
                event.preventDefault(); setActive(next);
                event.currentTarget.querySelectorAll<HTMLButtonElement>("button")[next]?.focus();
              }}>
                {ordered.map((photo, index) => <button key={photo.outputs[0].file} id={`${id}-thumb-${index}`} type="button" role="tab" aria-label={photo.outputs[0].height > photo.outputs[0].width ? "Stüdyo görünümü" : "Sofra görünümü"}
                  aria-selected={active === index} aria-controls={`${id}-photo`} tabIndex={active === index ? 0 : -1} onClick={() => setActive(index)}>
                  <V3Picture image={photo} sizes="64px" decorative />
                </button>)}
              </div>
            </div>}
            <Dialog.Description>Afina Zeytin, salamura zeytin çeşitlerini ve zeytinyağını hem bireysel tüketicilere hem de toptan alıcılara ulaştırıyor.</Dialog.Description>
            <VariantChips family={family} selected={selected} onChange={index => { onChange(index); setActive(0); setQuantity("1"); setInvalid(false); }} />
            <RollingPrice kurus={product.priceKurus} />
            {product.stock > 0 && <div className={styles.quantity}>
              <label htmlFor={`${id}-quantity`}>Adet</label>
              <input id={`${id}-quantity`} type="number" inputMode="numeric" min={1} max={product.stock} step={1} value={quantity} aria-invalid={invalid} aria-describedby={invalid ? `${id}-error` : undefined}
                onChange={event => { setQuantity(event.target.value); setInvalid(!Number.isInteger(Number(event.target.value)) || Number(event.target.value) < 1 || Number(event.target.value) > product.stock); }} />
              {invalid && <p id={`${id}-error`} role="alert">1–{product.stock} arasında tam sayı girin.</p>}
            </div>}
            <AddToCart key={product.id} product={product} quantity={Number(quantity)} />
            <a className={styles.wholesale} href="#toptan" onClick={event => {
              if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
              event.preventDefault(); onClose(true);
            }}>Toptan teklif iste</a>
          </div>
          {mobile && <button type="button" className={styles.handle} aria-label={expanded ? "Görünümü daralt" : "Görünümü genişlet"} aria-expanded={expanded}
            onPointerDown={event => { if (!reduced) controls.start(event); }} onClick={() => setExpanded(value => !value)}><span aria-hidden="true" /></button>}
        </motion.div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>;
}
