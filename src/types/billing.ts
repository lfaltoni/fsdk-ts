// Billing domain types — generic subscription management with Stripe

export type PlanTier = string; // Generic — consumer defines tier names
export type SubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'canceled'
  | 'incomplete'
  | 'expired';

export interface Subscription {
  plan_tier: PlanTier;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  trial_ends_at: string | null;
}

export interface AvailablePlan {
  tier: PlanTier;
  price_id: string;
  label: string;
}

export interface BillingSummary {
  stripe_configured: boolean;
  subscription: Subscription;
  limits: Record<string, number | string[] | null>;
  /**
   * Current usage per resource. `null` means the count could NOT be determined
   * (the backend's resource counter failed) — render it as "unknown", NEVER as
   * 0. A confident `0 / 5` over an unknown state is the bug this nullability
   * exists to prevent.
   */
  usage: Record<string, number | null>;
  available_plans: AvailablePlan[];
}

/**
 * 403 `tier_limit_exceeded` / 503 `usage_unknown` body from a gated endpoint.
 * `current` is `null` when the request was refused because the usage could not
 * be counted — not because a limit was reached.
 */
export interface TierLimitError {
  error: 'tier_limit_exceeded' | 'usage_unknown';
  resource: string;
  limit: number | null;
  current: number | null;
  tier: PlanTier;
  message: string;
}

export interface CheckoutResponse {
  url: string;
}

export interface PortalResponse {
  url: string;
}

/** Type for the billing API object (used by hook and consumers). */
export interface BillingApi {
  getSubscription: () => Promise<BillingSummary>;
  createCheckoutSession: (
    priceId: string,
    successUrl: string,
    cancelUrl: string
  ) => Promise<CheckoutResponse>;
  createPortalSession: (returnUrl: string) => Promise<PortalResponse>;
}
