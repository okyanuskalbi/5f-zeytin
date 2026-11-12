"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { announceSearchChange } from "./location-search";

/** Menu and footer links change the query through the router; this passes the change on. Renders nothing. */
export function SearchSync(): null {
  const search = useSearchParams().toString();
  useEffect(() => { announceSearchChange(); }, [search]);
  return null;
}
