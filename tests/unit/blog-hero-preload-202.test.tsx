import type { ComponentProps } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it, vi } from 'vitest';
import Article from '@/app/blog/[slug]/page';
import { blogPosts } from '@/lib/blog/posts';
import { getProductFamilies } from '@/lib/catalog/static-products';

vi.mock('@/lib/catalog/read', () => ({ readProductFamilies: () => getProductFamilies() }));
vi.mock('next/link', () => ({
  default: ({ prefetch, ...props }: ComponentProps<'a'> & { prefetch?: boolean }) =>
    <a {...props} data-prefetch={prefetch === false ? 'disabled' : 'automatic'} />,
}));

// Task208: the blog list is the home page's #blog section; only the articles keep a breadcrumb.
it.each(blogPosts.map(post => post.slug))('does not fetch the homepage hero from the %s breadcrumb', async slug => {
  const page = await Article({ params: Promise.resolve({ slug }) });
  const doc = new DOMParser().parseFromString(renderToStaticMarkup(page), 'text/html');
  expect(doc.querySelector('nav[aria-label="İçerik yolu"] a[href="/"]')?.getAttribute('data-prefetch')).toBe('disabled');
  expect(doc.querySelector('nav[aria-label="İçerik yolu"] a[href="/#blog"]')?.getAttribute('data-prefetch')).toBe('disabled');
  expect(doc.querySelector('nav[aria-label="İçerik yolu"] a[href="/blog"]')).toBeNull();
  expect(doc.querySelector('link[rel="preload"][href*="hero-poster"]')).toBeNull();
});
