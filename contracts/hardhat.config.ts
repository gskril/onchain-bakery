import '@nomicfoundation/hardhat-toolbox-viem'
import '@nomicfoundation/hardhat-verify'
import 'dotenv/config'
import { HardhatUserConfig } from 'hardhat/config'

const DEPLOYER_KEY = process.env.DEPLOYER_KEY
const OP_ETHERSCAN_API_KEY = process.env.OP_ETHERSCAN_API_KEY

if (!DEPLOYER_KEY) throw new Error('DEPLOYER_KEY must be set')
if (!OP_ETHERSCAN_API_KEY) throw new Error('OP_ETHERSCAN_API_KEY must be set')

const config: HardhatUserConfig = {
  networks: {
    optimism: {
      url: 'https://rpc.ankr.com/optimism',
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
      optimisticGoerli: OP_ETHERSCAN_API_KEY,
      optimisticEthereum: OP_ETHERSCAN_API_KEY,
    },
  },
  paths: {
    sources: './src',
  },
}

export default config
