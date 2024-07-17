import { useQuery } from '@tanstack/react-query'
import { formatEther } from 'viem'
import { base } from 'viem/chains'
import { usePublicClient } from 'wagmi'

import { breadContract } from '@/lib/contracts'
import { products } from '@/lib/products'
import { primaryChain, wagmiConfig } from '@/lib/web3'

type Props = {
  tokenIds?: bigint[]
  filter: boolean
}

export function useInventory({ tokenIds, filter }: Props) {
  const viemClient = usePublicClient({
    config: wagmiConfig,
    chainId: primaryChain.id,
  })

  return useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const productIds = tokenIds || products.map((product) => product.id)

      const inventory = await viemClient.readContract({
        ...breadContract,
        functionName: 'inventoryBatch',
        args: [productIds],
      })

      const productsWithInventory = productIds.map((id, index) => {
        const product = products.find((p) => p.id === id)!

        return {
          ...product,
          quantity: {
            raw: inventory[index].quantity,
            formatted: Number(inventory[index].quantity),
          },
          price: {
            raw: inventory[index].price,
            formatted: Number(formatEther(inventory[index].price)),
          },
        }
      })

      let finalData

      // If the filter is enabled, return only the products with inventory
      // Otherwise, return all products
      if (filter) {
        finalData = productsWithInventory.filter(
          (product) => product.quantity.formatted > 0
        )
      } else {
        finalData = productsWithInventory
      }

      return finalData
    },
  })
}
