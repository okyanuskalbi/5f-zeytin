import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { CreditCardForm, validateCard } from "@/components/ui/credit-card-form";

afterEach(cleanup);
const valid = { number: "4111111111111111", holder: "TEST USER", month: "11", year: "2026", cvv: "123" };
it("rejects an invalid checksum and a past month, while accepting the current month", () => {
  const now = new Date(2026, 10, 1);
  expect(validateCard(valid, now).allValid).toBe(true);
  expect(validateCard({ ...valid, number: "4111111111111112" }, now).number).toBe(false);
  expect(validateCard({ ...valid, month: "10" }, now).allValid).toBe(false);
  expect(validateCard({ ...valid, number: "0000000000000" }, now).number).toBe(false);
  expect(validateCard({ ...valid, cvv: "12" }, now).cvv).toBe(false);
});
it("uses instance-specific labels and never submits an incomplete form", () => {
  const submit = vi.fn();
  const { container } = render(<><CreditCardForm onSubmit={submit} /><CreditCardForm /></>);
  const ids = [...container.querySelectorAll("[id]")].map(el => el.id);
  expect(new Set(ids).size).toBe(ids.length);
  fireEvent.submit(container.querySelector("form")!);
  expect(submit).not.toHaveBeenCalled();
  expect(screen.getAllByLabelText("CVV")[0].getAttribute("type")).toBe("password");
});
it("provides a non-collecting card preview for the existing PayTR iframe page", () => {
  const { container } = render(<CreditCardForm previewOnly />);
  expect(container.querySelector("input,select,form")).toBeNull();
  expect(screen.getByLabelText("Temsili ödeme kartı")).toBeTruthy();
});
