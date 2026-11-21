import { useQuery } from '@tanstack/react-query'
import { publicActions } from 'viem'
import { mainnet } from 'wagmi/chains'

import { getEthPrice as readEthPrice } from '@/lib/pricing'
import { wagmiConfig } from '@/lib/web3'

export function useEthPrice() {
  return useQuery({
    queryKey: ['ethPrice'],
    queryFn: getEthPrice,
  })
}

export async function getEthPrice() {
  const viemClient = wagmiConfig
    .getClient({ chainId: mainnet.id })
    .extend(publicActions)

  return readEthPrice(viemClient)
}
