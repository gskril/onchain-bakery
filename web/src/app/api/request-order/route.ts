import { NextRequest, NextResponse } from 'next/server'
import { isAddress } from 'viem/utils'
import { z } from 'zod'

import { getFarcasterAccountByAddress } from '@/lib/neynar'

const schema = z.object({
  account: z.string().refine(isAddress, { message: 'Invalid address' }),
  tokenId: z.number().positive(),
  quantity: z.number().positive(),
})

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => {
    return {}
  })

  const safeParse = schema.safeParse(body)
  if (!safeParse.success) {
    return NextResponse.json(safeParse.error, { status: 400 })
  }

  const { account, tokenId, quantity } = safeParse.data

  // TODO: Only allow addresses that are associated with a Farcaster account
  const farcasterAccount = await getFarcasterAccountByAddress(account)

  return NextResponse.json(farcasterAccount)
}
