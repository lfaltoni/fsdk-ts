/**
 * Billing API module — init-time configuration pattern.
 *
 * Consumer calls initBillingApi() once at app startup with their request function
 * and URL prefix. Then billingApi is used everywhere (imported directly by hooks).
 *
 * Usage:
 *   import { initBillingApi, billingApi } from 'frontend-lib';
 *   // At startup:
 *   initBillingApi(apiRequest, '/bm/billing/');
 *   // In components/hooks:
 *   const data = await billingApi.getSubscription();
 */

import { getLogger } from '../utils/logging';
import type {
  BillingSummary,
  CheckoutResponse,
  PortalResponse,
  BillingApi,
} from '../types/billing';

const logger = getLogger('billing-api');

// Module-level state — configured once by consumer
type RequestFn = <T>(url: string, opts?: RequestInit) => Promise<T>;
let _requestFn: RequestFn | null = null;
let _urlPrefix = '/billing/';

/**
 * Initialize the billing API module. Call once at app startup.
 *
 * @param requestFn - The consumer's HTTP request function (e.g. apiRequest)
 * @param urlPrefix - URL prefix for billing endpoints (e.g. '/bm/billing/')
 */
export function initBillingApi(requestFn: RequestFn, urlPrefix = '/billing/'): void {
  _requestFn = requestFn;
  _urlPrefix = urlPrefix.endsWith('/') ? urlPrefix : urlPrefix + '/';
  logger.info('Billing API initialized', { urlPrefix: _urlPrefix });
}

function getRequestFn(): RequestFn {
  if (!_requestFn) {
    throw new Error(
      'Billing API not initialized. Call initBillingApi(requestFn, urlPrefix) at app startup.'
    );
  }
  return _requestFn;
}

/** Module-level billing API — uses the configured request function. */
export const billingApi: BillingApi = {
  getSubscription: () => {
    const req = getRequestFn();
    return req<BillingSummary>(_urlPrefix);
  },

  createCheckoutSession: (priceId: string, successUrl: string, cancelUrl: string) => {
    const req = getRequestFn();
    return req<CheckoutResponse>(`${_urlPrefix}checkout`, {
      method: 'POST',
      body: JSON.stringify({
        price_id: priceId,
        success_url: successUrl,
        cancel_url: cancelUrl,
      }),
    });
  },

  createPortalSession: (returnUrl: string) => {
    const req = getRequestFn();
    return req<PortalResponse>(`${_urlPrefix}portal`, {
      method: 'POST',
      body: JSON.stringify({ return_url: returnUrl }),
    });
  },
};

/**
 * Factory for consumers who prefer explicit instances over module-level state.
 *
 * Usage:
 *   const myBillingApi = createBillingApi(apiRequest, '/api/billing/');
 */
export function createBillingApi(requestFn: RequestFn, urlPrefix = '/billing/'): BillingApi {
  const prefix = urlPrefix.endsWith('/') ? urlPrefix : urlPrefix + '/';
  return {
    getSubscription: () => requestFn<BillingSummary>(prefix),

    createCheckoutSession: (priceId, successUrl, cancelUrl) =>
      requestFn<CheckoutResponse>(`${prefix}checkout`, {
        method: 'POST',
        body: JSON.stringify({
          price_id: priceId,
          success_url: successUrl,
          cancel_url: cancelUrl,
        }),
      }),

    createPortalSession: (returnUrl) =>
      requestFn<PortalResponse>(`${prefix}portal`, {
        method: 'POST',
        body: JSON.stringify({ return_url: returnUrl }),
      }),
  };
}
