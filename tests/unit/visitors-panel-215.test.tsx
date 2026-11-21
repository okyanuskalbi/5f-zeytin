import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { VisitorsPanel } from "@/components/admin/VisitorsPanel";
import type { VisitSummary } from "@/lib/contracts/visits";

const summary = (period: 1 | 7 | 30): VisitSummary => ({
  period, totals: { views: 12, visitors: 5 },
  daily: Array.from({ length: Math.max(period, 7) }, (_, i) => ({ day: `2026-11-${String(i + 1).padStart(2, "0")}`, views: i, visitors: i })),
  pages: [{ path: "/blog", views: 7 }], sources: [{ kind: "google", views: 8 }, { kind: "direct", views: 4 }], campaigns: [{ source: "instagram", medium: "story", campaign: "kasim", views: 2 }],
  countries: [{ country: "TR", views: 10 }], devices: [{ device: "mobile", views: 9 }],
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe("VisitorsPanel", () => {
  it("loads a period, renders sections and a text table, and switches period", async () => {
    const fetcher = vi.fn(async (url: string) => Response.json({ data: summary(url.includes("period=30") ? 30 : 7) })); vi.stubGlobal("fetch", fetcher);
    const { container } = render(<VisitorsPanel />);
    expect(await screen.findByRole("region", { name: "Sayfa görüntüleme" })).toBeTruthy();
    expect(within(screen.getByRole("region", { name: "Sayfa görüntüleme" })).getByText("12")).toBeTruthy();
    expect(screen.getByRole("region", { name: "Kaynaklar" }).textContent).toMatch(/Google[\s\S]*Doğrudan/);
    expect(screen.getByRole("region", { name: "Ülkeler" }).textContent).toContain("Türkiye");
    expect(screen.getByRole("region", { name: "Cihazlar" }).textContent).toContain("Mobil");
    expect(container.querySelector("svg[role='img'] path")).not.toBeNull();
    expect(container.querySelectorAll("table tbody tr")).toHaveLength(7);
    fireEvent.click(screen.getByRole("radio", { name: "30 gün" }));
    await waitFor(() => expect(container.querySelectorAll("table tbody tr")).toHaveLength(30));
    expect(fetcher.mock.calls.map(call => call[0])).toEqual(["/api/admin/visitors?period=7", "/api/admin/visitors?period=30"]);
  });
  it("shows a Turkish error with retry", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 503 })));
    render(<VisitorsPanel />);
    expect((await screen.findByRole("alert")).textContent).toContain("yüklenemedi");
    expect(screen.getByRole("button", { name: "Yeniden dene" })).toBeTruthy();
  });
});
