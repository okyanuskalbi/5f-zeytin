"use client";

import dynamic from "next/dynamic";
import { createContext, useContext, useState, type ReactNode } from "react";
const AuthDialog = dynamic(() =>
  import("./AuthDialog").then((module) => module.AuthDialog),
);
const MembershipDialogContext = createContext<
  ((trigger?: HTMLElement) => void) | null
>(null);
export const useMembershipDialog = () => useContext(MembershipDialogContext);

export function MembershipDialogProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [trigger, setTrigger] = useState<HTMLElement | null>(null);
  return (
    <MembershipDialogContext.Provider
      value={(element) => {
        setTrigger(
          element ??
            (document.activeElement instanceof HTMLElement
              ? document.activeElement
              : null),
        );
        setOpen(true);
      }}
    >
      {children}
      {open && <AuthDialog onClose={() => setOpen(false)} trigger={trigger} />}
    </MembershipDialogContext.Provider>
  );
}
