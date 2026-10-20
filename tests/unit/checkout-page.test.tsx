import { afterEach, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import Page, { metadata } from "@/app/odeme/page";
import { getPaytrCredentials } from "@/lib/payments/paytr";

vi.mock("@/lib/payments/preview", () => ({ isPaymentPreviewEnabled: () => process.env.NODE_ENV !== "production" && process.env.PAYMENT_PREVIEW !== "0" }));
vi.mock("@/lib/payments/paytr", () => ({ getPaytrCredentials: vi.fn(() => null) }));
afterEach(() => { vi.unstubAllEnvs(); vi.clearAllMocks(); });

it("production stays upcoming without demo opt-in and never reads PayTR keys", () => {
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("NEXT_PUBLIC_DEMO", "0");
  const html = renderToStaticMarkup(<Page />);
  expect(html).toContain("Yakında");
  expect(html).toContain('href="/sepet"');
  expect(html).not.toContain("<form");
  expect(getPaytrCredentials).not.toHaveBeenCalled();
  expect(metadata.robots).toEqual({ index: false, follow: false });
});

it("production demo has the checkout UI but cannot open the local token endpoint", () => {
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("NEXT_PUBLIC_DEMO", "1");
  expect(Page().props.localPreviewAvailable).toBe(false);
  expect(getPaytrCredentials).not.toHaveBeenCalled();
});

it("development without keys retains the keyless warning mode", () => {
  vi.stubEnv("NODE_ENV", "development");
  expect(Page().props.localPreviewAvailable).toBe(false);
  expect(getPaytrCredentials).toHaveBeenCalledOnce();
});
