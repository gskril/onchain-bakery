import { useQuery } from '@tanstack/react-query'
import { usePublicClient, useReadContract } from 'wagmi'

import { breadContract } from '@/lib/contracts'
import { products } from '@/lib/products'
import { wagmiConfig } from '@/lib/web3'

export function useInventory() {
  const viemClient = usePublicClient({ config: wagmiConfig })

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
        quantity: inventory[index].quantity,
        price: inventory[index].price,
      }))

      const availableProductsWithInventory = productsWithInventory.filter(
        (product) => product.quantity > BigInt(0)
      )

      return availableProductsWithInventory
    },
  })
}
