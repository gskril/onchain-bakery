import { NextRequest, NextResponse } from 'next/server'
import { breadContract } from 'shared/src/contracts'
import Stripe from 'stripe'
import { Hex, createWalletClient, http, isAddress } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

import { getOrderPriceWei, parseTokenIds } from '@/lib/card-order'
import { primaryChain } from '@/lib/constants'
import { toUsdCents } from '@/lib/pricing'

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

  if (
    event.type === 'checkout.session.completed' ||
    event.type === 'checkout.session.async_payment_succeeded'
  ) {
    const session = event.data.object

    // Delayed payment methods complete the session before funds arrive
    if (session.payment_status !== 'paid') {
      return NextResponse.json({ message: 'Awaiting payment' }, { status: 200 })
    }

    const metadata = session.metadata ?? {}
    const address = metadata.address
    const tokenIds = parseTokenIds(metadata.tokenIds)
    const ethPrice = Number(metadata.ethPrice)

    if (
      !address ||
      !isAddress(address) ||
      !tokenIds ||
      !Number.isFinite(ethPrice) ||
      ethPrice <= 0
    ) {
      return NextResponse.json({ error: 'Invalid metadata' }, { status: 400 })
    }

    // Price the tokens being minted from onchain data, using the ETH price
    // that was locked in when the session was created, and make sure that
    // Stripe actually collected at least that much.
    const priceWei = await getOrderPriceWei(address, tokenIds)
    const expectedCents = toUsdCents(priceWei, ethPrice)

    if (
      session.currency !== 'usd' ||
      session.amount_total === null ||
      session.amount_total < expectedCents
    ) {
      console.error('Stripe payment does not cover order', {
        session: session.id,
        amountTotal: session.amount_total,
        currency: session.currency,
        expectedCents,
      })

      return NextResponse.json(
        { error: 'Payment does not cover order' },
        { status: 400 }
      )
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
