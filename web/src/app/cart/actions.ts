'use server'

import { isAddress, isHex, recoverMessageAddress } from 'viem'
import { z } from 'zod'

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

  const isValidSignature =
    (await recoverMessageAddress({ message: phone, signature })) === account

  if (!isValidSignature) {
    return { ok: false, message: 'Invalid signature' }
  }

  const isValid = await twilio.lookups.v2
    .phoneNumbers(phone)
    .fetch({ countryCode: 'US' })

  if (!isValid) {
    return { ok: false, message: 'Invalid phone number' }
  }

  await redis.set(account, isValid.phoneNumber)

  return { ok: true, message: 'Phone number saved' }
}
