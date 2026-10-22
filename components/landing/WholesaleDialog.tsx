"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type JSX } from "react";
import { useAnimate } from "motion/react";
import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { usePrefersReducedMotion } from "@/lib/media/use-deferred-enhancement";
import { motionTokens } from "@/lib/ui-motion";
import { WholesaleForm } from "./WholesaleForm";
import styles from "./WholesaleFaq.module.css";

const desktopQuery = "(min-width: 768px)";
function subscribe(notify: () => void): () => void {
  const media = window.matchMedia?.(desktopQuery);
  media?.addEventListener("change", notify);
  return () => media?.removeEventListener("change", notify);
}
const desktopSnapshot = () => window.matchMedia?.(desktopQuery).matches ?? true;
const serverSnapshot = () => true;

export function WholesaleDialog({ onClose, onRestoreFocus }: { onClose: () => void; onRestoreFocus: () => void }): JSX.Element {
  const desktop = useSyncExternalStore(subscribe, desktopSnapshot, serverSnapshot);
  const reduced = usePrefersReducedMotion();
  const viewportRef = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState<HTMLDivElement | null>(null);
  const attachContent = useCallback((node: HTMLDivElement | null) => {
    viewportRef.current = node;
    setContent(node);
  }, []);
  const closing = useRef(false);
  const mounted = useRef(false);
  const [panel, animate] = useAnimate<HTMLDivElement>();
  const Root = desktop ? Dialog : Sheet;
  const Content = desktop ? DialogContent : SheetContent;

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (desktop || !viewport || !content) return;
    function sync(): void {
      // 100dvh alone does not follow the iOS virtual keyboard. Keep the sticky
      // action inside the visual viewport, including browser focus panning.
      content!.style.setProperty("--wholesale-viewport-height", `${viewport!.height}px`);
      content!.style.setProperty("--wholesale-viewport-top", `${viewport!.offsetTop}px`);
    }
    sync();
    viewport.addEventListener("resize", sync);
    viewport.addEventListener("scroll", sync);
    return () => {
      viewport.removeEventListener("resize", sync);
      viewport.removeEventListener("scroll", sync);
      content.style.removeProperty("--wholesale-viewport-height");
      content.style.removeProperty("--wholesale-viewport-top");
    };
  }, [content, desktop]);

  useEffect(() => {
    if (reduced || !content || !panel.current) return;
    const controls = animate(panel.current, { y: [desktop ? motionTokens.distance.lg : "100%", 0], opacity: [0, 1] },
      { duration: motionTokens.duration.crossfade });
    return () => controls.stop();
  }, [animate, content, desktop, panel, reduced]);

  function close(): void {
    if (closing.current) return;
    closing.current = true;
    if (reduced || !panel.current) { onClose(); return; }
    // Keep the Radix trap, scroll lock and buy-bar exclusion until exit ends.
    void animate(panel.current, { y: desktop ? motionTokens.distance.lg : "100%", opacity: 0 },
      { duration: motionTokens.duration.fast }).then(() => { if (mounted.current) onClose(); });
  }

  return <Root open onOpenChange={open => { if (!open) close(); }}>
    <Content ref={attachContent} aria-modal="true" data-slot={desktop ? "dialog-content" : "sheet-content"}
      data-wholesale-modal="" data-reduced-motion={reduced} placement={desktop ? "center" : "fullscreen"}
      showCloseButton={false} className={desktop ? styles.dialog : styles.sheet}
      onOpenAutoFocus={event => { event.preventDefault(); viewportRef.current?.querySelector<HTMLInputElement>('input[name="name"]')?.focus({ preventScroll: true }); }}
      onCloseAutoFocus={event => { event.preventDefault(); onRestoreFocus(); }}>
      <div ref={panel} className={styles.panel}>
        <header className={styles.formHeader}>
          <DialogTitle>Toptan teklif isteyin</DialogTitle>
          <DialogDescription>Sofralık zeytin, salamura zeytin ve zeytinyağı için miktar ve teslimat bilgisini yazın.</DialogDescription>
          <DialogClose asChild>
            <Button className={styles.close} variant="ghost" size="icon"><XIcon aria-hidden="true" /><span className="sr-only">Kapat</span></Button>
          </DialogClose>
        </header>
        <WholesaleForm />
      </div>
    </Content>
  </Root>;
}
