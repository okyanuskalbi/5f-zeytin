/**
 * Markalı HTML e-posta (docs/DESIGN.md "Altın Dal"): tablo düzeni, satır içi stil, en çok 600 px.
 * Ham HTML kabul edilmez: içerikteki her metin ve bağlantı escapeHtml'den geçerek yazılır.
 */
const siteUrl = "https://afinazeytin.com";
const logoUrl = `${siteUrl}/email/afina-zeytin-logo.png`;

const color = {
  green: "#243A29", ivory: "#F5F1E7", paper: "#FFFDF8", sage: "#E7EBDD", gold: "#D4B483",
  goldDeep: "#80602D", ink: "#202A22", muted: "#586052", line: "#D7D7C9",
} as const;
const display = "'Cormorant Garamond',Cormorant,Georgia,'Times New Roman',serif";
const body = "Montserrat,'Avenir Next','Segoe UI',Helvetica,Arial,sans-serif";
const wrap = "word-break:break-word;overflow-wrap:anywhere;";
const table = 'role="presentation" cellpadding="0" cellspacing="0" border="0"';

const entities: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, character => entities[character]);
}

/** Satır sonları kaçıştan sonra işlenir; böylece eklenen tek etiket <br> olur. */
const multiline = (value: string) => escapeHtml(value).replace(/\r\n|\r|\n/g, "<br>");

export type EmailContent = {
  title: string;
  lead: string;
  /** Etiket/değer satırları. Değerler ziyaretçiden gelebilir: yalnız metin olarak yazılır, bağlantı yapılmaz. */
  details?: readonly (readonly [label: string, value: string])[];
  message?: { label: string; text: string };
  action: { label: string; url: string };
  note?: string;
};

function detailRows(details: NonNullable<EmailContent["details"]>): string {
  const rows = details.map(([label, value]) => `<tr>
<td width="76" valign="top" style="width:76px;padding:11px 8px 11px 0;border-top:1px solid ${color.line};font-family:${body};font-size:13px;line-height:22px;color:${color.muted};">${escapeHtml(label)}</td>
<td valign="top" data-field="${escapeHtml(label)}" style="padding:11px 0;border-top:1px solid ${color.line};font-family:${body};font-size:15px;line-height:22px;color:${color.ink};${wrap}">${escapeHtml(value)}</td>
</tr>`).join("\n");
  return `<table ${table} width="100%" style="width:100%;margin-top:24px;table-layout:fixed;">
${rows}
</table>`;
}

function messageBox({ label, text }: NonNullable<EmailContent["message"]>): string {
  return `<table ${table} width="100%" style="width:100%;margin-top:16px;table-layout:fixed;">
<tr><td bgcolor="${color.sage}" style="padding:16px 18px 18px;background-color:${color.sage};border-radius:12px;">
<div style="font-family:${body};font-size:13px;line-height:20px;color:${color.muted};">${escapeHtml(label)}</div>
<div data-message style="margin-top:6px;font-family:${body};font-size:15px;line-height:25px;color:${color.ink};${wrap}">${multiline(text)}</div>
</td></tr>
</table>`;
}

/** Sitenin imza düğmesi: yeşil hap, sağ ucunda altın madalyon. Köşeyi tanımayan istemcide düz düğme kalır. */
function button({ label, url }: EmailContent["action"]): string {
  return `<table ${table} style="margin-top:28px;border-collapse:separate;">
<tr><td bgcolor="${color.green}" style="background-color:${color.green};border-radius:999px;">
<a data-action href="${escapeHtml(url)}" target="_blank" style="display:inline-block;padding:8px 8px 8px 24px;font-family:${body};font-size:15px;font-weight:600;line-height:36px;color:${color.ivory};text-decoration:none;white-space:nowrap;border-radius:999px;">${escapeHtml(label)}<span aria-hidden="true" style="display:inline-block;width:36px;height:36px;margin-left:16px;border-radius:18px;background-color:${color.gold};color:${color.green};font-family:Arial,sans-serif;font-size:18px;font-weight:700;line-height:36px;text-align:center;vertical-align:top;">&#8594;</span></a>
</td></tr>
</table>`;
}

function fallbackLink(url: string): string {
  const safe = escapeHtml(url);
  return `<p style="margin:24px 0 0;font-family:${body};font-size:13px;line-height:21px;color:${color.muted};">Düğme çalışmazsa bu bağlantıyı kopyalayıp tarayıcınıza yapıştırın:</p>
<p style="margin:4px 0 0;font-family:${body};font-size:13px;line-height:21px;word-break:break-all;overflow-wrap:anywhere;"><a data-fallback href="${safe}" target="_blank" style="color:${color.goldDeep};text-decoration:underline;word-break:break-all;">${safe}</a></p>`;
}

const noteBlock = (note: string) =>
  `<p style="margin:24px 0 0;padding-top:20px;border-top:1px solid ${color.line};font-family:${body};font-size:13px;line-height:21px;color:${color.muted};">${escapeHtml(note)}</p>`;

export function renderEmail(content: EmailContent): string {
  const title = escapeHtml(content.title);
  const blocks = [
    `<h1 style="margin:0;font-family:${display};font-size:28px;font-weight:400;line-height:34px;color:${color.green};">${title}</h1>`,
    `<p style="margin:12px 0 0;font-family:${body};font-size:16px;line-height:26px;color:${color.ink};">${escapeHtml(content.lead)}</p>`,
    content.details?.length ? detailRows(content.details) : "",
    content.message ? messageBox(content.message) : "",
    button(content.action),
    fallbackLink(content.action.url),
    content.note ? noteBlock(content.note) : "",
  ].filter(Boolean).join("\n");

  return `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:${color.ivory};">
<table ${table} width="100%" bgcolor="${color.ivory}" style="width:100%;background-color:${color.ivory};">
<tr><td align="center" style="padding:24px 12px;">
<!--[if mso]><table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
<table ${table} width="100%" style="width:100%;max-width:600px;table-layout:fixed;border-collapse:separate;text-align:left;">
<tr><td bgcolor="${color.paper}" style="padding:12px;background-color:${color.paper};border:1px solid ${color.line};border-radius:24px 24px 0 0;">
<img src="${logoUrl}" alt="AFİNA ZEYTİN" width="196" height="64" style="display:block;width:196px;height:64px;border:0;font-family:${display};font-size:20px;line-height:64px;color:${color.green};">
</td></tr>
<tr><td bgcolor="${color.paper}" style="padding:30px 20px 32px;background-color:${color.paper};border-left:1px solid ${color.line};border-right:1px solid ${color.line};">
${blocks}
</td></tr>
<tr><td bgcolor="${color.green}" style="padding:22px 20px 24px;background-color:${color.green};border-radius:0 0 24px 24px;">
<div style="font-family:${display};font-size:20px;line-height:26px;color:${color.ivory};">AFİNA ZEYTİN</div>
<div style="margin-top:4px;font-family:${body};font-size:13px;line-height:20px;"><a href="${siteUrl}" target="_blank" style="color:${color.gold};text-decoration:underline;">afinazeytin.com</a></div>
</td></tr>
</table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr>
</table>
</body>
</html>
`;
}
