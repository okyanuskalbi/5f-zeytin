import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it, vi } from 'vitest';
import Home from '@/app/page';
import { getProductFamilies } from '@/lib/catalog/static-products';
vi.mock('@/lib/catalog/read',()=>({readProductFamilies:()=>getProductFamilies()}));
vi.mock('next/navigation',()=>({useRouter:()=>({replace:vi.fn()}),usePathname:()=>'/',useSearchParams:()=>new URLSearchParams(window.location.search)}));
// Task208: the BRIEF's content now sits in six sections of one page; three article cards, no link out of the story.
it('Task198 BRIEF: exact section order, one hero action, three blog destinations, no homepage marquee',async()=>{
 const doc=new DOMParser().parseFromString(renderToStaticMarkup(await Home()),'text/html');
 expect([...doc.querySelectorAll('[data-home-section]')].map(n=>n.getAttribute('data-home-section'))).toEqual(['hero','products','story','business','blog','contact']);
 const posterPreload = doc.querySelector('head link[rel="preload"][as="image"]');
 expect(posterPreload?.getAttribute('href')).toBe('/images/customer-home/hero-poster-720.avif');
 expect(posterPreload?.getAttribute('imagesrcset')).toContain('hero-poster-1920.avif 1920w');
 expect(doc.querySelector('h1')?.textContent).toBe('Kökü toprakta. Yeri sofrada.');
 expect(doc.querySelectorAll('#baslangic a')).toHaveLength(1);
 expect(doc.querySelector('#hero-title')?.closest('[data-overlay-ok]')).toBeTruthy();
 expect(doc.querySelector('#baslangic')?.textContent).not.toContain('Ellek, Düziçi / Osmaniye');
 expect(doc.querySelectorAll('[data-home-section="blog"] a[href^="/blog/"]')).toHaveLength(3);
 expect(doc.querySelectorAll('[data-home-section="story"] a')).toHaveLength(0);
 expect(doc.querySelector('[data-home-section="categories"], [data-home-section="marquee"], [data-about-strip]')).toBeNull();
 expect([...doc.querySelectorAll('#urunler [role="radio"]')].map(n=>n.textContent)).toEqual(['Tümü','Zeytinyağı','Zeytin','Siyah','Yeşil','Kırma']);
});
