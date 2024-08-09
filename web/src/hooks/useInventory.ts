import { useQuery } from '@tanstack/react-query'
import { breadContract } from 'shared/contracts'
import { formatEther, publicActions } from 'viem'

import { primaryChain } from '@/lib/constants'
import { products } from '@/lib/products'
import { wagmiConfig } from '@/lib/web3'

type Props = {
  tokenIds?: bigint[]
}

export function useInventory({ tokenIds }: Props) {
  return useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      return getInventory({ tokenIds })
    },
  })
}

export async function getInventory({ tokenIds }: Props) {
  const viemClient = wagmiConfig
    .getClient({ chainId: primaryChain.id })
    .extend(publicActions)

  const productIds =
    tokenIds ||
    products.filter((product) => product.active).map((product) => product.id)

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
}
