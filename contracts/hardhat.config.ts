import '@nomicfoundation/hardhat-toolbox-viem'
import '@nomicfoundation/hardhat-verify'
import 'dotenv/config'
import type { HardhatUserConfig } from 'hardhat/config'

const { DEPLOYER_KEY, BASESCAN_API_KEY } = process.env

// Keys are only required for deploying and verifying, so local compiling and testing work without a .env file
const accounts = DEPLOYER_KEY ? [DEPLOYER_KEY] : []

const config: HardhatUserConfig = {
  networks: {
    base: {
      url: 'https://mainnet.base.org',
      accounts,
    },
    baseSepolia: {
      url: 'https://sepolia.base.org',
      accounts,
    },
  },
  solidity: {
    compilers: [
      {
        version: '0.8.21',
        settings: {
          optimizer: {
            enabled: true,
            runs: 100000,
          },
        },
      },
    ],
  },
  etherscan: {
    apiKey: {
      base: BASESCAN_API_KEY ?? '',
      baseSepolia: BASESCAN_API_KEY ?? '',
    },
  },
  paths: {
    sources: './src',
  },
}

export default config
