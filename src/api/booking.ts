// Booking API — framework-agnostic, pure TypeScript async functions
// No React imports. Any JS/TS consumer can call these directly.

import type {
  ReservationRequest,
  Reservation,
  BookingDetail,
  BookingPaymentResponse,
  BookingCancelResponse,
  BookingStatusResponse,
} from '../types/booking';
import { getLogger } from '../utils/logging';
import { apiRequest } from './client';

const logger = getLogger('booking-api');

export const bookingApi = {
  /**
   * Create a reservation for an experience slot.
   * Requires active session (credentials: 'include').
   */
  reserve: async (
    handle: string,
    request: ReservationRequest,
  ): Promise<Reservation> => {
    logger.info('Creating reservation', { handle, slotId: request.slotId, guests: request.guests });

    try {
      const response = await apiRequest<Reservation>(
        `/api/v1/experiences/${encodeURIComponent(handle)}/reserve`,
        {
          method: 'POST',
          body: JSON.stringify(request),
        },
      );
      logger.info('Reservation created', { bookingId: response.bookingId });
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Reservation failed', { error: errorMessage, handle });
      throw error;
    }
  },

  /**
   * Get full booking details. Owner only.
   */
  getBooking: async (bookingId: number): Promise<BookingDetail> => {
    logger.info('Fetching booking', { bookingId });

    try {
      const response = await apiRequest<BookingDetail>(
        `/api/v1/bookings/${bookingId}`,
      );
      logger.info('Booking fetched', { bookingId });
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to fetch booking', { error: errorMessage, bookingId });
      throw error;
    }
  },

  /**
   * Initiate Stripe Checkout and get the redirect URL.
   * Owner only. Booking must be in Pending status.
   */
  getPaymentUrl: async (bookingId: number): Promise<BookingPaymentResponse> => {
    logger.info('Initiating payment', { bookingId });

    try {
      const response = await apiRequest<BookingPaymentResponse>(
        `/api/v1/bookings/${bookingId}/pay`,
        { method: 'POST' },
      );
      logger.info('Payment URL received', { bookingId });
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Payment initiation failed', { error: errorMessage, bookingId });
      throw error;
    }
  },

  /**
   * Cancel a booking. Processes refund if paid. Owner only.
   */
  cancelBooking: async (bookingId: number): Promise<BookingCancelResponse> => {
    logger.info('Cancelling booking', { bookingId });

    try {
      const response = await apiRequest<BookingCancelResponse>(
        `/api/v1/bookings/${bookingId}/cancel`,
        { method: 'POST' },
      );
      logger.info('Booking cancelled', { bookingId, refundStatus: response.refundStatus });
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Booking cancellation failed', { error: errorMessage, bookingId });
      throw error;
    }
  },

  /**
   * Confirm a booking via Stripe checkout session ID.
   * Public — no auth required; the session ID acts as proof of payment.
   * Also confirms the booking server-side if the webhook hasn't fired yet.
   */
  confirmSession: async (sessionId: string): Promise<BookingDetail> => {
    logger.info('Confirming booking via session', { sessionId: sessionId.slice(0, 16) + '...' });

    try {
      const response = await apiRequest<BookingDetail>(
        `/api/v1/bookings/confirm-session?sessionId=${encodeURIComponent(sessionId)}`,
      );
      logger.info('Session confirmed', { bookingId: response.id, status: response.status });
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Session confirmation failed', { error: errorMessage });
      throw error;
    }
  },

  /**
   * Lightweight status check for polling after payment.
   * Owner only.
   */
  getStatus: async (bookingId: number): Promise<BookingStatusResponse> => {
    logger.info('Checking booking status', { bookingId });

    try {
      const response = await apiRequest<BookingStatusResponse>(
        `/api/v1/bookings/${bookingId}/status`,
      );
      logger.info('Booking status received', { bookingId, status: response.status });
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Status check failed', { error: errorMessage, bookingId });
      throw error;
    }
  },
};
