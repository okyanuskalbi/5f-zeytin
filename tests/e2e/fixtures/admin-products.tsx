import React from "react";
import { createRoot } from "react-dom/client";
import { AppRouterContext, type AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { AdminShell } from "../../../components/admin/AdminShell";
import { ProductManager } from "../../../components/admin/ProductManager";
import "../../../app/globals.css";

// Client-only test fixture. No auth cookie, database or production bypass.
const router: AppRouterInstance = {
  bfcacheId: "admin-products-fixture", back: () => {}, forward: () => {}, prefetch: () => {},
  refresh: () => {}, push: () => {}, replace: () => {},
};
createRoot(document.getElementById("root")!).render(<AppRouterContext.Provider value={router}>
  <AdminShell area="admin-urunler"><ProductManager /></AdminShell>
</AppRouterContext.Provider>);
