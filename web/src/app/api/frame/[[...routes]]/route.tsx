/** @jsxImportSource frog/jsx */
import { Button, Frog } from 'frog'
import { handle } from 'frog/next'
import { breadContract } from 'shared/contracts'
import { Address } from 'viem'

import { primaryChain } from '@/lib/web3'

const DOMAIN = new URL(process.env.DOMAIN || 'http://localhost:3000')

const app = new Frog({
  basePath: '/api/frame',
  title: 'Good Bread by Greg',
})

app.frame('/', (c) => {
  return c.res({
    image: <img src={`${DOMAIN.origin}/frame/1.svg`} />,
    intents: [
      <Button.Transaction target="/mint">Mint Launch NFT</Button.Transaction>,
      <Button.Link href="https://dev.goodbread.nyc">Visit Website</Button.Link>,
    ],
  })
})

app.transaction('/mint', (c) => {
  return c.contract({
    abi: breadContract.abi,
    to: breadContract.address,
    functionName: 'buyBread',
    chainId: `eip155:${primaryChain.id}`,
    args: [c.address as Address, [BigInt(1)], [BigInt(1)], '0x'],
  })
})

export const GET = handle(app)
export const POST = handle(app)
