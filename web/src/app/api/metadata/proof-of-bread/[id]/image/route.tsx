import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export const runtime = 'nodejs'

const schema = z.object({
  id: z.coerce.bigint(),
})

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const safeParse = schema.safeParse(await params)

  if (!safeParse.success) {
    return NextResponse.json(safeParse.error, { status: 400 })
  }

  const { id } = safeParse.data
  const DOMAIN = new URL(process.env.DOMAIN || 'http://localhost:3000').origin

  return fetch(`${DOMAIN}/proof-of-bread/${id}.svg`)
}
