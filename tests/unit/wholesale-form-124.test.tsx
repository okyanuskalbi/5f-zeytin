import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { useRef, useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WholesaleDialog } from "@/components/landing/WholesaleDialog";
import { WholesaleForm } from "@/components/landing/WholesaleForm";

const title = "Toptan teklif isteyin";
const description = "Sofralık zeytin, salamura zeytin ve zeytinyağı için miktar ve teslimat bilgisini yazın.";
const unavailable = "Toptan iletişim bilgileri yakında paylaşılacak. Bilgileriniz gönderilmez.";
const media = new Map<string, MediaQueryList>();
let width = 1440;
let reduced = true;
const animation = vi.hoisted(() => ({ animate: vi.fn(), stop: vi.fn() }));
vi.mock("motion/react", () => ({ useAnimate: () => [useRef(null), animation.animate] }));

function setWidth(next: number): void {
  width = next;
  act(() => {
    for (const [query, list] of media) {
      const matches = query === "(min-width: 768px)" ? width >= 768 : reduced;
      Object.defineProperty(list, "matches", { configurable: true, value: matches });
      list.dispatchEvent(new Event("change"));
    }
  });
}

beforeEach(() => {
  width = 1440;
  reduced = true;
  media.clear();
  animation.animate.mockReset().mockReturnValue(Object.assign(Promise.resolve(), { stop: animation.stop }));
  animation.stop.mockClear();
  vi.stubGlobal("matchMedia", (query: string) => {
    if (!media.has(query)) {
      const list = new EventTarget() as MediaQueryList;
      Object.assign(list, { media: query, matches: query === "(min-width: 768px)" ? width >= 768 : reduced });
      media.set(query, list);
    }
    return media.get(query)!;
  });
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

function Harness() {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  return <>
    <button ref={trigger} onClick={() => setOpen(true)}>Teklif formunu aç</button>
    {open && <WholesaleDialog onClose={() => setOpen(false)} onRestoreFocus={() => trigger.current?.focus()} />}
  </>;
}
function openForm() {
  render(<Harness />);
  const trigger = screen.getByRole("button", { name: "Teklif formunu aç" });
  fireEvent.click(trigger);
  return { trigger, dialog: screen.getByRole("dialog", { name: title }) };
}

it("shows one h2 and one description, with the truthful availability note only below the fields", () => {
  const { dialog } = openForm();
  expect(within(dialog).getAllByRole("heading")).toHaveLength(1);
  expect(within(dialog).getByRole("heading", { level: 2 }).textContent).toBe(title);
  expect(dialog.textContent).not.toContain("Toptan talep formu");
  expect(within(dialog).getByText(description)).toBeDefined();
  expect(within(dialog).getAllByText(unavailable)).toHaveLength(1);
  const footer = dialog.querySelector("[data-wholesale-actions]")!;
  expect(footer.contains(within(dialog).getByText(unavailable))).toBe(true);
  expect(footer.contains(within(dialog).getByRole("button", { name: "Talebi gönder" }))).toBe(true);
});

it("removes visible helper paragraphs while keeping required markers, limits and error associations", () => {
  render(<WholesaleForm submitRequest={vi.fn()} />);
  const form = screen.getByRole("form");
  expect(form.querySelector("h2,h3")).toBeNull();
  expect(form.querySelectorAll("fieldset p")).toHaveLength(0);
  for (const field of form.querySelectorAll("input:not([type=checkbox]),textarea")) {
    const hint = document.getElementById(field.getAttribute("aria-describedby")!);
    expect(hint?.classList.contains("sr-only")).toBe(true);
    expect(hint?.textContent).toBeTruthy();
  }
  for (const name of ["İsim / firma", "Talep mesajı"]) {
    const field = screen.getByRole("textbox", { name: name });
    expect(field.hasAttribute("required")).toBe(true);
    expect(form.querySelector(`label[for="${field.id}"]`)?.textContent).toContain("*");
  }
  expect(screen.getByRole("textbox", { name: "Talep mesajı" }).getAttribute("placeholder")).toContain("En az 10 karakter");
  fireEvent.submit(form);
  for (const text of ["İsim / firma 2–120 karakter olmalıdır.", "Talep mesajı 10–2000 karakter olmalıdır.", "Devam etmek için KVKK aydınlatma metnini okuduğunuzu belirtin."]) {
    expect(screen.getByText(text)).toBeDefined();
  }
  const name = screen.getByRole("textbox", { name: "İsim / firma" });
  const ids = name.getAttribute("aria-describedby")!.split(" ");
  expect(ids).toHaveLength(2);
  expect(ids.every(id => document.getElementById(id))).toBe(true);
  expect(document.activeElement).toBe(name);
});

it.each([375, 390, 767, 768, 1366, 1440])("uses only Sheet below 768px and Dialog from 768px at %ipx", viewport => {
  setWidth(viewport);
  const { dialog } = openForm();
  expect(dialog.getAttribute("data-slot")).toBe(viewport < 768 ? "sheet-content" : "dialog-content");
  expect(document.querySelectorAll('[role="dialog"]')).toHaveLength(1);
});

it("retains entered values and focus when the same open form crosses the breakpoint", () => {
  setWidth(767);
  const { dialog } = openForm();
  const name = within(dialog).getByRole("textbox", { name: "İsim / firma" });
  fireEvent.change(name, { target: { value: "Örnek Firma" } });
  name.focus();
  setWidth(768);
  expect(screen.getByRole("dialog").getAttribute("data-slot")).toBe("dialog-content");
  expect(screen.getByRole("textbox", { name: "İsim / firma" })).toBe(name);
  expect((name as HTMLInputElement).value).toBe("Örnek Firma");
  expect(document.activeElement).toBe(name);
});

it("keeps the submit in a sticky footer outside the scrolling fieldset and supplies mobile keyboard tokens", () => {
  setWidth(390);
  const { dialog } = openForm();
  const submit = within(dialog).getByRole("button", { name: "Talebi gönder" });
  const actions = submit.closest("[data-wholesale-actions]")!;
  expect(actions.classList.contains("sticky")).toBe(true);
  expect(actions.classList.contains("bottom-0")).toBe(true);
  expect(actions.closest("fieldset")).toBeNull();
  for (const [label, inputMode, autocomplete] of [["İsim / firma", "text", "organization"], ["E-posta", "email", "email"], ["Telefon", "tel", "tel"]]) {
    const input = within(dialog).getByRole("textbox", { name: label });
    expect(input.getAttribute("inputmode")).toBe(inputMode);
    expect(input.getAttribute("autocomplete")).toBe(autocomplete);
  }
  expect(within(dialog).getByRole("textbox", { name: "Talep mesajı" }).getAttribute("rows")).toBe("3");
});

it("tracks the visual viewport while the keyboard is open and removes its listeners on close", () => {
  setWidth(390);
  const viewport = Object.assign(new EventTarget(), { height: 844, offsetTop: 0, scale: 1 });
  const remove = vi.spyOn(viewport, "removeEventListener");
  vi.stubGlobal("visualViewport", viewport);
  const { dialog } = openForm();
  Object.assign(viewport, { height: 360, offsetTop: 18 });
  act(() => { viewport.dispatchEvent(new Event("resize")); viewport.dispatchEvent(new Event("scroll")); });
  expect(dialog.style.getPropertyValue("--wholesale-viewport-height")).toBe("360px");
  expect(dialog.style.getPropertyValue("--wholesale-viewport-top")).toBe("18px");
  fireEvent.click(within(dialog).getByRole("button", { name: "Kapat" }));
  expect(remove).toHaveBeenCalledWith("resize", expect.any(Function));
  expect(remove).toHaveBeenCalledWith("scroll", expect.any(Function));
});

it("grows messages up to six lines and shrinks them back without discarding text", () => {
  render(<WholesaleForm />);
  const message = screen.getByRole("textbox", { name: "Talep mesajı" }) as HTMLTextAreaElement;
  // Supply layout measurements that jsdom cannot calculate from CSS modules.
  Object.assign(message.style, { minHeight: "90px", maxHeight: "162px", borderTopWidth: "1px", borderBottomWidth: "1px" });
  let contentHeight = 400;
  Object.defineProperty(message, "scrollHeight", { get: () => contentHeight });
  fireEvent.change(message, { target: { value: "Uzun talep\n".repeat(12) } });
  expect(message.style.height).toBe("162px");
  expect(message.value).toBe("Uzun talep\n".repeat(12));
  contentHeight = 60;
  fireEvent.change(message, { target: { value: "Kısa talep" } });
  expect(message.style.height).toBe("90px");
});

it("performs neither opening nor closing animation under reduced motion", () => {
  setWidth(390);
  const { dialog } = openForm();
  expect(dialog.getAttribute("data-reduced-motion")).toBe("true");
  fireEvent.click(within(dialog).getByRole("button", { name: "Kapat" }));
  expect(animation.animate).not.toHaveBeenCalled();
  expect(screen.queryByRole("dialog")).toBeNull();
});

it("lets the empty message shrink to the two-line SE minimum despite the three-row native default", () => {
  render(<WholesaleForm />);
  const message = screen.getByRole("textbox", { name: "Talep mesajı" }) as HTMLTextAreaElement;
  Object.assign(message.style, { minHeight: "66px", maxHeight: "162px", borderTopWidth: "1px", borderBottomWidth: "1px" });
  // rows=3 gives a 90px native height when height:auto. Measure from the CSS
  // minimum instead, so SE's two-line box can actually become smaller.
  Object.defineProperty(message, "scrollHeight", { get: () => message.style.height === "66px" ? 64 : 88 });
  fireEvent.resize(window);
  expect(message.getAttribute("rows")).toBe("3");
  expect(message.style.height).toBe("66px");
});

it.each([390, 1366])("keeps the modal trap mounted through the exit motion at %ipx", async viewport => {
  reduced = false;
  setWidth(viewport);
  const { dialog, trigger } = openForm();
  expect(animation.animate).toHaveBeenCalledWith(expect.any(HTMLElement),
    { y: [viewport < 768 ? "100%" : 24, 0], opacity: [0, 1] }, expect.any(Object));
  let finish!: () => void;
  animation.animate.mockReturnValueOnce(Object.assign(new Promise<void>(resolve => { finish = resolve; }), { stop: animation.stop }));
  fireEvent.click(within(dialog).getByRole("button", { name: "Kapat" }));
  fireEvent.keyDown(dialog, { key: "Escape" });
  expect(dialog.getAttribute("aria-modal")).toBe("true");
  expect(screen.getByRole("dialog")).toBe(dialog);
  expect(animation.animate).toHaveBeenCalledTimes(2);
  await act(async () => { finish(); });
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  await waitFor(() => expect(document.activeElement).toBe(trigger));
  expect(animation.stop).toHaveBeenCalled();
});

describe.each([390, 1366])("focus and dismissal at %ipx", viewport => {
  it.each(["Escape", "close", "backdrop"])("focuses the first field and restores the trigger after %s", async method => {
    setWidth(viewport);
    const { dialog, trigger } = openForm();
    await waitFor(() => expect(document.activeElement).toBe(within(dialog).getByRole("textbox", { name: "İsim / firma" })));
    if (method === "Escape") fireEvent.keyDown(document.activeElement!, { key: "Escape" });
    else if (method === "close") fireEvent.click(within(dialog).getByRole("button", { name: "Kapat" }));
    else {
      const overlay = document.querySelector('[data-slot$="-overlay"]')!;
      // Radix starts listening for outside pointerdown after the opening event.
      await act(async () => { await new Promise(resolve => setTimeout(resolve, 1)); });
      fireEvent(overlay, new MouseEvent("pointerdown", { bubbles: true, button: 0 }));
      fireEvent(overlay, new MouseEvent("pointerup", { bubbles: true, button: 0 }));
      fireEvent.click(overlay);
    }
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });
});
