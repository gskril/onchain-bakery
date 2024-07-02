import '@nomicfoundation/hardhat-toolbox-viem'
import '@nomicfoundation/hardhat-verify'
import 'dotenv/config'
import { HardhatUserConfig } from 'hardhat/config'

// prettier-ignore
const HARDHAT_PKEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
const DEPLOYER_KEY = process.env.DEPLOYER_KEY || HARDHAT_PKEY
const BASESCAN_API_KEY = process.env.BASESCAN_API_KEY

if (!BASESCAN_API_KEY) throw new Error('BASESCAN_API_KEY must be set')

const config: HardhatUserConfig = {
  networks: {
    base: {
      url: 'https://rpc.ankr.com/base',
      accounts: [DEPLOYER_KEY],
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
      base: BASESCAN_API_KEY,
      baseGoerli: 'BASESCAN_API_KEY', // don't need a key for Base Goerli
    },
  },
  paths: {
    sources: './src',
  },
}

export default config
