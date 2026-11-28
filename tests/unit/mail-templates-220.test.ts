import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { buildAuthEmail, type AuthEmailKind } from "@/lib/auth/email";
import { buildLeadNotification } from "@/lib/mail/lead-notify";
import { escapeHtml } from "@/lib/mail/template";
import { contrastFailures, parseEmail } from "../helpers/email-html";

vi.mock("server-only", () => ({}));

const logo = "https://afinazeytin.com/email/afina-zeytin-logo.png";
const panel = "https://afinazeytin.com/panel/leadler";
const authUrl = "https://afinazeytin.com/api/auth/verify-email?token=ornek-1&callbackURL=%2Fhesabim";

const hostile = {
  name: `<script>alert(1)</script> "Ad" & 'Soyad'`,
  email: `x"><img/src=x/onerror=alert(2)>@example.com`,
  phone: `"><img src=x onerror=alert(3)>`,
  message: `birinci & satır\r\n<script>alert(4)</script>\n</td></table>"\r<img src=x onerror=alert(5)>`,
  source: "<script>alert(6)</script>",
};

const lead = {
  name: "Örnek Kişi", email: "ornek@example.com", phone: "+90 555 000 00 00",
  message: "Toptan fiyat\nlütfen arayın", source: "bayilik",
};

const allEmails = () => [
  ...(["verify", "reset", "magic"] as const).map(kind => buildAuthEmail(kind, authUrl).html),
  buildLeadNotification(lead).html,
];

function expectInert(html: string, allowedLinks: string[]) {
  const document = parseEmail(html);
  expect(document.querySelectorAll("script, iframe, form, input, link, style, svg, object")).toHaveLength(0);
  expect([...document.querySelectorAll("img")].map(img => img.getAttribute("src"))).toEqual([logo]);
  for (const element of document.querySelectorAll("*")) {
    for (const attribute of element.getAttributeNames()) expect(attribute.startsWith("on"), attribute).toBe(false);
  }
  for (const link of document.querySelectorAll("a")) expect(allowedLinks).toContain(link.getAttribute("href"));
}

describe("220 escapeHtml", () => {
  it("escapes the five characters that can leave a text or attribute context", () => {
    expect(escapeHtml(`& < > " '`)).toBe("&amp; &lt; &gt; &quot; &#39;");
    expect(escapeHtml("&amp;")).toBe("&amp;amp;");
    expect(escapeHtml("Çağrı Işık İğde Öz Şükrü")).toBe("Çağrı Işık İğde Öz Şükrü");
  });
});

describe("220 lead notification HTML", () => {
  it("shows every hostile visitor value as inert text", () => {
    const { html } = buildLeadNotification(hostile);
    expectInert(html, [panel, "https://afinazeytin.com"]);
    expect(html).not.toMatch(/<script|<img[^>]*onerror/i);
    const document = parseEmail(html);
    const values = [...document.querySelectorAll("[data-field]")].map(cell => [cell.getAttribute("data-field"), cell.textContent]);
    expect(values).toEqual([["Kaynak", "Form"], ["Ad", hostile.name], ["E-posta", hostile.email], ["Telefon", hostile.phone]]);
    const message = document.querySelector("[data-message]")!;
    expect(message.querySelectorAll("*:not(br)")).toHaveLength(0);
    expect(message.querySelectorAll("br")).toHaveLength(3);
    expect(message.textContent).toBe(hostile.message.replace(/\r\n|\r|\n/g, ""));
  });

  it("never places a visitor value inside an attribute and never makes it clickable", () => {
    const marked = { name: "ZZAD", email: "zzeposta@example.com", phone: "ZZTEL", message: "ZZMESAJ https://zzlink.example.com", source: "iletisim" };
    const document = parseEmail(buildLeadNotification(marked).html);
    for (const element of document.querySelectorAll("*")) {
      for (const attribute of element.getAttributeNames()) expect(element.getAttribute(attribute)).not.toMatch(/zz/i);
    }
    for (const link of document.querySelectorAll("a")) expect(link.textContent).not.toMatch(/zz/i);
  });

  it("keeps labels, message box and one panel button, and skips empty optional fields", () => {
    const document = parseEmail(buildLeadNotification({ ...lead, email: null, phone: null, message: "" }).html);
    expect([...document.querySelectorAll("[data-field]")].map(cell => cell.getAttribute("data-field"))).toEqual(["Kaynak", "Ad"]);
    expect(document.querySelector("[data-message]")).toBeNull();
    const buttons = document.querySelectorAll("a[data-action]");
    expect(buttons).toHaveLength(1);
    expect(buttons[0].getAttribute("href")).toBe(panel);
    expect(buttons[0].textContent).toContain("Panelde gör");
    expect(document.body.textContent).toContain("AFİNA ZEYTİN sitesinden yeni bir talep geldi.");
  });

  it("keeps the plain text version and subject exactly as before", () => {
    const { subject, text } = buildLeadNotification(lead);
    expect(subject).toBe("Yeni talep (Bayilik): Örnek Kişi");
    expect(text).toBe([
      "AFİNA ZEYTİN sitesinden yeni bir talep geldi.", "", "Kaynak: Bayilik", "Ad: Örnek Kişi",
      "E-posta: ornek@example.com", "Telefon: +90 555 000 00 00", "", "Mesaj:", "Toptan fiyat\nlütfen arayın",
      "", `Talebi panelden görebilirsiniz: ${panel}`,
    ].join("\n"));
  });
});

describe("220 account email HTML", () => {
  const expected: Record<AuthEmailKind, { subject: string; title: string; button: string; lead: string }> = {
    verify: { subject: "AFİNA ZEYTİN e-posta doğrulama", title: "E-posta adresinizi doğrulayın", button: "E-postamı doğrula", lead: "E-posta adresinizi doğrulamak için" },
    reset: { subject: "AFİNA ZEYTİN şifre sıfırlama", title: "Şifrenizi yenileyin", button: "Şifremi yenile", lead: "Şifrenizi yenilemek için" },
    magic: { subject: "AFİNA ZEYTİN giriş bağlantısı", title: "Hesabınıza giriş yapın", button: "Giriş yap", lead: "Hesabınıza giriş yapmak için" },
  };

  it.each(Object.keys(expected) as AuthEmailKind[])("%s: one title, one button, copyable link and security note", kind => {
    const mail = buildAuthEmail(kind, authUrl);
    expect(mail.subject).toBe(expected[kind].subject);
    expectInert(mail.html, [authUrl, "https://afinazeytin.com"]);
    const document = parseEmail(mail.html);
    expect([...document.querySelectorAll("h1")].map(node => node.textContent)).toEqual([expected[kind].title]);
    const buttons = document.querySelectorAll("a[data-action]");
    expect(buttons).toHaveLength(1);
    expect(buttons[0].getAttribute("href")).toBe(authUrl);
    expect(buttons[0].textContent).toContain(expected[kind].button);
    expect(document.querySelector("a[data-fallback]")!.textContent).toBe(authUrl);
    const body = document.body.textContent!;
    expect(body).toContain(expected[kind].lead);
    expect(body).toContain("Düğme çalışmazsa");
    expect(body).toContain("Bu bağlantı kısa süre geçerlidir. Bu işlemi siz başlatmadıysanız bu e-postayı dikkate almayın.");
    expect(mail.text).toContain(authUrl);
    expect(mail.text.endsWith("Bu bağlantı kısa süre geçerlidir. Bu işlemi siz başlatmadıysanız bu e-postayı dikkate almayın.\n\nAFİNA ZEYTİN\nhttps://afinazeytin.com")).toBe(true);
  });

  it("escapes a link that tries to leave the href attribute", () => {
    const url = `https://example.com/?a=1&b="><script>alert(1)</script>'`;
    const { html } = buildAuthEmail("magic", url);
    expectInert(html, [url, "https://afinazeytin.com"]);
    expect(html).not.toContain("<script");
    expect(parseEmail(html).querySelector("a[data-action]")!.getAttribute("href")).toBe(url);
  });
});

describe("220 mail client compatibility", () => {
  it("uses inline-styled tables, at most 600px, with no external assets or scripts", () => {
    for (const html of allEmails()) {
      expect(html).toMatch(/^<!doctype html>/);
      expect(html).toContain('<html lang="tr">');
      expect(html).toContain('<meta charset="utf-8">');
      expect(html).toContain("max-width:600px");
      expect(html).not.toMatch(/<script|<link|<style|@import|url\(|javascript:|<svg|display:\s*(flex|grid)/i);
      const images = parseEmail(html).querySelectorAll("img");
      expect(images).toHaveLength(1);
      expect(images[0].getAttribute("src")).toBe(logo);
      expect(images[0].getAttribute("alt")).toBe("AFİNA ZEYTİN");
      expect(images[0].getAttribute("width")).toBe("196");
      for (const table of parseEmail(html).querySelectorAll("table")) expect(table.getAttribute("role")).toBe("presentation");
    }
  });

  it("states colours explicitly with at least 4.5:1 contrast for every text", () => {
    for (const html of allEmails()) expect(contrastFailures(html)).toEqual([]);
  });

  it("serves the logo as a small PNG from the public folder", () => {
    const png = readFileSync(path.resolve("public/email/afina-zeytin-logo.png"));
    expect(png.subarray(1, 4).toString("ascii")).toBe("PNG");
    expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([392, 128]);
    expect(png.length).toBeLessThan(40_000);
  });
});
