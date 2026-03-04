import { useState, useCallback } from 'react';
import { bookingApi } from '../../api/booking';
import { ApiError } from '../../api/client';
import type { Reservation } from '../../types/booking';
import { getLogger } from '../../utils/logging';

const logger = getLogger('useBooking');

export type BookingErrorCode =
  | 'auth_required'
  | 'no_availability'
  | 'validation_error'
  | 'not_found'
  | 'rate_limited'
  | 'payment_failed'
  | null;

export interface GuestInfo {
  guestEmail: string;
  guestName: string;
}

export interface BookingError {
  message: string;
  code: BookingErrorCode;
  /** Remaining spots — populated when code is 'no_availability' */
  remainingSpots?: number;
}

interface UseBookingReturn {
  // Actions
  reserve: (slotId: number, guests: number, guestInfo?: GuestInfo, giftCardCode?: string) => Promise<Reservation>;
  redirectToPayment: (bookingId: number) => Promise<void>;

  // State
  reservation: Reservation | null;
  isSubmitting: boolean;
  error: string | null;
  errorCode: BookingErrorCode;
  /** Structured error with extra context (e.g. remainingSpots) */
  bookingError: BookingError | null;
  clearError: () => void;
}

/**
 * Derive a BookingError from a caught exception.
 * Uses ApiError.status and ApiError.code for precise matching,
 * with message-based fallback for plain Error instances.
 */
function deriveBookingError(err: unknown): BookingError {
  if (err instanceof ApiError) {
    // Status-based mapping
    if (err.status === 401) {
      return { message: 'Please log in or continue as a guest to book.', code: 'auth_required' };
    }
    if (err.status === 404) {
      return { message: err.message, code: 'not_found' };
    }
    if (err.status === 409 || err.code === 'no_availability') {
      const remaining = err.data.remainingSpots as number | undefined;
      const msg = remaining != null && remaining > 0
        ? `Only ${remaining} spot${remaining === 1 ? '' : 's'} left for this time slot.`
        : 'This time slot is fully booked. Please select another time.';
      return { message: msg, code: 'no_availability', remainingSpots: remaining };
    }
    if (err.status === 422) {
      return { message: err.message, code: 'validation_error' };
    }
    if (err.status === 429) {
      return { message: 'Too many booking attempts. Please wait a moment and try again.', code: 'rate_limited' };
    }
    if (err.status === 502) {
      return { message: 'Payment setup failed. Please try again.', code: 'payment_failed' };
    }
    return { message: err.message, code: null };
  }

  // Plain Error fallback — keyword matching
  const message = err instanceof Error ? err.message : 'Booking failed. Please try again.';
  const lower = message.toLowerCase();
  if (lower.includes('login required') || lower.includes('auth')) {
    return { message, code: 'auth_required' };
  }
  if (lower.includes('not enough spots') || lower.includes('no_availability')) {
    return { message, code: 'no_availability' };
  }
  return { message, code: null };
}

/**
 * Hook for creating and managing experience bookings.
 * Thin React wrapper around bookingApi — all business logic
 * lives in the framework-agnostic API module.
 */
export const useBooking = (handle: string): UseBookingReturn => {
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<BookingErrorCode>(null);
  const [bookingError, setBookingError] = useState<BookingError | null>(null);

  const clearError = useCallback(() => {
    setError(null);
    setErrorCode(null);
    setBookingError(null);
  }, []);

  const applyError = useCallback((err: unknown) => {
    const derived = deriveBookingError(err);
    setError(derived.message);
    setErrorCode(derived.code);
    setBookingError(derived);
    return derived;
  }, []);

  const reserve = useCallback(
    async (slotId: number, guests: number, guestInfo?: GuestInfo, giftCardCode?: string): Promise<Reservation> => {
      setIsSubmitting(true);
      clearError();

      try {
        logger.info('Starting reservation', { handle, slotId, guests, isGuest: !!guestInfo });
        const result = await bookingApi.reserve(handle, {
          slotId,
          guests,
          ...(guestInfo && {
            guestEmail: guestInfo.guestEmail,
            guestName: guestInfo.guestName,
          }),
          ...(giftCardCode && { giftCardCode }),
        });
        setReservation(result);
        logger.info('Reservation successful', { bookingId: result.bookingId });

        // NOTE: Full-cover gift card bookings have no checkoutUrl.
        // BookingSidebar handles routing for those. Do not throw or
        // set error state here when checkoutUrl is absent.
        if (result.checkoutUrl) {
          window.location.href = result.checkoutUrl;
        }

        return result;
      } catch (err) {
        const derived = applyError(err);
        logger.error('Reservation error', { error: derived.message, errorCode: derived.code });
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [handle, clearError, applyError],
  );

  const redirectToPayment = useCallback(
    async (bookingId: number): Promise<void> => {
      setIsSubmitting(true);
      clearError();

      try {
        logger.info('Initiating payment redirect', { bookingId });
        const { checkoutUrl } = await bookingApi.getPaymentUrl(bookingId);
        // Redirect to Stripe hosted checkout
        window.location.href = checkoutUrl;
      } catch (err) {
        const derived = applyError(err);
        logger.error('Payment redirect error', { error: derived.message });
        setIsSubmitting(false);
        throw err;
      }
      // Note: no finally — if redirect succeeds, page unloads
    },
    [clearError, applyError],
  );

  return {
    reserve,
    redirectToPayment,
    reservation,
    isSubmitting,
    error,
    errorCode,
    bookingError,
    clearError,
  };
};
