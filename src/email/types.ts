export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export interface SmtpConfig {
  host: string
  port: number
  secure: boolean
  user: string
  pass: string
  from: string
}