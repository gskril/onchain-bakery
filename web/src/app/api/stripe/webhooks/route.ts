import { NextRequest, NextResponse } from 'next/server'
import { breadContract } from 'shared/contracts'
import Stripe from 'stripe'
import { Hex, createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

import { primaryChain } from '@/lib/constants'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '')
  const signature = request.headers.get('Stripe-Signature') || ''
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

  let event: Stripe.Event

  try {
    event = await stripe.webhooks.constructEventAsync(
      await request.text(),
      signature,
      endpointSecret
    )
  } catch (error) {
    console.error(error)
    return NextResponse.json(error, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const metadata = session.metadata as { address?: Hex; tokenIds?: string }
    const address = metadata.address
    const tokenIds = metadata.tokenIds?.split(',').map(BigInt)

    if (!address || !tokenIds) {
      return NextResponse.json({ error: 'Invalid metadata' }, { status: 400 })
    }

    // TODO: create wallet client from the wagmi config
    const walletClient = createWalletClient({
      account: privateKeyToAccount(process.env.SIGNER_PRIVATE_KEY as Hex),
      chain: primaryChain,
      transport: http(),
    })

    // Mint NFTs
    await walletClient.writeContract({
      ...breadContract,
      functionName: 'adminOrder',
      args: [address, tokenIds, tokenIds.map(() => BigInt(1))],
    })
  }

  return NextResponse.json({ message: 'Success!' }, { status: 200 })
}
