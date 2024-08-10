import 'dotenv/config'
import { createPublicClient, decodeEventLog, http } from 'viem'

import { breadContract } from '../contracts.js'
import { openMints } from '../lib.js'
import { sendMessage } from '../messenger.js'

const fromBlock = 18242464n // 3:15am on Aug 10th
const toBlock = 'latest'
const client = createPublicClient({
  transport: http(process.env.RPC_URL),
})

const _logs = await client.getLogs({
  ...breadContract,
  event: breadContract.abi.find(
    (x) => x.type === 'event' && x.name === 'OrderPlaced'
  ),
  fromBlock,
  toBlock,
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

const _revokedOrders = await client.getLogs({
  ...breadContract,
  event: breadContract.abi.find(
    (x) => x.type === 'event' && x.name === 'OrderRevoked'
  ),
  fromBlock,
  toBlock,
})

const revokedOrders = _revokedOrders.map((log) => {
  const decodedLog = decodeEventLog({
    ...breadContract,
    eventName: 'OrderRevoked',
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

  const revokedOrdersFromAccount = revokedOrders.find(
    (order) => order.args.account === account
  )

  // Ignore revoked orders
  if (revokedOrdersFromAccount) {
    console.log(`Skipping revoked order for ${account}`)
    continue
  }

  const message = [
    'Good Bread by Greg pickup #3 is this Sunday from 2:30pm - 5pm at ______________',
    'Feel free to come hang out for as long or as short as you want. Lmk if you have any questions or feedback!',
  ].join('\n\n')

  const mediaUrl = undefined

  await sendMessage({ account, message, mediaUrl, idempotencyKey: log.data })
}
