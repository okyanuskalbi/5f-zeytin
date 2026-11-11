import { cleanup, fireEvent, render, screen, waitFor, act } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { QuoteComposer } from '@/components/storefront/quote/QuoteComposer';
import { QuoteJourneyProvider } from '@/components/storefront/quote/QuoteJourneyProvider';

const pending = vi.hoisted(() => {
  let resolve!: (value: { phoneForm: () => { phone: string } }) => void;
  const promise = new Promise<{ phoneForm: () => { phone: string } }>(done => { resolve = done; });
  return { resolve, promise, validate: vi.fn(() => ({ phone: '' })) };
});
vi.mock('@/lib/contact/customer-phone', () => pending.promise);
vi.mock('@/components/storefront/forms/DeferredPhoneField', () => ({
  DeferredPhoneField: () => <label>Telefon<input name="phone" /></label>,
}));
afterEach(cleanup);

it('marks submission busy, prevents duplicate validation and discards errors after an edit while loading', async () => {
  render(<QuoteJourneyProvider><QuoteComposer products={[]} /></QuoteJourneyProvider>);
  const submit = screen.getByRole('button', { name: 'Talep özetini hazırla' });
  fireEvent.click(submit);
  expect((submit as HTMLButtonElement).disabled).toBe(true);
  expect(submit.getAttribute('aria-busy')).toBe('true');
  fireEvent.submit(screen.getByRole('form', { name: 'Kurumsal teklif talebi' }));
  fireEvent.change(screen.getByLabelText('Adınız veya firma adı'), { target: { value: 'Düzenlenen firma' } });
  await act(async () => pending.resolve({ phoneForm: pending.validate }));
  await waitFor(() => expect((submit as HTMLButtonElement).disabled).toBe(false));
  expect(pending.validate).toHaveBeenCalledTimes(1);
  expect(screen.getByLabelText('Adınız veya firma adı').getAttribute('aria-invalid')).toBeNull();
  expect(screen.getByRole('alert').textContent).toBe('');
});

it('reports a validation download failure explicitly and permits another submission', async () => {
  vi.doMock('@/lib/contact/customer-phone', () => { throw new Error('local validation chunk unavailable'); });
  render(<QuoteJourneyProvider><QuoteComposer products={[]} /></QuoteJourneyProvider>);
  const submit = screen.getByRole('button', { name: 'Talep özetini hazırla' });
  fireEvent.click(submit);
  expect(await screen.findByText('Telefon doğrulaması yüklenemedi. Yeniden deneyin.')).toBeTruthy();
  expect((submit as HTMLButtonElement).disabled).toBe(false);
  vi.doMock('@/lib/contact/customer-phone', () => ({ phoneForm: pending.validate }));
  fireEvent.click(submit);
  await waitFor(() => expect(screen.queryByText('Telefon doğrulaması yüklenemedi. Yeniden deneyin.')).toBeNull());
  expect(screen.getByText('Geçerli bir telefon numarası girin.')).toBeTruthy();
});
