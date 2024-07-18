import { NextRequest, NextResponse } from 'next/server'
import { Neynar } from 'shared/neynar'
import { Hex, encodeAbiParameters, keccak256, toHex } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { isAddress } from 'viem/utils'
import { z } from 'zod'

import { products } from '@/lib/products'

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

  const fullLoaves = products.filter((product) => product.fullLoaf)

  const numberOfFullLoaves = ids.reduce((acc, id) => {
    if (fullLoaves.some((loaf) => loaf.id === BigInt(id))) {
      return acc + 1
    }

    return acc
  })

  // Make sure that you can't order multiple loaves in one order
  if (numberOfFullLoaves > 1) {
    return NextResponse.json(
      { error: 'You can only order one full loaf at a time' },
      { status: 400 }
    )
  }

  const neynar = new Neynar(process.env.NEYNAR_API_KEY)
  const farcasterAccount = await neynar.getFarcasterAccountByAddress(account)

  if (farcasterAccount.error) {
    return NextResponse.json(farcasterAccount.error, { status: 400 })
  }

  const followsGreg = farcasterAccount.data.viewer_context.followed_by
  const gregFollows = farcasterAccount.data.viewer_context.following

  if (followsGreg === false) {
    return NextResponse.json(
      { error: 'You must be following Greg to place an order' },
      { status: 403 }
    )
  }

  if (gregFollows === false) {
    return NextResponse.json(
      { error: 'Greg must be following you to place an order' },
      { status: 403 }
    )
  }

  // TODO: Improve this logic. Currently it will only allow for one order per drop
  const claimId = keccak256(toHex(account + ':1'))

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

  return NextResponse.json({ data: { encodedMessageAndData, claimId } })
}
