import { NextRequest, NextResponse } from 'next/server'
import { fromHex } from 'viem/utils'
import z from 'zod'

import { products } from '@/lib/products'

const schema = z.object({
  id: z.string(),
})

export async function GET(
  req: NextRequest,
  { params }: { params: [key: string] }
) {
  const safeParse = schema.safeParse(params)

  if (!safeParse.success) {
    return NextResponse.json(safeParse.error, { status: 400 })
  }

  let idBigint: bigint
  const { id } = safeParse.data

  if (typeof id === 'string') {
    idBigint = fromHex(('0x' + id) as any, 'bigint')
  } else {
    idBigint = BigInt(id)
  }

  const product = products.find((product) => product.id === idBigint)

  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  const DOMAIN = new URL(process.env.DOMAIN || 'http://localhost:3000').origin

  const metadata = {
    name: product?.name,
    image: `${DOMAIN}/api/metadata/bread/${idBigint.toString()}/image`,
    description: product?.description,
  }

  return NextResponse.json(metadata)
}
