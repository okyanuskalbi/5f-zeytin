import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { WholesaleForm } from "@/components/landing/WholesaleForm";
import type { WholesaleResult } from "@/lib/contracts/wholesale";

afterEach(cleanup);
const input = (name: string) => screen.getByLabelText(name, { exact: true });
const form = () => screen.getByRole("form", { name: "Toptan talep formu" });
function fill(): void {
  fireEvent.change(input("İsim / firma"), { target: { value: "  Örnek Firma  " } });
  fireEvent.change(input("E-posta"), { target: { value: "talep@example.test" } });
  fireEvent.change(input("Talep mesajı"), { target: { value: "  Zeytin için bilgi rica ederim.  " } });
}

it("prevents even programmatic submission without a delivery dependency", () => {
  render(<WholesaleForm />);
  fill();
  const event = new Event("submit", { bubbles: true, cancelable: true });
  fireEvent(form(), event);
  expect(event.defaultPrevented).toBe(true);
  expect(screen.getByRole("status").textContent).toContain("Bilgileriniz gönderilmez.");
  expect((screen.getByRole("button") as HTMLButtonElement).disabled).toBe(true);
  expect(screen.getByRole("alert").textContent).toBe("");
});

it("focuses the first invalid field, associates errors and clears a corrected field", () => {
  const submitRequest = vi.fn();
  render(<WholesaleForm submitRequest={submitRequest} />);
  fireEvent.submit(form());
  expect(document.activeElement).toBe(input("İsim / firma"));
  expect(screen.getByRole("alert").textContent).toContain("Lütfen işaretli alanları kontrol edin.");
  expect(input("İsim / firma").getAttribute("aria-describedby")).toMatch(/-error/);
  fireEvent.change(input("İsim / firma"), { target: { value: "Örnek Firma" } });
  expect(input("İsim / firma").hasAttribute("aria-invalid")).toBe(false);
  expect(submitRequest).not.toHaveBeenCalled();
});

it("blocks same-tick duplicate events, trims the payload and resets only on acknowledged success", async () => {
  let finish!: (result: WholesaleResult) => void;
  const submitRequest = vi.fn(() => new Promise<WholesaleResult>(resolve => { finish = resolve; }));
  render(<WholesaleForm submitRequest={submitRequest} />);
  fill();
  act(() => { fireEvent.submit(form()); fireEvent.submit(form()); });
  expect(submitRequest).toHaveBeenCalledTimes(1);
  expect(submitRequest).toHaveBeenCalledWith({ name: "Örnek Firma", email: "talep@example.test", phone: "", message: "Zeytin için bilgi rica ederim." });
  expect(screen.getByRole("status").textContent).toBe("Talebiniz gönderiliyor…");
  expect(form().getAttribute("aria-busy")).toBe("true");
  await act(async () => { finish({ ok: true }); });
  expect(screen.getByRole("status").textContent).toBe("Talebiniz gönderildi.");
  expect(document.activeElement).toBe(screen.getByRole("status"));
  expect((input("İsim / firma") as HTMLInputElement).value).toBe("");
  expect((input("Talep mesajı") as HTMLTextAreaElement).value).toBe("");
  fireEvent.change(input("Telefon"), { target: { value: "5551234567" } });
  expect(screen.getByRole("status").textContent).toBe("");
});

it.each(["rejection", "negative result"])("retains entered values on %s and allows a successful retry", async mode => {
  const submitRequest = vi.fn<() => Promise<WholesaleResult>>();
  if (mode === "rejection") submitRequest.mockRejectedValueOnce(new Error("private provider detail"));
  else submitRequest.mockResolvedValueOnce({ ok: false });
  submitRequest.mockResolvedValueOnce({ ok: true });
  render(<WholesaleForm submitRequest={submitRequest} />);
  fill();
  fireEvent.submit(form());
  await waitFor(() => expect(screen.getByRole("alert").textContent).toContain("Talebiniz gönderilemedi."));
  expect(document.activeElement).toBe(screen.getByRole("alert"));
  expect((input("İsim / firma") as HTMLInputElement).value).toBe("  Örnek Firma  ");
  expect((input("Talep mesajı") as HTMLTextAreaElement).value).toBe("  Zeytin için bilgi rica ederim.  ");
  expect(form().textContent).not.toContain("private provider detail");
  expect(screen.getByRole("status").textContent).toBe("");
  fireEvent.submit(form());
  await waitFor(() => expect(screen.getByRole("status").textContent).toBe("Talebiniz gönderildi."));
  expect(submitRequest).toHaveBeenCalledTimes(2);
});

it("clears the previous success when the reset form is submitted empty", async () => {
  const submitRequest = vi.fn<() => Promise<WholesaleResult>>().mockResolvedValue({ ok: true });
  render(<WholesaleForm submitRequest={submitRequest} />);
  fill();
  fireEvent.submit(form());
  await waitFor(() => expect(screen.getByRole("status").textContent).toBe("Talebiniz gönderildi."));
  fireEvent.submit(form());
  expect(screen.getByRole("status").textContent).toBe("");
  expect(document.activeElement).toBe(input("İsim / firma"));
  expect(submitRequest).toHaveBeenCalledTimes(1);
});
