export type LeadPayload = { name: string; email?: string; phone?: string; message: string; source: "iletisim" | "bayilik" | "teklif" };

/** Form kaydını sessizce sunucuya iletir (D1 `leads`). E-posta taslağı akışını hiçbir zaman engellemez: hata sessizce yutulur. */
export async function sendLead(payload: LeadPayload): Promise<boolean> {
  try {
    if (typeof fetch !== "function") return false;
    const response = await fetch("/api/contact", {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...payload, website: "" }),
      keepalive: true, signal: AbortSignal.timeout(8000),
    });
    return response.ok;
  } catch { return false; }
}
