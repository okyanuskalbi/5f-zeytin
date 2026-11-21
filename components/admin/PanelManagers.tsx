"use client";

import { useEffect, useId, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { PillButton } from "@/components/storefront/ui/PillButton";
import { orderStatusLabels, orderStatuses, orderStatusesSettable, leadSourceLabels, leadStatusLabels, leadStatuses, leadLimits,
  type AdminCustomerDetail, type AdminCustomerRow, type AdminLead, type AdminOrderDetail, type AdminOrderRow, type LeadStatus, type OrderStatus } from "@/lib/contracts/admin-panel";
import { AdminDataList, type DetailTools } from "./AdminDataList";
import styles from "./PanelLists.module.css";

const money = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" });
const date = new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Istanbul" });
const when = (value: string) => { const parsed = new Date(value); return Number.isNaN(parsed.getTime()) ? "—" : date.format(parsed); };
const messages: Record<string, string> = {
  order_conflict: "Bu sipariş için istenen durum geçişi yapılamaz.", order_not_found: "Sipariş bulunamadı. Listeyi yenileyin.", lead_not_found: "Kayıt bulunamadı. Listeyi yenileyin.",
  validation_error: "Alanları kontrol edin.", unauthenticated: "Oturumunuz sona erdi. Yeniden giriş yapın.", forbidden: "Bu işlem için yönetici yetkisi gerekiyor.",
};
const orderTone = (status: OrderStatus) => (status === "cancelled" || status === "refunded" ? "outline" : "default");

/** Tek kaydı API'den okuyan küçük kanca; yükleniyor/hata durumlarını tek yerde tutar. */
function useRecord<T>(url: string) {
  const [state, setState] = useState<{ data: T | null; error: string }>({ data: null, error: "" });
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const response = await fetch(url, { cache: "no-store", signal: AbortSignal.any([controller.signal, AbortSignal.timeout(10000)]) });
        if (!response.ok) throw new Error();
        const body = await response.json();
        if (!controller.signal.aborted) setState({ data: body.data as T, error: "" });
      } catch { if (!controller.signal.aborted) setState({ data: null, error: "Ayrıntı yüklenemedi. Lütfen yeniden deneyin." }); }
    })();
    return () => controller.abort();
  }, [url, revision]);
  return { ...state, retry: () => { setState({ data: null, error: "" }); setRevision(value => value + 1); } };
}
async function patch(url: string, body: unknown): Promise<string | null> {
  try {
    const response = await fetch(url, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(body), signal: AbortSignal.timeout(10000) });
    if (response.ok) return null;
    const failure = await response.json().catch(() => null);
    return messages[failure?.error?.code] ?? "İşlem tamamlanamadı. Listeyi yenileyip yeniden deneyin.";
  } catch { return "İşlem sonucu doğrulanamadı. Listeyi yenileyin."; }
}
function Loading({ error, retry }: { error: string; retry: () => void }) {
  return error ? <div><p role="alert" className={styles.err}>{error}</p><PillButton variant="outline" icon="none" size="md" onClick={retry}>Yeniden dene</PillButton></div> : <p role="status">Yükleniyor…</p>;
}

function OrderDetail({ row, tools }: { row: AdminOrderRow; tools: DetailTools }) {
  const uid = useId();
  const { data, error, retry } = useRecord<AdminOrderDetail>(`/api/admin/orders?id=${encodeURIComponent(row.id)}`);
  const [status, setStatus] = useState("");
  const [carrier, setCarrier] = useState<string | null>(null);
  const [tracking, setTracking] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState("");
  const [saved, setSaved] = useState("");
  if (!data) return <Loading error={error} retry={retry} />;
  const address = data.deliveryAddress;
  const addressText = [address.recipient, address.line, [address.district, address.city].filter(Boolean).join(" / "), address.postalCode].filter(Boolean).join("\n");
  async function save() {
    if (!status || busy) return;
    setBusy(true); setFailure(""); setSaved("");
    const body: Record<string, unknown> = { id: row.id, status };
    if (carrier !== null) body.shippingCarrier = carrier;
    if (tracking !== null) body.trackingNo = tracking;
    const problem = await patch("/api/admin/orders", body);
    setBusy(false);
    if (problem) { setFailure(problem); return; }
    setSaved("Sipariş güncellendi."); tools.reload(); retry();
  }
  return <>
    <dl className={styles.facts}>
      <div><dt>Durum</dt><dd><Badge variant={orderTone(data.status)}>{orderStatusLabels[data.status]}</Badge></dd></div>
      <div><dt>Toplam</dt><dd>{money.format(data.totalKurus / 100)}</dd></div>
      <div><dt>Müşteri</dt><dd>{data.customerName}<span className={styles.sub}>{data.customerEmail}</span></dd></div>
      <div><dt>Tarih</dt><dd>{when(data.createdAt)}</dd></div>
      <div className={styles.wide}><dt>Teslimat adresi</dt><dd>{addressText || "—"}{address.phone && <span className={styles.sub}>{address.phone}</span>}</dd></div>
      <div><dt>Kargo</dt><dd>{data.shippingCarrier || "—"}</dd></div>
      <div><dt>Takip no</dt><dd>{data.trackingNo || "—"}</dd></div>
    </dl>
    <ul className={styles.lines} aria-label="Sipariş kalemleri">{data.items.map(item => <li key={item.id}>
      <span>{item.productName}<small className={styles.sub}>{item.weight} · {item.quantity} adet</small></span><strong>{money.format(item.unitPriceKurus * item.quantity / 100)}</strong></li>)}</ul>
    <div className={styles.form} role="group" aria-label="Durum güncelle">
      <div><label htmlFor={`${uid}-status`}>Yeni durum</label>
        <select id={`${uid}-status`} value={status} onChange={event => setStatus(event.target.value)}>
          <option value="">Seçin</option>{orderStatusesSettable.map(value => <option key={value} value={value}>{orderStatusLabels[value]}</option>)}</select></div>
      <div><label htmlFor={`${uid}-carrier`}>Kargo firması</label>
        <input id={`${uid}-carrier`} maxLength={100} value={carrier ?? data.shippingCarrier ?? ""} onChange={event => setCarrier(event.target.value)} /></div>
      <div><label htmlFor={`${uid}-tracking`}>Takip no</label>
        <input id={`${uid}-tracking`} maxLength={100} value={tracking ?? data.trackingNo ?? ""} onChange={event => setTracking(event.target.value)} /></div>
      <div className={styles.wide}><PillButton icon="none" disabled={!status || busy} busy={busy} onClick={() => void save()}>Kaydet</PillButton></div>
      {failure && <p role="alert" className={`${styles.err} ${styles.wide}`}>{failure}</p>}
      {saved && <p role="status" className={`${styles.ok} ${styles.wide}`}>{saved}</p>}
    </div>
  </>;
}

export function OrdersManager() {
  return <AdminDataList<AdminOrderRow> headingId="admin-siparisler" title="Siparişler" subtitle="Sipariş durumu ve kargo." endpoint="/api/admin/orders"
    listLabel="Sipariş listesi" noun="Sipariş" searchLabel="Sipariş no, ad veya e-posta"
    statusOptions={orderStatuses.map(value => ({ value, label: orderStatusLabels[value] }))}
    columns={[
      { label: "Sipariş", render: row => <><strong>{row.orderNo}</strong><span className={styles.sub}>{when(row.createdAt)}</span></> },
      { label: "Müşteri", render: row => <><span>{row.customerName}</span><span className={styles.sub}>{row.customerEmail}</span></> },
      { label: "Kalem", numeric: true, render: row => String(row.itemCount) },
      { label: "Toplam", numeric: true, render: row => money.format(row.totalKurus / 100) },
      { label: "Durum", render: row => <Badge variant={orderTone(row.status)}>{orderStatusLabels[row.status] ?? row.status}</Badge> },
    ]}
    actionLabel={row => `${row.orderNo} ayrıntısını aç`} detailTitle={row => `Sipariş ${row.orderNo}`}
    renderDetail={(row, tools) => <OrderDetail row={row} tools={tools} />} />;
}

function CustomerDetail({ row }: { row: AdminCustomerRow }) {
  const { data, error, retry } = useRecord<AdminCustomerDetail>(`/api/admin/customers?id=${encodeURIComponent(row.id)}`);
  if (!data) return <Loading error={error} retry={retry} />;
  return <>
    <dl className={styles.facts}>
      <div><dt>E-posta</dt><dd>{data.email}</dd></div>
      <div><dt>Telefon</dt><dd>{data.phone || "—"}</dd></div>
      <div><dt>Üyelik</dt><dd>{when(data.createdAt)}</dd></div>
      <div><dt>Sipariş</dt><dd>{data.orderCount} · {money.format(data.totalKurus / 100)}</dd></div>
    </dl>
    <h3>Adresler</h3>
    {data.addresses.length === 0 ? <p>Kayıtlı adres yok.</p> : <ul className={styles.lines} aria-label="Kayıtlı adresler">{data.addresses.map(address => <li key={address.id}>
      <span><strong>{address.title}</strong>{address.isDefault && <> <Badge variant="outline">Varsayılan</Badge></>}
        <small className={styles.sub}>{address.recipient} · {address.phone}</small>
        <small className={styles.sub}>{address.line}, {address.district} / {address.city} {address.postalCode}</small></span></li>)}</ul>}
  </>;
}

export function CustomersManager() {
  return <AdminDataList<AdminCustomerRow> headingId="admin-musteriler" title="Müşteriler" subtitle="Üyeler, adresler ve sipariş özeti." endpoint="/api/admin/customers"
    listLabel="Müşteri listesi" noun="Müşteri" searchLabel="Ad, e-posta veya telefon"
    columns={[
      { label: "Müşteri", render: row => <><strong>{row.name}</strong><span className={styles.sub}>{row.email}</span></> },
      { label: "Telefon", render: row => row.phone || "—" },
      { label: "Sipariş", numeric: true, render: row => String(row.orderCount) },
      { label: "Toplam", numeric: true, render: row => money.format(row.totalKurus / 100) },
      { label: "Adres", numeric: true, render: row => String(row.addressCount) },
      { label: "Üyelik", render: row => when(row.createdAt) },
    ]}
    actionLabel={row => `${row.name} ayrıntısını aç`} detailTitle={row => row.name}
    renderDetail={row => <CustomerDetail row={row} />} />;
}

function LeadDetail({ row, tools }: { row: AdminLead; tools: DetailTools }) {
  const uid = useId();
  const [status, setStatus] = useState<LeadStatus>(row.status);
  const [note, setNote] = useState(row.note ?? "");
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState("");
  const [saved, setSaved] = useState("");
  async function save() {
    if (busy) return;
    setBusy(true); setFailure(""); setSaved("");
    const problem = await patch("/api/admin/leads", { id: row.id, status, note });
    setBusy(false);
    if (problem) { setFailure(problem); return; }
    setSaved("Kayıt güncellendi."); tools.reload();
  }
  return <>
    <dl className={styles.facts}>
      <div><dt>Tarih</dt><dd>{when(row.createdAt)}</dd></div>
      <div><dt>Kaynak</dt><dd>{leadSourceLabels[row.source] ?? row.source}</dd></div>
      <div><dt>E-posta</dt><dd>{row.email ? <a href={`mailto:${row.email}`}>{row.email}</a> : "—"}</dd></div>
      <div><dt>Telefon</dt><dd>{row.phone ? <a href={`tel:${row.phone.replace(/[^\d+]/g, "")}`}>{row.phone}</a> : "—"}</dd></div>
      <div className={styles.wide}><dt>Mesaj</dt><dd>{row.message || "—"}</dd></div>
    </dl>
    <div className={styles.form} role="group" aria-label="Takip">
      <div><label htmlFor={`${uid}-status`}>Durum</label>
        <select id={`${uid}-status`} value={status} onChange={event => setStatus(event.target.value as LeadStatus)}>
          {leadStatuses.map(value => <option key={value} value={value}>{leadStatusLabels[value]}</option>)}</select></div>
      <div className={styles.wide}><label htmlFor={`${uid}-note`}>Not</label>
        <textarea id={`${uid}-note`} maxLength={leadLimits.note} value={note} onChange={event => setNote(event.target.value)} /></div>
      <div className={styles.wide}><PillButton icon="none" disabled={busy} busy={busy} onClick={() => void save()}>Kaydet</PillButton></div>
      {failure && <p role="alert" className={`${styles.err} ${styles.wide}`}>{failure}</p>}
      {saved && <p role="status" className={`${styles.ok} ${styles.wide}`}>{saved}</p>}
    </div>
  </>;
}

export function LeadsManager() {
  return <AdminDataList<AdminLead> headingId="admin-leadler" title="Leadler" subtitle="Form başvuruları ve takip notları." endpoint="/api/admin/leads"
    listLabel="Lead listesi" noun="Lead" searchLabel="Ad, e-posta, telefon veya mesaj"
    statusOptions={leadStatuses.map(value => ({ value, label: leadStatusLabels[value] }))}
    columns={[
      { label: "Kişi", render: row => <><strong>{row.name}</strong><span className={styles.sub}>{row.email || row.phone}</span></> },
      { label: "Kaynak", render: row => leadSourceLabels[row.source] ?? row.source },
      { label: "Tarih", render: row => when(row.createdAt) },
      { label: "Durum", render: row => <Badge variant={row.status === "new" ? "default" : "outline"}>{leadStatusLabels[row.status] ?? row.status}</Badge> },
    ]}
    actionLabel={row => `${row.name} kaydını aç`} detailTitle={row => row.name}
    renderDetail={(row, tools) => <LeadDetail key={row.id} row={row} tools={tools} />} />;
}
