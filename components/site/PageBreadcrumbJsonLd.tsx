import { siteIdentity } from "@/lib/site/identity";

/** Static navigation context only; never serialize account, order or payment data. */
export function PageBreadcrumbJsonLd({ name, path, parent }: {
  name: string; path: string; parent?: { name: string; path: string };
}) {
  const trail = [{ name: "Ana Sayfa", path: "/" }, ...(parent ? [parent] : []), { name, path }];
  const schema = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: trail.map((item, index) => ({
      "@type": "ListItem", position: index + 1, name: item.name, item: `${siteIdentity.origin}${item.path}`,
    })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />;
}
