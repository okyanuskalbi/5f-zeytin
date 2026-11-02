import type { JSX } from "react";
import { Footerdemo } from "@/components/ui/footer-section";
import { siteContact } from "@/lib/site/contact";

/** Task170 mounts the compact 21st-derived footer on the shared site layout. */
export function Footer(): JSX.Element {
  return <Footerdemo contact={siteContact} />;
}
