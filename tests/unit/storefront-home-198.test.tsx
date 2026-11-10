import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it, vi } from 'vitest';
import Home from '@/app/page';
import { getProductFamilies } from '@/lib/catalog/static-products';
vi.mock('@/lib/catalog/read',()=>({readProductFamilies:()=>getProductFamilies()}));
vi.mock('next/navigation',()=>({useRouter:()=>({replace:vi.fn()})}));
it('Task198 BRIEF: exact section order, one hero action, all four blog destinations, no homepage marquee',async()=>{
 const doc=new DOMParser().parseFromString(renderToStaticMarkup(await Home()),'text/html');
 expect([...doc.querySelectorAll('[data-home-section]')].map(n=>n.getAttribute('data-home-section'))).toEqual(['hero','categories','products','story','featured','banners','harvest','business','blog']);
 const posterPreload = doc.querySelector('head link[rel="preload"][as="image"]');
 expect(posterPreload?.getAttribute('href')).toBe('/images/customer-home/hero-poster-720.avif');
 expect(posterPreload?.getAttribute('imagesrcset')).toContain('hero-poster-1920.avif 1920w');
 expect(doc.querySelector('h1')?.textContent).toBe('Kökü toprakta. Yeri sofrada.');
 expect(doc.querySelectorAll('#baslangic a')).toHaveLength(1);
 expect(doc.querySelectorAll('[data-home-section="blog"] a[href^="/blog/"]')).toHaveLength(4);
 expect(doc.querySelector('[data-home-section="story"] a')?.textContent).toBe('Hakkımızda');
 expect(doc.querySelectorAll('[data-home-section="categories"] a')).toHaveLength(4);
});
