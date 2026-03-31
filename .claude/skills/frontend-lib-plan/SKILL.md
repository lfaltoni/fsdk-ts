---
description: Plan the implementation of a new domain module in frontend-lib (the React companion to foundation-sdk). Covers types, API client, React hook, barrel exports, and package exports. Ensures the module stays agnostic and follows existing conventions.
---

# /frontend-lib-plan — Frontend-lib Domain Module Planning

## User Input

```text
$ARGUMENTS
```

You **MUST** read the user input carefully — it describes the new domain, feature, or change to plan.

---

## Phase 1: Understand the Request

Before touching any code, answer:

1. **What foundation-sdk domain does this map to?** (e.g., notifications, teams, tenancy)
2. **Is this truly agnostic?** Would this code work identically for a hotel app, a SaaS dashboard, and an activity marketplace? If not, it belongs in the consumer app, not here.
3. **What are the key entities/models?** List them with their fields.
4. **What API endpoints does the foundation-sdk backend expose for this domain?**
5. **What React state management does the consumer need?** (CRUD, loading, error, pagination?)

Write this summary out before proceeding.

## Phase 2: Read the Living References

Read these files to understand current conventions. The plan must follow existing patterns exactly.

### Required reads

```bash
# 1. Architecture doc — the authoritative reference for what goes where
cat ARCHITECTURE.md

# 2. Canonical API client example — reviews is the best-structured one
cat src/api/reviews.ts

# 3. Canonical hook example
cat src/hooks/reviews/useReviews.ts

# 4. Canonical type definitions
cat src/types/review.ts

# 5. HTTP clients — understand apiRequest vs foundationRequest
cat src/api/client.ts
cat src/api/foundation-client.ts

# 6. Current barrel exports — what's already exported
cat src/api/index.ts
cat src/hooks/index.ts
cat src/types/index.ts
cat src/utils/index.ts
cat src/index.ts

# 7. Package exports — subpath exports in package.json
grep -A 30 '"exports"' package.json

# 8. Logging convention
cat src/utils/logging.ts
```

### Conditional reads

```bash
# If the domain uses a decoupled initialization pattern (like billing)
cat src/api/billing.ts  # initBillingApi() pattern

# If the domain needs a React context/provider (like currency did before extraction)
# Check hooks/billing/useBilling.ts for the context pattern

# If the corresponding foundation-sdk domain exists
cat ../foundation-sdk/foundation/<domain>/DOMAIN.md
cat ../foundation-sdk/ARCHITECTURE.md  # relevant section
```

## Phase 3: Agnosticism Check

This is the most critical gate. For each piece of planned code, ask:

| Question | If YES → frontend-lib | If NO → consumer app |
|----------|----------------------|---------------------|
| Would a different product need the exact same types? | Types here | Types in consumer |
| Would a different product call the same endpoints with the same shapes? | API client here | API client in consumer |
| Would a different product need the same React state management? | Hook here | Hook in consumer |
| Does the code have hardcoded product-specific values (currencies, categories, scopes)? | Extract those values | Code stays in consumer |

**Grey area pattern:** If the domain is generic but some configuration is product-specific, use the `initBillingApi()` pattern — the module lives in frontend-lib but is initialized by the consumer with product-specific config.

**Output:** A table classifying each planned export as "agnostic" or "needs init pattern" or "consumer-only (don't build here)".

## Phase 4: Convention Checklist

### 4A. Types (`src/types/<domain>.ts`)

1. **Mirror foundation-sdk models.** Field names and types must match the JSON the backend returns.
2. **Export interfaces, not classes.** All types are plain interfaces or type aliases.
3. **No imports from other files** — type files are self-contained.
4. **Include request and response types** — not just the entity model.
   - e.g., `CreateReviewRequest`, `ReviewListResponse`, `ReviewStatsResponse`
5. **Use `PaginatedResponse<T>` from `types/api.ts`** if the endpoint returns paginated data.

### 4B. API Client (`src/api/<domain>.ts`)

1. **Choose the right HTTP client:**
   - `apiRequest` — for requests to the consumer app's backend (CSRF token, cookie auth)
   - `foundationRequest` — for requests to foundation-sdk's backend (JWT Bearer token)
   - If the domain might talk to different backends in different products → use the `initBillingApi(requestFn, urlPrefix)` decoupled pattern

2. **Structured logging:** Every API client uses `getLogger('domain-api')` at module level.
   - `logger.info()` before and after each request
   - `logger.error()` in catch blocks with the error message
   - Include relevant context (IDs, counts) in log metadata

3. **Error handling:** Let `ApiError` propagate — do not catch and re-throw with a different type. The hook layer handles error display.

4. **Export a single object** with all methods (e.g., `export const reviewsApi = { ... }`).

5. **Type every request and response** — import from the types file.

### 4C. React Hook (`src/hooks/<domain>/use<Domain>.ts`)

1. **Thin React wrapper.** Business logic lives in the API client, not the hook.
2. **Standard state shape:** `{ data, isLoading, error, clearError, ...actions }`
3. **Use `getLogger('useDomain')` for hook-level logging.**
4. **Catch `ApiError`** from the API client and expose `error: string | null` state.
5. **Use `useCallback`** for all action functions to prevent unnecessary re-renders.
6. **Use `useEffect`** for initial data fetching (with the fetch function in `useCallback`).
7. **If the hook manages a list with pagination,** accept page/limit params and expose `totalPages`.
8. **Export the hook and its return type interface.**

### 4D. Barrel Exports

For every new module, update:

1. `src/types/index.ts` — add `export * from './<domain>'`
2. `src/api/index.ts` — add `export * from './<domain>'`
3. `src/hooks/index.ts` — add `export * from './<domain>/use<Domain>'`
4. `src/index.ts` — no change needed (it re-exports from the barrel files above)

### 4E. Package Exports (if needed)

If the new module should be importable via a subpath (e.g., `frontend-lib/<domain>`), add an entry to the `"exports"` map in `package.json`. Most modules don't need this — they're accessible via the main `frontend-lib` import.

Only add a subpath export if:
- The module is server-only (like `server/` or `email/`)
- The module is useful standalone without pulling in all of frontend-lib

### 4F. Logging

- API clients: `const logger = getLogger('<domain>-api')`
- Hooks: `const logger = getLogger('use<Domain>')`
- Log INFO for successful operations with relevant IDs
- Log ERROR for failures with error message
- Never log sensitive data (tokens, passwords, PII)

## Phase 5: Write the Implementation Plan

### Plan structure

```
## Context
1-3 sentences. What foundation-sdk domain this maps to, what the consumer needs.

## Agnosticism Assessment
Table showing each export and why it's agnostic (or why it uses the init pattern).

## Work Packages

### WP1: Types — `src/types/<domain>.ts`
- List every interface/type to define
- Show the key fields for each
- Note which match foundation-sdk response shapes

### WP2: API Client — `src/api/<domain>.ts`
- Which HTTP client (apiRequest vs foundationRequest vs init pattern)
- List every method with: name, HTTP method, endpoint path, request type, response type
- Logger context string

### WP3: React Hook — `src/hooks/<domain>/use<Domain>.ts`
- Return type interface
- State fields (data, isLoading, error, etc.)
- Action functions
- Initial fetch behavior (useEffect or manual)

### WP4: Barrel Exports
- Exact lines to add to each index.ts

### WP5: Package Exports (if applicable)
- Exact entry to add to package.json exports map

## Files to Modify
| File | WP | Changes |
|------|-----|---------|

## Files to Read Before Implementation
List files the implementing agent MUST read in full.

## Implementation Order
1. Types (no dependencies)
2. API client (depends on types)
3. Hook (depends on API client and types)
4. Barrel exports (depends on all above)
5. Build verification: `npm run build`

## Verification
- `npm run build` passes (both ESM and CJS)
- Consumer app can import new exports from `'frontend-lib'`
- Consumer app builds successfully
```

### Plan rules

- **File paths are relative to `frontend-lib/`.** e.g., `src/api/notifications.ts`
- **Follow existing patterns exactly.** Read `src/api/reviews.ts` and `src/hooks/reviews/useReviews.ts` as the canonical example — match their structure, error handling, and logging.
- **Reference living docs, don't duplicate them.** Say "follow the API client pattern in `src/api/reviews.ts`" not copy-paste the pattern.
- **Types must match foundation-sdk backend responses.** If unsure, read the foundation-sdk domain's models or DOMAIN.md.
- **Never add product-specific code.** If you find yourself writing Rihla-specific types, hardcoded values, or product-specific endpoints, stop — that code belongs in the consumer app's `src/lib/`.
- **The init pattern (`initBillingApi`)** is for modules that are architecturally agnostic but need per-consumer configuration. Use it sparingly.
- **Build verification is mandatory.** The plan must end with `npm run build` in both frontend-lib and a consumer app.
- **Include "Files to Read Before Implementation"** — list every file the implementing agent must read in full. At minimum: the ARCHITECTURE.md, the canonical example (reviews), and the corresponding foundation-sdk domain docs.
