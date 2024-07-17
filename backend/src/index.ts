import 'dotenv/config'
import { createPublicClient, webSocket } from 'viem'

import { breadContract } from './contracts.js'
import { Neynar } from './neynar.js'
import { sendDirectCast } from './warpcast.js'

type Required<T> = {
  [P in keyof T]-?: T[P]
}

const client = createPublicClient({
  transport: webSocket(process.env.WEB_SOCKET_URL),
})

const neynar = new Neynar(process.env.NEYNAR_API_KEY)

client.watchContractEvent({
  ...breadContract,
  eventName: 'OrderPlaced',
  onLogs: async (logs) => {
    for (const log of logs) {
      type LogArgs = typeof log.args
      const { account, ids, quantities, price } = log.args as Required<LogArgs>

      const farcasterAccount =
        await neynar.getFarcasterAccountByAddress(account)

      if (farcasterAccount.error) {
        console.error(
          'Failed to get farcaster account:',
          farcasterAccount.error
        )
        continue
      }

      const { fid } = farcasterAccount.data

      await sendDirectCast({
        recipientFid: fid,
        message:
          'Thanks for buying my bread! 🍞 \n\nI will be in touch soon with more info about the pickup time and location',
        idempotencyKey: log.data,
      })
    }
  },
})
