import type { JSX } from "react";
import Link from "next/link";
import { V3Picture } from "@/components/media/V3Picture";
import photos from "@/lib/media/classic-photos.json";
import { blogPosts } from "@/lib/blog/posts";
import styles from "./Blog.module.css";

type Post = (typeof blogPosts)[number];
export function formatBlogDate(date: string): string {
  return new Intl.DateTimeFormat("tr-TR", { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));
}

export function BlogCard({ post, headingLevel = 2, other = false }: { post: Post; headingLevel?: 2 | 3; other?: boolean }): JSX.Element {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return <article data-blog-card={post.slug} data-other-article={other ? post.slug : undefined} className={styles.card}>
    <Link prefetch={false} href={`/blog/${post.slug}`} className={styles.cardLink}>
      <V3Picture image={photos.assets[post.imageKey]} sizes="(max-width: 767px) calc(100vw - 32px), (max-width: 1312px) 44vw, 600px" decorative className={styles.cardImage} />
      <div className={styles.cardContent}><time dateTime={post.date}>{formatBlogDate(post.date)}</time><Heading>{post.title}</Heading><p>{post.excerpt}</p><span className={styles.textLink}>Devamını oku</span></div>
    </Link>
  </article>;
}
