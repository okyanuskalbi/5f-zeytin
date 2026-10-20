"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CreditCard, LockKeyhole, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

type Summary = Readonly<{ productName: string; amountKurus: number; quantity: number }>;
type Session = { iframeUrl: string; token: string };
type State = { phase: "idle" | "requesting" } | { phase: "frame"; session: Session } | { phase: "error"; message: string };
type ResizableFrame = HTMLIFrameElement & { iFrameResizer?: { removeListeners: () => void } };
type ResizerWindow = Window & { iFrameResize?: (options: { checkOrigin: string[] }, frame: HTMLIFrameElement) => void };

function PaytrFrame({ session, onFailure }: { session: Session; onFailure: () => void }) {
  const ref = useRef<ResizableFrame>(null);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const frame = ref.current;
    const host = window as ResizerWindow;
    const script = document.createElement("script");
    script.src = "https://www.paytr.com/js/iframeResizer.min.js";
    script.async = true;
    script.onload = () => {
      try {
        if (!host.iFrameResize || !frame) throw new Error("resizer unavailable");
        host.iFrameResize({ checkOrigin: ["https://www.paytr.com"] }, frame);
      } catch { onFailure(); }
    };
    script.onerror = onFailure;
    timeout.current = setTimeout(onFailure, 15_000);
    document.head.append(script);
    return () => {
      if (timeout.current) clearTimeout(timeout.current);
      script.onload = null;
      script.onerror = null;
      script.remove();
      frame?.iFrameResizer?.removeListeners();
    };
  }, [onFailure]);

  return <div>
    <p role="status" className="mb-4 text-sm text-muted-foreground">
      {loaded ? "PayTR çerçevesi yüklendi. Test modundasınız." : "PayTR test ekranı yükleniyor…"}
    </p>
    <iframe ref={ref} id="paytriframe" title="PayTR test ödeme formu" src={session.iframeUrl}
      className="min-h-[640px] w-full border-0 bg-card" allow="payment" scrolling="no"
      onLoad={() => { if (timeout.current) clearTimeout(timeout.current); setLoaded(true); }}
      onError={onFailure} />
    <p className="mt-4 text-sm text-muted-foreground">Çerçeve yüklenmesi ödeme teyidi değildir.</p>
  </div>;
}

export function PaymentPreview({ keysAvailable, summary }: { keysAvailable: boolean; summary: Summary }) {
  const [state, setState] = useState<State>({ phase: "idle" });
  const controllerRef = useRef<AbortController | null>(null);
  const frameFailure = useCallback(() => setState({ phase: "error", message: "PayTR test ekranı yüklenemedi. Yeniden deneyin." }), []);
  useEffect(() => () => { controllerRef.current?.abort(); controllerRef.current = null; }, []);

  async function start() {
    if (!keysAvailable || controllerRef.current) return;
    const controller = new AbortController();
    controllerRef.current = controller;
    const timer = setTimeout(() => controller.abort(), 10_000);
    setState({ phase: "requesting" });
    try {
      const response = await fetch("/api/odeme-onizleme/paytr-token", {
        method: "POST", credentials: "same-origin", signal: controller.signal,
      });
      const data: unknown = await response.json();
      if (!response.ok || !data || typeof data !== "object" ||
        !("token" in data) || typeof data.token !== "string" || !/^[a-zA-Z0-9]{1,256}$/.test(data.token) ||
        !("iframeUrl" in data) || data.iframeUrl !== `https://www.paytr.com/odeme/guvenli/${data.token}`) {
        throw new Error("test session unavailable");
      }
      if (controllerRef.current === controller) setState({ phase: "frame", session: { iframeUrl: data.iframeUrl, token: data.token } });
    } catch {
      if (controllerRef.current === controller) setState({ phase: "error", message: "PayTR test ekranı açılamadı. Bir süre sonra yeniden deneyin." });
    } finally {
      clearTimeout(timer);
      if (controllerRef.current === controller) controllerRef.current = null;
    }
  }

  const money = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(summary.amountKurus / 100);
  return <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
    <p className="mb-3 text-xs font-medium tracking-widest text-gold-ink">YEREL ÖNİZLEME · TEST MODU</p>
    <h1>Ödeme ekranı önizlemesi</h1>
    <p className="mt-4 max-w-2xl text-muted-foreground">Sabit örnek sipariş ile PayTR test ekranını inceleyin. Ürün ve tutar temsilidir; gerçek sipariş oluşturulmaz.</p>
    <div className="mt-10 grid items-start gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
      <aside aria-label="Örnek sipariş özeti" className="min-w-0 space-y-6">
        <div aria-hidden="true" className="rounded-xl bg-primary p-6 text-primary-foreground sm:p-8">
          <div className="flex items-center justify-between gap-4"><span className="text-xs tracking-widest text-brand-gold">TEMSİLİ · TEST</span><CreditCard className="size-8 text-brand-gold" /></div>
          <p className="mt-10 font-serif text-2xl">Afina Zeytin</p>
          <p className="mt-2 text-sm">Ödeme önizlemesi</p>
        </div>
        {/* Adapted from 21st.dev astralyxdev/checkout-summary (demo 36084):
            integer minor units, semantic dl rows and a separated total. */}
        <section className="rounded-xl border bg-card p-6" aria-labelledby="preview-summary-title">
          <h2 id="preview-summary-title" className="text-xl">Örnek sipariş</h2>
          <dl data-slot="checkout-summary" className="mt-5 flex flex-col gap-3 text-sm">
            <div className="flex items-baseline gap-3"><dt className="min-w-0 flex-1 text-muted-foreground">{summary.productName}</dt><dd className="shrink-0">{summary.quantity} adet</dd></div>
            <div className="flex items-baseline gap-3 border-t pt-3"><dt className="min-w-0 flex-1 font-medium">Test tutarı</dt><dd className="shrink-0 text-base font-medium tabular-nums">{money}</dd></div>
          </dl>
        </section>
        <div className="flex items-start gap-3 text-sm text-muted-foreground"><ShieldCheck aria-hidden="true" className="mt-1 size-5 shrink-0" /><p>Kart ve 3D Secure alanları PayTR çerçevesinde açılır. Kart bilgilerinizi bu siteye girmeyin.</p></div>
      </aside>
      <section aria-labelledby="preview-payment-title" className="min-w-0 rounded-xl border bg-card p-5 sm:p-8">
        <div className="mb-6 flex items-center gap-3"><LockKeyhole aria-hidden="true" className="size-5 shrink-0" /><h2 id="preview-payment-title" className="text-xl">PayTR test ekranı</h2></div>
        {!keysAvailable ? <p role="alert" className="rounded-md border border-input bg-background p-4 text-sm">Test anahtarı eksik — .env.local&apos;e ekleyin</p> : <>
          {state.phase === "requesting" && <p role="status" className="mb-4 text-sm">Test oturumu hazırlanıyor…</p>}
          {state.phase === "error" && <p role="alert" className="mb-4 text-sm text-destructive">{state.message}</p>}
          {state.phase === "frame" && <PaytrFrame session={state.session} onFailure={frameFailure} />}
          <Button className="mt-4 w-full" disabled={state.phase === "requesting" || state.phase === "frame"} onClick={() => void start()}>
            {state.phase === "error" ? "Yeniden dene" : state.phase === "requesting" ? "Hazırlanıyor…" : "Test ekranını aç"}
          </Button>
        </>}
        <p className="mt-6 text-sm text-muted-foreground">Önizleme yönlendirme sonucu, ödeme teyidi değildir.</p>
      </section>
    </div>
  </main>;
}
