export function getAuthCookieOptions() {
  return { path: "/", sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", httpOnly: true };
}

export function safeAuthRedirect(path: string | null): string {
  return path && ["/hesabim", "/hesabim/siparisler", "/hesabim/adresler", "/hesabim/bilgilerim", "/hesabim/guvenlik", "/sepet", "/odeme"].includes(path) ? path : "/hesabim";
}
