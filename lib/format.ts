export const CURRENCY = 'USD';
export const LOCALE = 'en-US';

/** Prices are stored in cents to keep arithmetic exact. */
export function money(cents: number): string {
  return new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: CURRENCY,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

/** Deposits / instalments read better without the cents noise of Intl defaults. */
export function moneyParts(cents: number): { symbol: string; amount: string } {
  const formatted = money(cents);
  const symbol = formatted.replace(/[0-9.,\s]/g, '');
  return { symbol, amount: formatted.replace(symbol, '').trim() };
}

export function lineTotal(cents: number, qty: number): number {
  return cents * qty;
}

export function shippingFor(subtotalCents: number): number {
  return subtotalCents >= 50000 || subtotalCents === 0 ? 0 : 4500;
}

export function taxFor(subtotalCents: number): number {
  return Math.round(subtotalCents * 0.08);
}
