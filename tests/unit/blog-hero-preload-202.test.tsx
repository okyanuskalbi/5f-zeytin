import type { ComponentProps } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it, vi } from 'vitest';
import Blog from '@/app/blog/page';
import Article from '@/app/blog/[slug]/page';
import { blogPosts } from '@/lib/blog/posts';
import { getProductFamilies } from '@/lib/catalog/static-products';

vi.mock('@/lib/catalog/read', () => ({ readProductFamilies: () => getProductFamilies() }));
vi.mock('next/link', () => ({
  default: ({ prefetch, ...props }: ComponentProps<'a'> & { prefetch?: boolean }) =>
    <a {...props} data-prefetch={prefetch === false ? 'disabled' : 'automatic'} />,
}));

it.each(['index', ...blogPosts.map(post => post.slug)])('does not fetch the homepage hero from the %s breadcrumb', async slug => {
  const page = slug === 'index' ? Blog() : await Article({ params: Promise.resolve({ slug }) });
  const doc = new DOMParser().parseFromString(renderToStaticMarkup(page), 'text/html');
  expect(doc.querySelector('nav[aria-label="İçerik yolu"] a[href="/"]')?.getAttribute('data-prefetch')).toBe('disabled');
  expect(doc.querySelector('link[rel="preload"][href*="hero-poster"]')).toBeNull();
});
