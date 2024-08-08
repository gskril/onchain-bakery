'use server'

import { redirect } from 'next/navigation'
import Stripe from 'stripe'
import { createPublicClient, http, isAddress, isHex } from 'viem'
import { z } from 'zod'

import { primaryChain } from '@/lib/constants'
import { redis } from '@/lib/redis'
import { twilio } from '@/lib/twilio'

const schema = z.object({
  account: z.string().refine(isAddress, { message: 'Invalid address' }),
  phone: z.string().min(10).max(12),
  signature: z.string().refine(isHex, { message: 'Invalid signature' }),
})

export async function savePhoneNumber(
  prevState: any,
  formData: FormData
): Promise<{
  ok: boolean
  message?: string
}> {
  const safeParse = schema.safeParse({
    account: formData.get('account'),
    phone: formData.get('phone'),
    signature: formData.get('signature'),
  })

  if (!safeParse.success) {
    return { ok: false, message: 'Invalid phone number' }
  }

  const { account, phone, signature } = safeParse.data

  // TODO: find a way to create a viem client from the wagmi config
  // `wagmiConfig.getClient()` doesn't work because of module resolution issues but it's the right direction
  // https://wagmi.sh/core/api/createConfig#getclient
  const viemClient = createPublicClient({
    chain: primaryChain,
    transport: http(),
  })

  const isValidSignature = viemClient.verifyMessage({
    address: account,
    message: phone,
    signature,
  })

  if (!isValidSignature) {
    return { ok: false, message: 'Invalid signature' }
  }

  const isValid = await twilio.lookups.v2
    .phoneNumbers(phone)
    .fetch({ countryCode: 'US' })

  if (!isValid) {
    return { ok: false, message: 'Invalid phone number' }
  }

  try {
    await redis.set(account, isValid.phoneNumber)
  } catch (error) {
    return { ok: false, message: 'Failed to save phone number' }
  }

  return { ok: true, message: 'Phone number saved' }
}

export async function createCheckoutSession(
  prevState: any,
  formData: FormData
): Promise<{
  ok: boolean
  message?: string
  stripeUrl?: string
}> {
  let session: Stripe.Checkout.Session | undefined

  try {
    const usdPrice = formData.get('usdPrice') as string
    const address = formData.get('address') as string

    const DOMAIN = new URL(process.env.DOMAIN || 'http://localhost:3000').origin
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '')

    session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: Number(usdPrice) * 100,
            product_data: {
              name: 'Bread',
              description: 'Pickup is in Manhattan this weekend.',
            },
          },
          quantity: 1,
        },
      ],
      expires_at: Math.floor(Date.now() / 1000) + 60 * 30, // 30 minutes
      success_url: `${DOMAIN}/cart/success`,
      cancel_url: `${DOMAIN}/cart`,
      metadata: {
        address,
      },
    })

    if (!session.url) {
      throw new Error()
    }
  } catch (error) {
    console.error(error)
    return { ok: false, message: 'Error creating payment session' }
  }

  redirect(session.url)
}
