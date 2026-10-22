import React from "react";
import { createRoot } from "react-dom/client";
import { AppRouterContext, type AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { AccountSummary } from "../../../components/account/AccountSummary";
import { Account } from "../../../components/account/Account";
import "../../../app/globals.css";

// Test-only rendering; these props never pass through the production auth gate.
const query = new URLSearchParams(window.location.search);
const unavailable = query.has("unavailable");
const demo = query.has("demo");
const profile = { name: "Deniz Sofra", email: "deniz@example.test", phone: "05321234567" };
const root = createRoot(document.getElementById("root")!);
const router: AppRouterInstance = {
  bfcacheId: "account-fixture", back: () => {}, forward: () => {}, prefetch: () => {},
  refresh: () => { if (unavailable) render(false); },
  push: url => window.history.pushState(null, "", url),
  replace: url => window.history.replaceState(null, "", url),
};
function render(failed = unavailable) {
  root.render(<AppRouterContext.Provider value={router}>{demo ? <Account /> : <AccountSummary profile={failed ? null : profile} />}</AppRouterContext.Provider>);
}
render();
