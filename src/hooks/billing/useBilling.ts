import { useState, useEffect, useCallback, useMemo } from 'react';
import { billingApi } from '../../api/billing';
import { getLogger } from '../../utils/logging';
import type { BillingSummary, AvailablePlan } from '../../types/billing';

const logger = getLogger('useBilling');

export interface UseBillingReturn {
  // State
  summary: BillingSummary | null;
  isLoading: boolean;
  error: string | null;

  // Computed
  isTrialing: boolean;
  trialDaysRemaining: number | null;
  isPastDue: boolean;
  isExpired: boolean;
  isCanceling: boolean;
  isConfigured: boolean;
  planTier: string | null;
  availablePlans: AvailablePlan[];

  // Actions
  refresh: () => Promise<void>;
  checkout: (priceId: string, successUrl: string, cancelUrl: string) => Promise<void>;
  manageSubscription: (returnUrl: string) => Promise<void>;
  clearError: () => void;
}

/**
 * Hook for managing billing/subscription state.
 *
 * Loads subscription data on mount and provides actions for Stripe checkout
 * and customer portal. Requires initBillingApi() to have been called at startup.
 */
export function useBilling(): UseBillingReturn {
  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await billingApi.getSubscription();
      setSummary(data);
      logger.info('Billing data loaded', { tier: data.subscription.plan_tier });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load billing data';
      setError(msg);
      logger.error('Failed to load billing data', { error: msg });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkout = useCallback(
    async (priceId: string, successUrl: string, cancelUrl: string) => {
      setError(null);
      try {
        const { url } = await billingApi.createCheckoutSession(priceId, successUrl, cancelUrl);
        window.location.href = url;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Could not start checkout';
        setError(msg);
        logger.error('Checkout failed', { error: msg });
      }
    },
    []
  );

  const manageSubscription = useCallback(async (returnUrl: string) => {
    setError(null);
    try {
      const { url } = await billingApi.createPortalSession(returnUrl);
      window.location.href = url;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not open billing portal';
      setError(msg);
      logger.error('Portal redirect failed', { error: msg });
    }
  }, []);

  // Load on mount
  useEffect(() => {
    refresh();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Computed values
  const computed = useMemo(() => {
    const sub = summary?.subscription;
    const isTrialing = sub?.status === 'trialing';
    let trialDaysRemaining: number | null = null;
    if (isTrialing && sub?.trial_ends_at) {
      trialDaysRemaining = Math.max(
        0,
        Math.ceil((new Date(sub.trial_ends_at).getTime() - Date.now()) / 86400000)
      );
    }
    return {
      isTrialing,
      trialDaysRemaining,
      isPastDue: sub?.status === 'past_due',
      isExpired: sub?.status === 'expired',
      isCanceling: sub?.cancel_at_period_end ?? false,
      isConfigured: summary?.stripe_configured ?? false,
      planTier: sub?.plan_tier ?? null,
      availablePlans: summary?.available_plans ?? [],
    };
  }, [summary]);

  return {
    summary,
    isLoading,
    error,
    ...computed,
    refresh,
    checkout,
    manageSubscription,
    clearError,
  };
}
