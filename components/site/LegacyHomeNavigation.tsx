"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const destinations: Readonly<Record<string, string>> = {
  "#toptan": "/toptan-satis", "#teklif": "/toptan-satis", "#toptan-iletisim": "/toptan-satis",
  "#hakkimizda": "/hakkimizda", "#tesisimiz": "/hakkimizda", "#kurumsal": "/hakkimizda", "#uretim-yolculugu": "/hakkimizda",
  "#iletisim": "/hakkimizda#iletisim", "#sik-sorulanlar": "/hakkimizda#sik-sorulanlar",
};

/** A URL fragment never reaches the server; preserve historical entry points in the browser. */
export function legacyHomeDestination(hash: string, search: string): string | null {
  if (!Object.hasOwn(destinations, hash)) return null;
  const destination = new URL(destinations[hash], "https://afinazeytin.com");
  destination.search = search;
  return `${destination.pathname}${destination.search}${destination.hash}`;
}

export function LegacyHomeNavigation(): null {
  const router = useRouter();
  useEffect(() => {
    const navigate = () => {
      const target = legacyHomeDestination(window.location.hash, window.location.search);
      if (target) router.replace(target);
    };
    navigate();
    window.addEventListener("hashchange", navigate);
    return () => window.removeEventListener("hashchange", navigate);
  }, [router]);
  return null;
}
