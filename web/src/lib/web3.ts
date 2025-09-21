import { getDefaultWallets } from '@rainbow-me/rainbowkit'
import { createConfig, http } from 'wagmi'
import { base, baseSepolia, mainnet } from 'wagmi/chains'

const WALLETCONNECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_ID

if (!WALLETCONNECT_ID) {
  throw new Error('Missing NEXT_PUBLIC_WALLETCONNECT_ID')
}

const { connectors } = getDefaultWallets({
  appName: 'Good Bread by Greg',
  projectId: WALLETCONNECT_ID,
})

const chains = [base, mainnet, baseSepolia] as const

export const wagmiConfig = createConfig({
  chains,
  connectors,
  transports: {
    [base.id]: http(process.env.NEXT_PUBLIC_BASE_RPC ?? 'https://base-rpc.publicnode.com'),
    [mainnet.id]: http(process.env.NEXT_PUBLIC_MAINNET_RPC ?? 'https://ethereum-rpc.publicnode.com'),
    [baseSepolia.id]: http(process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC ?? 'https://base-sepolia-rpc.publicnode.com'),
  },
})
