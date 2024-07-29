import 'dotenv/config'
import { createPublicClient, decodeEventLog, http } from 'viem'

import { breadContract } from '../contracts.js'
import { openMints, redis, twilio } from '../lib.js'
import { Neynar } from '../neynar.js'
import { sendDirectCast } from '../warpcast.js'

const client = createPublicClient({
  transport: http(process.env.RPC_URL),
})

const neynar = new Neynar(process.env.NEYNAR_API_KEY)

const _logs = await client.getLogs({
  ...breadContract,
  event: breadContract.abi.find(
    (x) => x.type === 'event' && x.name === 'OrderPlaced'
  ),
  fromBlock: 17573730n,
  toBlock: 'latest',
})

const logs = _logs.map((log) => {
  const decodedLog = decodeEventLog({
    ...breadContract,
    eventName: 'OrderPlaced',
    data: log.data,
    topics: log.topics,
  })

  return { ...decodedLog, ...log }
})

for (const log of logs) {
  type LogArgs = typeof log.args
  const { account, ids } = log.args as Required<LogArgs>

  // Ignore open mints
  if (ids.length === 1 && openMints.includes(ids[0])) {
    continue
  }

  const messageParts = [
    'Thanks for buying my bread! 🍞',
    'I will be in touch soon with more info about the pickup time and location',
  ]
  const message = messageParts.join('\n\n')

  const phoneAccount = await redis.get<string>(account)

  if (phoneAccount) {
    try {
      await twilio.messages.create({
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneAccount,
        body: message,
      })

      console.log(`SMS sent to ${account}`)
    } catch (error) {
      console.error(`Failed to send SMS to ${account}`, error)
    }

    // TODO: keep track of sent messages with idempotency key
  } else {
    const farcasterAccount = await neynar.getFarcasterAccountByAddress(account)

    if (farcasterAccount.error) {
      console.error('Failed to get farcaster account:', farcasterAccount.error)
      continue
    }

    const { fid } = farcasterAccount.data

    await sendDirectCast({
      recipientFid: fid,
      message,
      idempotencyKey: log.data,
    })
  }
}
