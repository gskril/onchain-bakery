type Props = {
  recipientFid: number
  message: string
  idempotencyKey: string
}

export async function sendDirectCast({
  recipientFid,
  message,
  idempotencyKey,
}: Props) {
  const res = await fetch('https://api.warpcast.com/v2/ext-send-direct-cast', {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${process.env.WARPCAST_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ recipientFid, message, idempotencyKey }),
  })

  if (res.ok) {
    console.log(`Direct cast sent to ${recipientFid}`)
  } else {
    console.error(`Failed to send direct cast to ${recipientFid}`)
  }

  return await res.json()
}
