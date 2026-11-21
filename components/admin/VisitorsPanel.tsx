"use client";

import { useEffect, useId, useState } from "react";
import { PillButton } from "@/components/storefront/ui/PillButton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { deviceLabels, sourceLabels, visitPeriodLabels, visitPeriods, type VisitPeriod, type VisitSummary } from "@/lib/contracts/visits";
import products from "./Products.module.css";
import styles from "./Visitors.module.css";

const number = new Intl.NumberFormat("tr-TR");
const countryNames = new Intl.DisplayNames(["tr"], { type: "region" });
const countryName = (code: string) => { try { return countryNames.of(code) ?? code; } catch { return code; } };
const shortDay = (day: string) => new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${day}T00:00:00Z`));

/** Eksen adımı: tam sayı ve yuvarlak (1, 5, 50, 500 ...) bir birimin katı; ortası 13 gibi tuhaf değer olmaz. */
function niceStep(raw: number) {
  const unit = raw <= 5 ? 1 : 5 * 10 ** Math.floor(Math.log10(raw / 5));
  return Math.max(1, Math.ceil(raw / unit) * unit);
}
const W = 640, H = 220, PAD = { l: 36, r: 12, t: 12, b: 28 };
/** Hafif çizgi grafik (bağımlılıksız SVG). Erişilebilirlik için aynı veriler altta tablo olarak da verilir. */
function LineChart({ daily }: { daily: VisitSummary["daily"] }) {
  const step = niceStep(Math.max(1, ...daily.map(point => point.views)) / 2);
  const max = step * 2;
  const x = (index: number) => PAD.l + (daily.length === 1 ? 0 : (index / (daily.length - 1)) * (W - PAD.l - PAD.r));
  const y = (value: number) => PAD.t + (1 - value / max) * (H - PAD.t - PAD.b);
  const line = (key: "views" | "visitors") => daily.map((point, index) => `${index ? "L" : "M"}${x(index).toFixed(1)} ${y(point[key]).toFixed(1)}`).join(" ");
  const area = `${line("views")} L${x(daily.length - 1).toFixed(1)} ${y(0)} L${x(0).toFixed(1)} ${y(0)} Z`;
  const ticks = [0, step, max];
  const labelEvery = Math.ceil(daily.length / 6);
  return <svg viewBox={`0 0 ${W} ${H}`} className={styles.chart} role="img" aria-label="Günlük sayfa görüntüleme ve ziyaretçi çizgi grafiği">
    {ticks.map(tick => <g key={tick}><line x1={PAD.l} x2={W - PAD.r} y1={y(tick)} y2={y(tick)} className={styles.grid} /><text x={PAD.l - 6} y={y(tick) + 4} textAnchor="end" className={styles.axis}>{tick}</text></g>)}
    <path d={area} className={styles.area} />
    <path d={line("views")} className={styles.viewsLine} />
    <path d={line("visitors")} className={styles.visitorsLine} />
    {daily.map((point, index) => (index % labelEvery === 0 || index === daily.length - 1) && <text key={point.day} x={x(index)} y={H - 8} textAnchor={index === 0 ? "start" : index === daily.length - 1 ? "end" : "middle"} className={styles.axis}>{shortDay(point.day)}</text>)}
  </svg>;
}

function Bars({ rows, empty = "Veri yok." }: { rows: { label: string; value: number }[]; empty?: string }) {
  const max = Math.max(1, ...rows.map(row => row.value));
  if (!rows.length) return <p className={styles.muted}>{empty}</p>;
  return <ul className={styles.bars}>{rows.map(row => <li key={row.label}>
    <span className={styles.barLabel}>{row.label}</span><span className={styles.barValue}>{number.format(row.value)}</span>
    <span className={styles.track} aria-hidden="true"><span style={{ width: `${Math.max(2, (row.value / max) * 100)}%` }} /></span>
  </li>)}</ul>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const id = useId();
  return <Card role="region" aria-labelledby={id}><CardHeader><h2 id={id}>{title}</h2></CardHeader><CardContent>{children}</CardContent></Card>;
}

export function VisitorsPanel() {
  const uid = useId();
  const [period, setPeriod] = useState<VisitPeriod>(7);
  const [data, setData] = useState<VisitSummary | null>(null);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const response = await fetch(`/api/admin/visitors?period=${period}`, { cache: "no-store", signal: AbortSignal.any([controller.signal, AbortSignal.timeout(10000)]) });
        if (!response.ok) throw new Error();
        const body = await response.json();
        if (!controller.signal.aborted) { setData(body.data as VisitSummary); setError(""); }
      } catch { if (!controller.signal.aborted) setError("Ziyaretçi verisi yüklenemedi. Lütfen yeniden deneyin."); }
    })();
    return () => controller.abort();
  }, [period, revision]);

  const ready = data && data.period === period ? data : null;
  return <section aria-labelledby={`${uid}-title`} className={styles.page}>
    <div className={styles.heading}>
      <div><h1 id={`${uid}-title`} tabIndex={-1}>Ziyaretçiler</h1><p className={styles.muted}>Çerezsiz, anonim sayaç. Botlar sayılmaz.</p></div>
      <ToggleGroup type="single" variant="outline" spacing={2} aria-label="Dönem" className={products.categoryVisibility} value={String(period)}
        onValueChange={value => { if (value) { setPeriod(Number(value) as VisitPeriod); setError(""); } }}>
        {visitPeriods.map(item => <ToggleGroupItem key={item} value={String(item)}>{visitPeriodLabels[item]}</ToggleGroupItem>)}
      </ToggleGroup>
    </div>
    {error && <div><p role="alert" className={styles.err}>{error}</p><PillButton icon="none" size="md" variant="outline" onClick={() => { setError(""); setRevision(value => value + 1); }}>Yeniden dene</PillButton></div>}
    {!ready && !error && <p role="status">Yükleniyor…</p>}
    {ready && <div className={styles.grid2} aria-busy={false}>
      <div className={styles.kpis}>
        <Card role="region" aria-label="Sayfa görüntüleme"><CardHeader><h2>Sayfa görüntüleme</h2></CardHeader><CardContent><p className={styles.big}>{number.format(ready.totals.views)}</p></CardContent></Card>
        <Card role="region" aria-label="Tekil ziyaretçi"><CardHeader><h2>Tekil ziyaretçi</h2></CardHeader><CardContent><p className={styles.big}>{number.format(ready.totals.visitors)}</p><p className={styles.muted}>Günlük tekil toplamı.</p></CardContent></Card>
      </div>
      <div className={styles.wide}><Section title={period === 1 ? "Son 7 gün" : "Günlük seyir"}>
        <LineChart daily={ready.daily} />
        <p className={styles.legend}><span className={styles.keyViews}>Görüntüleme</span><span className={styles.keyVisitors}>Ziyaretçi</span></p>
        <details className={styles.details}><summary>Değerleri tablo olarak göster</summary>
          <div className={styles.tableWrap}><table><thead><tr><th>Gün</th><th>Görüntüleme</th><th>Ziyaretçi</th></tr></thead>
            <tbody>{ready.daily.map(point => <tr key={point.day}><td>{shortDay(point.day)}</td><td>{point.views}</td><td>{point.visitors}</td></tr>)}</tbody></table></div>
        </details>
      </Section></div>
      <Section title="En çok görüntülenen sayfalar"><Bars rows={ready.pages.map(row => ({ label: row.path, value: row.views }))} /></Section>
      <Section title="Kaynaklar"><Bars rows={ready.sources.map(row => ({ label: sourceLabels[row.kind], value: row.views }))} />
        {ready.campaigns.length > 0 && <Bars rows={ready.campaigns.map(row => ({ label: [row.source, row.medium, row.campaign].filter(Boolean).join(" / "), value: row.views }))} />}
      </Section>
      <Section title="Ülkeler"><Bars rows={ready.countries.map(row => ({ label: countryName(row.country), value: row.views }))} /></Section>
      <Section title="Cihazlar"><Bars rows={ready.devices.map(row => ({ label: deviceLabels[row.device], value: row.views }))} /></Section>
    </div>}
  </section>;
}
