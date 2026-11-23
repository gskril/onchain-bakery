import { formatEther, type PublicClient, parseAbi } from 'viem'

type ReadClient = Pick<PublicClient, 'readContract'>

/**
 * Read the USD price of 1 ETH from the 1inch oracle on mainnet.
 */
export async function getEthPrice(mainnetClient: ReadClient) {
  const sourceToken = {
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
    decimals: 6,
  } as const

  const token = '0x0000000000000000000000000000000000000000'
  const decimals = 18

  const res = await mainnetClient.readContract({
    address: '0x07D91f5fb9Bf7798734C3f606dB065549F6893bb', // 1inch Oracle
    abi: parseAbi([
      'function getRate(address srcsourceToken, address dstsourceToken, bool useWrappers) view returns (uint256 weightedRate)',
    ]),
    functionName: 'getRate',
    args: [sourceToken.address, token, false],
  })

  const numerator = 10 ** sourceToken.decimals
  const denominator = 10 ** decimals
  const conversionFactor = numerator / (1e18 * denominator)
  const price = 1 / (Number(res) * conversionFactor)

  return price
}

/**
 * Convert an order price in wei to whole US dollars, as shown at checkout.
 */
export function toUsdValue(priceWei: bigint, ethPrice: number) {
  return (Number(formatEther(priceWei)) * ethPrice).toFixed(0)
}

/**
 * The amount charged by Stripe for an order, in cents.
 */
export function toUsdCents(priceWei: bigint, ethPrice: number) {
  return Number(toUsdValue(priceWei, ethPrice)) * 100
}
