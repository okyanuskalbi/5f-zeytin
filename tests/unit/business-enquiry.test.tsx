import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { BusinessEnquiry } from "@/components/landing/BusinessEnquiry";
import { buildBusinessEnquiry } from "@/lib/contracts/business-enquiry";
import { getProducts } from "@/lib/catalog/static-products";

afterEach(cleanup);
const valid = { company: "Ellek Market", contact: "Ayşe Yılmaz", phone: "+90 555 123 45 67", email: "", city: "Osmaniye", productId: "sample-green-olive-10kg", packaging: "3 L teneke", consumption: "Aylık 100 kg", deliveryRegion: "Düziçi", customerType: "Market" };

it("converts all B2B fields into the existing validated wholesale contract", async () => {
  const result = buildBusinessEnquiry(valid, await getProducts());
  expect(result.ok).toBe(true);
  if (!result.ok) return;
  expect(result.data.name).toBe("Ayşe Yılmaz / Ellek Market");
  for (const value of ["Osmaniye", "Düziçi", "Aylık 100 kg", "3 L teneke", "Market"]) expect(result.data.message).toContain(value);
  expect(result.data.message).toContain("Doğal Kırma Yeşil Zeytin");
});

it("rejects unpublished products and incomplete business details", async () => {
  const result = buildBusinessEnquiry({ ...valid, company: "", productId: "invented", phone: "1" }, await getProducts());
  expect(result.ok).toBe(false);
  if (result.ok) return;
  expect(result.errors.company).toBeTruthy();
  expect(result.errors.productId).toBeTruthy();
  expect(result.errors.phone).toBeTruthy();
});

it("shows all customer-requested fields and keeps sending unavailable without a service", async () => {
  render(<BusinessEnquiry products={await getProducts()} />);
  for (const label of ["Firma adı", "Yetkili kişi", "Telefon", "Şehir", "Ürün", "Ambalaj tercihi", "Tahmini aylık tüketim", "Teslimat bölgesi"]) expect(screen.getByLabelText(label, { exact: false })).toBeDefined();
  expect((screen.getByRole("button", { name: "Teklif talebini gönder" }) as HTMLButtonElement).disabled).toBe(true);
  expect(screen.getByRole("status").textContent).toContain("gönderim şu anda kapalı");
  expect(screen.queryByText("Talebiniz gönderildi.")).toBeNull();
});

it("requires consent and passes one complete request to an injected service", async () => {
  const submitRequest = vi.fn().mockResolvedValue({ ok: true });
  render(<BusinessEnquiry products={await getProducts()} submitRequest={submitRequest} />);
  for (const [name, value] of Object.entries(valid)) fireEvent.change(document.querySelector(`[name="${name}"]`)!, { target: { value } });
  fireEvent.click(screen.getByRole("button", { name: "Teklif talebini gönder" }));
  expect(submitRequest).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("checkbox"));
  fireEvent.click(screen.getByRole("button", { name: "Teklif talebini gönder" }));
  await waitFor(() => expect(submitRequest).toHaveBeenCalledTimes(1));
  await waitFor(() => expect(screen.getByRole("status").textContent).toBe("Talebiniz gönderildi."));
});
