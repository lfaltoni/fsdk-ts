// Email domain — server-only module.
// Import this only from Next.js API routes, Server Actions, or server components.

export { sendEmail } from './email-service'
export { hostRegistrationTemplate } from './templates/host-registration'
export type { EmailOptions, HostRegistrationData, SmtpConfig } from './types'
