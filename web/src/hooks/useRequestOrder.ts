import { useQuery } from '@tanstack/react-query'
import { Hex } from 'viem'

import { OrderRequest } from '@/app/api/request-order/route'

export function useRequestOrder({
  account,
  ids,
  quantities,
}: Partial<OrderRequest>) {
  return useQuery({
    queryKey: ['order', account, ids, quantities],
    queryFn: async () => {
      if (!account || !ids || !quantities) {
        return undefined
      }

      const response = await fetch('/api/request-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ account, ids, quantities }),
      })

      const json = await response.json()

      if (json.error) {
        throw new Error(json.error)
      }

      return json.data as Hex
    },
  })
}