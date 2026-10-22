import type { JSX } from "react";

export function BrandLogo({ className, loading }: {
  className?: string;
  loading?: "eager" | "lazy";
}): JSX.Element {
  return (
    <picture>
      <source type="image/webp" srcSet="/brand/afina-zeytin-yatay-dark@2x.webp 2x, /brand/afina-zeytin-yatay-dark@3x.webp 3x" />
      <img src="/brand/afina-zeytin-yatay-dark@2x.webp" alt="AFİNA ZEYTİN" width={180} height={48}
        loading={loading} decoding="async" className={className} />
    </picture>
  );
}
