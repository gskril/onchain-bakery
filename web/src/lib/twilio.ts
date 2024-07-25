'server-only'

import createTwilio from 'twilio'

export const twilio = createTwilio(
  process.env.TWILIO_PROJECT_SID,
  process.env.TWILIO_SECRET,
  {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
  }
)
