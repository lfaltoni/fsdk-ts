# Email Domain — `frontend-lib/email`

A reusable, server-side email module for all Next.js apps in this monorepo. Built on **nodemailer** with a clean separation between transport, templates, and types so each concern can grow independently.

---

## Why it lives here

`frontend-lib` is the shared JS/TS layer across projects. Email sending is the first server-side concern added to it, following the same pattern as `foundation-sdk` (Python) — centralise cross-cutting infrastructure, let consumer apps stay thin.

The alternatives considered:
- **In the Next.js app** (`src/lib/email/`) — simple but not reusable; every new app would copy-paste.
- **Separate npm package** — correct long-term, but premature until there are 3+ consumers.
- **`foundation-sdk` (Python)** — not applicable; this stack is TypeScript.

When this module needs to support more apps or grow in complexity, extract it to a standalone `@yourorg/email` package and update the import path.

---

## Architecture

```
src/email/
├── index.ts                      # Public API — import from here only
├── types.ts                      # Shared TypeScript interfaces
├── email-service.ts              # nodemailer transport (SMTP)
└── templates/
    └── host-registration.ts      # HTML + plain-text template
```

### Separation of concerns

| Layer | File | Responsibility |
|---|---|---|
| Types | `types.ts` | Contracts shared between service, templates, and consumers |
| Transport | `email-service.ts` | Reads SMTP config from env, creates transporter, sends |
| Templates | `templates/*.ts` | Pure functions: data in → `{ html, text }` out. No side effects |
| Public API | `index.ts` | Single import surface for consumers |

Templates are **pure functions** — no imports from the transport layer, no network calls. This means they can be unit-tested in isolation without any SMTP setup, and reused in contexts beyond email (e.g. previewing in a browser route).

---

## How to consume in a Next.js app

### 1. Ensure nodemailer is installed in the consumer app

`nodemailer` is a peer dependency of `frontend-lib`. Add it to the consuming app's `package.json`:

```json
"nodemailer": ">=6.0.0"
```

### 2. Set environment variables

The transport reads config from `process.env` at call time (not module load time), so there is no initialisation step.

```env
SMTP_HOST=smtp.gmail.com        # Default if omitted
SMTP_PORT=587                   # Default if omitted
SMTP_SECURE=false               # true = port 465, false = STARTTLS
SMTP_USER=you@gmail.com
SMTP_PASS=your_app_password     # Gmail: Security → App Passwords
SMTP_FROM="App Name <you@gmail.com>"

CONTACT_EMAIL=inbox@yourapp.com # Where submissions are delivered
```

### 3. Import in an API route or Server Action only

```ts
// src/app/api/contact/route.ts
import { sendEmail, hostRegistrationTemplate } from 'frontend-lib/email'
import type { HostRegistrationData } from 'frontend-lib/email'
```

> **Never import this module in a Client Component or client-side code.** `nodemailer` is Node.js-only. Next.js will throw a build error if you try — treat that as the safeguard.

### 4. Call pattern

```ts
const { html, text } = hostRegistrationTemplate(data)

await sendEmail({
  to: process.env.CONTACT_EMAIL!,
  subject: `New Host Registration: ${data.fullName}`,
  html,
  text,
})
```

---

## Adding a new template

1. Create `src/email/templates/your-template.ts`
2. Export a function that accepts a typed data object and returns `{ html: string; text: string }`
3. Export it from `src/email/index.ts`
4. Rebuild: `npm run build` in `frontend-lib`

```ts
// src/email/templates/your-template.ts
import { YourData } from '../types'

export function yourTemplate(data: YourData): { html: string; text: string } {
  return {
    html: `<p>Hello ${data.name}</p>`,
    text: `Hello ${data.name}`,
  }
}
```

Always provide both `html` and `text`. The plain-text version is used by email clients that block HTML and improves spam scores.

---

## Adding a new consumer app

1. Add `"frontend-lib": "file:../path/to/frontend-lib"` to the app's `package.json`
2. Install nodemailer in the app
3. Add the SMTP env vars
4. Import from `frontend-lib/email` in server-only files

No changes to `frontend-lib` are needed unless a new template is required.

---

## Current templates

| Template | Function | Used in |
|---|---|---|
| Host registration | `hostRegistrationTemplate` | `dubaiactivities` — `/api/contact` |

---

## Upgrading to a standalone package

When a second or third app starts using this module, promote it:

1. Copy `src/email/` to a new repo/workspace `packages/email`
2. Update `package.json` name to `@yourorg/email`
3. Publish to npm (private registry or public)
4. Replace `from 'frontend-lib/email'` with `from '@yourorg/email'` in all consumers

The module's internal structure does not need to change.
