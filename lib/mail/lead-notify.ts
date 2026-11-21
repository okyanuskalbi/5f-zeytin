import "server-only";
import { leadSourceLabels, type LeadInput } from "@/lib/contracts/admin-panel";
import { cleanHeader, getMailConfig, runInBackground, sendMail } from "./send";

export function buildLeadNotification(input: LeadInput): { subject: string; text: string } {
  const source = leadSourceLabels[input.source] ?? "Form";
  const lines = [
    "AFİNA ZEYTİN sitesinden yeni bir talep geldi.", "",
    `Kaynak: ${source}`, `Ad: ${cleanHeader(input.name, 200)}`,
    ...(input.email ? [`E-posta: ${cleanHeader(input.email, 254)}`] : []),
    ...(input.phone ? [`Telefon: ${cleanHeader(input.phone, 40)}`] : []),
    ...(input.message ? ["", "Mesaj:", input.message.slice(0, 4000)] : []),
    "", "Talebi panelden görebilirsiniz: https://afinazeytin.com/panel/leadler",
  ];
  return { subject: `Yeni talep (${source}): ${cleanHeader(input.name, 60)}`, text: lines.join("\n") };
}

/** Yeni talep bildirimi. Alıcı yalnız LEAD_NOTIFY_TO'dur; ayar yoksa hiçbir şey yapılmaz. Kayıt akışını asla bekletmez. */
export function notifyNewLead(input: LeadInput): void {
  const config = getMailConfig();
  if (!config?.leadNotifyTo) return;
  const to = config.leadNotifyTo;
  const { subject, text } = buildLeadNotification(input);
  runInBackground("lead_notify", () => sendMail({ to, subject, text, replyTo: input.email }));
}
