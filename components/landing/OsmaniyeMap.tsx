import type { JSX } from "react";
import map from "@/lib/geo/osmaniye.json";

// Real province boundary, locally projected; attribution and share-alike
// terms: public/maps/osmaniye-license.txt. The dot marks the town, not the factory.
export function OsmaniyeMap({ className }: { className?: string }): JSX.Element {
  return (
    <svg className={className} viewBox="0 0 320 240" width="320" height="240" role="img" aria-labelledby="osmaniye-map-title" aria-describedby="osmaniye-map-desc">
      <title id="osmaniye-map-title">Osmaniye il sınırı ve Düziçi</title>
      <desc id="osmaniye-map-desc">İl sınırları içinde işaretlenen nokta Düziçi ilçe merkezidir; tesisin tam konumu değildir.</desc>
      <path d={map.path} fill="currentColor" />
      <circle cx={map.point[0]} cy={map.point[1]} r="6" />
    </svg>
  );
}
