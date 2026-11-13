import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { QuoteProductTrigger } from '@/components/storefront/quote/QuoteProductTrigger';
import { PhoneCountrySearch } from '@/components/ui/phone-country-search';
import { getProducts } from '@/lib/catalog/static-products';

afterEach(cleanup);
it('keeps the visible selection at the start of its accessible name as quantities change', async () => {
 const products = await getProducts();
 const view = render(<QuoteProductTrigger products={products} quantities={{}} />);
 expect(screen.getByRole('button', {name:'Ürünleri seçin · İlgilendiğiniz ürünler'})).toBeTruthy();
 view.rerender(<QuoteProductTrigger products={products} quantities={{[products[0].id]:'2'}} />);
 expect(screen.getByRole('button', {name:'1 ürün, 2 adet · İlgilendiğiniz ürünler'})).toBeTruthy();
 view.rerender(<QuoteProductTrigger products={products} quantities={{[products[0].id]:''}} />);
 expect(screen.getByRole('button', {name:'1 ürün, Adetleri kontrol edin · İlgilendiğiniz ürünler'})).toBeTruthy();
});
it('includes both responsive visible country labels, and updates after country changes', () => {
 const options = [{country:'TR' as const,code:'+90',name:'Türkiye'},{country:'GB' as const,code:'+44',name:'Birleşik Krallık'}];
 const props = {name:'country',options,label:'Telefon ülke kodu',autoComplete:'tel-country-code',lang:'tr' as const,onChange:vi.fn()};
 const view=render(<PhoneCountrySearch {...props} value="TR" />);
 expect(screen.getByRole('button',{name:'TR +90 Türkiye · Telefon ülke kodu'})).toBeTruthy();
 view.rerender(<PhoneCountrySearch {...props} value="GB" />);
 expect(screen.getByRole('button',{name:'GB +44 Birleşik Krallık · Telefon ülke kodu'})).toBeTruthy();
});
