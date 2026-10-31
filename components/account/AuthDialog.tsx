"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { MembershipFrame } from "./MembershipFrame";
import { SignIn } from "./SignIn";
import { Register } from "./Register";
import styles from "./CustomerPanel.module.css";

// 21st Auth Modal (20038), using installed Radix focus/escape/scroll management.
export function AuthDialog({
  onClose,
  trigger,
}: {
  onClose: () => void;
  trigger?: HTMLElement | null;
}) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [session, setSession] = useState<
    "loading" | "guest" | "member" | "error"
  >("loading");
  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/account", {
      credentials: "same-origin",
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (response.status === 401) return "guest" as const;
        const body = await response.json().catch(() => null);
        return response.ok && body?.data && typeof body.data === "object"
          ? ("member" as const)
          : ("error" as const);
      })
      .then((value) => {
        if (!controller.signal.aborted) setSession(value);
      })
      .catch(() => {
        if (!controller.signal.aborted) setSession("error");
      });
    return () => controller.abort();
  }, []);
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        onClick={(event) => {
          if (
            event.target instanceof Element &&
            event.target.closest("a[href]")
          )
            onClose();
        }}
        className={styles.dialog}
        onCloseAutoFocus={(event) => {
          if (trigger?.isConnected) {
            event.preventDefault();
            trigger.focus();
          }
        }}
      >
        <DialogTitle className="sr-only">AFİNA üyelik</DialogTitle>
        <DialogDescription className="sr-only">
          Hesabınıza giriş yapın veya hesap oluşturun. Misafir olarak alışverişe
          devam edebilirsiniz.
        </DialogDescription>
        <MembershipFrame mode={mode} onModeChange={setMode} embedded>
          {session === "loading" ? (
            <p role="status">Üyelik bilgileri yükleniyor…</p>
          ) : mode === "register" ? (
            <Register embedded />
          ) : (
            <SignIn
              embedded
              onAuthenticated={onClose}
              signedIn={session === "member"}
              unavailable={session === "error"}
            />
          )}
        </MembershipFrame>
      </DialogContent>
    </Dialog>
  );
}
