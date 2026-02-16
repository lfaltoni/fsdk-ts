import { useState, useCallback } from 'react';
import { bookingApi } from '../../api/booking';
import type { Reservation } from '../../types/booking';
import { getLogger } from '../../utils/logging';

const logger = getLogger('useBooking');

type BookingErrorCode = 'auth_required' | 'no_availability' | 'validation_error' | null;

export interface GuestInfo {
  guestEmail: string;
  guestName: string;
}

interface UseBookingReturn {
  // Actions
  reserve: (slotId: number, guests: number, guestInfo?: GuestInfo) => Promise<Reservation>;
  redirectToPayment: (bookingId: number) => Promise<void>;

  // State
  reservation: Reservation | null;
  isSubmitting: boolean;
  error: string | null;
  errorCode: BookingErrorCode;
  clearError: () => void;
}

/**
 * Parse a structured API error message into an error code.
 * The backend returns messages like "Login required to reserve",
 * "Not enough spots remaining", or validation errors.
 */
function parseErrorCode(message: string): BookingErrorCode {
  const lower = message.toLowerCase();
  if (lower.includes('login required') || lower.includes('auth')) {
    return 'auth_required';
  }
  if (lower.includes('not enough spots') || lower.includes('no_availability')) {
    return 'no_availability';
  }
  if (lower.includes('validation') || lower.includes('invalid')) {
    return 'validation_error';
  }
  return null;
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

  const clearError = useCallback(() => {
    setError(null);
    setErrorCode(null);
  }, []);

  const reserve = useCallback(
    async (slotId: number, guests: number, guestInfo?: GuestInfo): Promise<Reservation> => {
      setIsSubmitting(true);
      setError(null);
      setErrorCode(null);

      try {
        logger.info('Starting reservation', { handle, slotId, guests, isGuest: !!guestInfo });
        const result = await bookingApi.reserve(handle, {
          slotId,
          guests,
          ...(guestInfo && {
            guestEmail: guestInfo.guestEmail,
            guestName: guestInfo.guestName,
          }),
        });
        setReservation(result);
        logger.info('Reservation successful', { bookingId: result.bookingId });

        // Guest checkout: redirect to Stripe immediately if checkoutUrl is present
        if (result.checkoutUrl) {
          window.location.href = result.checkoutUrl;
        }

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Booking failed';
        const code = parseErrorCode(errorMessage);
        setError(errorMessage);
        setErrorCode(code);
        logger.error('Reservation error', { error: errorMessage, errorCode: code });
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [handle],
  );

  const redirectToPayment = useCallback(
    async (bookingId: number): Promise<void> => {
      setIsSubmitting(true);
      setError(null);
      setErrorCode(null);

      try {
        logger.info('Initiating payment redirect', { bookingId });
        const { checkoutUrl } = await bookingApi.getPaymentUrl(bookingId);
        // Redirect to Stripe hosted checkout
        window.location.href = checkoutUrl;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Payment initiation failed';
        setError(errorMessage);
        setErrorCode(parseErrorCode(errorMessage));
        logger.error('Payment redirect error', { error: errorMessage });
        setIsSubmitting(false);
        throw err;
      }
      // Note: no finally — if redirect succeeds, page unloads
    },
    [],
  );

  return {
    reserve,
    redirectToPayment,
    reservation,
    isSubmitting,
    error,
    errorCode,
    clearError,
  };
};
