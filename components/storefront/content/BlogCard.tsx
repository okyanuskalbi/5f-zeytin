import type { JSX } from "react";
import Link from "next/link";
import { V3Picture } from "@/components/media/V3Picture";
import { blogCover } from "@/lib/blog/cover";
import { blogPosts } from "@/lib/blog/posts";
import styles from "./Blog.module.css";

type Post = (typeof blogPosts)[number];
export function formatBlogDate(date: string): string {
  return new Intl.DateTimeFormat("tr-TR", { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));
}

export function BlogCard({ post, headingLevel = 2, other = false, size = "small" }: { post: Post; headingLevel?: 2 | 3; other?: boolean; size?: "large" | "small" }): JSX.Element {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return <article data-blog-card={post.slug} data-blog-size={size} data-other-article={other ? post.slug : undefined} className={styles.card}>
    <Link prefetch={false} href={`/blog/${post.slug}`} className={styles.cardLink}>
      <V3Picture image={blogCover(post)} sizes={size === "large" ? "(max-width: 767px) calc(100vw - 32px), (max-width: 1376px) 54vw, 720px" : "(max-width: 767px) calc(100vw - 32px), (max-width: 1376px) 30vw, 400px"} eager={size === "large"} decorative className={styles.cardImage} />
      <div className={styles.cardContent}><p className={styles.cardMeta}><time dateTime={post.date}>{formatBlogDate(post.date)}</time><span>{post.readingMinutes} dk okuma</span></p><Heading>{post.title}</Heading><p>{post.excerpt}</p><span className={styles.textLink}>Yazıyı oku</span></div>
    </Link>
  </article>;
}
