import "server-only";
import nodemailer from "nodemailer";

export class EmailUnavailableError extends Error {
  constructor() { super("email_not_configured"); }
}

export function assertAuthEmailConfigured() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM } = process.env;
  if (!SMTP_HOST?.trim() || !SMTP_USER?.trim() || !SMTP_PASSWORD || !SMTP_FROM?.trim() || !/^\d+$/.test(SMTP_PORT ?? "") || Number(SMTP_PORT) < 1 || Number(SMTP_PORT) > 65535) throw new EmailUnavailableError();
}

/** No preview/log fallback: a missing or refused SMTP service is a failure. */
export async function sendAuthEmail(input: { to: string; url: string; subject: string }) {
  assertAuthEmailConfigured();
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT), secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASSWORD! },
    requireTLS: Number(process.env.SMTP_PORT) !== 465,
    connectionTimeout: 5000, greetingTimeout: 5000, socketTimeout: 10000,
  });
  try {
    const result = await transport.sendMail({ from: process.env.SMTP_FROM, to: input.to, subject: input.subject, text: `AFİNA üyelik işleminizi bu bağlantıyla tamamlayın:\n${input.url}\n\nBu işlemi siz başlatmadıysanız bu e-postayı dikkate almayın.` });
    if (!result.accepted.length || result.rejected.length) throw new Error("email_delivery_failed");
  } finally { transport.close(); }
}
