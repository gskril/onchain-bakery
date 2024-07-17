import { Address } from 'viem/accounts'

import { NeynarError, NeynarVerificationData } from './neynar-types'

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY

if (!NEYNAR_API_KEY) {
  throw new Error('NEYNAR_API_KEY is not set')
}

const headers = {
  accept: 'application/json',
  api_key: NEYNAR_API_KEY,
}

const baseUrl = 'https://api.neynar.com/v2'

export async function getFarcasterAccountByAddress(address: Address) {
  const url = `${baseUrl}/farcaster/user/bulk-by-address`
  const res = await fetch(`${url}?addresses=${address}&viewer_fid=347`, {
    headers,
  })
  const data = await res.json()

  if (data.code) {
    const error = data as NeynarError
    return { error }
  }

  const json = data as NeynarVerificationData
  const lowercaseAddress = address.toLowerCase() as Address
  return { data: json?.[lowercaseAddress]?.[0] }
}
