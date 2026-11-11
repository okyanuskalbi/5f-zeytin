"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import shell from "./AdminShell.module.css";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminProductPageSize, type AdminProduct, type AdminProductsResponse, type ProductInput, type ProductSort } from "@/lib/contracts/admin-products";
import { ProductForm } from "./ProductForm";
import styles from "./Products.module.css";

const messages: Record<string, string> = {
  product_conflict: "En fazla 6 aktif ürün olabilir. Listeyi yenileyip birlikte önerilen ürünleri kontrol edin.",
  product_not_found: "Ürün bulunamadı. Listeyi yenileyin.",
  validation_error: "Ürün alanlarını kontrol edin.",
  unauthenticated: "Oturumunuz sona erdi. Yeniden giriş yapın.",
  forbidden: "Bu işlem için yönetici yetkisi gerekiyor.",
};
const money = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" });
const sortLabels: [ProductSort, string][] = [["name", "Ürün"], ["priceKurus", "Fiyat"], ["stock", "Stok"], ["isActive", "Durum"]];

export function ProductManager() {
  const [result, setResult] = useState<AdminProductsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [revision, setRevision] = useState(0);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<ProductSort>("name");
  const [direction, setDirection] = useState<"asc" | "desc">("asc");
  const [editing, setEditing] = useState<AdminProduct | "new" | null>(null);
  const [confirm, setConfirm] = useState<AdminProduct | null>(null);
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const returnFocus = useRef<HTMLButtonElement | null>(null);
  const focusAfterClose = useRef<"trigger" | "status">("trigger");
  const status = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true); setListError("");
      try {
        const response = await fetch(`/api/admin/products?sort=${sort}&direction=${direction}&page=${page}`, {
          cache: "no-store", signal: AbortSignal.any([controller.signal, AbortSignal.timeout(10000)]),
        });
        if (!response.ok) throw new Error();
        const body: AdminProductsResponse = await response.json();
        if (!Array.isArray(body.data) || !Array.isArray(body.options) || !Number.isSafeInteger(body.total) || body.total < 0 ||
          !Number.isInteger(body.activeCount) || body.activeCount < 0 || body.activeCount > 6 || body.page !== page) throw new Error();
        if (!controller.signal.aborted) {
          if (page > 1 && (page - 1) * adminProductPageSize >= body.total) setPage(Math.max(1, Math.ceil(body.total / adminProductPageSize)));
          else setResult(body);
        }
      } catch {
        if (!controller.signal.aborted) setListError("Ürünler yüklenemedi. Lütfen yeniden deneyin.");
      } finally { if (!controller.signal.aborted) setLoading(false); }
    }
    void load();
    return () => controller.abort();
  }, [sort, direction, page, revision]);

  function closeForm() { focusAfterClose.current = "trigger"; setEditing(null); setError(""); returnFocus.current?.focus(); }
  async function mutate(method: string, body: unknown) {
    if (pending.current) return;
    pending.current = true; setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/admin/products", { method, headers: { "content-type": "application/json" },
        body: JSON.stringify(body), signal: AbortSignal.timeout(10000) });
      if (!response.ok) {
        const failure = await response.json();
        setError(messages[failure?.error?.code] ?? "İşlem tamamlanamadı. Listeyi yenileyip yeniden deneyin.");
        return;
      }
      focusAfterClose.current = "status";
      setEditing(null); setConfirm(null);
      setNotice(method === "DELETE" ? "Ürün yayından kaldırıldı." : "Ürün kaydedildi.");
      setRevision(value => value + 1);
      // Focus a stable live region; an edited row may disappear after refresh.
      status.current?.focus();
    } catch { setError("İşlem sonucu doğrulanamadı. Yeniden kaydetmeden önce listeyi yenileyin."); }
    finally { pending.current = false; setBusy(false); }
  }

  return <div className={styles.manager}>
    <div className={styles.heading}><div><h1 id="admin-urunler" tabIndex={-1}>Ürünler</h1><p>Fiyat, stok ve yayın durumu.</p></div>
      <Button disabled={loading || busy || !!listError || !!editing} onClick={event => { returnFocus.current = event.currentTarget; setEditing("new"); setConfirm(null); setError(""); setNotice(""); }}><Plus aria-hidden="true" />Ürün ekle</Button>
    </div>
    <p ref={status} tabIndex={-1} role="status" className={notice || loading ? styles.status : styles.silentStatus}>{loading ? "Ürünler yükleniyor…" : notice}</p>
    {listError && <div className={styles.error}><p role="alert">{listError}</p><Button variant="outline" disabled={busy} onClick={() => setRevision(value => value + 1)}>Yeniden dene</Button></div>}
    {error && !editing && <div className={styles.error}><p role="alert">{error}</p><Button variant="outline" disabled={busy} onClick={() => { closeForm(); setConfirm(null); setRevision(value => value + 1); }}>Listeyi yenile</Button></div>}
    {result && <>
      <div className={styles.count}><p>Aktif ürün <strong>{result.activeCount} / 6</strong></p><p>Toplam kayıt <strong>{result.total}</strong></p></div>
      <Dialog open={!!editing} onOpenChange={open => { if (!open && !busy) closeForm(); }}>
        {editing && <DialogContent data-surface="admin" className={`${shell.theme} ${styles.editDialog}`} showCloseButton={false}
          onPointerDownOutside={event => event.preventDefault()}
          onEscapeKeyDown={event => { if (busy) event.preventDefault(); }}
          onCloseAutoFocus={event => { event.preventDefault(); if (focusAfterClose.current === "status") status.current?.focus(); else returnFocus.current?.focus(); }}>
          <div className={styles.dialogHeading}><DialogTitle>{editing === "new" ? "Yeni ürün" : "Ürünü düzenle"}</DialogTitle>
            <Button variant="outline" disabled={busy} onClick={closeForm}>Kapat</Button></div>
          <DialogDescription>Ürün bilgilerini girip kaydedin.</DialogDescription>
          {error && <div className={styles.error}><p role="alert">{error}</p><Button variant="outline" disabled={busy} onClick={() => { closeForm(); setRevision(value => value + 1); }}>Listeyi yenile</Button></div>}
          <ProductForm key={editing === "new" ? "new" : editing.id} product={editing === "new" ? undefined : editing}
            options={result.options} activeCount={result.activeCount} busy={busy} onCancel={closeForm}
            onSave={(input: ProductInput) => mutate(editing === "new" ? "POST" : "PATCH", editing === "new" ? input : { id: editing.id, ...input })} />
        </DialogContent>}
      </Dialog>
      {confirm && <div role="group" aria-label="Yayından kaldırma onayı" className={styles.panel}>
        <p>{confirm.name} yayından kaldırılsın mı? Kaydı korunur, birlikte önerilenlerden çıkarılır.</p>
        <div className={styles.actions}><Button disabled={busy} onClick={() => mutate("DELETE", { id: confirm.id })}>Kaldırmayı onayla</Button>
          <Button variant="outline" disabled={busy} onClick={() => { setConfirm(null); returnFocus.current?.focus(); }}>Vazgeç</Button></div>
      </div>}
      {!result.total && !loading && !listError && <p className={styles.panel}>Henüz ürün eklenmedi.</p>}
      {result.total > 0 && <section className={styles.panel} aria-label="Ürün listesi" aria-busy={loading}>
        <p className={styles.tableHint}>Tüm sütunları görmek için tabloyu yana kaydırabilirsiniz.</p>
        <div role="region" aria-label="Yatay kaydırılabilir ürün tablosu" tabIndex={0} className={styles.scroll}>
          <Table><TableCaption>Sayfa {page}. Sayfa başına en fazla {adminProductPageSize} ürün.</TableCaption>
            <TableHeader><TableRow>{sortLabels.map(([key, label]) => <TableHead key={key} scope="col" aria-sort={sort === key ? direction === "asc" ? "ascending" : "descending" : "none"}>
              <button type="button" disabled={loading || busy || !!editing} aria-label={`${label} ile sırala`} onClick={() => { setDirection(sort === key && direction === "asc" ? "desc" : "asc"); setSort(key); setPage(1); setConfirm(null); }}>{label} {sort === key ? direction === "asc" ? <ArrowUp aria-hidden="true" /> : <ArrowDown aria-hidden="true" /> : <ArrowUpDown aria-hidden="true" />}</button>
            </TableHead>)}<TableHead scope="col">İşlemler</TableHead></TableRow></TableHeader>
            <TableBody>{result.data.map(product => <TableRow key={product.id}>
              <TableCell><strong>{product.name}</strong><span className={styles.weight}>{product.weight}</span></TableCell>
              <TableCell className={styles.number}>{money.format(product.priceKurus / 100)}</TableCell>
              <TableCell className={styles.number}>{product.stock} {product.stock === 0 && <Badge variant="outline">Stok yok</Badge>}</TableCell>
              <TableCell><Badge variant={product.isActive ? "default" : "outline"}>{product.isActive ? "Yayında" : "Yayında değil"}</Badge></TableCell>
              <TableCell><div className={styles.actions}><Button variant="outline" disabled={loading || busy || !!listError || !!editing} aria-label={`${product.name} düzenle`} onClick={event => { returnFocus.current = event.currentTarget; setEditing(product); setConfirm(null); setError(""); setNotice(""); }}>Düzenle</Button>
                {product.isActive && <Button variant="outline" disabled={loading || busy || !!listError || !!editing} aria-label={`${product.name} yayından kaldır`} onClick={event => { returnFocus.current = event.currentTarget; setConfirm(product); setError(""); }}>Yayından kaldır</Button>}</div></TableCell>
            </TableRow>)}</TableBody>
          </Table>
        </div>
        <nav aria-label="Ürün sayfaları" className={styles.pagination}><Button variant="outline" disabled={page <= 1 || loading || busy || !!editing} onClick={() => { setPage(value => value - 1); setConfirm(null); }}>Önceki</Button>
          <span>Sayfa {page} / {Math.max(1, Math.ceil(result.total / adminProductPageSize))}</span>
          <Button variant="outline" disabled={page * adminProductPageSize >= result.total || loading || busy || !!editing} onClick={() => { setPage(value => value + 1); setConfirm(null); }}>Sonraki</Button></nav>
      </section>}
    </>}
  </div>;
}
