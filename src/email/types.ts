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

export interface HostRegistrationData {
  fullName: string
  email: string
  phone: string
  activityType: string
  numberOfExperiences: string
  message: string
}
