"use client";

import { useEffect, useId, useRef, useState, type ComponentType } from "react";
import type { QuoteProductPickerProps } from "@/components/ui/quote-product-picker";
import { QuoteProductTrigger } from "./QuoteProductTrigger";

type PickerModule = { QuoteProductPicker: ComponentType<QuoteProductPickerProps> };
const loadProductPicker = (): Promise<PickerModule> => import("@/components/ui/quote-product-picker");
type Props = QuoteProductPickerProps & { loadPicker?: () => Promise<PickerModule> };

/** Only a visitor's opening action loads the dialog. Once loaded, Radix remains its owner. */
export function DeferredQuoteProductPicker({ loadPicker = loadProductPicker, ...props }: Props) {
  const generatedId = useId();
  const id = props.id ?? `${generatedId}-products`;
  const statusId = `${id}-loading`;
  const [Picker, setPicker] = useState<ComponentType<QuoteProductPickerProps> | null>(null);
  const [initialOpen, setInitialOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const mounted = useRef(true);
  const pending = useRef(false);
  const requestedOpen = useRef(false);
  const restoreFocus = useRef(false);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => {
    if (Picker && restoreFocus.current) {
      restoreFocus.current = false;
      const control = document.getElementById(id);
      if (control instanceof HTMLButtonElement && !control.disabled) control.focus();
    }
  }, [Picker, id]);

  async function open(): Promise<void> {
    if (props.disabled) return;
    requestedOpen.current = true;
    restoreFocus.current = false;
    if (pending.current) return;
    pending.current = true;
    setStatus("loading");
    try {
      const loaded = await loadPicker();
      if (mounted.current) {
        setInitialOpen(requestedOpen.current);
        setPicker(() => loaded.QuoteProductPicker);
      }
    } catch {
      if (mounted.current) {
        requestedOpen.current = false;
        setStatus("error");
      }
    } finally { pending.current = false; }
  }

  if (Picker) return <Picker {...props} id={id} initialOpen={initialOpen && !props.disabled} />;
  return <>
    <QuoteProductTrigger ref={trigger} products={props.products} quantities={props.quantities} id={id}
      invalid={props.invalid} disabled={props.disabled} errorId={[props.errorId, status !== "idle" ? statusId : undefined].filter(Boolean).join(" ") || undefined}
      aria-haspopup="dialog" aria-expanded={false} aria-busy={status === "loading" || undefined} onClick={() => { void open(); }}
      onKeyDown={event => {
        if (event.key === "Escape" && pending.current) {
          event.preventDefault();
          requestedOpen.current = false;
          restoreFocus.current = document.activeElement === trigger.current;
        }
      }} />
    {status === "loading" && <span id={statusId} role="status" className="sr-only">Ürün seçimi yükleniyor.</span>}
    {status === "error" && <p id={statusId} role="alert">Ürün seçimi yüklenemedi. Yeniden denemek için ürün seçimine basın.</p>}
  </>;
}
