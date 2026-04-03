# fsdk-ts Architecture

## What This Library Is

fsdk-ts is the **React companion to foundation-sdk**. Where foundation-sdk provides backend services (auth, media, billing, reviews, etc.) as a Python library, fsdk-ts provides the corresponding React hooks, API clients, and TypeScript types for any frontend that consumes those services.

**Any app built on foundation-sdk should use fsdk-ts for its frontend.** It is not specific to any single product — it provides the primitives that every foundation-sdk consumer needs.

## What Goes in fsdk-ts vs. Consumer Apps

This is the most important architectural decision in the library.

### fsdk-ts owns (agnostic)

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

When in doubt, start in the consumer app. It's easy to promote code to fsdk-ts later; extracting code that leaked in is harder.

## Module Reference

### API Clients (`src/api/`)

Two base HTTP clients that all API modules build on:

| Client | File | Purpose | Auth |
|--------|------|---------|------|
| `apiRequest` | `client.ts` | Requests to the consumer app's backend | CSRF token (auto-fetched) |
| `foundationRequest` | `foundation-client.ts` | Requests to foundation-sdk's backend | `credentials: 'include'` (cookies) + JWT Bearer if token exists in localStorage |

Both read their base URLs from `utils/env.ts` (configurable via `window.__API_URL__` / `window.__FOUNDATION_URL__` or env vars).

Domain API modules:

| Module | File | Base Client | Endpoints |
|--------|------|-------------|-----------|
| `authApi` | `auth.ts` | `foundationRequest` | `/api/auth/*` (login, register, logout, password reset, Google) |
| `profileApi` | `profile.ts` | `foundationRequest` | `/api/users/profile` (get, update) |
| `mediaApi` | `media.ts` | direct fetch | `/api/media/*` (upload, gallery, delete, reorder, set primary) |
| `reviewsApi` | `reviews.ts` | `foundationRequest` | `/api/reviews/*` (CRUD, helpful votes, replies, flagging) |
| `billingApi` | `billing.ts` | configurable | Stripe subscriptions (checkout, portal, status) |
| `mfaApi` | `mfa.ts` | `foundationRequest` | `/api/mfa/*` (status, enroll, confirm, unenroll, challenge, verify) |
| `auditApi` | `audit.ts` | `foundationRequest` | `/api/admin/audit/*` (query, actor timeline, entity history) |
| `invitesApi` | `invites.ts` | `foundationRequest` | `/api/admin/invites/*` + `/api/invites/*` (CRUD, validate, consume) |
| `adminApi` | `admin.ts` | `foundationRequest` | `/api/admin/users/*` (list, detail, status, resend MFA) |

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
| `useMfa()` | `mfa/useMfa.ts` | MFA enrollment + challenges: `beginEnrollment()`, `confirmEnrollment()`, `unenroll()`, `sendChallenge()`, `verifyChallenge()`. Auto-fetches status. |
| `useAudit()` | `audit/useAudit.ts` | Audit log queries: `query()`, `getActorTimeline()`, `getEntityHistory()`. Manual trigger. |
| `useInvites()` | `invites/useInvites.ts` | Platform invite management: `create()`, `listAll()`, `listPending()`, `revoke()`, `validate()`, `consume()`. Manual trigger. |
| `useAdmin()` | `admin/useAdmin.ts` | Admin user management: `listUsers()`, `getUserDetail()`, `setAccountStatus()`, `resendMfa()`. Manual trigger. |

### Type Definitions (`src/types/`)

| File | Key Exports | Maps to |
|------|-------------|---------|
| `auth.ts` | `User`, `AuthState`, `LoginCredentials`, `RegisterData` | foundation-sdk `users` domain |
| `api.ts` | `PaginatedResponse<T>` | Generic pagination envelope |
| `filters.ts` | `FilterOption`, `ActiveFilters`, `CheckboxFilterOption`, `PriceRangeFilterOption`, `SelectNumberFilterOption` | Generic UI filter schema |
| `media.ts` | `MediaItem`, `MediaUploadResponse` | foundation-sdk `media` domain |
| `review.ts` | `Review`, `ReviewListResponse`, `ReviewStatsResponse`, `CreateReviewRequest`, etc. | foundation-sdk `reviews` domain |
| `billing.ts` | `Subscription`, `BillingSummary`, `AvailablePlan`, `BillingApi`, `PlanTier` | foundation-sdk `billing` domain |
| `mfa.ts` | `MfaStatusResponse`, `MfaResultResponse`, `MfaEnrollRequest`, `MfaCodeRequest` | foundation-sdk `mfa` domain |
| `audit.ts` | `AuditEntry`, `AuditPageResponse`, `AuditQueryParams`, `AuditPaginationMeta` | foundation-sdk `audit` domain |
| `invite.ts` | `PlatformInvite`, `InviteListResponse`, `InviteValidateResponse`, `InviteCreateRequest` | foundation-sdk `invites` domain |
| `admin.ts` | `AdminUser`, `AdminUserDetail`, `AdminUserListResponse`, `AdminUserListParams` | foundation-sdk `admin` domain |

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
| `fsdk-ts` | Everything (hooks, API clients, types, utils) | Client |
| `fsdk-ts/types` | Type definitions only | Any |
| `fsdk-ts/utils/pagination` | Pagination utilities only | Any |
| `fsdk-ts/seo` | SEO JSON-LD generators | Any |
| `fsdk-ts/email` | Email service | Server only |
| `fsdk-ts/server` | Rate limiting | Server only |

## Conventions

### Adding a new foundation-sdk domain to fsdk-ts

When foundation-sdk adds a new domain (e.g., `foundation/notifications/`), fsdk-ts should get:

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

## Consumer Integration Notes

Architectural patterns that consumer apps need to be aware of when integrating fsdk-ts with a foundation-sdk backend.

### Auth State Initialization

`useAuth()` synchronously reads the user from localStorage on first render. This means auth guards (`if (!isAuthenticated) redirect`) work correctly without race conditions. If you see flash-redirects after login, verify that `storage.setUser()` is called before navigation and that `useAuth` is using the synchronous `getInitialUser` pattern (not a useEffect-only approach).

### JWT Bearer Auth vs Flask-Login Sessions

`foundationRequest` sends both `credentials: 'include'` (so browser cookies are attached) and a JWT Bearer token if one exists in localStorage. This means it works for two auth strategies without any configuration:

- **Same-origin apps** (e.g., blogmachine — frontend served by or proxied to the same backend): Cookies are sent automatically. No JWT needed. `foundationRequest` works out of the box.
- **Cross-origin apps** (e.g., frontend on `:3000`, backend on `:5001`): Session cookies won't survive `SameSite` policies (requires HTTPS in dev). The JWT Bearer token handles auth instead.

For cross-origin setups, foundation-sdk blueprints use Flask-Login's `@login_required` which checks session cookies. Consumer apps must bridge JWT tokens to Flask-Login sessions. foundation-sdk provides a one-liner for this:

```python
from foundation.auth.jwt import configure_jwt_session_bridge
configure_jwt_session_bridge(app)  # after login_manager.init_app(app)
```

This installs a `before_request` hook that decodes the JWT and calls `login_user()`, so all `@login_required` decorators work transparently. Same-origin apps don't need this — cookies handle everything.

### Optional Domains and 404s

foundation-sdk domains like MFA, billing, and tenancy are opt-in. When not configured, their blueprints are not registered, so endpoints return 404. Frontend code using hooks for optional domains (`useMfa`, `useBilling`) should handle 404 responses gracefully — display a "not configured" message rather than a generic error.

### Media Gallery 404 on Empty

The media blueprint returns 404 when no media exists for an entity, rather than 200 with an empty array. Frontend code calling `mediaApi.getGallery()` should catch 404 and treat it as an empty gallery.

## Migration Complete (2026-03-31)

The following Rihla-specific modules were extracted to the Rihla consumer app (`rihla-web/frontend/chisfis-nextjs/src/lib/`). They now import agnostic utilities (logging, HTTP clients, `ApiError`) from fsdk-ts.

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
