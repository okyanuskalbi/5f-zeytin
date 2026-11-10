import type { Metadata } from "next";
import type { JSX } from "react";
import Link from "next/link";
import { BlogCard } from "@/components/blog/BlogCard";
import { blogPosts } from "@/lib/blog/posts";
import { siteIdentity } from "@/lib/site/identity";
import styles from "@/components/blog/Blog.module.css";

export const dynamic = "force-static";
export const revalidate = 300;
const title = "Zeytin Defteri | AFİNA ZEYTİN";
const description = "Zeytin çeşitleri, geleneksel salamura ve zeytinyağını saklama üzerine sade bilgiler. AFİNA ZEYTİN'in Zeytin Defteri'ndeki yazıları okuyun.";
export const metadata: Metadata = {
  title, description, alternates: { canonical: "/blog" }, robots: { index: true, follow: true },
  openGraph: { title, description, url: "/blog", type: "website", locale: "tr_TR", siteName: siteIdentity.name },
  twitter: { card: "summary_large_image", title, description },
};
const breadcrumb = {
  "@context": "https://schema.org", "@type": "BreadcrumbList",
  itemListElement: [{ "@type": "ListItem", position: 1, name: "Ana Sayfa", item: `${siteIdentity.origin}/` }, { "@type": "ListItem", position: 2, name: "Blog", item: `${siteIdentity.origin}/blog` }],
};

export default function Page(): JSX.Element {
  return <main className={styles.root}><div className={styles.container}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb).replace(/</g, "\\u003c") }} />
    <nav aria-label="İçerik yolu" className={styles.breadcrumb}><ol><li><Link href="/">Ana Sayfa</Link></li><li><span aria-hidden="true">/</span><span aria-current="page">Blog</span></li></ol></nav>
    <header className={styles.intro}><h1>Zeytin Defteri</h1><p>Zeytini tanımak, zeytinyağını özenle saklamak ve sofranız için seçim yapmak üzerine.</p></header>
    <div className={styles.cardGrid}>{blogPosts.map(post => <BlogCard key={post.slug} post={post} />)}</div>
  </div></main>;
}
