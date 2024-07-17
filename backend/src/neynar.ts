// TODO: Fix importing from the `shared` package so we don't need this duplicate file
type Address = `0x${string}`

type NeynarVerificationData = {
  [address: Address]: Array<{
    fid: number
  }>
}

type NeynarError = {
  code: string
  message: string
  property: string
}

export class Neynar {
  private headers: HeadersInit

  constructor(API_KEY: string | undefined) {
    if (!API_KEY) {
      throw new Error('Neynar API_KEY is not set')
    }

    this.headers = {
      accept: 'application/json',
      api_key: API_KEY,
    }
  }

  private baseUrl = 'https://api.neynar.com/v2'

  async getFarcasterAccountByAddress(address: Address) {
    const url = `${this.baseUrl}/farcaster/user/bulk-by-address`
    const res = await fetch(`${url}?addresses=${address}&viewer_fid=347`, {
      headers: this.headers,
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
}
