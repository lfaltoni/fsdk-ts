import nodemailer from 'nodemailer'
import { EmailOptions, SmtpConfig } from './types'

function getSmtpConfig(): SmtpConfig {
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const from = process.env.SMTP_FROM

  if (!user || !pass || !from) {
    throw new Error('Missing required SMTP environment variables: SMTP_USER, SMTP_PASS, SMTP_FROM')
  }

  return {
    host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT ?? '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    user,
    pass,
    from,
  }
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  const config = getSmtpConfig()

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  })

  await transporter.sendMail({
    from: config.from,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  })
}
