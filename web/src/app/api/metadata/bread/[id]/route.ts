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

  const VERCEL_URL = process.env.VERCEL_URL
  const baseUrl = VERCEL_URL ? `https://${VERCEL_URL}` : 'http://localhost:3000'

  const metadata = {
    name: product?.name,
    image: `${baseUrl}/api/metadata/bread/${id}/image`,
    description: product?.description,
  }

  return NextResponse.json(metadata)
}
