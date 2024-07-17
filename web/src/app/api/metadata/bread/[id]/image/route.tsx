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

  const VERCEL_URL = process.env.VERCEL_URL
  const baseUrl = VERCEL_URL ? `https://${VERCEL_URL}` : 'http://localhost:3000'

  const { id } = safeParse.data

  if (id === BigInt(1)) {
    return fetch(`${baseUrl}/nft/launch.png`)
  }

  return new ImageResponse(
    (
      <div style={{ display: 'flex' }}>
        <p>hi</p>
      </div>
    ),
    {}
  )
}
