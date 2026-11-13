import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { QuoteProductTrigger } from '@/components/storefront/quote/QuoteProductTrigger';
import { PhoneCountrySearch } from '@/components/ui/phone-country-search';
import { getProducts } from '@/lib/catalog/static-products';

afterEach(cleanup);

function expectVisibleLabelsInName(button: HTMLElement, labels: readonly Element[]) {
 expect(labels.length).toBeGreaterThan(0);
 const name = button.getAttribute('aria-label')!;
 for (const label of labels) {
  const text = label.textContent!.replace(/\s+/g, ' ').trim();
  expect(text.length).toBeGreaterThan(0);
  expect(name).toContain(text);
 }
}

function expectSelectionInName() {
 const button = screen.getByRole('button', {name: /İlgilendiğiniz ürünler$/});
 expectVisibleLabelsInName(button, [...button.querySelectorAll('span:not([aria-hidden])')]);
}

function expectCountryLabelsInName() {
 const button = screen.getByRole('button', {name: /Telefon ülke kodu$/});
 // Both spans are visually displayed at their respective viewport breakpoints,
 // even though aria-hidden avoids repeating them in the accessible name.
 expectVisibleLabelsInName(button, [...button.querySelectorAll('[data-phone-country-full], [data-phone-country-compact]')]);
}

it('keeps the visible selection at the start of its accessible name as quantities change', async () => {
 const products = await getProducts();
 const view = render(<QuoteProductTrigger products={products} quantities={{}} />);
 expect(screen.getByRole('button', {name:'Ürünleri seçin · İlgilendiğiniz ürünler'})).toBeTruthy();
 expectSelectionInName();
 view.rerender(<QuoteProductTrigger products={products} quantities={{[products[0].id]:'2'}} />);
 expect(screen.getByRole('button', {name:'1 ürün, 2 adet · İlgilendiğiniz ürünler'})).toBeTruthy();
 expectSelectionInName();
 view.rerender(<QuoteProductTrigger products={products} quantities={{[products[0].id]:''}} />);
 expect(screen.getByRole('button', {name:'1 ürün, Adetleri kontrol edin · İlgilendiğiniz ürünler'})).toBeTruthy();
 expectSelectionInName();
});
it('includes both responsive visible country labels, and updates after country changes', () => {
 const options = [{country:'TR' as const,code:'+90',name:'Türkiye'},{country:'GB' as const,code:'+44',name:'Birleşik Krallık'}];
 const props = {name:'country',options,label:'Telefon ülke kodu',autoComplete:'tel-country-code',lang:'tr' as const,onChange:vi.fn()};
 const view=render(<PhoneCountrySearch {...props} value="TR" />);
 expect(screen.getByRole('button',{name:'TR +90 Türkiye · Telefon ülke kodu'})).toBeTruthy();
 expectCountryLabelsInName();
 view.rerender(<PhoneCountrySearch {...props} value="GB" />);
 expect(screen.getByRole('button',{name:'GB +44 Birleşik Krallık · Telefon ülke kodu'})).toBeTruthy();
 expectCountryLabelsInName();
});
