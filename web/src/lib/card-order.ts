import { breadContract } from 'shared/contracts'
import { type Address, createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

import { primaryChain } from '@/lib/constants'
import { getEthPrice, toUsdCents } from '@/lib/pricing'
import { products } from '@/lib/products'

const primaryClient = createPublicClient({
  chain: primaryChain,
  transport: http(
    process.env.NEXT_PUBLIC_BASE_RPC ?? 'https://base-rpc.publicnode.com'
  ),
})

const mainnetClient = createPublicClient({
  chain: mainnet,
  transport: http(
    process.env.NEXT_PUBLIC_MAINNET_RPC ?? 'https://ethereum-rpc.publicnode.com'
  ),
})

/**
 * Parse a comma-separated list of token IDs, rejecting duplicates and IDs
 * that aren't known products.
 */
export function parseTokenIds(value: unknown): bigint[] | null {
  if (typeof value !== 'string' || !/^\d+(,\d+)*$/.test(value)) return null

  const ids = value.split(',').map(BigInt)
  const isUnique = new Set(ids.map(String)).size === ids.length
  const isKnown = ids.every((id) => products.some((p) => p.id === id))

  return isUnique && isKnown ? ids : null
}

/**
 * The onchain price of an order in wei, including any credit the account has.
 */
export async function getOrderPriceWei(account: Address, tokenIds: bigint[]) {
  const [priceWei] = await primaryClient.readContract({
    ...breadContract,
    functionName: 'price',
    args: [account, tokenIds, tokenIds.map(() => BigInt(1))],
  })

  return priceWei
}

/**
 * Price a card order from onchain data, dropping items that are sold out.
 */
export async function quoteCardOrder(account: Address, tokenIds: bigint[]) {
  const inventory = await primaryClient.readContract({
    ...breadContract,
    functionName: 'inventoryBatch',
    args: [tokenIds],
  })

  const tokenIdsInStock = tokenIds.filter(
    (_, i) => inventory[i].quantity > BigInt(0)
  )

  if (tokenIdsInStock.length === 0) {
    throw new Error('No items in stock')
  }

  const [priceWei, ethPrice] = await Promise.all([
    getOrderPriceWei(account, tokenIdsInStock),
    getEthPrice(mainnetClient),
  ])

  return {
    tokenIds: tokenIdsInStock,
    ethPrice,
    usdCents: toUsdCents(priceWei, ethPrice),
  }
}
