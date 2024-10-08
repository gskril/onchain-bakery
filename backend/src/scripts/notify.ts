import 'dotenv/config'
import { breadContract } from 'shared/contracts'
import { createPublicClient, decodeEventLog, http } from 'viem'

import { openMints } from '../lib.js'
import { sendMessage } from '../messenger.js'

const fromBlock = 18788443n
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

const sentMessages = new Set()

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

  // Ignore addresses that have already been sent a message (same person placing multiple orders)
  if (sentMessages.has(account)) {
    console.log(`Already sent message to ${account}`)
    continue
  }

  const message = [
    'Good Bread by Greg pickup #4 is tomorrow (Aug 24th) from 2:30pm - 5pm at Pilgrim Hill in Central Park https://maps.app.goo.gl/3wVvk8psZDuWxEqC9',
    'Feel free to come hang out for as long or as short as you want. See you soon!',
  ].join('\n\n')

  const mediaUrl = undefined

  await sendMessage({ account, message, mediaUrl, idempotencyKey: log.data })
  sentMessages.add(account)
}
