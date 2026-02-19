import { HostRegistrationData } from '../types'

export function hostRegistrationTemplate(data: HostRegistrationData): { html: string; text: string } {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Host Registration Request</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0ea5e9 0%,#0284c7 100%);border-radius:12px 12px 0 0;padding:36px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">
                New Host Registration Request
              </h1>
              <p style="margin:8px 0 0;color:#bae6fd;font-size:14px;">
                Someone wants to list their experience on your platform
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:36px 40px;">

              <!-- Details Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:24px;">
                <tr>
                  <td style="padding:24px;">
                    <h2 style="margin:0 0 20px;font-size:16px;font-weight:600;color:#0f172a;">Applicant Details</h2>

                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;">
                          <span style="font-size:13px;color:#64748b;font-weight:500;display:block;">Full Name</span>
                          <span style="font-size:15px;color:#0f172a;font-weight:600;">${data.fullName}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;">
                          <span style="font-size:13px;color:#64748b;font-weight:500;display:block;">Email</span>
                          <a href="mailto:${data.email}" style="font-size:15px;color:#0ea5e9;font-weight:600;text-decoration:none;">${data.email}</a>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;">
                          <span style="font-size:13px;color:#64748b;font-weight:500;display:block;">Phone</span>
                          <span style="font-size:15px;color:#0f172a;font-weight:600;">${data.phone}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;">
                          <span style="font-size:13px;color:#64748b;font-weight:500;display:block;">Activity Type</span>
                          <span style="font-size:15px;color:#0f172a;font-weight:600;">${data.activityType}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;">
                          <span style="font-size:13px;color:#64748b;font-weight:500;display:block;">Number of Experiences</span>
                          <span style="font-size:15px;color:#0f172a;font-weight:600;">${data.numberOfExperiences}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Message -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;margin-bottom:24px;">
                <tr>
                  <td style="padding:24px;">
                    <h2 style="margin:0 0 12px;font-size:16px;font-weight:600;color:#0f172a;">Message</h2>
                    <p style="margin:0;font-size:15px;color:#334155;line-height:1.7;white-space:pre-wrap;">${data.message || '—'}</p>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <p style="margin:0;font-size:14px;color:#64748b;text-align:center;">
                Reply directly to this email to get in touch with the applicant.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f1f5f9;border-radius:0 0 12px 12px;padding:20px 40px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#94a3b8;">
                This email was sent automatically from your website's Become a Host form.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()

  const text = `
New Host Registration Request
==============================

Full Name: ${data.fullName}
Email: ${data.email}
Phone: ${data.phone}
Activity Type: ${data.activityType}
Number of Experiences: ${data.numberOfExperiences}

Message:
${data.message || '—'}
  `.trim()

  return { html, text }
}
