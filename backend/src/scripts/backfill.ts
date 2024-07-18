import 'dotenv/config'
import { createPublicClient, decodeEventLog, http } from 'viem'

import { breadContract } from '../contracts.js'
import { Neynar } from '../neynar.js'
import { sendDirectCast } from '../warpcast.js'

type Required<T> = {
  [P in keyof T]-?: T[P]
}

const client = createPublicClient({
  transport: http(process.env.RPC_URL),
})

const neynar = new Neynar(process.env.NEYNAR_API_KEY)

const _logs = await client.getLogs({
  ...breadContract,
  fromBlock: 17250960n,
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
  const openMints = [1n]
  if (ids.length === 1 && openMints.includes(ids[0])) {
    console.log(`Ignoring open mint from ${account}`)
    continue
  }

  const farcasterAccount = await neynar.getFarcasterAccountByAddress(account)

  if (farcasterAccount.error) {
    console.error('Failed to get farcaster account:', farcasterAccount.error)
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
