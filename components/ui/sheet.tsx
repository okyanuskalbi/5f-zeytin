"use client";

// Adapted from `shadcn add sheet`: Sheet and Dialog use the same Radix Dialog
// primitives. Share our tokenized base and its fullscreen placement so switching
// presentation never remounts fields, discards a draft or interrupts focus.
// `side="bottom"` is the storefront's full-screen sheet in the v3 "Altın Dal" tokens
// (docs/DESIGN.md, docs/tasks/209); without `side` the caller styles the content itself.
import { useEffect, useRef, type ComponentProps, type JSX } from "react";
import { cn } from "cn";
import { X } from "lucide-react";
import { DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import styles from "./sheet.module.css";

export {
  Dialog as Sheet,
  DialogTrigger as SheetTrigger,
  DialogClose as SheetClose,
  DialogHeader as SheetHeader,
  DialogFooter as SheetFooter,
  DialogTitle as SheetTitle,
  DialogDescription as SheetDescription,
} from "@/components/ui/dialog";

type DialogContentProps = ComponentProps<typeof DialogContent>;
type BottomSheetProps = Omit<DialogContentProps, "placement" | "showCloseButton" | "title"> & {
  side: "bottom";
  /** The sheet's visible Cormorant heading and its accessible name. */
  title: string;
  closeLabel?: string;
};
type SheetContentProps = (DialogContentProps & { side?: undefined }) | BottomSheetProps;

/**
 * Keeps the sheet inside the part of the screen the on-screen keyboard leaves free,
 * and the focused field in view (iOS does not resize `dvh` for the keyboard).
 */
function useKeyboardSafeArea(): (node: HTMLDivElement | null) => void {
  const content = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const view = window.visualViewport;
    if (!view) return;
    const fit = (): void => {
      const node = content.current;
      if (!node) return;
      node.style.setProperty("--sheet-height", `${view.height}px`);
      node.style.setProperty("--sheet-top", `${view.offsetTop}px`);
      const focused = document.activeElement;
      if (focused instanceof HTMLElement && focused !== node && node.contains(focused)) focused.scrollIntoView({ block: "nearest" });
    };
    fit();
    view.addEventListener("resize", fit);
    view.addEventListener("scroll", fit);
    return () => { view.removeEventListener("resize", fit); view.removeEventListener("scroll", fit); };
  }, []);
  return node => { content.current = node; };
}

function BottomSheetContent({ side, title, closeLabel = "Pencereyi kapat", className, children, ...props }: BottomSheetProps): JSX.Element {
  const keyboardSafe = useKeyboardSafeArea();
  return <DialogContent ref={keyboardSafe} placement="fullscreen" showCloseButton={false} data-side={side} className={cn(styles.bottom, className)} {...props}>
    <div className={styles.bar}>
      <DialogTitle className={styles.title}>{title}</DialogTitle>
      <DialogClose asChild><button type="button" className={styles.close} aria-label={closeLabel}><X size={22} aria-hidden="true" /></button></DialogClose>
    </div>
    <div className={styles.body} data-sheet-body="">{children}</div>
  </DialogContent>;
}

function SheetContent(props: SheetContentProps): JSX.Element {
  return props.side === "bottom" ? <BottomSheetContent {...props} /> : <DialogContent {...props} />;
}

export { SheetContent };
