"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import styles from "./AdminShell.module.css";

/** Çıkış: hesabım sayfasıyla aynı yol (POST /auth/logout, 204). Yetki kuralları sunucuda kalır. */
export function AdminSignOut() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function signOut() {
    setBusy(true); setError("");
    try {
      const response = await fetch("/auth/logout", { method: "POST", credentials: "same-origin" });
      if (response.status !== 204) throw new Error();
      router.replace("/giris");
      router.refresh();
    } catch {
      setError("Çıkış yapılamadı. Lütfen yeniden deneyin.");
      setBusy(false);
    }
  }

  return <div className={styles.signOutWrap}>
    <button type="button" className={styles.signOut} disabled={busy} aria-busy={busy} onClick={() => void signOut()}>
      <LogOut aria-hidden="true" />{busy ? "Çıkış yapılıyor…" : "Çıkış yap"}
    </button>
    {error && <p role="alert" className={styles.signOutError}>{error}</p>}
  </div>;
}
