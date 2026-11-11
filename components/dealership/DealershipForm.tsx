import { businessTypes, outletCounts, outletCountLabels, dealershipLimits } from "@/lib/dealership/application";
import { DealershipFormClient } from "./DealershipFormClient";

/** Only small display configuration crosses into the browser. Validation stays
 * in the unchanged application module and is loaded when a draft is prepared. */
export function DealershipForm({ openDraft }: { openDraft?: (url: string) => void }) {
  return <DealershipFormClient openDraft={openDraft} configuration={{ businessTypes, outletCounts, outletCountLabels, dealershipLimits }} />;
}
