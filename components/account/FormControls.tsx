"use client";

import { useRef, useState, type InputHTMLAttributes } from "react";
import { Input } from "@/components/ui/input";
import { MembershipError } from "@/lib/auth/adapter";
import styles from "./Membership.module.css";

export function useMembershipAction() {
  const lock = useRef(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState({ error: false, message: "" });
  async function run(action: () => Promise<string | void>) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true); setErrors({}); setFeedback({ error: false, message: "" });
    try {
      const message = await action();
      if (message) setFeedback({ error: false, message });
    } catch (error) {
      const known = error instanceof MembershipError;
      const fields = known ? error.fields : {};
      setErrors(fields);
      setFeedback({ error: true, message: [known ? error.message : "İşlem tamamlanamadı. Lütfen yeniden deneyin.", ...Object.values(fields)].join(" ") });
      const first = Object.keys(fields)[0];
      if (first) requestAnimationFrame(() => document.querySelector<HTMLElement>(`[name="${first}"][aria-invalid="true"]`)?.focus());
    } finally { lock.current = false; setBusy(false); }
  }
  return { busy, errors, feedback, run };
}

export function Field({ label, error, id, hint, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; hint?: string; id: string }) {
  return <div className={styles.field}>
    <label htmlFor={id}>{label}</label>
    <Input id={id} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined} {...props} />
    {hint && <small id={`${id}-hint`} className={styles.muted}>{hint}</small>}
    {error && <small id={`${id}-error`} className={styles.error}>{error}</small>}
  </div>;
}

export function Feedback({ error, message }: { error: boolean; message: string }) {
  return <p role={error ? "alert" : "status"} aria-live={error ? "assertive" : "polite"} aria-atomic="true" className={`${styles.feedback} ${error ? styles.error : ""}`}>{message}</p>;
}

export function DemoNotice() {
  return <p className={styles.demo}><strong>Demo üyelik.</strong> Gerçek hesap veya Google bağlantısı yok. Örnek bilgiler kullanın. Veriler bu sekmede saklanır.</p>;
}
