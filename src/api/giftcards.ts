// Gift Card API — framework-agnostic, pure TypeScript async functions.
// All requests go to the Bookease-pro backend (apiRequest).

import type {
  GiftCardPurchaseRequest,
  GiftCardPurchaseResponse,
  GiftCard,
  GiftCardBalanceResponse,
  GiftCardValidateRequest,
  GiftCardValidateResponse,
  GiftCardListResponse,
} from '../types/giftcard';
import { getLogger } from '../utils/logging';
import { apiRequest } from './client';

const logger = getLogger('giftcard-api');

export const giftCardApi = {
  /**
   * Purchase a gift card. Returns a Stripe Checkout URL.
   * Auth is optional — guest purchasers provide purchaserEmail.
   */
  purchase: async (request: GiftCardPurchaseRequest): Promise<GiftCardPurchaseResponse> => {
    logger.info('Purchasing gift card', { valueCents: request.valueCents, scope: request.scope });
    try {
      const response = await apiRequest<GiftCardPurchaseResponse>('/api/v1/giftcards/purchase', {
        method: 'POST',
        body: JSON.stringify(request),
      });
      logger.info('Gift card purchase initiated', { giftCardId: response.giftCardId });
      return response;
    } catch (error) {
      logger.error('Gift card purchase failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  },

  /**
   * Public balance check by code. Does not require auth.
   */
  checkBalance: async (code: string): Promise<GiftCardBalanceResponse> => {
    logger.info('Checking gift card balance', { code });
    try {
      const response = await apiRequest<GiftCardBalanceResponse>(
        `/api/v1/giftcards/balance?code=${encodeURIComponent(code.trim().toUpperCase())}`,
      );
      return response;
    } catch (error) {
      logger.error('Gift card balance check failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  },

  /**
   * Validate a gift card code against a booking amount before checkout.
   * Read-only — does not deduct balance. Use this to show the adjusted price to the user.
   */
  validate: async (request: GiftCardValidateRequest): Promise<GiftCardValidateResponse> => {
    logger.info('Validating gift card', { code: request.code });
    try {
      const response = await apiRequest<GiftCardValidateResponse>('/api/v1/giftcards/validate', {
        method: 'POST',
        body: JSON.stringify(request),
      });
      return response;
    } catch (error) {
      logger.error('Gift card validation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  },

  /**
   * Get a gift card by ID. Owner or admin only.
   */
  getById: async (giftCardId: number): Promise<GiftCard> => {
    logger.info('Fetching gift card', { giftCardId });
    try {
      const response = await apiRequest<GiftCard>(`/api/v1/giftcards/${giftCardId}`);
      return response;
    } catch (error) {
      logger.error('Gift card fetch failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  },

  /**
   * List all gift cards purchased by or addressed to the logged-in user.
   */
  myCards: async (): Promise<GiftCardListResponse> => {
    logger.info('Fetching user gift cards');
    try {
      const response = await apiRequest<GiftCardListResponse>('/api/v1/giftcards/mine');
      return response;
    } catch (error) {
      logger.error('My gift cards fetch failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  },
};
