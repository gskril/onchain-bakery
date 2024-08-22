import { randomBytes } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { Neynar } from 'shared/src/neynar'
import { Hex, encodeAbiParameters } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { isAddress } from 'viem/utils'
import { z } from 'zod'

import { products } from '@/lib/products'
import { redis } from '@/lib/redis'

const schema = z.object({
  account: z.string().refine(isAddress, { message: 'Invalid address' }),
  ids: z.array(z.number().positive()),
  quantities: z.array(z.number().positive()),
})

export type OrderRequest = z.infer<typeof schema>

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => {
    return {}
  })

  const safeParse = schema.safeParse(body)
  if (!safeParse.success) {
    return NextResponse.json(safeParse.error.message, { status: 400 })
  }

  const { account, ids, quantities } = safeParse.data

  // Make sure that no quantity is greater than 1
  if (quantities.some((quantity) => quantity > 1)) {
    return NextResponse.json({ error: 'Quantity must be 1' }, { status: 400 })
  }

  // const loaves = products
  //   .filter((product) => ids.includes(Number(product.id)))
  //   .filter((product) => product.loaf)

  // Make sure that the user is only order 1 loaf at a time
  // if (loaves.length > 1) {
  //   return NextResponse.json(
  //     { error: 'You can only order 1 loaf at a time' },
  //     { status: 400 }
  //   )
  // }

  let accountType
  const phoneAccount = await redis.get<string>(account)

  if (!phoneAccount) {
    accountType = 'farcaster'
    const neynar = new Neynar(process.env.NEYNAR_API_KEY)
    const farcasterAccount = await neynar.getFarcasterAccountByAddress(account)

    if (farcasterAccount.error) {
      return NextResponse.json(
        { error: 'You must provide a phone number' },
        { status: 422 }
      )
    }

    const followsGreg = farcasterAccount.data?.viewer_context.followed_by
    const gregFollows = farcasterAccount.data?.viewer_context.following

    if (followsGreg === false || gregFollows === false) {
      return NextResponse.json(
        { error: 'You must provide a phone number' },
        { status: 422 }
      )
    }
  } else {
    accountType = 'phone'
  }

  // Generate a new claimId on each request, removing restrictions for now
  const claimId = ('0x' + randomBytes(32).toString('hex')) as `0x${string}`

  const messageToSign = encodeAbiParameters(
    [
      { name: 'buyer', type: 'address' },
      { name: 'claimId', type: 'bytes32' },
      { name: 'expiration', type: 'uint256' },
    ],
    [
      account,
      claimId,
      BigInt(Math.floor(Date.now() / 1000) + 300), // 5 minute expiration
    ]
  )

  const signer = privateKeyToAccount(process.env.SIGNER_PRIVATE_KEY as Hex)
  const signedMessage = await signer.signMessage({
    message: { raw: messageToSign },
  })

  const encodedMessageAndData = encodeAbiParameters(
    [
      { name: 'message', type: 'bytes' },
      { name: 'signature', type: 'bytes' },
    ],
    [messageToSign, signedMessage]
  )

  return NextResponse.json({
    data: { encodedMessageAndData, claimId, accountType },
  })
}
