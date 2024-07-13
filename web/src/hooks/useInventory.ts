import { useQuery } from '@tanstack/react-query'
import { formatEther } from 'viem'
import { base } from 'viem/chains'
import { usePublicClient } from 'wagmi'

import { breadContract } from '@/lib/contracts'
import { products } from '@/lib/products'
import { wagmiConfig } from '@/lib/web3'

export function useInventory() {
  const viemClient = usePublicClient({
    config: wagmiConfig,
    chainId: base.id,
  })

  return useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const inventory = await viemClient.readContract({
        ...breadContract,
        functionName: 'inventoryBatch',
        args: [products.map((product) => product.id)],
      })

      const productsWithInventory = products.map((product, index) => ({
        ...product,
        quantity: {
          raw: inventory[index].quantity,
          formatted: Number(inventory[index].quantity),
        },
        price: {
          raw: inventory[index].price,
          formatted: Number(formatEther(inventory[index].price)),
        },
      }))

      const availableProductsWithInventory = productsWithInventory.filter(
        (product) => product.quantity.formatted > 0
      )

      return availableProductsWithInventory
    },
  })
}
