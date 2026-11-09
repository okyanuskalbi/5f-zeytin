import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DealershipForm } from "@/components/dealership/DealershipForm";

beforeEach(() => { vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ items: [] }) })); });
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
const change = (label: RegExp, value: string) => fireEvent.change(screen.getByLabelText(label, { selector: "input,select,textarea" }), { target: { value } });
function fill() {
  change(/^Firma adı/, "Ellek & Sofra #1"); change(/^Yetkili adı soyadı/, "Çağrı Öztürk");
  change(/^Telefon$/, "5321234567"); change(/^E-posta/, "cagri+bayi@example.com");
  change(/^İl \*/, "Osmaniye"); change(/^İlçe/, "Düziçi"); change(/^İşletme türü/, "Market");
  change(/^Satış noktası sayısı/, "2–5"); change(/^Mesaj/, "Zeytin & zeytinyağı? #başvuru");
  fireEvent.click(screen.getByRole("checkbox"));
}
const submit = () => fireEvent.click(screen.getByRole("button", { name: "Başvuru E-postasını Hazırla" }));

describe("Bayilik başvuru formu", () => {
  it("renders labeled required fields, existing searchable controls and optional fields", () => {
    render(<DealershipForm />);
    for (const label of [/^Firma adı/, /^Yetkili adı soyadı/, /^Telefon$/, /^E-posta/, /^İl \*/, /^İlçe/, /^İşletme türü/]) expect((screen.getByLabelText(label) as HTMLInputElement).required).toBe(true);
    expect(screen.getByRole("button", { name: /Telefon ülke kodu/ })).toBeTruthy();
    expect(screen.getByRole("combobox", { name: /^İl \*/ })).toBeTruthy();
    expect((screen.getByLabelText(/^Satış noktası sayısı/) as HTMLSelectElement).required).toBe(false);
    expect((screen.getByLabelText(/^Mesaj/) as HTMLTextAreaElement).maxLength).toBe(1000);
    expect(screen.getByRole("link", { name: "KVKK aydınlatma metni" }).getAttribute("href")).toBe("/kvkk");
    expect(screen.queryByRole("button", { name: "Metni kopyala" })).toBeNull();
  });
  it("marks errors beside fields, associates them and focuses the first invalid control", () => {
    const openDraft = vi.fn(); render(<DealershipForm openDraft={openDraft} />); submit();
    for (const label of [/^Firma adı/, /^Yetkili adı soyadı/, /^Telefon$/, /^E-posta/, /^İl \*/, /^İlçe/, /^İşletme türü/]) {
      const input = screen.getByLabelText(label);
      expect(input.getAttribute("aria-invalid")).toBe("true");
      const errorId = input.getAttribute("aria-describedby")!.split(" ").at(-1)!;
      expect(document.getElementById(errorId)?.textContent).toBeTruthy();
      expect(input.closest("[data-dealership-field]")?.contains(document.getElementById(errorId))).toBe(true);
    }
    expect(document.activeElement).toBe(screen.getByLabelText(/^Firma adı/));
    expect(screen.getByRole("checkbox").getAttribute("aria-invalid")).toBe("true");
    expect(openDraft).not.toHaveBeenCalled();
  });
  it("rejects malformed email, invalid phone and missing KVKK beside their controls", () => {
    const openDraft = vi.fn(); render(<DealershipForm openDraft={openDraft} />); fill();
    change(/^E-posta/, "wrong-address"); change(/^Telefon$/, "123"); fireEvent.click(screen.getByRole("checkbox")); submit();
    expect(screen.getByLabelText(/^E-posta/).getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByLabelText(/^Telefon$/).getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByRole("checkbox").getAttribute("aria-invalid")).toBe("true");
    expect(openDraft).not.toHaveBeenCalled();
  });
  it("clears district when the city changes", () => {
    render(<DealershipForm />); change(/^İl \*/, "Osmaniye"); change(/^İlçe/, "Düziçi"); change(/^İl \*/, "Adana");
    expect((screen.getByLabelText(/^İlçe/) as HTMLInputElement).value).toBe("");
  });
  it("opens encoded mail draft after validation, explains manual sending and invalidates stale drafts", async () => {
    const openDraft = vi.fn(); render(<DealershipForm openDraft={openDraft} />); fill(); submit();
    expect(openDraft).toHaveBeenCalledTimes(1);
    const url = new URL(openDraft.mock.calls[0][0]);
    expect(url.pathname).toBe("info@afina.com.tr");
    expect(url.searchParams.get("subject")).toBe("Bayilik başvurusu — Ellek & Sofra #1");
    expect(url.searchParams.get("body")).toContain("Zeytin & zeytinyağı? #başvuru");
    expect(screen.getByRole("status", { name: "Başvuru durumu" }).textContent).toBe("E-posta uygulamanızda başvuru taslağı açıldı. Gönder'e bastığınızda başvurunuz bize ulaşır.");
    expect(screen.getByRole("button", { name: "Metni kopyala" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "info@afina.com.tr" })).toBeTruthy();
    change(/^Firma adı/, "Yeni firma");
    await waitFor(() => expect(screen.queryByRole("button", { name: "Metni kopyala" })).toBeNull());
  });
  it("retains a copyable draft if the email application cannot be launched", () => {
    render(<DealershipForm openDraft={() => { throw Error("unavailable"); }} />); fill(); submit();
    expect(screen.getByRole("status", { name: "Başvuru durumu" }).textContent).toContain("Başvuru taslağınız hazır");
    expect(screen.getByRole("button", { name: "Metni kopyala" })).toBeTruthy();
    expect((screen.getByRole("textbox", { name: "Hazırlanan başvuru metni" }) as HTMLTextAreaElement).value).toContain("Ellek & Sofra #1");
  });
  it("copies the subject and full prepared body", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    render(<DealershipForm openDraft={vi.fn()} />); fill(); submit(); fireEvent.click(screen.getByRole("button", { name: "Metni kopyala" }));
    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
    expect(writeText.mock.calls[0][0]).toContain("Bayilik başvurusu — Ellek & Sofra #1");
    expect(writeText.mock.calls[0][0]).toContain("Yetkili adı soyadı: Çağrı Öztürk");
    expect(writeText.mock.calls[0][0]).toContain("KVKK");
  });
  it("keeps a selectable full draft when clipboard access is denied", async () => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: vi.fn().mockRejectedValue(Error("denied")) } });
    render(<DealershipForm openDraft={vi.fn()} />); fill(); submit(); fireEvent.click(screen.getByRole("button", { name: "Metni kopyala" }));
    await waitFor(() => expect(screen.getByText(/Metni aşağıdaki kutudan seçip kopyalayabilirsiniz/)).toBeTruthy());
    const preview = screen.getByRole("textbox", { name: "Hazırlanan başvuru metni" }) as HTMLTextAreaElement;
    expect(preview.readOnly).toBe(true); expect(preview.value).toContain("Ellek & Sofra #1");
    expect(document.activeElement).toBe(preview);
  });
});
