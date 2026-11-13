"use client";

import { useSyncExternalStore } from "react";

const SEARCH_EVENT = "afina:search";

function subscribe(notify: () => void): () => void {
  window.addEventListener("popstate", notify);
  window.addEventListener("hashchange", notify);
  window.addEventListener(SEARCH_EVENT, notify);
  return () => {
    window.removeEventListener("popstate", notify);
    window.removeEventListener("hashchange", notify);
    window.removeEventListener(SEARCH_EVENT, notify);
  };
}
const browserSearch = (): string => window.location.search;
const browserHash = (): string => window.location.hash;
const serverSearch = (): string => "";

/** The address bar's query, read after hydration so the landing page itself stays static. */
export function useLocationSearch(): string {
  return useSyncExternalStore(subscribe, browserSearch, serverSearch);
}

/** The address bar's fragment (`#toptan`), read after hydration like the query. */
export function useLocationHash(): string {
  return useSyncExternalStore(subscribe, browserHash, serverSearch);
}

/** Tells the sections that the query changed without a browser history event (router navigation). */
export function announceSearchChange(): void {
  window.dispatchEvent(new Event(SEARCH_EVENT));
}

/** Keeps a pill choice shareable: the query changes in place, the page neither reloads nor scrolls. */
export function replaceSearchParam(key: string, value: string | null): void {
  const url = new URL(window.location.href);
  if (value) url.searchParams.set(key, value);
  else url.searchParams.delete(key);
  window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
  announceSearchChange();
}
