import { useState, useEffect, useCallback } from 'react';
import { bookingApi } from '../../api/booking';
import type { BookingDetail, BookingCancelResponse } from '../../types/booking';
import { getLogger } from '../../utils/logging';

const logger = getLogger('useMyBookings');

interface UseMyBookingsReturn {
  bookings: BookingDetail[];
  isLoading: boolean;
  error: string | null;
  cancelBooking: (bookingId: number) => Promise<BookingCancelResponse>;
  isCancelling: number | null;
  refresh: () => Promise<void>;
}

export const useMyBookings = (): UseMyBookingsReturn => {
  const [bookings, setBookings] = useState<BookingDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState<number | null>(null);

  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await bookingApi.listMyBookings();
      setBookings(response.bookings);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load bookings';
      logger.error('Failed to fetch bookings', { error: message });
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const cancelBooking = useCallback(async (bookingId: number): Promise<BookingCancelResponse> => {
    setIsCancelling(bookingId);
    try {
      const result = await bookingApi.cancelBooking(bookingId);
      // Update local state
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: 'Cancelled', canCancel: false } : b)),
      );
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Cancellation failed';
      logger.error('Cancel booking failed', { error: message, bookingId });
      throw err;
    } finally {
      setIsCancelling(null);
    }
  }, []);

  return { bookings, isLoading, error, cancelBooking, isCancelling, refresh: fetchBookings };
};
