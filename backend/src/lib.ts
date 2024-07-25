import { Redis } from '@upstash/redis'
import createTwilio from 'twilio'

export const openMints = [1n]

export const redis = new Redis({
  url: process.env.UPSTASH_URL,
  token: process.env.UPSTASH_TOKEN,
})

export const twilio = createTwilio(
  process.env.TWILIO_PROJECT_SID,
  process.env.TWILIO_SECRET,
  {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
  }
)
