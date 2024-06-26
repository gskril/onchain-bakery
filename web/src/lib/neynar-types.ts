import { Address } from 'viem/accounts'

export type NeynarVerificationData = {
  [address: Address]: Array<{
    object: string
    fid: number
    custody_address: string
    username: string
    display_name: string
    pfp_url: string
    profile: {
      bio: {
        text: string
      }
    }
    follower_count: number
    following_count: number
    verifications: Array<string>
    verified_addresses: {
      eth_addresses: Array<Address>
      sol_addresses: Array<any>
    }
    active_status: string
    power_badge: boolean
    viewer_context: {
      following: boolean
      followed_by: boolean
    }
  }>
}

export type NeynarVerificationError = {
  code: string
  message: string
  property: string
}
