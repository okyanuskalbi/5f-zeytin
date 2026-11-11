import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { CustomerWorkspace } from '@/components/account/CustomerWorkspace';

vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: vi.fn(), refresh: vi.fn() }) }));
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

it('keeps the order-detail space reserved on the same container before and after its response', async () => {
  let resolve!: (response: Response) => void;
  vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>(done => { resolve = done; })));
  const { container } = render(<CustomerWorkspace section="order-detail" orderNo="QA199-RESERVE" profile={{ name: 'Yerel Kontrol', email: 'local@example.test', phone: null }} />);
  const reserved = container.querySelector('[data-customer-section="order-detail"]');
  expect(reserved).not.toBeNull();
  expect(reserved?.contains(screen.getByText('Siparişiniz yükleniyor…'))).toBe(true);
  const heading = screen.getByRole('heading', { name: 'Sipariş bilgileri' });
  const css = readFileSync('components/storefront/account/AccountSurface.module.css', 'utf8');
  expect(css).toMatch(/\.customerContent\[data-customer-section="order-detail"\]\s*\{[^}]*min-height:\s*calc\(100svh - 240px\)/);
  await act(async () => resolve(Response.json({ data: { no: 'QA199-RESERVE', date: '2026-11-11T00:00:00Z', totalKurus: 50000, status: 'paid', items: [{name:'Zeytin',weight:'1 kg',quantity:1,unitPriceKurus:50000}], deliveryAddress:'Yerel adres', shipping:null } })));
  expect(await screen.findByText('Teslimat ve kargo')).toBeTruthy();
  expect(container.querySelector('[data-customer-section="order-detail"]')).toBe(reserved);
  expect(reserved?.querySelectorAll('section')).toHaveLength(3);
  expect(screen.getByRole('heading', { name: 'Sipariş bilgileri' })).toBe(heading);
  expect(screen.getByText('QA199-RESERVE').tagName).toBe('P');
});

it.each([
  ['addresses', 'Adresleriniz yükleniyor…', 'Henüz adresiniz yok.', []],
  ['orders', 'Siparişleriniz yükleniyor…', 'Henüz siparişiniz yok.', { orders: [], page: 1, total: 0 }],
] as const)('keeps %s reservation through the loading and empty response', async (section, loading, ready, data) => {
  let resolve!: (response: Response) => void;
  vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>(done => { resolve = done; })));
  const { container } = render(<CustomerWorkspace section={section} profile={{ name: 'Yerel Kontrol', email: 'local@example.test', phone: null }} />);
  const reserved = container.querySelector(`[data-customer-section="${section}"]`);
  expect(reserved?.contains(screen.getByText(loading))).toBe(true);
  const css = readFileSync('components/storefront/account/AccountSurface.module.css', 'utf8');
  const rule = css.split('}').find(block => block.includes('min-height: calc(100svh - 240px)'))!;
  expect(rule).toContain(`.customerContent[data-customer-section="${section}"]`);
  expect(rule).not.toMatch(/data-customer-section="(?:profile|security)"/);
  await act(async () => resolve(Response.json({ data })));
  expect(await screen.findByText(ready)).toBeTruthy();
  expect(container.querySelector(`[data-customer-section="${section}"]`)).toBe(reserved);
});


it.each([['orders', 'Alışveriş geçmişiniz'], ['order-detail', 'Sipariş bilgileri']] as const)(
  'renders the %s heading before any customer response without a fabricated order', (section, title) => {
    const html = renderToStaticMarkup(<CustomerWorkspace section={section} orderNo="QA199-UNLOADED" profile={{name:'Yerel Kontrol',email:'local@example.test',phone:null}} />);
    const doc = new DOMParser().parseFromString(html, 'text/html');
    expect([...doc.querySelectorAll('h2')].map(node => node.textContent)).toContain(title);
    expect(doc.body.textContent).not.toContain('QA199-UNLOADED');
  },
);
