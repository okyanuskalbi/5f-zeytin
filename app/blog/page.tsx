import { completeMetadata } from "@/lib/site/metadata";
import type { Metadata } from "next";
import type { JSX } from "react";
import { BlogCard } from "@/components/storefront/content/BlogCard";
import { PageBand, PagePath } from "@/components/storefront/ui/PageBand";
import { blogPosts } from "@/lib/blog/posts";
import { siteIdentity } from "@/lib/site/identity";
import styles from "@/components/storefront/content/Blog.module.css";

export const dynamic = "force-static";
export const revalidate = 300;
const title = "Zeytin Defteri | AFİNA ZEYTİN";
const description = "Zeytin çeşitleri, geleneksel salamura ve zeytinyağını saklama üzerine sade bilgiler. AFİNA ZEYTİN defterindeki yazıları okuyun.";
export const metadata: Metadata = completeMetadata({
  title, description, alternates: { canonical: "/blog" }, robots: { index: true, follow: true },
  openGraph: { title, description, url: "/blog", type: "website", locale: "tr_TR", siteName: siteIdentity.name },
  twitter: { card: "summary_large_image", title, description },
});
const breadcrumb = {
  "@context": "https://schema.org", "@type": "BreadcrumbList",
  itemListElement: [{ "@type": "ListItem", position: 1, name: "Ana Sayfa", item: `${siteIdentity.origin}/` }, { "@type": "ListItem", position: 2, name: "Blog", item: `${siteIdentity.origin}/blog` }],
};

export default function Page(): JSX.Element {
  return <main className={styles.root}><div className={styles.container}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb).replace(/</g, "\\u003c") }} />
    <PagePath steps={[{ name: "Ana Sayfa", href: "/" }, { name: "Blog" }]} />
    <PageBand title="Zeytin Defteri" lead="Zeytini tanımak, zeytinyağını özenle saklamak ve sofranız için seçim yapmak üzerine." />
    <div className={styles.cardGrid}>{blogPosts.map((post, index) => <BlogCard key={post.slug} post={post} size={index === 0 ? "large" : "small"} />)}</div>
  </div></main>;
}
