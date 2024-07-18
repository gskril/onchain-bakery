import { NextRequest, NextResponse } from 'next/server'
import z from 'zod'

import { products } from '@/lib/products'

const schema = z.object({
  id: z.coerce.bigint(),
})

export async function GET(
  req: NextRequest,
  { params }: { params: [key: string] }
) {
  const safeParse = schema.safeParse(params)

  if (!safeParse.success) {
    return NextResponse.json(safeParse.error, { status: 400 })
  }

  const { id } = safeParse.data
  const product = products.find((product) => product.id === id)

  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  const DOMAIN = new URL(process.env.DOMAIN || 'http://localhost:3000').origin

  const metadata = {
    name: product?.name,
    image: `${DOMAIN}/api/metadata/bread/${id}/image`,
    description: product?.description,
  }

  return NextResponse.json(metadata)
}
