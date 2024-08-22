import { Neynar } from 'shared/neynar'
import { Hex } from 'viem'

import { redis, twilio } from './lib.js'
import { sendDirectCast } from './warpcast.js'

const neynar = new Neynar(process.env.NEYNAR_API_KEY)

export async function sendMessage({
  account,
  message,
  mediaUrl,
  idempotencyKey,
}: {
  account: Hex
  message: string
  mediaUrl?: string
  idempotencyKey: string
}) {
  const phoneAccount = await redis.get<string>(account)

  if (phoneAccount) {
    try {
      await twilio.messages.create({
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneAccount,
        body: message,
        mediaUrl: mediaUrl ? [mediaUrl] : undefined,
      })

      console.log(`SMS sent to ${account}`)
    } catch (error) {
      console.error(`Failed to send SMS to ${account}`, error)
    }

    // TODO: keep track of sent messages with idempotency key
  } else {
    const farcasterAccount = await neynar.getFarcasterAccountByAddress(account)

    if (farcasterAccount.error || !farcasterAccount.data) {
      console.error('Failed to get farcaster account:', farcasterAccount.error)
      return
    }

    const { fid } = farcasterAccount.data

    await sendDirectCast({
      recipientFid: fid,
      message: (mediaUrl ? `${mediaUrl} ` : '') + message,
      idempotencyKey,
    })
  }
}
