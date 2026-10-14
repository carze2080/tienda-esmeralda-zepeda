/**
 * Currency utilities for US Dollar (USD) handling across the boutique
 */

export const CURRENCY_CODE = 'USD';
export const CURRENCY_SYMBOL = '$';
export const CURRENCY_LABEL = 'Dólares Estadounidenses (USD)';

/**
 * Format a numeric amount as USD string: e.g. "$45.00 USD"
 */
export function formatUSD(amount: number | undefined | null): string {
  const val = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  return `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`;
}

/**
 * Format a numeric amount as compact USD string: e.g. "$45.00"
 */
export function formatUSDCompact(amount: number | undefined | null): string {
  const val = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  return `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Format currency with explicit symbol and code
 */
export function formatPrice(amount: number | undefined | null, symbol = '$', code = 'USD'): string {
  const val = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  return `${symbol}${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${code}`;
}
