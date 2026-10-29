# fsdk-ts — Backlog

## FSDK-DISTRIBUTION — publish fsdk-ts as a versioned npm package (owner, 2026-10-15; research done, NOT scheduled)

This is the fsdk-ts half of **FSDK-DISTRIBUTION**. The full research, the decision and the work packages are in `foundation-sdk/BACKLOG.md`. In short: friends' apps install foundation-sdk and fsdk-ts as **pinned packages**, not as source, so they can't drift. This is a library, not a hosted API.

fsdk-ts specifics:
- Consumers use `file:` links and `npm install --install-links` today. Instead, publish the built `dist/` to npm or GitHub Packages, with a semver policy and a CHANGELOG.
- Define the public exports (hooks, clients, utils) and treat anything else as internal.
- Version fsdk-ts against the foundation-sdk API it targets. Document a compatibility table, or release both together.
- Plan with `/fsdk-ts-plan`. Prompt: `~/GitHub/Projects/prompts/fsdk-distribution-planner.md`.

## SHARED-AUTH-UI — one login/sign-up page for every FSDK app (Leo, 2026-10-30; research done, NOT scheduled)

Leo: "I built it twice". The two forms are near-copies on the same fsdk-ts hooks (`useLogin`, `useEmailSignIn`, `useGoogleSignIn`):
email-first passwordless, password fallback, Google button.
- Rihla: `rihla/storefront/frontend/chisfis-nextjs/src/app/(auth)/AuthForm.tsx` (528 lines, Next.js app router, own UI kit + translations,
  which methods are on comes from the backend at runtime: `authOptionsFrom` in `lib/utils/publicConfig.ts`).
- BlogMachine: `blogmachine-deploy/blogmachine/frontend/src/components/auth/AuthForm.tsx` (471 lines, Vite + react-router, shadcn + lucide,
  build-time `VITE_PASSWORDLESS_ENABLED`, a referral `onRegisterSuccess` hook). An older password-only page is in `fsdk-starter`.
- Needed next (video-builder collaborators, see `video-builder/PRODUCT_READINESS.md`), so a third copy is coming unless this lands first.

Shape (to decide in a plan, `/fsdk-ts-plan`):
1. A headless auth-flow component/hook (`useAuthFlow`: steps, method choice, errors, redirects) that owns the shared state logic.
   It is logic, so it fits fsdk-ts's "no UI" rule.
2. A thin themeable `<AuthForm>` in a sibling package (e.g. `fsdk-ts-ui`), with router- and UI-kit-agnostic slots (link component,
   input/button components, i18n strings). Apps keep their look.
3. A standard foundation-sdk endpoint that says which login methods are on (password, magic link, passwordless, Google), replacing
   Rihla's private `authOptionsFrom` and BlogMachine's build flag, so the form reads one contract everywhere.

Settings page (Leo's question): a central page on the dev machine has little value because finished apps deploy separately. What does
pay off is per-app: (3) above, a standard FSDK settings table for operator choices (foundation-sdk has none; Rihla has its own
`Settings` row + admin page), and a reusable admin settings panel each app mounts. Record in foundation-sdk/BACKLOG.md when planned.
