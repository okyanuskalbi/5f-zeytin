import type { JSX } from "react";

export function BrandLogo({ className, loading, tone = "dark" }: {
  className?: string;
  loading?: "eager" | "lazy";
  tone?: "light" | "dark";
}): JSX.Element {
  if (tone === "light") return <picture>
    <source type="image/webp" srcSet="/brand/afina-zeytin-yatay@2x.webp 2x, /brand/afina-zeytin-yatay@3x.webp 3x" />
    <img src="/brand/afina-zeytin-yatay@2x.webp" alt="AFİNA ZEYTİN" width={180} height={48}
      loading={loading} decoding="async" className={className} />
  </picture>;
  return (
    <picture>
      <source type="image/webp" srcSet="/brand/afina-zeytin-yatay-dark@2x.webp 2x, /brand/afina-zeytin-yatay-dark@3x.webp 3x" />
      <img src="/brand/afina-zeytin-yatay-dark@2x.webp" alt="AFİNA ZEYTİN" width={180} height={48}
        loading={loading} decoding="async" className={className} />
    </picture>
  );
}
