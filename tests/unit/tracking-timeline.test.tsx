import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { createMockAuthAdapter } from "@/lib/auth/adapter";
import { createMockTrackingAdapter } from "@/lib/orders/tracking-adapter";
import { DeliveryTimeline } from "@/components/orders/DeliveryTimeline";

it.each(["cancelled", "refunded"] as const)("stops shipment progress for %s and shows its dated terminal event", async status => {
  const result = await createMockTrackingAdapter(createMockAuthAdapter(sessionStorage)).lookup({ no: "DEMO-10801", contact: "4567" });
  if (result.kind !== "found") throw new Error("Expected demo order");
  const doc = document.implementation.createHTMLDocument();
  doc.body.innerHTML = renderToStaticMarkup(<DeliveryTimeline order={{ ...result.order, status, terminalAt: "2026-10-21T10:00:00+03:00" }} />);
  expect(doc.querySelectorAll("ol > li")).toHaveLength(7);
  expect(doc.querySelector('[aria-current="step"]')?.textContent).toContain(status === "cancelled" ? "İptal edildi" : "İade edildi");
  expect(doc.querySelector('[aria-current="step"] time')?.getAttribute("datetime")).toBe("2026-10-21T10:00:00+03:00");
  expect(doc.body.textContent).toContain("Gerçekleşmedi");
});
