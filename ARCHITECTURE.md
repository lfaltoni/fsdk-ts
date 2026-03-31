# Frontend-lib Architecture

## What This Library Is

Frontend-lib is the **React companion to foundation-sdk**. Where foundation-sdk provides backend services (auth, media, billing, reviews, etc.) as a Python library, frontend-lib provides the corresponding React hooks, API clients, and TypeScript types for any frontend that consumes those services.

**Any app built on foundation-sdk should use frontend-lib for its frontend.** It is not specific to any single product — it provides the primitives that every foundation-sdk consumer needs.

## What Goes in Frontend-lib vs. Consumer Apps

This is the most important architectural decision in the library.

### Frontend-lib owns (agnostic)

Code that maps directly to a **foundation-sdk domain** or is **universally useful infrastructure**:

- **Auth** — login, register, logout, password reset, Google SSO, session management
- **User/Profile** — profile CRUD, avatar upload
- **Media** — generic entity-based upload/gallery (any entity type, any entity ID)
- **Reviews** — polymorphic reviews (any `targetTable`/`targetId`)
- **Billing** — Stripe subscription management (decoupled via `initBillingApi()`)
- **HTTP clients** — `apiRequest` (CSRF-aware), `foundationRequest`, `ApiError`
- **Utilities** — structured logging, localStorage helpers, env config, pagination, SEO JSON-LD generators
- **Server utilities** — rate limiting, IP extraction
- **Email** — nodemailer wrapper for server-side email sending

**Rule of thumb:** if the code would work identically for a hotel booking app, a SaaS dashboard, and an activity marketplace, it belongs here.

### Consumer apps own (domain-specific)

Code that encodes **product-specific domain knowledge**:

- Domain models and types (e.g., `Experience`, `Booking`, `Slot`, `GiftCard`)
- API clients for product-specific endpoints (e.g., `/api/v1/experiences/`)
- Hooks that orchestrate product-specific workflows (e.g., `useBooking`, `useAvailability`)
- Product-specific utilities (e.g., currency with hardcoded AED base, experience JSON-LD)
- UI components

**Rule of thumb:** if a different product built on foundation-sdk would need different types, different endpoints, or different business logic, it belongs in the consumer app.

### Grey areas

Some things feel generic but carry hidden product assumptions:

| Feature | Verdict | Why |
|---------|---------|-----|
| Newsletter subscription | Consumer | The endpoint shape and fields are product-specific |
| Currency formatting | Consumer | Base currency and exchange rates are product-specific |
| Gift card scoping | Consumer | `'platform' \| 'provider' \| 'experience'` is a product hierarchy |
| Slot-based availability | Consumer | Not all products use time slots |

When in doubt, start in the consumer app. It's easy to promote code to frontend-lib later; extracting code that leaked in is harder.

## Module Reference

### API Clients (`src/api/`)

Two base HTTP clients that all API modules build on:

| Client | File | Purpose | Auth |
|--------|------|---------|------|
| `apiRequest` | `client.ts` | Requests to the consumer app's backend | CSRF token (auto-fetched) |
| `foundationRequest` | `foundation-client.ts` | Requests to foundation-sdk's backend | JWT Bearer token from localStorage |

Both read their base URLs from `utils/env.ts` (configurable via `window.__API_URL__` / `window.__FOUNDATION_URL__` or env vars).

Domain API modules:

| Module | File | Base Client | Endpoints |
|--------|------|-------------|-----------|
| `authApi` | `auth.ts` | `foundationRequest` | `/api/auth/*` (login, register, logout, password reset, Google) |
| `profileApi` | `profile.ts` | `foundationRequest` | `/api/users/profile` (get, update) |
| `mediaApi` | `media.ts` | direct fetch | `/api/media/*` (upload, gallery, delete, reorder, set primary) |
| `reviewsApi` | `reviews.ts` | `foundationRequest` | `/api/reviews/*` (CRUD, helpful votes, replies, flagging) |
| `billingApi` | `billing.ts` | configurable | Stripe subscriptions (checkout, portal, status) |

`billingApi` is special — it uses `initBillingApi(requestFn, urlPrefix)` so the consumer can configure which HTTP client and URL prefix to use. This is the pattern to follow for any module that might talk to different backends in different products.

### React Hooks (`src/hooks/`)

| Hook | File | Purpose |
|------|------|---------|
| `useAuth()` | `auth/useAuth.ts` | Auth state: `user`, `isAuthenticated`, `login()`, `logout()`, `refreshUser()` |
| `useLogin()` | `auth/useLogin.ts` | Login form: `login()`, `register()`, `isLoading`, `error` |
| `useRegister()` | `auth/useRegister.ts` | Registration form (delegates to `useLogin`) |
| `useGoogleLogin()` | `auth/useGoogleLogin.ts` | Google Identity Services: `googleLogin(credential)` |
| `usePasswordReset()` | `auth/usePasswordReset.ts` | Password reset flow: `requestReset()`, `confirmReset()` |
| `useUser()` | `account/useUser.ts` | User data: `loadUser()`, `updateUser()`, `clearUser()` |
| `useProfile()` | `account/useProfile.ts` | Profile data + updates |
| `useProfilePicture()` | `account/useProfilePicture.ts` | Avatar upload: `uploadProfilePicture()`, `handleFileSelect()` |
| `useAccount()` | `useAccount.ts` | Composite: combines useUser + useProfile + useProfilePicture |
| `useReviews()` | `reviews/useReviews.ts` | Reviews for any entity: CRUD, replies, helpful votes, pagination |
| `useBilling()` | `billing/useBilling.ts` | Subscription state + actions: `checkout()`, `manageSubscription()` |

### Type Definitions (`src/types/`)

| File | Key Exports | Maps to |
|------|-------------|---------|
| `auth.ts` | `User`, `AuthState`, `LoginCredentials`, `RegisterData` | foundation-sdk `users` domain |
| `api.ts` | `PaginatedResponse<T>` | Generic pagination envelope |
| `filters.ts` | `FilterOption`, `ActiveFilters`, `CheckboxFilterOption`, `PriceRangeFilterOption`, `SelectNumberFilterOption` | Generic UI filter schema |
| `media.ts` | `MediaItem`, `MediaUploadResponse` | foundation-sdk `media` domain |
| `review.ts` | `Review`, `ReviewListResponse`, `ReviewStatsResponse`, `CreateReviewRequest`, etc. | foundation-sdk `reviews` domain |
| `billing.ts` | `Subscription`, `BillingSummary`, `AvailablePlan`, `BillingApi`, `PlanTier` | foundation-sdk `billing` domain |

### Utilities (`src/utils/`)

| File | Key Exports | Purpose |
|------|-------------|---------|
| `logging.ts` | `getLogger(context)`, `FrontendLogger` | Structured logging with levels, localStorage export, `window.getFrontendLogs()` |
| `storage.ts` | `storage` object | User + JWT token persistence in localStorage |
| `env.ts` | `getEnvConfig()`, `envConfig` | Base URLs for API and Foundation backends (configurable via window globals or env vars) |
| `pagination.ts` | `computePaginationPages()`, `computeTotalPages()` | Pagination UI logic (page numbers with gaps) |
| `seo.ts` | `generateOrganizationJsonLd()`, `generateBreadcrumbJsonLd()`, `generateArticleJsonLd()`, `generateFAQJsonLd()` | Schema.org JSON-LD generators (no framework dependency) |

### Server Modules (`src/server/`)

Server-only code, never bundled into client builds:

| File | Key Exports | Purpose |
|------|-------------|---------|
| `rate-limit.ts` | `createRateLimiter(options)`, `getClientIp(request)` | Sliding-window rate limiting for Next.js API routes |

### Email Module (`src/email/`)

Server-only email sending:

| File | Key Exports | Purpose |
|------|-------------|---------|
| `email-service.ts` | `sendEmail(options)` | Nodemailer wrapper, reads SMTP config from env vars at runtime |
| `types.ts` | `EmailOptions`, `SmtpConfig` | Type definitions for email configuration |

## Package Exports

The library uses conditional exports in `package.json` to support tree-shaking and server/client separation:

| Import Path | What You Get | Environment |
|-------------|-------------|-------------|
| `frontend-lib` | Everything (hooks, API clients, types, utils) | Client |
| `frontend-lib/types` | Type definitions only | Any |
| `frontend-lib/utils/pagination` | Pagination utilities only | Any |
| `frontend-lib/seo` | SEO JSON-LD generators | Any |
| `frontend-lib/email` | Email service | Server only |
| `frontend-lib/server` | Rate limiting | Server only |

## Conventions

### Adding a new foundation-sdk domain to frontend-lib

When foundation-sdk adds a new domain (e.g., `foundation/notifications/`), frontend-lib should get:

1. **Types** in `src/types/<domain>.ts` — mirrors the domain's models
2. **API client** in `src/api/<domain>.ts` — wraps the domain's HTTP endpoints
3. **Hook** in `src/hooks/<domain>/use<Domain>.ts` — React state management for the domain
4. **Barrel exports** — add re-exports to `types/index.ts`, `api/index.ts`, `hooks/index.ts`

Follow existing patterns — read `api/reviews.ts` and `hooks/reviews/useReviews.ts` as the canonical example of a well-structured domain module.

### Error handling

- API clients throw `ApiError` for non-2xx responses
- Hooks catch `ApiError` and expose `error` state
- Consumer components read `error` from hooks, never catch API errors directly

### Logging

Every API client and hook uses `getLogger(context)`:
```typescript
const logger = getLogger('moduleName')
logger.info('Action completed', { entityId: '123' })
```

Logs are stored in localStorage and can be exported via `window.getFrontendLogs()` for debugging.

## Environment Configuration

| Variable | Default | Purpose |
|----------|---------|---------|
| `NEXT_PUBLIC_API_URL` or `window.__API_URL__` | `http://localhost:5000` | Consumer app backend (used by `apiRequest`) |
| `NEXT_PUBLIC_FOUNDATION_URL` or `window.__FOUNDATION_URL__` | `http://localhost:5001` | Foundation SDK backend (used by `foundationRequest`) |

Defaults are dev-mode convenience values. Consumer apps override these via environment variables or window globals.

## Migration Complete (2026-03-31)

The following Rihla-specific modules were extracted to the Rihla consumer app (`rihla-web/frontend/chisfis-nextjs/src/lib/`). They now import agnostic utilities (logging, HTTP clients, `ApiError`) from frontend-lib.

| Moved Module | Now at `src/lib/` | Why it's product-specific |
|--------|-------------|--------------------------|
| `types/experience.ts` | `types/experience.ts` | Experience listing model |
| `types/booking.ts` | `types/booking.ts` | Reservation tied to experience handles |
| `types/slot.ts` | `types/slot.ts` | Time-slot availability |
| `types/giftcard.ts` | `types/giftcard.ts` | Gift card scoping |
| `api/experiences.ts` | `api/experiences.ts` | Experience-specific endpoints |
| `api/booking.ts` | `api/booking.ts` | Booking flow endpoints |
| `api/slots.ts` | `api/slots.ts` | Slot availability endpoints |
| `api/giftcards.ts` | `api/giftcards.ts` | Gift card endpoints |
| `api/communications.ts` | `api/communications.ts` | Newsletter/host registration |
| `hooks/*/useAvailability.ts` | `hooks/useAvailability.ts` | Slot-based availability |
| `hooks/*/useBooking.ts` | `hooks/useBooking.ts` | Booking workflow |
| `hooks/*/useMyBookings.ts` | `hooks/useMyBookings.ts` | User's bookings list |
| `hooks/*/useGiftCard.ts` | `hooks/useGiftCard.ts` | Gift card operations |
| `hooks/*/useCurrency.tsx` | `hooks/useCurrency.tsx` | AED-based currency provider |
| `utils/currency.ts` | `utils/currency.ts` | Hardcoded AED base + GCC exchange rates |
| `seo.ts` (`generateExperienceJsonLd`) | `utils/seo-experience.ts` | Uses experience types |
