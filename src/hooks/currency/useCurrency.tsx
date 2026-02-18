'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { BASE_CURRENCY, formatPrice as _formatPrice } from '../../utils/currency';

const STORAGE_KEY = 'preferred_currency';

interface CurrencyContextValue {
  /** Currently selected currency code, e.g. "AED" */
  currency: string;
  /** Change the displayed currency */
  setCurrency: (code: string) => void;
  /**
   * Format a price in AED fils to the user's selected currency.
   * @param aedFils - Amount in fils (100 fils = 1 AED)
   */
  formatPrice: (aedFils: number) => string;
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const CurrencyContext = createContext<CurrencyContextValue>(null!);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<string>(BASE_CURRENCY);

  // Hydrate from localStorage on mount (avoids SSR mismatch)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setCurrencyState(stored);
    } catch {
      // localStorage unavailable (SSR, private browsing)
    }
  }, []);

  const setCurrency = useCallback((code: string) => {
    setCurrencyState(code);
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {
      // ignore
    }
  }, []);

  const formatPrice = useCallback(
    (aedFils: number) => _formatPrice(aedFils, currency),
    [currency],
  );

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return ctx;
}
