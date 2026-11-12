import { completeMetadata } from "@/lib/site/metadata";
import type { Metadata } from "next";
import type { JSX } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogCard, formatBlogDate } from "@/components/storefront/content/BlogCard";
import { V3Picture } from "@/components/media/V3Picture";
import { ProductTile } from "@/components/storefront/ProductTile";
import { PagePath } from "@/components/storefront/ui/PageBand";
import { blogEditorial } from "@/components/storefront/content/blog-editorial";
import { blogCover } from "@/lib/blog/cover";
import { blogPosts } from "@/lib/blog/posts";
import { getProductGroup, productsForGroup } from "@/lib/catalog/groups";
import { readProductFamilies } from "@/lib/catalog/read";
import { siteIdentity } from "@/lib/site/identity";
import styles from "@/components/storefront/content/Blog.module.css";

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
  const outputs = blogCover(post).outputs;
  const shareImage = outputs.findLast(output => output.file.endsWith(".webp")) ?? outputs[0];
  const image = shareImage.file;
  return completeMetadata({
    title, description: post.excerpt, alternates: { canonical: url }, robots: { index: true, follow: true },
    openGraph: { title, description: post.excerpt, url, type: "article", locale: "tr_TR", siteName: siteIdentity.name, publishedTime: post.date, modifiedTime: post.updated, authors: [siteIdentity.origin], images: [{ url: image, width: shareImage.width, height: shareImage.height, alt: post.title }] },
    twitter: { card: "summary_large_image", title, description: post.excerpt, images: [image] },
  });
}

export default async function Page({ params }: Props): Promise<JSX.Element> {
  const { slug } = await params;
  const post = blogPosts.find(item => item.slug === slug);
  if (!post) notFound();
  const editorial = blogEditorial[post.slug];
  const related = productsForGroup(await readProductFamilies(), post.category).slice(0, 3);
  const category = getProductGroup(post.category);
  const canonical = `${siteIdentity.origin}/blog/${post.slug}`;
  const image = blogCover(post);
  const shareImage = image.outputs.findLast(output => output.file.endsWith(".webp")) ?? image.outputs[0];
  const article = {
    "@context": "https://schema.org", "@type": "BlogPosting", "@id": `${canonical}#article`,
    headline: post.title, description: post.excerpt, datePublished: post.date, dateModified: post.updated,
    author: { "@type": "Organization", name: "AFİNA ZEYTİN", url: siteIdentity.origin },
    publisher: { "@type": "Organization", name: "AFİNA ZEYTİN", url: siteIdentity.origin },
    image: `${siteIdentity.origin}${shareImage.file}`, mainEntityOfPage: canonical, inLanguage: "tr-TR",
  };
  const faq = {
    "@context": "https://schema.org", "@type": "FAQPage", "@id": `${canonical}#article-faq-title`,
    mainEntity: editorial.faq.map(item => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })),
  };
  const breadcrumb = {
    "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: `${siteIdentity.origin}/` },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${siteIdentity.origin}/#blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: canonical },
    ],
  };
  return <main className={styles.root}><div className={styles.container}>
    {[article, breadcrumb, faq].map(schema => <script key={schema["@type"]} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />)}
    <PagePath steps={[{ name: "Ana Sayfa", href: "/" }, { name: "Blog", href: "/#blog" }, { name: post.title }]} />
    <article className={styles.article}>
      <header className={styles.articleHeader}><h1>{post.title}</h1><div className={styles.articleMeta}><span>Güncelleme: <time dateTime={post.updated}>{formatBlogDate(post.updated)}</time></span><span data-article-author>AFİNA ZEYTİN</span><span>{post.readingMinutes} dakika okuma</span></div><p className={styles.excerpt} data-article-answer>{editorial.answer}</p></header>
      <V3Picture image={image} sizes="(max-width: 767px) calc(100vw - 32px), (max-width: 1023px) 90vw, 960px" eager className={styles.cover} />
      <nav aria-label="İçindekiler" className={styles.contents}><ul>{editorial.headings.slice(0, post.sections.length).map((heading, index) => <li key={heading}><a href={`#bolum-${index + 1}`}>{heading}</a></li>)}</ul></nav>
      <div className={styles.prose} data-blog-content>{post.sections.map((section, index) => <section key={section.heading}><h2 id={`bolum-${index + 1}`}>{editorial.headings[index]}</h2>{section.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}{section.items && <ol>{section.items.map(item => <li key={item}>{item}</li>)}</ol>}</section>)}<p className={styles.categoryLink}><Link href={post.categoryHref}>{category?.name ?? "İlgili kategori"} ürünlerini inceleyin</Link></p><section data-article-faq className={styles.faq} aria-labelledby="article-faq-title"><h2 id="article-faq-title">Bu konuda sık sorulan sorular neler?</h2>{editorial.faq.map(item => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</section></div>
    </article>
    <section aria-labelledby="related-products-title" className={styles.related}><h2 id="related-products-title">Hangi ürünler bu yazıyla ilgili?</h2><div className={styles.productGrid}>{related.map(product => <ProductTile key={product.id} product={product} />)}</div></section>
    <section aria-labelledby="other-articles-title" className={styles.related}><h2 id="other-articles-title">Başka hangi yazıları okuyabilirsiniz?</h2><div className={`${styles.cardGrid} ${styles.otherGrid}`}>{blogPosts.filter(other => other.slug !== post.slug).map(other => <BlogCard key={other.slug} post={other} headingLevel={3} other />)}</div></section>
  </div></main>;
}
