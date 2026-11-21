// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { bindTestD1, createTestD1 } from "../helpers/d1-sqlite";
import { query } from "@/lib/db";
import { POST as postContact } from "@/app/api/contact/route";
import { buildLeadNotification } from "@/lib/mail/lead-notify";
import { cleanHeader, getMailConfig, MailNotConfiguredError, sendMail } from "@/lib/mail/send";
vi.mock("server-only", () => ({}));
vi.mock("@/lib/auth/server", async importOriginal => {
  const original = await importOriginal<typeof import("@/lib/auth/server")>();
  return { ...original, assertRequestOrigin: () => {} };
});
const mocks = vi.hoisted(() => ({ send: vi.fn(), close: vi.fn(), connect: vi.fn() }));
vi.mock("worker-mailer", () => ({ WorkerMailer: { connect: mocks.connect } }));

const env = { SMTP_HOST: "mail.example.test", SMTP_PORT: "465", SMTP_SECURE: "true", SMTP_USER: "afina@example.test", SMTP_PASSWORD: "secret-pass", MAIL_FROM: "AFİNA ZEYTİN <afina@example.test>", LEAD_NOTIFY_TO: "afina@example.test" };
const origin = "https://shop.example.test";
const lead = { name: "Ali Veli", email: "ali@example.test", phone: "+90 555 000 00 00", message: "Toptan fiyat\nlütfen arayın", source: "bayilik" };
const post = (body: unknown, ip = "203.0.113.7") => postContact(new Request(`${origin}/api/contact`, { method: "POST", headers: { origin, "content-type": "application/json", "cf-connecting-ip": ip }, body: JSON.stringify(body) }));
const flush = () => new Promise(resolve => setTimeout(resolve, 0));
let waitUntil: ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
  waitUntil = vi.fn();
  bindTestD1(createTestD1(), {});
  (globalThis as Record<symbol, { ctx: { waitUntil: unknown } }>)[Symbol.for("__cloudflare-context__")].ctx.waitUntil = waitUntil;
  for (const [name, value] of Object.entries(env)) vi.stubEnv(name, value);
  mocks.connect.mockResolvedValue({ send: mocks.send, close: mocks.close });
  mocks.send.mockResolvedValue(undefined);
  mocks.close.mockResolvedValue(undefined);
});
afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });

describe("mail config and sendMail", () => {
  it("reads vars and the password secret; password absence means not configured", () => {
    expect(getMailConfig()).toMatchObject({ host: "mail.example.test", port: 465, secure: true, from: { name: "AFİNA ZEYTİN", email: "afina@example.test" }, leadNotifyTo: "afina@example.test" });
    vi.stubEnv("SMTP_PASSWORD", "");
    expect(getMailConfig()).toBeNull();
  });
  it("throws MailNotConfiguredError without connecting when not configured", async () => {
    vi.stubEnv("SMTP_PASSWORD", "");
    await expect(sendMail({ to: "a@example.test", subject: "x", text: "y" })).rejects.toBeInstanceOf(MailNotConfiguredError);
    expect(mocks.connect).not.toHaveBeenCalled();
  });
  it("sends through worker-mailer with TLS, encoded headers and closes", async () => {
    await sendMail({ to: "a@example.test", subject: "Şifre sıfırlama", text: "merhaba" });
    expect(mocks.connect).toHaveBeenCalledWith(expect.objectContaining({ host: "mail.example.test", port: 465, secure: true, credentials: { username: "afina@example.test", password: "secret-pass" } }));
    const sent = mocks.send.mock.calls[0][0];
    expect(sent.from).toEqual({ email: "afina@example.test" });
    expect(sent.headers.From).toMatch(/^=\?UTF-8\?B\?[A-Za-z0-9+/=]+\?= <afina@example\.test>$/);
    expect(sent.headers.Subject).toMatch(/^=\?UTF-8\?B\?/);
    expect(mocks.close).toHaveBeenCalledOnce();
  });
  it("strips line breaks from subject and rejects injected or invalid recipients", async () => {
    expect(cleanHeader("Merhaba\r\nBcc: evil@example.test")).toBe("Merhaba Bcc: evil@example.test");
    await sendMail({ to: "a@example.test", subject: "Konu\r\nBcc: evil@example.test", text: "x", replyTo: "ali@example.test\r\nBcc: evil@example.test" });
    const sent = mocks.send.mock.calls[0][0];
    expect(sent.subject).not.toMatch(/[\r\n]/);
    expect(sent.reply).toBeUndefined();
    for (const to of ["a@example.test\r\nBcc: evil@example.test", "a@example.test, b@example.test", "not-an-email"]) {
      await expect(sendMail({ to, subject: "x", text: "y" })).rejects.toThrow("mail_invalid_recipient");
    }
  });
  it("closes the connection even when sending fails", async () => {
    mocks.send.mockRejectedValue(new Error("smtp down"));
    await expect(sendMail({ to: "a@example.test", subject: "x", text: "y" })).rejects.toThrow("smtp down");
    expect(mocks.close).toHaveBeenCalledOnce();
  });
});

describe("lead notification", () => {
  it("builds a short plain Turkish text with name, source, contact and message", () => {
    const { subject, text } = buildLeadNotification(lead);
    expect(subject).toBe("Yeni talep (Bayilik): Ali Veli");
    expect(text).toContain("Kaynak: Bayilik");
    expect(text).toContain("Ad: Ali Veli");
    expect(text).toContain("E-posta: ali@example.test");
    expect(text).toContain("Telefon: +90 555 000 00 00");
    expect(text).toContain("Toptan fiyat\nlütfen arayın");
    expect(text).not.toMatch(/<[a-z]+/i);
  });
  it("saves the lead, answers 201 and sends the mail in the background to the fixed address only", async () => {
    const response = await post(lead);
    expect(response.status).toBe(201);
    expect(waitUntil).toHaveBeenCalledOnce();
    await waitUntil.mock.calls[0][0];
    const sent = mocks.send.mock.calls[0][0];
    expect(sent.to).toEqual({ email: "afina@example.test" });
    expect(sent.reply).toEqual({ email: "ali@example.test" });
    expect(sent.text).toContain("Ali Veli");
    expect((await query("select count(*) as n from leads")).rows[0]).toEqual({ n: 1 });
  });
  it("keeps the lead and the 201 answer when the mail fails, logging no personal data", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.send.mockRejectedValue(new Error("550 rejected ali@example.test"));
    const response = await post(lead);
    expect(response.status).toBe(201);
    await waitUntil.mock.calls[0][0];
    await flush();
    expect((await query("select count(*) as n from leads")).rows[0]).toEqual({ n: 1 });
    const logged = JSON.stringify(log.mock.calls);
    expect(logged).toContain("lead_notify_failed");
    for (const secret of ["ali@example.test", "Ali Veli", "secret-pass", "+90 555"]) expect(logged).not.toContain(secret);
  });
  it("keeps the lead and sends nothing when the password is missing (current behaviour)", async () => {
    vi.stubEnv("SMTP_PASSWORD", "");
    const response = await post(lead);
    expect(response.status).toBe(201);
    expect(waitUntil).not.toHaveBeenCalled();
    expect(mocks.connect).not.toHaveBeenCalled();
    expect((await query("select count(*) as n from leads")).rows[0]).toEqual({ n: 1 });
  });
  it("does not delay the answer when the SMTP connection hangs", async () => {
    mocks.connect.mockReturnValue(new Promise(() => {}));
    const response = await Promise.race([post(lead), new Promise<string>(resolve => setTimeout(() => resolve("slow"), 2000))]);
    expect(response).not.toBe("slow");
    expect((response as Response).status).toBe(201);
  });
  it("neutralises header injection in name and email without changing the recipient", async () => {
    await post({ ...lead, name: "Ali\r\nBcc: evil@example.test" });
    await waitUntil.mock.calls[0][0];
    const sent = mocks.send.mock.calls[0][0];
    expect(sent.subject).not.toMatch(/[\r\n]/);
    expect(sent.to).toEqual({ email: "afina@example.test" });
    expect(sent.headers.Subject).not.toMatch(/[\r\n]/);
  });
  it("sends nothing for honeypot submissions", async () => {
    expect((await post({ ...lead, website: "http://spam.test" })).status).toBe(201);
    expect(waitUntil).not.toHaveBeenCalled();
  });
});
