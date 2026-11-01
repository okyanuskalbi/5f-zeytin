import { cleanup, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, expect, it, vi } from "vitest";
import TrackingTimeline from "@/components/ui/order-history";
import { CustomerWorkspace } from "@/components/account/CustomerWorkspace";
import { customerOrderTimeline, deliveryOrderTimeline } from "@/lib/orders/timeline";
import type { CustomerOrder } from "@/lib/contracts/customer";
import { trackingStages, type TrackingOrder } from "@/lib/orders/tracking-adapter";

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn(), refresh: vi.fn() }) }));

const order: CustomerOrder = {
  no: "AF-16501", date: "2026-11-01T09:00:00+03:00", status: "pending",
  totalKurus: 50000, items: [], deliveryAddress: "Osmaniye", shipping: null,
};
const tracking: TrackingOrder = {
  no: order.no, status: "preparing", amountKurus: 50000, items: [],
  deliveryAddress: "D*** · Osmaniye", shipping: null,
  events: trackingStages.map((label, index) => ({ label, at: index === 0 ? order.date : null })),
};

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

it.each([
  ["pending", "Ödeme bekleniyor", "in-progress"],
  ["paid", "Ödeme onaylandı", "completed"],
  ["preparing", "Hazırlanıyor", "in-progress"],
  ["shipped", "Kargoya verildi", "in-progress"],
  ["delivered", "Teslim edildi", "completed"],
] as const)("maps the real %s status without inventing milestone dates", (status, title, state) => {
  const items = customerOrderTimeline({ ...order, status });
  expect(items.filter(item => item.current)).toHaveLength(1);
  expect(items.find(item => item.current)).toMatchObject({ title, status: state, date: null });
  expect(items.filter(item => item.date)).toEqual([expect.objectContaining({ title: "Sipariş alındı", date: order.date })]);
  if (status === "delivered") expect(items.every(item => item.status === "completed")).toBe(true);
});

it.each(["cancelled", "refunded"] as const)("does not infer missing shipment history for a %s customer order", status => {
  const items = customerOrderTimeline({ ...order, status });
  expect(items).toHaveLength(2);
  expect(items.at(-1)).toMatchObject({ current: true, status: "stopped", date: null });
  expect(items.some(item => item.status === "in-progress")).toBe(false);
});

it("preserves valid carrier timestamps, ignores malformed timestamps and keeps terminal status current", () => {
  const items = deliveryOrderTimeline({
    ...tracking, status: "refunded", terminalAt: "2026-11-02T11:00:00Z",
    events: tracking.events.map((event, index) => index === 2 ? { ...event, at: "not-a-date" } : event),
  });
  expect(items[0].date).toBe(order.date);
  expect(items[2]).toMatchObject({ date: null, status: "pending", description: "Kayıt bulunmuyor." });
  expect(items.at(-1)).toMatchObject({ title: "İade edildi", date: "2026-11-02T11:00:00Z", status: "stopped", current: true });
  expect(items.some(item => item.status === "in-progress")).toBe(false);
});

it("renders delivered content and a single current step in SSR without hidden or animated waiting content", () => {
  const html = renderToStaticMarkup(<TrackingTimeline items={customerOrderTimeline({ ...order, status: "delivered" })} />);
  const doc = document.implementation.createHTMLDocument();
  doc.body.innerHTML = html;
  expect(doc.querySelectorAll("ol > li")).toHaveLength(5);
  expect(doc.querySelectorAll('[aria-current="step"]')).toHaveLength(1);
  expect(doc.querySelector('[aria-current="step"]')?.textContent).toContain("Teslim edildi");
  expect(doc.querySelectorAll("time")).toHaveLength(1);
  expect(doc.querySelector("time")?.dateTime).toBe(order.date);
  expect(html).not.toMatch(/opacity:0|scale\(0\)|animate-ping|in-progress/);
});

it("keeps reduced motion static and renders missing dates as text rather than false time elements", () => {
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
  const { container } = render(<TrackingTimeline items={customerOrderTimeline(order)} />);
  expect(container.querySelector("ol")?.getAttribute("data-motion")).toBe("reduced");
  expect(container.querySelectorAll("time")).toHaveLength(1);
  expect(container.querySelector('[aria-current="step"]')?.textContent).toContain("Ödeme bekleniyor");
  expect(container.innerHTML).not.toMatch(/opacity:0|translateY|animate-ping/);
});

it("mounts the timeline on the authenticated order detail using the existing read-only endpoint", async () => {
  const fetcher = vi.fn().mockResolvedValue(Response.json({ data: { ...order, status: "delivered" } }));
  vi.stubGlobal("fetch", fetcher);
  render(<CustomerWorkspace section="order-detail" orderNo={order.no} profile={{ name: "Deniz", email: "deniz@example.test", phone: null }} />);
  expect(await screen.findByRole("heading", { name: "Sipariş yolculuğu" })).toBeDefined();
  expect(fetcher).toHaveBeenCalledTimes(1);
  expect(fetcher.mock.calls[0][0]).toBe(`/api/account/orders/${order.no}`);
  expect(document.querySelector('[aria-current="step"]')?.textContent).toContain("Teslim edildi");
  expect(screen.getByRole("link", { name: "Siparişlerime dön" }).getAttribute("href")).toBe("/hesabim/siparisler");
});
