import React from "react";
import { createRoot } from "react-dom/client";
import { AppRouterContext, type AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { AdminShell, type AdminOverview } from "../../../components/admin/AdminShell";
import "../../../app/globals.css";

// Test-only client rendering; no session creation or production auth bypass.
const status = new URLSearchParams(window.location.search).get("status");
const root = createRoot(document.getElementById("root")!);
const router: AppRouterInstance = {
  bfcacheId: "admin-shell-fixture", back: () => {}, forward: () => {}, prefetch: () => {},
  refresh: () => render(), push: () => {}, replace: () => {},
};
function render(overview?: AdminOverview) {
  root.render(<AppRouterContext.Provider value={router}><AdminShell overview={overview} /></AppRouterContext.Provider>);
}
render(status === "error" || status === "loading" || status === "empty" ? { status } : undefined);
