import { useQuery } from '@tanstack/react-query'
import { breadContract } from 'shared/contracts'
import { formatEther } from 'viem'
import { usePublicClient } from 'wagmi'

import { products } from '@/lib/products'
import { primaryChain, wagmiConfig } from '@/lib/web3'

type Props = {
  tokenIds?: bigint[]
}

export function useInventory({ tokenIds }: Props) {
  const viemClient = usePublicClient({
    config: wagmiConfig,
    chainId: primaryChain.id,
  })

  return useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const productIds =
        tokenIds ||
        products
          .filter((product) => product.active)
          .map((product) => product.id)

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

      return productsWithInventory
    },
  })
}
