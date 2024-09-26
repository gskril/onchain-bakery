import { breadContract } from 'shared/contracts'
import { createPublicClient, http } from 'viem'

import { openMints } from './lib.js'
import { sendMessage } from './messenger.js'

export function subscribe() {
  console.log('Subscribing to contract events')

  const client = createPublicClient({
    transport: http(process.env.RPC_URL),
  })

  client.watchContractEvent({
    ...breadContract,
    eventName: 'OrderPlaced',
    onLogs: async (logs) => {
      for (const log of logs) {
        type LogArgs = typeof log.args
        const { account, ids } = log.args as Required<LogArgs>

        // Ignore open mints
        // if (ids.length === 1 && openMints.includes(ids[0])) {
        //   console.log(`Ignoring open mint from ${account}`)
        //   continue
        // }

        const message = [
          'Thanks for supporting Good Bread by Greg! 🍞',
          "I'll be in touch soon with more info about the pickup time and location",
        ].join('\n\n')

        await sendMessage({ account, message, idempotencyKey: log.data })
      }
    },
    onError: (error) => {
      console.error('Error watching contract event:', error)
    },
  })
}
