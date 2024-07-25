import { createPublicClient, http } from 'viem'

import { breadContract } from './contracts.js'
import { openMints } from './lib.js'
import { Neynar } from './neynar.js'
import { sendDirectCast } from './warpcast.js'

export function subscribe() {
  console.log('Subscribing to contract events')

  const client = createPublicClient({
    transport: http(process.env.RPC_URL),
  })

  const neynar = new Neynar(process.env.NEYNAR_API_KEY)

  client.watchContractEvent({
    ...breadContract,
    eventName: 'OrderPlaced',
    onLogs: async (logs) => {
      for (const log of logs) {
        type LogArgs = typeof log.args
        const { account, ids } = log.args as Required<LogArgs>

        // Ignore open mints
        if (ids.length === 1 && openMints.includes(ids[0])) {
          console.log(`Ignoring open mint from ${account}`)
          continue
        }

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
    onError: (error) => {
      console.error('Error watching contract event:', error)
    },
  })
}
