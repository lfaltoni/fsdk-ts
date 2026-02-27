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
  usage: Record<string, number>;
  available_plans: AvailablePlan[];
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
