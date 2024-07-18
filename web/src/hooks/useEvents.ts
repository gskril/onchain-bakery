import { useQuery } from '@tanstack/react-query'
import { breadContract } from 'shared/contracts'
import { decodeEventLog } from 'viem'
import { usePublicClient } from 'wagmi'

import { primaryChain, wagmiConfig } from '@/lib/web3'

export function useEvents(hash?: string) {
  const viemClient = usePublicClient({
    config: wagmiConfig,
    chainId: primaryChain.id,
  })

  return useQuery({
    queryKey: ['events', hash],
    queryFn: async () => {
      const logs = await viemClient.getLogs({
        address: breadContract.address,
        fromBlock: BigInt(0),
      })

      const decodedLogs = logs.map((log) =>
        decodeEventLog({
          abi: breadContract.abi,
          data: log.data,
          topics: log.topics,
        })
      )

      const formattedLogs = decodedLogs.map((log) => {
        const { eventName, args } = log

        // If there is a bigint in the args, convert it to a string
        const formattedArgs = Object.fromEntries(
          Object.entries(args || {}).map(([key, value]) => [
            key,
            typeof value === 'bigint' ? value.toString() : value,
          ])
        )

        return { eventName, args: formattedArgs }
      })

      return formattedLogs.reverse()
    },
  })
}
