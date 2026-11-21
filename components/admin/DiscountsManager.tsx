"use client";

import { useId, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { PillButton } from "@/components/storefront/ui/PillButton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { discountLimits, discountStatuses, discountStatusLabels, discountTypeLabels, istanbulInputToIso, isoToIstanbulInput, kurusToTl, tlToKurus,
  type AdminDiscount, type DiscountType } from "@/lib/contracts/discounts";
import { AdminDataList, type DetailTools } from "./AdminDataList";
import products from "./Products.module.css";
import styles from "./PanelLists.module.css";

const money = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" });
const date = new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Istanbul" });
const when = (value: string | null) => { const parsed = value ? new Date(value) : null; return !parsed || Number.isNaN(parsed.getTime()) ? "—" : date.format(parsed); };
const valueText = (type: DiscountType, value: number) => (type === "percent" ? `%${value}` : money.format(value / 100));
const messages: Record<string, string> = {
  discount_duplicate: "Bu kod zaten var.", discount_not_found: "Kod bulunamadı. Listeyi yenileyin.", discount_limit_below_usage: "Kullanım limiti, kullanılan sayıdan az olamaz.",
  validation_error: "Alanları kontrol edin.", unauthenticated: "Oturumunuz sona erdi. Yeniden giriş yapın.", forbidden: "Bu işlem için yönetici yetkisi gerekiyor.",
};
async function send(method: "POST" | "PATCH", body: unknown): Promise<string | null> {
  try {
    const response = await fetch("/api/admin/discounts", { method, headers: { "content-type": "application/json" }, body: JSON.stringify(body), signal: AbortSignal.timeout(10000) });
    if (response.ok) return null;
    const failure = await response.json().catch(() => null);
    return messages[failure?.error?.code] ?? "İşlem tamamlanamadı. Listeyi yenileyip yeniden deneyin.";
  } catch { return "İşlem sonucu doğrulanamadı. Listeyi yenileyin."; }
}

/** Oluşturma ve düzenleme aynı form: kod yalnız oluştururken yazılır; kullanım sayısı hiçbir zaman düzenlenmez. */
function DiscountForm({ row, tools }: { row?: AdminDiscount; tools: DetailTools }) {
  const uid = useId();
  const [code, setCode] = useState(row?.code ?? "");
  const [type, setType] = useState<DiscountType>(row?.type ?? "percent");
  const [value, setValue] = useState(row ? (row.type === "percent" ? String(row.value) : kurusToTl(row.value)) : "");
  const [min, setMin] = useState(row ? kurusToTl(row.minSubtotalKurus) : "0");
  const [starts, setStarts] = useState(isoToIstanbulInput(row?.startsAt ?? null));
  const [ends, setEnds] = useState(isoToIstanbulInput(row?.endsAt ?? null));
  const [maxUses, setMaxUses] = useState(row?.maxUses ? String(row.maxUses) : "");
  const [note, setNote] = useState(row?.note ?? "");
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState("");
  const [saved, setSaved] = useState("");

  async function save() {
    if (busy) return;
    setFailure(""); setSaved("");
    const amount = type === "percent" ? (/^\d{1,3}$/.test(value.trim()) ? Number(value) : null) : tlToKurus(value);
    const minKurus = tlToKurus(min || "0");
    const startsAt = istanbulInputToIso(starts);
    const endsAt = istanbulInputToIso(ends);
    const limit = maxUses.trim() === "" ? null : /^\d{1,7}$/.test(maxUses.trim()) ? Number(maxUses) : undefined;
    if (amount === null || amount < 1 || (type === "percent" && amount > 100)) { setFailure(type === "percent" ? "Yüzde 1 ile 100 arasında olmalı." : "İndirim tutarını kontrol edin."); return; }
    if (minKurus === null || startsAt === undefined || endsAt === undefined || limit === undefined || limit === 0) { setFailure("Alanları kontrol edin."); return; }
    if (startsAt && endsAt && startsAt >= endsAt) { setFailure("Bitiş, başlangıçtan sonra olmalı."); return; }
    const fields = { type, value: amount, minSubtotalKurus: minKurus, startsAt, endsAt, maxUses: limit, note: note.trim() || null };
    setBusy(true);
    const problem = row ? await send("PATCH", { id: row.id, ...fields }) : await send("POST", { code: code.trim(), ...fields, active: true });
    setBusy(false);
    if (problem) { setFailure(problem); return; }
    tools.reload();
    if (row) setSaved("Kod güncellendi."); else tools.close();
  }
  async function toggle() {
    if (!row || busy) return;
    setBusy(true); setFailure(""); setSaved("");
    const problem = await send("PATCH", { id: row.id, active: !row.active });
    setBusy(false);
    if (problem) { setFailure(problem); return; }
    tools.reload(); tools.close();
  }
  return <>
    {row && <dl className={styles.facts}>
      <div><dt>Durum</dt><dd><Badge variant={row.active ? "default" : "outline"}>{discountStatusLabels[row.active ? "active" : "passive"]}</Badge></dd></div>
      <div><dt>Kullanım</dt><dd>{row.usedCount}{row.maxUses ? ` / ${row.maxUses}` : " (sınırsız)"}</dd></div>
    </dl>}
    <div className={styles.form} role="group" aria-label={row ? "Kodu düzenle" : "Yeni kod"}>
      <div><label htmlFor={`${uid}-code`}>Kod</label>
        <input id={`${uid}-code`} value={code} readOnly={!!row} maxLength={discountLimits.codeMax} autoCapitalize="characters" autoComplete="off" spellCheck={false}
          aria-describedby={`${uid}-code-help`} onChange={event => setCode(event.target.value.toUpperCase())} />
        <small id={`${uid}-code-help`} className={styles.sub}>{row ? "Kod değiştirilemez." : "Harf, rakam, - ve _ (3-32 karakter). Büyük/küçük harf fark etmez."}</small></div>
      <div><span id={`${uid}-type`} className={products.controlLabel}>Tür</span>
        <ToggleGroup type="single" variant="outline" spacing={2} aria-labelledby={`${uid}-type`} className={products.categoryVisibility} disabled={busy}
          value={type} onValueChange={next => { if (next) setType(next as DiscountType); }}>
          <ToggleGroupItem value="percent">{discountTypeLabels.percent}</ToggleGroupItem>
          <ToggleGroupItem value="fixed">{discountTypeLabels.fixed}</ToggleGroupItem>
        </ToggleGroup></div>
      <div><label htmlFor={`${uid}-value`}>{type === "percent" ? "İndirim yüzdesi" : "İndirim tutarı (₺)"}</label>
        <input id={`${uid}-value`} inputMode="decimal" value={value} onChange={event => setValue(event.target.value)} /></div>
      <div><label htmlFor={`${uid}-min`}>En düşük sepet tutarı (₺)</label>
        <input id={`${uid}-min`} inputMode="decimal" value={min} onChange={event => setMin(event.target.value)} /></div>
      <div><label htmlFor={`${uid}-starts`}>Başlangıç</label>
        <input id={`${uid}-starts`} type="datetime-local" value={starts} onChange={event => setStarts(event.target.value)} /></div>
      <div><label htmlFor={`${uid}-ends`}>Bitiş</label>
        <input id={`${uid}-ends`} type="datetime-local" value={ends} onChange={event => setEnds(event.target.value)} /></div>
      <div><label htmlFor={`${uid}-max`}>Kullanım limiti</label>
        <input id={`${uid}-max`} inputMode="numeric" value={maxUses} placeholder="Sınırsız" onChange={event => setMaxUses(event.target.value)} /></div>
      <div className={styles.wide}><label htmlFor={`${uid}-note`}>Not</label>
        <textarea id={`${uid}-note`} maxLength={discountLimits.note} value={note} onChange={event => setNote(event.target.value)} /></div>
      <div className={styles.wide}>
        <PillButton icon="none" disabled={busy} busy={busy} onClick={() => void save()}>{row ? "Kaydet" : "Oluştur"}</PillButton>
        {row && <PillButton variant="outline" icon="none" disabled={busy} onClick={() => void toggle()}>{row.active ? "Kodu kapat" : "Kodu aç"}</PillButton>}
      </div>
      {failure && <p role="alert" className={`${styles.err} ${styles.wide}`}>{failure}</p>}
      {saved && <p role="status" className={`${styles.ok} ${styles.wide}`}>{saved}</p>}
    </div>
  </>;
}

export function DiscountsManager() {
  return <AdminDataList<AdminDiscount> headingId="admin-indirimler" title="İndirim kodları" subtitle="Sepette girilen kodlar ve kullanım durumu." endpoint="/api/admin/discounts"
    listLabel="İndirim kodu listesi" noun="Kod" searchLabel="Kod veya not"
    statusOptions={discountStatuses.map(value => ({ value, label: discountStatusLabels[value] }))}
    creator={{ label: "Yeni kod", title: "Yeni indirim kodu", render: tools => <DiscountForm tools={tools} /> }}
    columns={[
      { label: "Kod", render: row => <><strong>{row.code}</strong>{row.note && <span className={styles.sub}>{row.note}</span>}</> },
      { label: "İndirim", render: row => valueText(row.type, row.value) },
      { label: "Kullanım", numeric: true, render: row => (row.maxUses ? `${row.usedCount} / ${row.maxUses}` : String(row.usedCount)) },
      { label: "Süre", render: row => (row.startsAt || row.endsAt ? `${when(row.startsAt)} – ${when(row.endsAt)}` : "Süresiz") },
      { label: "Durum", render: row => <Badge variant={row.active ? "default" : "outline"}>{discountStatusLabels[row.active ? "active" : "passive"]}</Badge> },
    ]}
    actionLabel={row => `${row.code} kodunu aç`} detailTitle={row => row.code}
    renderDetail={(row, tools) => <DiscountForm key={`${row.id}-${row.usedCount}-${row.active}`} row={row} tools={tools} />} />;
}
