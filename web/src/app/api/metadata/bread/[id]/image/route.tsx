import { ImageResponse } from 'next/og'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export const runtime = 'edge'

const schema = z.object({
  id: z.coerce.bigint(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: [key: string] }
): Promise<ImageResponse | NextResponse> {
  const safeParse = schema.safeParse(params)

  if (!safeParse.success) {
    return NextResponse.json(safeParse.error, { status: 400 })
  }

  const { id } = safeParse.data
  const DOMAIN = new URL(process.env.DOMAIN || 'http://localhost:3000').origin

  return fetch(`${DOMAIN}/nft/${id}.svg`)

  // TODO: Generate the images rather than exporting each one individually
  return new ImageResponse(
    (
      <div style={{ display: 'flex' }}>
        <p>hi</p>
      </div>
    ),
    {}
  )
}
