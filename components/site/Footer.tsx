import type { JSX } from "react";
import { Footerdemo } from "@/components/ui/footer-section";
import { siteContact } from "@/lib/site/contact";

/** Task165 mounts the user's footer component on the shared site layout. */
export function Footer(): JSX.Element {
  return <Footerdemo contact={siteContact} />;
}
