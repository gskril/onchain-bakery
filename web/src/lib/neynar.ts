import { Address } from 'viem/accounts'

import { NeynarVerificationData, NeynarVerificationError } from './neynar-types'

export async function getFarcasterAccountByAddress(address: Address) {
  const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY

  if (!NEYNAR_API_KEY) {
    throw new Error('NEYNAR_API_KEY is not set')
  }

  const baseUrl = 'https://api.neynar.com/v2/farcaster/user/bulk-by-address'

  const res = await fetch(`${baseUrl}?addresses=${address}`, {
    headers: {
      accept: 'application/json',
      api_key: NEYNAR_API_KEY,
    },
  })

  const data = await res.json()

  if (data.code) {
    const error = data as NeynarVerificationError
    return { error }
  }

  const json = data as NeynarVerificationData
  const lowercaseAddress = address.toLowerCase() as Address
  return { data: json?.[lowercaseAddress]?.[0] }
}
