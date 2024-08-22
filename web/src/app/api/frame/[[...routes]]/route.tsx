/** @jsxImportSource frog/jsx */
import { Button, Frog } from 'frog'
import { handle } from 'frog/next'
import { openMinterContract } from 'shared/src/contracts'
import { Address, parseEther } from 'viem'

import { primaryChain } from '@/lib/constants'

const DOMAIN = new URL(process.env.DOMAIN || 'http://localhost:3000')

const app = new Frog({
  browserLocation: '/',
  basePath: '/api/frame',
  title: 'Good Bread by Greg',
})

app.frame('/', (c) => {
  return c.res({
    action: '/thanks',
    image: <img src={`${DOMAIN.origin}/frame/1.svg`} />,
    intents: [
      <Button.Transaction target="/mint">Mint Launch NFT</Button.Transaction>,
      <Button.Link href="https://goodbread.nyc?ref=farcaster">
        Visit Website
      </Button.Link>,
    ],
  })
})

app.frame('/thanks', (c) => {
  return c.res({
    image: <img src={`${DOMAIN.origin}/frame/2.svg`} />,
    intents: [
      <Button.Link href="https://warpcast.com/~/compose?text=i%20like%20(good)%20bread%20(by%20@greg)%20%F0%9F%8D%9E&embeds[]=https://goodbread.nyc?ref=farcaster&channelKey=goodbread">
        Share
      </Button.Link>,
      <Button.Link href="https://goodbread.nyc?ref=farcaster">
        Visit Website
      </Button.Link>,
    ],
  })
})

app.transaction('/mint', (c) => {
  return c.contract({
    abi: openMinterContract.abi,
    to: openMinterContract.address,
    functionName: 'mint',
    chainId: `eip155:${primaryChain.id}`,
    args: [c.address as Address, BigInt(1), BigInt(1)],
    value: parseEther('0.000777'),
  })
})

export const GET = handle(app)
export const POST = handle(app)
