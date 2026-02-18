// Booking types — shared contract between backend API and frontend consumers
// Framework-agnostic: no React or framework imports

export interface ReservationRequest {
  slotId: number;
  guests: number;
  // Guest checkout fields (no login required)
  guestEmail?: string;
  guestName?: string;
  // Optional gift card code to apply at checkout
  giftCardCode?: string;
}

export interface Reservation {
  bookingId: number;
  status: 'pending_payment' | 'confirmed' | 'cancelled';
  slotId: number;
  guests: number;
  slot: {
    date: string;
    formattedTime: string;
    formattedDuration: string;
    formattedPrice: string;
    experienceTitle: string;
  };
  totalPriceCents: number;
  formattedTotalPrice: string;
  checkoutUrl?: string;
  /** Set when a gift card was applied at reserve time */
  giftCardAppliedCents?: number;
  /** Remaining amount charged to Stripe after gift card */
  giftCardRemainingCents?: number;
}

export interface BookingDetail {
  id: number;
  status: string;
  slot: {
    date: string;
    formattedTime: string;
    formattedDuration: string;
    formattedPrice: string;
    experienceTitle: string;
  };
  guests: number;
  totalPriceCents: number;
  formattedTotalPrice: string;
  createdAt: string;
  canCancel: boolean;
}

export interface BookingPaymentResponse {
  checkoutUrl: string;
}

export interface BookingCancelResponse {
  bookingId: number;
  status: 'cancelled';
  refundStatus: 'full' | 'partial' | 'none';
  refundAmount?: number; // cents
}

export interface BookingStatusResponse {
  bookingId: number;
  status: string;
}
