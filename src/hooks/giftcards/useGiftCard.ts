import { useState, useCallback } from 'react';
import { giftCardApi } from '../../api/giftcards';
import type {
  GiftCard,
  GiftCardBalanceResponse,
  GiftCardPurchaseRequest,
  GiftCardPurchaseResponse,
  GiftCardValidateRequest,
  GiftCardValidateResponse,
} from '../../types/giftcard';
import { getLogger } from '../../utils/logging';

const logger = getLogger('useGiftCard');

interface UseGiftCardReturn {
  // Actions
  purchase: (request: GiftCardPurchaseRequest) => Promise<GiftCardPurchaseResponse>;
  checkBalance: (code: string) => Promise<GiftCardBalanceResponse>;
  validate: (request: GiftCardValidateRequest) => Promise<GiftCardValidateResponse>;
  loadMyCards: () => Promise<void>;

  // State
  myCards: GiftCard[];
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

/**
 * Hook for gift card operations.
 *
 * Thin React wrapper around giftCardApi — all business logic lives in
 * the framework-agnostic API module.
 */
export const useGiftCard = (): UseGiftCardReturn => {
  const [myCards, setMyCards] = useState<GiftCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const purchase = useCallback(
    async (request: GiftCardPurchaseRequest): Promise<GiftCardPurchaseResponse> => {
      setIsLoading(true);
      setError(null);
      try {
        logger.info('Initiating gift card purchase', { valueCents: request.valueCents });
        const result = await giftCardApi.purchase(request);
        // Redirect to Stripe checkout
        window.location.href = result.checkoutUrl;
        return result;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Gift card purchase failed';
        setError(msg);
        logger.error('Gift card purchase error', { error: msg });
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const checkBalance = useCallback(
    async (code: string): Promise<GiftCardBalanceResponse> => {
      setIsLoading(true);
      setError(null);
      try {
        return await giftCardApi.checkBalance(code);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Balance check failed';
        setError(msg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const validate = useCallback(
    async (request: GiftCardValidateRequest): Promise<GiftCardValidateResponse> => {
      setIsLoading(true);
      setError(null);
      try {
        return await giftCardApi.validate(request);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Validation failed';
        setError(msg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const loadMyCards = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const { cards } = await giftCardApi.myCards();
      setMyCards(cards);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load gift cards';
      setError(msg);
      logger.error('loadMyCards error', { error: msg });
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    purchase,
    checkBalance,
    validate,
    loadMyCards,
    myCards,
    isLoading,
    error,
    clearError,
  };
};
