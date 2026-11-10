import type { Metadata } from "next";
import type { JSX } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogCard, formatBlogDate } from "@/components/blog/BlogCard";
import { V3Picture } from "@/components/media/V3Picture";
import { ProductCard } from "@/components/catalog/ProductCard";
import { blogPosts } from "@/lib/blog/posts";
import { getProductGroup, productsForGroup } from "@/lib/catalog/groups";
import { readProductFamilies } from "@/lib/catalog/read";
import photos from "@/lib/media/classic-photos.json";
import { v3Image } from "@/lib/media/v3-assets";
import { siteIdentity } from "@/lib/site/identity";
import styles from "@/components/blog/Blog.module.css";

export const dynamic = "force-static";
export const dynamicParams = false;
export const revalidate = 300;
type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() { return blogPosts.map(post => ({ slug: post.slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find(item => item.slug === slug);
  if (!post) notFound();
  const title = `${post.title} | AFİNA ZEYTİN`;
  const url = `/blog/${post.slug}`;
  const image = photos.assets[post.imageKey].outputs[0].file;
  return {
    title, description: post.excerpt, alternates: { canonical: url }, robots: { index: true, follow: true },
    openGraph: { title, description: post.excerpt, url, type: "article", locale: "tr_TR", siteName: siteIdentity.name, publishedTime: post.date, authors: [siteIdentity.origin], images: [{ url: image, alt: post.title }] },
    twitter: { card: "summary_large_image", title, description: post.excerpt, images: [image] },
  };
}

export default async function Page({ params }: Props): Promise<JSX.Element> {
  const { slug } = await params;
  const post = blogPosts.find(item => item.slug === slug);
  if (!post) notFound();
  const related = productsForGroup(await readProductFamilies(), post.category).slice(0, 3);
  const category = getProductGroup(post.category);
  const canonical = `${siteIdentity.origin}/blog/${post.slug}`;
  const image = photos.assets[post.imageKey];
  const article = {
    "@context": "https://schema.org", "@type": "BlogPosting", "@id": `${canonical}#article`,
    headline: post.title, description: post.excerpt, datePublished: post.date, dateModified: post.date,
    author: { "@type": "Organization", name: "AFİNA ZEYTİN", url: siteIdentity.origin },
    publisher: { "@type": "Organization", name: "AFİNA ZEYTİN", url: siteIdentity.origin },
    image: `${siteIdentity.origin}${image.outputs[0].file}`, mainEntityOfPage: canonical, inLanguage: "tr-TR",
  };
  const breadcrumb = {
    "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: `${siteIdentity.origin}/` },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${siteIdentity.origin}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: canonical },
    ],
  };
  return <main className={styles.root}><div className={styles.container}>
    {[article, breadcrumb].map(schema => <script key={schema["@type"]} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />)}
    <nav aria-label="İçerik yolu" className={styles.breadcrumb}><ol><li><Link href="/">Ana Sayfa</Link></li><li><span aria-hidden="true">/</span><Link href="/blog">Blog</Link></li><li><span aria-hidden="true">/</span><span aria-current="page">{post.title}</span></li></ol></nav>
    <article className={styles.article}>
      <header className={styles.articleHeader}><p className={styles.eyebrow}>Zeytin Defteri</p><h1>{post.title}</h1><div className={styles.articleMeta}><time dateTime={post.date}>{formatBlogDate(post.date)}</time><span aria-hidden="true">·</span><span>{post.readingMinutes} dakika okuma</span></div><p className={styles.excerpt}>{post.excerpt}</p></header>
      <V3Picture image={image} sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1023px) 90vw, 960px" eager className={styles.cover} />
      <div className={styles.prose} data-blog-content>{post.sections.map(section => <section key={section.heading}><h2>{section.heading}</h2>{section.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}{section.items && <ul>{section.items.map(item => <li key={item}>{item}</li>)}</ul>}</section>)}<p className={styles.categoryLink}><Link href={post.categoryHref}>{category?.name ?? "İlgili kategori"} ürünlerini inceleyin</Link></p></div>
    </article>
    <section aria-labelledby="related-products-title" className={styles.related}><h2 id="related-products-title">İlgili Ürünler</h2><div className={styles.productGrid}>{related.map(product => <ProductCard key={product.id} product={product} image={v3Image(product.imageKey)} featured={false} staticPresentation imageSizes="(max-width: 359px) 90vw, (max-width: 767px) 42vw, 30vw" />)}</div></section>
    <section aria-labelledby="other-articles-title" className={styles.related}><h2 id="other-articles-title">Diğer Yazılar</h2><div className={`${styles.cardGrid} ${styles.otherGrid}`}>{blogPosts.filter(other => other.slug !== post.slug).map(other => <BlogCard key={other.slug} post={other} headingLevel={3} other />)}</div></section>
  </div></main>;
}
