"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
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
        showCloseButton={false}
        onClick={(event) => {
          if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
          const link = event.target instanceof Element
            ? event.target.closest<HTMLAnchorElement>("a[href]")
            : null;
          if (!link || (link.target && link.target.toLowerCase() !== "_self")) return;
          // Next Link prevents the default browser navigation before this event
          // bubbles; same-tab client navigation must still dismiss the overlay.
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
        <div className={styles.dialogToolbar}>
          <span>AFİNA üyelik</span>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className={styles.dialogClose} aria-label="Kapat">
              <X aria-hidden="true" />
            </Button>
          </DialogClose>
        </div>
        <div className={styles.dialogBody} data-auth-dialog-body>
          <MembershipFrame mode={mode} onModeChange={setMode} embedded>
            {session === "loading" ? (
              <p role="status">Üyelik bilgileri yükleniyor…</p>
            ) : mode === "register" ? (
              <Register embedded onSignIn={() => setMode("login")} />
            ) : (
              <SignIn
                embedded
                onAuthenticated={onClose}
                signedIn={session === "member"}
                unavailable={session === "error"}
                onRegister={() => setMode("register")}
              />
            )}
          </MembershipFrame>
        </div>
      </DialogContent>
    </Dialog>
  );
}
