import React from "react";
import { createRoot } from "react-dom/client";
import { AppRouterContext, type AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { SignIn } from "../../../components/account/SignIn";
import "../../../app/globals.css";

// Fixture navigation retains the component after logout for UI assertions.
const router: AppRouterInstance = {
  bfcacheId: "login-fixture", back: () => {}, forward: () => {}, refresh: () => {},
  prefetch: () => {},
  push: url => window.history.pushState(null, "", url),
  replace: url => window.history.replaceState(null, "", url),
};
createRoot(document.getElementById("root")!).render(<AppRouterContext.Provider value={router}><SignIn signedIn /></AppRouterContext.Provider>);
