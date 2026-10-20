"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Field, Feedback } from "@/components/account/FormControls";
import { getMembershipAdapters } from "@/lib/auth/demo";
import type { AccountOrder } from "@/lib/account/adapter";
import { validateTrackingQuery, type TrackingOrder, type TrackingResult } from "@/lib/orders/tracking-adapter";
import { getTrackingAdapter } from "@/lib/orders/tracking-demo";
import { DeliveryTimeline } from "./DeliveryTimeline";
import { TrackingSummary } from "./TrackingSummary";
import styles from "./Tracking.module.css";

const labels = { preparing: "Hazırlanıyor", shipped: "Kargoya verildi", delivered: "Teslim edildi", cancelled: "İptal edildi", refunded: "İade edildi" } as const;

export function Tracking() {
  const params = useSearchParams();
  const requestedNo = params.get("no")?.slice(0, 40) ?? "";
  return <TrackingView key={requestedNo} requestedNo={requestedNo} />;
}

function TrackingView({ requestedNo }: { requestedNo: string }) {
  const [no, setNo] = useState(requestedNo);
  const [order, setOrder] = useState<TrackingOrder | null>(null);
  const [ownOrders, setOwnOrders] = useState<AccountOrder[]>([]);
  const [busy, setBusy] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState({ error: false, message: "" });
  const lock = useRef(true);
  const version = useRef(0);
  const resultTitle = useRef<HTMLHeadingElement>(null);

  function showResult(result: TrackingResult) {
    setOrder(result.kind === "found" ? result.order : null);
    setFeedback({ error: result.kind !== "found", message: result.kind === "not-found" ? "Sipariş bulunamadı. Sipariş numarası ve eşleşen iletişim bilgisini kontrol edin." : result.kind === "rate-limited" ? `Deneme sınırına ulaştınız. ${result.retryAfterSeconds} saniye sonra yeniden deneyin.` : "Sipariş bilgileri gösteriliyor. Bu bir demo kaydıdır." });
    if (result.kind === "found") requestAnimationFrame(() => resultTitle.current?.focus());
  }

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const { auth, account } = getMembershipAdapters();
        if (!(await auth.getSession())) return;
        const orders = await account.listOrders();
        const result = requestedNo ? await getTrackingAdapter().getOwnOrder(requestedNo) : null;
        if (!active) return;
        setOwnOrders(orders);
        if (result?.kind === "found") showResult(result);
      } catch { if (active) setFeedback({ error: true, message: "Siparişler yüklenemedi. Aşağıdaki formdan yeniden deneyin." }); }
      finally { if (active) { lock.current = false; setBusy(false); } }
    }
    void load();
    return () => { active = false; };
  }, [requestedNo]);

  async function run(lookup: () => Promise<TrackingResult>) {
    if (lock.current) return;
    lock.current = true; setBusy(true); setOrder(null); setErrors({}); setFeedback({ error: false, message: "" });
    const current = ++version.current;
    try { const result = await lookup(); if (version.current === current) showResult(result); }
    catch { if (version.current === current) setFeedback({ error: true, message: "Sorgulama tamamlanamadı. Lütfen yeniden deneyin." }); }
    finally { if (version.current === current) { lock.current = false; setBusy(false); } }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lock.current) return;
    const data = new FormData(event.currentTarget);
    const query = { no, contact: String(data.get("contact") ?? "") };
    const fields = validateTrackingQuery(query);
    setErrors(fields); setOrder(null);
    if (Object.keys(fields).length) {
      setFeedback({ error: true, message: "Lütfen işaretli alanları kontrol edin." });
      const input = event.currentTarget.elements.namedItem(Object.keys(fields)[0]);
      if (input instanceof HTMLElement) input.focus();
      return;
    }
    void run(() => getTrackingAdapter().lookup(query));
  }

  return <main className={styles.page}><div className={styles.container}>
    <header className={styles.header}><h1>Sipariş takibi</h1><p>Sofranıza giden yolculuğun her adımını takip edin.</p></header>
    <p className={styles.demo}><strong>Demo sipariş takibi.</strong> Gerçek sipariş veya kargo kaydı yok. Örnek numaralar: DEMO-10902, DEMO-10801, DEMO-10800. E-posta: demo@example.test veya telefon son 4: 4567.</p>
    {ownOrders.length > 0 && <nav aria-label="Siparişleriniz" className={styles.ownOrders}><p>Siparişlerinizden doğrudan takip edin:</p>{ownOrders.map(item => <Button key={item.no} variant="outline" disabled={busy} onClick={() => { setNo(item.no); void run(() => getTrackingAdapter().getOwnOrder(item.no)); }}>{item.no} · {item.status}</Button>)}</nav>}
    <form noValidate onSubmit={submit} className={styles.form} aria-label="Sipariş sorgulama" aria-busy={busy}>
      <fieldset disabled={busy}>
        <Field id="tracking-no" name="no" label="Sipariş numarası" autoComplete="off" value={no} onChange={event => setNo(event.target.value)} maxLength={40} required error={errors.no} />
        <Field id="tracking-contact" name="contact" label="E-posta veya telefon son 4" autoComplete="off" maxLength={254} required error={errors.contact} hint="Siparişte kullanılan e-posta adresi veya telefonun son 4 rakamı." />
        <Button type="submit">{busy ? "Sorgulanıyor…" : "Siparişimi bul"}</Button>
      </fieldset>
    </form>
    <Feedback {...feedback} />
    {order && <article className={styles.result} aria-labelledby="tracking-result-title">
      <header className={styles.resultHeader}><h2 ref={resultTitle} tabIndex={-1} id="tracking-result-title">{order.no}</h2><p>{labels[order.status]}</p></header>
      <div className={styles.resultBody}><DeliveryTimeline order={order} /><TrackingSummary key={order.no} order={order} /></div>
    </article>}
    <Link className={styles.link} href="/hesabim">Hesabım ve siparişlerim</Link>
  </div></main>;
}
