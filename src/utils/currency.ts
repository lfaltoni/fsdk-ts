/**
 * Currency utilities — AED is the base (reference) currency.
 *
 * All prices are stored in the database as integer fils (1 AED = 100 fils).
 * Exchange rates are static approximations; update periodically as needed.
 */

export const BASE_CURRENCY = 'AED';

/** Exchange rates: 1 AED = X <currency> */
export const EXCHANGE_RATES: Record<string, number> = {
  AED: 1.0,
  USD: 0.2723,   // 1 USD = 3.6725 AED (hard peg)
  EUR: 0.2500,   // approximate
  GBP: 0.2140,   // approximate
  SAR: 1.0211,   // 1 SAR ≈ 0.979 AED (Saudi riyal soft peg to USD)
  QAR: 0.9907,   // 1 QAR ≈ 1.009 AED (Qatari riyal soft peg to USD)
};

export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
}

export const CURRENCIES: CurrencyInfo[] = [
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham' },
  { code: 'USD', symbol: '$',   name: 'US Dollar' },
  { code: 'EUR', symbol: '€',   name: 'Euro' },
  { code: 'GBP', symbol: '£',   name: 'British Pound' },
  { code: 'SAR', symbol: 'SAR', name: 'Saudi Riyal' },
  { code: 'QAR', symbol: 'QAR', name: 'Qatari Riyal' },
];

/**
 * Format a price given in AED fils (integer) into a display string
 * for the specified currency.
 *
 * @param aedFils - Price in base units (fils). 100 fils = 1 AED.
 * @param currencyCode - Target display currency (defaults to AED).
 * @returns Formatted price string, e.g. "AED 183.50" or "$49.99"
 */
export function formatPrice(aedFils: number, currencyCode: string = BASE_CURRENCY): string {
  const rate = EXCHANGE_RATES[currencyCode] ?? 1.0;
  const aed = aedFils / 100;
  const converted = aed * rate;
  const info = CURRENCIES.find((c) => c.code === currencyCode);
  const symbol = info?.symbol ?? currencyCode;

  // For AED, SAR, QAR show code before amount; for symbol currencies put symbol first
  const symbolIsCode = symbol === currencyCode;
  if (symbolIsCode) {
    return `${symbol} ${converted.toFixed(2)}`;
  }
  return `${symbol}${converted.toFixed(2)}`;
}
