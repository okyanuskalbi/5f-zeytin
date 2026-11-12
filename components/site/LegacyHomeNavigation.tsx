"use client";

import { useEffect } from "react";

const sections: Readonly<Record<string, string>> = {
  "#toptan-iletisim": "toptan-bayilik",
  "#hakkimizda": "hikayemiz", "#tesisimiz": "hikayemiz", "#kurumsal": "hikayemiz", "#uretim-yolculugu": "hikayemiz",
  "#kiler": "urunler", "#one-cikanlar": "urunler",
};

/** Historical entry points of the home page mapped to today's section ids; null when the address is current. */
export function legacyHomeSection(hash: string, search: string): string | null {
  if (Object.hasOwn(sections, hash)) return sections[hash];
  if (!hash && new URLSearchParams(search).get("magaza") === "ac") return "urunler";
  return null;
}

/** A URL fragment never reaches the server; old fragments are moved to their section in the browser. */
export function LegacyHomeNavigation(): null {
  useEffect(() => {
    const navigate = () => {
      const section = legacyHomeSection(window.location.hash, window.location.search);
      if (!section) return;
      const url = new URL(window.location.href);
      url.searchParams.delete("magaza");
      url.hash = section;
      window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
      document.getElementById(section)?.scrollIntoView();
    };
    navigate();
    window.addEventListener("hashchange", navigate);
    return () => window.removeEventListener("hashchange", navigate);
  }, []);
  return null;
}
