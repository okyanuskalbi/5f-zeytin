// @vitest-environment node
/** Runs the real sendMail and the real worker-mailer against an in-memory SMTP server and checks the bytes on the wire. */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildLeadNotification } from "@/lib/mail/lead-notify";
import { sendMail } from "@/lib/mail/send";
import { decodeMime, fakeSmtp, wire } from "../helpers/fake-smtp";

vi.mock("server-only", () => ({}));
vi.mock("worker-mailer", async () => (await import("../helpers/fake-smtp")).loadRealWorkerMailer());

const env = { SMTP_HOST: "mail.example.test", SMTP_PORT: "465", SMTP_SECURE: "true", SMTP_USER: "site@example.com", SMTP_PASSWORD: "test-only", MAIL_FROM: "AFİNA ZEYTİN <site@example.com>" };
const turkish = "Çağrı İğdeli Şükrü Öztürk ışıl ILIK";
const crlf = (value: string) => value.replace(/\r\n?|\n/g, "\r\n");

beforeEach(() => {
  for (const [name, value] of Object.entries(env)) vi.stubEnv(name, value);
  vi.stubGlobal("__fakeSmtpConnect", fakeSmtp);
  wire.data = "";
});
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe("220 MIME on the wire (real worker-mailer 1.3.1)", () => {
  it("sends text and HTML as multipart/alternative, UTF-8 quoted-printable, with safe line lengths", async () => {
    const input = {
      name: turkish, email: "ornek@example.com", phone: null, source: "iletisim",
      message: `${turkish}\n.\n.gizli satır\nA = B =3D \t \n${"ğ".repeat(1500)}\n${"x".repeat(2000)}`,
    };
    const mail = buildLeadNotification(input);
    await sendMail({ to: "alici@example.com", ...mail });

    const mime = decodeMime(wire.data);
    expect(mime.ascii).toBe(true);
    expect(mime.bareLineBreaks).toBe(false);
    expect(mime.longestLine).toBeLessThanOrEqual(998);
    expect(mime.longestBodyLine).toBeLessThanOrEqual(76);
    expect(mime.parts.map(part => part.type)).toEqual(['text/plain; charset="UTF-8"', 'text/html; charset="UTF-8"']);
    expect(mime.parts.map(part => part.encoding)).toEqual(["quoted-printable", "quoted-printable"]);
    expect(mime.parts[0].content).toBe(crlf(mail.text));
    expect(mime.parts[1].content).toBe(crlf(mail.html));
    expect(mime.parts[1].content).toContain(turkish);
    expect(mime.subject).toBe(mail.subject);
  });

  it("does not cut the HTML in half when it is longer than the 20,000 character text limit", async () => {
    const mail = buildLeadNotification({ name: "Örnek Kişi", email: null, phone: null, source: "teklif", message: '"'.repeat(4000) });
    expect(mail.html.length).toBeGreaterThan(20_000);
    await sendMail({ to: "alici@example.com", ...mail });
    const [, html] = decodeMime(wire.data).parts;
    expect(html.content).toBe(crlf(mail.html));
    expect(html.content.trimEnd().endsWith("</html>")).toBe(true);
  });

  it("drops an oversized HTML part entirely instead of truncating it, keeping the text", async () => {
    await sendMail({ to: "alici@example.com", subject: "x", text: "düz metin", html: `<!doctype html><p>${"a".repeat(100_000)}</p>` });
    const mime = decodeMime(wire.data);
    expect(mime.parts.map(part => part.type)).toEqual(['text/plain; charset="UTF-8"']);
    expect(mime.parts[0].content).toBe("düz metin");
  });

  it("strips control characters from the HTML part", async () => {
    await sendMail({ to: "alici@example.com", subject: "x", text: "y", html: "<p>a\u0000b\u0007c\u007f</p>\rd" });
    expect(decodeMime(wire.data).parts[1].content).toBe("<p>abc</p>\r\nd");
  });
});
