import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { TrackingSummary } from "@/components/orders/TrackingSummary";
import { createMockAuthAdapter } from "@/lib/auth/adapter";
import { createMockTrackingAdapter, isSafeCarrierUrl } from "@/lib/orders/tracking-adapter";

it.each([null, "javascript:alert(1)", "http://carrier.example.test", "https://name:pass@carrier.example.test", "/tracking"])("rejects unsafe carrier link %s", url => {
  expect(isSafeCarrierUrl(url)).toBe(false);
});

it("renders an adapter-provided HTTPS link safely and omits an unknown estimate", async () => {
  const result = await createMockTrackingAdapter(createMockAuthAdapter(sessionStorage)).lookup({ no: "DEMO-10801", contact: "4567" });
  if (result.kind !== "found" || !result.order.shipping) throw new Error("Expected shipped demo order");
  const url = "https://carrier.example.test/track?id=demo";
  const doc = document.implementation.createHTMLDocument();
  doc.body.innerHTML = renderToStaticMarkup(<TrackingSummary order={{ ...result.order, shipping: { ...result.order.shipping, trackingUrl: url, estimatedDelivery: null } }} />);
  const link = doc.querySelector("a");
  expect(link?.getAttribute("href")).toBe(url);
  expect(link?.getAttribute("rel")).toBe("noopener noreferrer");
  expect(link?.getAttribute("referrerpolicy")).toBe("no-referrer");
  expect(doc.body.textContent).not.toContain("Tahmini teslim:");
});
