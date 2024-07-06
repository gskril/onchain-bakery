import { getDefaultWallets } from '@rainbow-me/rainbowkit'
import { createConfig, http } from 'wagmi'
import { base, mainnet } from 'wagmi/chains'

const WALLETCONNECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_ID

if (!WALLETCONNECT_ID) {
  throw new Error('Missing NEXT_PUBLIC_WALLETCONNECT_ID')
}

const { connectors } = getDefaultWallets({
  appName: 'Onchain Bakery',
  projectId: WALLETCONNECT_ID,
})

const chains = [base, mainnet] as const

export const wagmiConfig = createConfig({
  chains,
  connectors,
  transports: {
    [base.id]: http(
      'https://virtual.base.rpc.tenderly.co/6226ee33-4b44-4162-a0f8-9b01a7853db8'
    ),
    [mainnet.id]: http(),
  },
})
