// Email domain — server-only module.
// Import this only from Next.js API routes, Server Actions, or server components.

export { sendEmail } from './email-service'
export type { EmailOptions, SmtpConfig } from './types'
