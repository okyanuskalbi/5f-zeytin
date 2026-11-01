import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { MembershipFrame } from "@/components/account/MembershipFrame";

afterEach(cleanup);

it("responds to password focus without copying credentials into the membership artwork", () => {
  render(<MembershipFrame mode="login"><label>E-posta<input name="email" /></label><label>Şifre<input name="password" type="password" /></label></MembershipFrame>);
  const card = screen.getByRole("img", { name: "AFİNA üyelik kartı" });
  const email = screen.getByLabelText("E-posta");
  const password = screen.getByLabelText("Şifre");
  fireEvent.change(email, { target: { value: "private@example.test" } });
  fireEvent.change(password, { target: { value: "private-pass-165" } });
  fireEvent.focus(password);
  expect(card.getAttribute("data-side")).toBe("back");
  expect(card.textContent).not.toContain("private");
  fireEvent.focus(email);
  expect(card.getAttribute("data-side")).toBe("front");
  expect(screen.getByRole("link", { name: "Hesap oluştur" }).getAttribute("href")).toBe("/kayit");
});
