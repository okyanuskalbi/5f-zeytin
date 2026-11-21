"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { PillButton } from "@/components/storefront/ui/PillButton";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminListPageSize, type AdminListResponse } from "@/lib/contracts/admin-panel";
import shell from "./AdminShell.module.css";
import products from "./Products.module.css";
import styles from "./PanelLists.module.css";

export type Column<T> = { label: string; render: (row: T) => ReactNode; numeric?: boolean };
export type DetailTools = { reload: () => void; close: () => void };
type Props<T extends { id: string }> = {
  headingId: string; title: string; subtitle: string; endpoint: string; listLabel: string; noun: string;
  columns: Column<T>[]; statusOptions?: { value: string; label: string }[]; searchLabel: string;
  detailTitle: (row: T) => string; renderDetail: (row: T, tools: DetailTools) => ReactNode; actionLabel: (row: T) => string;
  /** Opsiyonel "yeni kayıt" düğmesi ve penceresi (ör. indirim kodu oluşturma). */
  creator?: { label: string; title: string; render: (tools: DetailTools) => ReactNode };
};

/** Ortak liste: sayfalama, durum süzgeci, arama ve ayrıntı penceresi. Veri her zaman API'den (yönetici oturumuyla) gelir. */
export function AdminDataList<T extends { id: string }>(props: Props<T>) {
  const { headingId, title, subtitle, endpoint, listLabel, noun, columns, statusOptions, searchLabel, detailTitle, renderDetail, actionLabel, creator } = props;
  const uid = useId();
  const [result, setResult] = useState<AdminListResponse<T> | null>(null);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [draft, setDraft] = useState("");
  const [q, setQ] = useState("");
  const [revision, setRevision] = useState(0);
  const [selected, setSelected] = useState<T | null>(null);
  const [creating, setCreating] = useState(false);
  const returnFocus = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true); setListError("");
      try {
        const params = new URLSearchParams({ page: String(page) });
        if (status) params.set("status", status);
        if (q) params.set("q", q);
        const response = await fetch(`${endpoint}?${params}`, { cache: "no-store", signal: AbortSignal.any([controller.signal, AbortSignal.timeout(10000)]) });
        if (!response.ok) throw new Error();
        const body: AdminListResponse<T> = await response.json();
        if (!Array.isArray(body.data) || !Number.isSafeInteger(body.total) || body.total < 0 || body.page !== page) throw new Error();
        if (controller.signal.aborted) return;
        if (page > 1 && (page - 1) * adminListPageSize >= body.total) setPage(Math.max(1, Math.ceil(body.total / adminListPageSize)));
        else setResult(body);
      } catch {
        if (!controller.signal.aborted) setListError(`${noun} yüklenemedi. Lütfen yeniden deneyin.`);
      } finally { if (!controller.signal.aborted) setLoading(false); }
    }
    void load();
    return () => controller.abort();
  }, [endpoint, page, status, q, revision, noun]);

  const total = result?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / adminListPageSize));
  const filtered = Boolean(status || q);
  return <div className={products.manager}>
    <div className={products.heading}><div><h1 id={headingId} tabIndex={-1}>{title}</h1><p>{subtitle}</p></div>
      {creator && <PillButton icon="none" size="md" onClick={event => { returnFocus.current = event.currentTarget; setCreating(true); }}>{creator.label}</PillButton>}</div>
    <form role="search" aria-label={`${title} süzgeci`} className={`${shell.theme} ${styles.filters}`} onSubmit={event => { event.preventDefault(); setPage(1); setQ(draft.trim()); }}>
      <div className={styles.filterField}><label htmlFor={`${uid}-q`}>{searchLabel}</label>
        <input id={`${uid}-q`} type="search" name="q" value={draft} maxLength={100} autoComplete="off" onChange={event => setDraft(event.target.value)} /></div>
      {statusOptions && <div className={styles.filterField}><label htmlFor={`${uid}-status`}>Durum</label>
        <select id={`${uid}-status`} name="status" value={status} onChange={event => { setStatus(event.target.value); setPage(1); }}>
          <option value="">Tümü</option>{statusOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div>}
      <PillButton type="submit" icon="none" size="md">Ara</PillButton>
    </form>
    <p role="status" className={loading ? products.status : products.silentStatus}>{loading ? `${noun} yükleniyor…` : ""}</p>
    {listError && <div className={products.error}><p role="alert">{listError}</p><PillButton variant="outline" icon="none" size="md" onClick={() => setRevision(value => value + 1)}>Yeniden dene</PillButton></div>}
    {result && <>
      <div className={products.count}><p>Toplam kayıt <strong>{total}</strong></p></div>
      {!total && !loading && !listError && <p className={products.panel}>{filtered ? "Süzgece uyan kayıt yok." : `Henüz ${noun.toLocaleLowerCase("tr-TR")} yok.`}</p>}
      {total > 0 && <section className={products.panel} aria-label={listLabel} aria-busy={loading}>
        <div role="region" aria-label={`${listLabel} tablosu`} tabIndex={0} className={`${products.scroll} ${styles.table}`}>
          <Table role="table"><TableCaption className={styles.captionHidden}>Sayfa {page}. Sayfa başına en fazla {adminListPageSize} kayıt.</TableCaption>
            <TableHeader role="rowgroup"><TableRow role="row">{columns.map(column => <TableHead key={column.label} role="columnheader" scope="col">{column.label}</TableHead>)}
              <TableHead role="columnheader" scope="col">İşlem</TableHead></TableRow></TableHeader>
            <TableBody role="rowgroup">{result.data.map(row => <TableRow role="row" key={row.id}>
              {columns.map(column => <TableCell role="cell" key={column.label} data-label={column.label} className={column.numeric ? products.number : undefined}>{column.render(row)}</TableCell>)}
              <TableCell role="cell" data-label="İşlem"><PillButton variant="outline" icon="none" size="md" aria-label={actionLabel(row)}
                onClick={event => { returnFocus.current = event.currentTarget; setSelected(row); }}>Aç</PillButton></TableCell>
            </TableRow>)}</TableBody>
          </Table>
        </div>
        <nav aria-label={`${title} sayfaları`} className={products.pagination}>
          <PillButton variant="outline" icon="none" size="md" disabled={page <= 1 || loading} onClick={() => setPage(value => value - 1)}>Önceki</PillButton>
          <span>Sayfa {page} / {pages}</span>
          <PillButton variant="outline" icon="none" size="md" disabled={page >= pages || loading} onClick={() => setPage(value => value + 1)}>Sonraki</PillButton></nav>
      </section>}
    </>}
    <Dialog open={!!selected} onOpenChange={open => { if (!open) setSelected(null); }}>
      {selected && <DialogContent data-surface="admin" className={`${shell.theme} ${products.editDialog} ${styles.detail}`} onPointerDownOutside={event => event.preventDefault()}
        onCloseAutoFocus={event => { event.preventDefault(); returnFocus.current?.focus(); }}>
        <div className={products.dialogHeading}><DialogTitle>{detailTitle(selected)}</DialogTitle>
          <PillButton variant="outline" icon="none" size="md" onClick={() => setSelected(null)}>Kapat</PillButton></div>
        <DialogDescription className="sr-only">Kayıt ayrıntısı.</DialogDescription>
        {renderDetail(selected, { reload: () => setRevision(value => value + 1), close: () => setSelected(null) })}
      </DialogContent>}
    </Dialog>
    {creator && <Dialog open={creating} onOpenChange={setCreating}>
      {creating && <DialogContent data-surface="admin" className={`${shell.theme} ${products.editDialog} ${styles.detail}`} onPointerDownOutside={event => event.preventDefault()}
        onCloseAutoFocus={event => { event.preventDefault(); returnFocus.current?.focus(); }}>
        <div className={products.dialogHeading}><DialogTitle>{creator.title}</DialogTitle>
          <PillButton variant="outline" icon="none" size="md" onClick={() => setCreating(false)}>Kapat</PillButton></div>
        <DialogDescription className="sr-only">Yeni kayıt formu.</DialogDescription>
        {creator.render({ reload: () => setRevision(value => value + 1), close: () => setCreating(false) })}
      </DialogContent>}
    </Dialog>}
  </div>;
}
