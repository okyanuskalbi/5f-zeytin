import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { DeferredPhoneField } from '@/components/storefront/forms/DeferredPhoneField';

let intersect: IntersectionObserverCallback;
let options: IntersectionObserverInit | undefined;
const disconnect = vi.fn();
beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', class {
    constructor(callback: IntersectionObserverCallback, config?: IntersectionObserverInit) { intersect = callback; options = config; }
    observe() {}
    disconnect = disconnect;
  });
});
afterEach(() => { vi.doUnmock("@/components/ui/customer-phone-field"); cleanup(); vi.unstubAllGlobals(); vi.clearAllMocks(); });

it('reserves the phone controls without exposing an editable empty field before proximity', () => {
  const changed = vi.fn();
  render(<DeferredPhoneField name="phone" lang="tr" onValueChange={changed} />);
  const phone = screen.getByRole('textbox', { name: 'Telefon' }) as HTMLInputElement;
  expect(phone.readOnly).toBe(true);
  expect(phone.getAttribute('aria-busy')).toBe('true');
  expect(screen.getByText('10 hane')).toBeTruthy();
  expect(screen.getByRole('button', { name: /Telefon ülke kodu/ })).toBeTruthy();
  expect(options?.rootMargin).toBe('100px 0px');
  expect(changed).not.toHaveBeenCalled();
});

it('loads the existing field near the viewport and preserves actual phone formatting and value', async () => {
  const changed = vi.fn();
  render(<DeferredPhoneField name="phone" lang="tr" onValueChange={changed} />);
  act(() => intersect([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver));
  await waitFor(() => expect((screen.getByRole('textbox', { name: 'Telefon' }) as HTMLInputElement).readOnly).toBe(false));
  fireEvent.change(screen.getByRole('textbox', { name: 'Telefon' }), { target: { value: '5321234567' } });
  expect((screen.getByRole('textbox', { name: 'Telefon' }) as HTMLInputElement).value).toBe('532 123 45 67');
  await waitFor(() => expect(changed).toHaveBeenLastCalledWith('+90 532 123 45 67'));
  expect(disconnect).toHaveBeenCalled();
});

it('loads on keyboard focus and returns focus to the real input', async () => {
  render(<DeferredPhoneField name="phone" lang="tr" />);
  act(() => screen.getByRole('textbox', { name: 'Telefon' }).focus());
  await waitFor(() => expect((screen.getByRole('textbox', { name: 'Telefon' }) as HTMLInputElement).readOnly).toBe(false));
  expect(document.activeElement).toBe(screen.getByRole('textbox', { name: 'Telefon' }));
});

it('does not steal focus when the visitor leaves during loading', async () => {
  render(<><DeferredPhoneField name="phone" lang="tr" /><button>Sonraki alan</button></>);
  act(() => { screen.getByRole('textbox', { name: 'Telefon' }).focus(); screen.getByRole('button', { name: 'Sonraki alan' }).focus(); });
  await waitFor(() => expect((screen.getByRole('textbox', { name: 'Telefon' }) as HTMLInputElement).readOnly).toBe(false));
  expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Sonraki alan' }));
});

it('loads after pointer use even without an observer callback', async () => {
  render(<DeferredPhoneField name="phone" lang="tr" />);
  fireEvent.pointerDown(screen.getByRole('button', { name: /Telefon ülke kodu/ }));
  await waitFor(() => expect((screen.getByRole('textbox', { name: 'Telefon' }) as HTMLInputElement).readOnly).toBe(false));
});


it('keeps failure retry in the reserved controls and loads the real field after retry', async () => {
  vi.doMock('@/components/ui/customer-phone-field', () => { throw new Error('local chunk unavailable'); });
  render(<DeferredPhoneField name="phone" lang="tr" />);
  fireEvent.pointerDown(screen.getByRole('textbox', { name: 'Telefon' }));
  const retry = await screen.findByRole('button', { name: 'Yeniden dene' });
  expect((screen.getByRole('textbox', { name: 'Telefon' }) as HTMLInputElement).readOnly).toBe(true);
  expect(screen.getByRole('alert').textContent).toContain('yüklenemedi');
  vi.doUnmock('@/components/ui/customer-phone-field');
  fireEvent.click(retry);
  await waitFor(() => expect((screen.getByRole('textbox', { name: 'Telefon' }) as HTMLInputElement).readOnly).toBe(false));
});
