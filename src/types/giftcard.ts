// Gift card types — shared contract between backend API and frontend consumers.
// Framework-agnostic: no React or framework imports.

export type GiftCardStatus =
  | 'pending_payment'
  | 'active'
  | 'partially_used'
  | 'fully_used'
  | 'expired'
  | 'voided';

export type GiftCardDeliveryMethod = 'email_giftee' | 'keep_self';

export type GiftCardScope = 'platform' | 'provider' | 'experience';

// ─── Purchase ────────────────────────────────────────────────────────────────

export interface GiftCardPurchaseRequest {
  /** Face value in cents (e.g. 5000 = $50) */
  valueCents: number;
  deliveryMethod: GiftCardDeliveryMethod;
  purchaserEmail: string;
  purchaserName: string;
  /** Required when deliveryMethod === 'email_giftee' */
  recipientEmail?: string;
  personalizedMessage?: string;
  scope?: GiftCardScope;
  /** Required when scope === 'provider' */
  scopeProviderId?: number;
  /** Required when scope === 'experience' */
  scopeExperienceId?: number;
}

export interface GiftCardPurchaseResponse {
  giftCardId: number;
  /** The generated code — shown to the user on the confirmation page */
  code: string;
  /** Stripe Checkout URL to redirect the purchaser to */
  checkoutUrl: string;
}

// ─── Gift card (owner view) ───────────────────────────────────────────────────

export interface GiftCard {
  id: number;
  code: string;
  originalValueCents: number;
  remainingBalanceCents: number;
  formattedBalance: string;
  formattedOriginalValue: string;
  status: GiftCardStatus;
  deliveryMethod: GiftCardDeliveryMethod;
  recipientEmail?: string | null;
  personalizedMessage?: string | null;
  scope: GiftCardScope;
  scopeProviderId?: number | null;
  scopeExperienceId?: number | null;
  purchaserEmail: string;
  purchaserName: string;
  purchasedAt: string;
  expiresAt?: string | null;
  deliveredAt?: string | null;
  /** Cover image URL from the media domain. Null when no image has been associated. */
  imageUrl?: string | null;
}

// ─── Public balance check ─────────────────────────────────────────────────────

export interface GiftCardBalanceResponse {
  code: string;
  status: GiftCardStatus;
  remainingBalanceCents: number;
  formattedBalance: string;
  originalValueCents: number;
  formattedOriginalValue: string;
  expiresAt?: string | null;
  scope: GiftCardScope;
  imageUrl?: string | null;
}

// ─── Validation (pre-checkout) ────────────────────────────────────────────────

export interface GiftCardValidateRequest {
  code: string;
  bookingAmountCents: number;
  experienceId?: number;
  experienceProviderId?: number;
}

export interface GiftCardValidateResponse {
  valid: boolean;
  /** Amount that will be deducted from the card */
  applicableAmountCents: number;
  /** Card balance remaining after deduction */
  newBalanceCents: number;
  /** Amount still owed via Stripe after card applied */
  remainingBookingCents: number;
  error?: string | null;
}

// ─── My cards list ────────────────────────────────────────────────────────────

export interface GiftCardListResponse {
  success: boolean;
  cards: GiftCard[];
  total: number;
}
