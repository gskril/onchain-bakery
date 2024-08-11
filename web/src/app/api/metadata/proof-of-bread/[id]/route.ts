import { NextRequest, NextResponse } from 'next/server'
import z from 'zod'

const proofOfBreads = [
  {
    name: 'Proof of Bread #1',
    description:
      'This NFT is proof that you picked up bread from Greg in New York City on July 21, 2024.',
  },
  {
    name: 'Proof of Bread #2',
    description:
      'This NFT is proof that you picked up bread from Greg in New York City on July 27, 2024.',
  },
  {
    name: 'Proof of Bread #3',
    description:
      'This NFT is proof that you picked up bread from Greg in New York City on August 11, 2024.',
  },
]

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
  const nft = proofOfBreads[Number(id) - 1]

  if (!nft) {
    return NextResponse.json({ error: 'NFT not found' }, { status: 404 })
  }

  const DOMAIN = new URL(process.env.DOMAIN || 'http://localhost:3000').origin

  const metadata = {
    ...nft,
    image: `${DOMAIN}/api/metadata/proof-of-bread/${id}/image`,
  }

  return NextResponse.json(metadata)
}
