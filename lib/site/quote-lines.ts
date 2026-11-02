export const QUOTE_QUANTITY_MAX = 99999;

/** Quantity editing may be temporarily empty; only a complete positive integer
 * can enter the prepared quote. Exponents, decimals and signs are not counts. */
export function validateQuoteQuantity(value: string): number | null {
  const text = value.trim();
  if (!/^[0-9]+$/.test(text)) return null;
  const quantity = Number(text);
  return Number.isSafeInteger(quantity) && quantity >= 1 && quantity <= QUOTE_QUANTITY_MAX ? quantity : null;
}
