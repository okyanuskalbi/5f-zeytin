import "server-only";
import { leadSourceLabels, type LeadInput } from "@/lib/contracts/admin-panel";
import { cleanHeader, getMailConfig, runInBackground, sendMail } from "./send";
import { renderEmail } from "./template";

const panelUrl = "https://afinazeytin.com/panel/leadler";
const intro = "AFİNA ZEYTİN sitesinden yeni bir talep geldi.";

export function buildLeadNotification(input: LeadInput): { subject: string; text: string; html: string } {
  const source = leadSourceLabels[input.source] ?? "Form";
  const details: [string, string][] = [
    ["Kaynak", source], ["Ad", cleanHeader(input.name, 200)],
    ...(input.email ? [["E-posta", cleanHeader(input.email, 254)] as [string, string]] : []),
    ...(input.phone ? [["Telefon", cleanHeader(input.phone, 40)] as [string, string]] : []),
  ];
  const message = input.message.slice(0, 4000);
  const text = [
    intro, "", ...details.map(([label, value]) => `${label}: ${value}`),
    ...(message ? ["", "Mesaj:", message] : []),
    "", `Talebi panelden görebilirsiniz: ${panelUrl}`,
  ].join("\n");
  const html = renderEmail({
    title: "Yeni talep", lead: intro, details,
    ...(message ? { message: { label: "Mesaj", text: message } } : {}),
    action: { label: "Panelde gör", url: panelUrl },
  });
  return { subject: `Yeni talep (${source}): ${cleanHeader(input.name, 60)}`, text, html };
}

/** Yeni talep bildirimi. Alıcı yalnız LEAD_NOTIFY_TO'dur; ayar yoksa hiçbir şey yapılmaz. Kayıt akışını asla bekletmez. */
export function notifyNewLead(input: LeadInput): void {
  const config = getMailConfig();
  if (!config?.leadNotifyTo) return;
  const to = config.leadNotifyTo;
  const mail = buildLeadNotification(input);
  runInBackground("lead_notify", () => sendMail({ to, ...mail, replyTo: input.email }));
}
