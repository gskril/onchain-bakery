import hre from 'hardhat'
import { parseEther } from 'viem'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'

const args = [
  '0x179A862703a4adfb29896552DF9e307980D19285', // _owner,
  '0x0000000000000000000000000000000000000000', // _signer,
  '0x0000000000000000000000000000000000000000', // _proofOfBread,
  'https://website.com/api/{id}', // _uri
] as const

// This only works when the DEPLOYER_KEY is empty, meaning it is the default Hardhat account
async function main() {
  let tries = 1
  const _walletClient = await hre.viem.getWalletClients()
  const walletClient = _walletClient[0]

  const initialDeployment = await hre.viem.deployContract('Bread', [...args])
  console.log(`Initial deployment to ${initialDeployment.address}`)

  // Loop through new private keys until one is found that deploys the contract with the desired vanity address
  while (true) {
    // Log every 100 tries
    if (tries % 100 === 0) console.log(`Tries: ${tries}`)

    const privateKey = generatePrivateKey()
    const vanityDeployer = privateKeyToAccount(privateKey)

    // Send enough ETH to the new deployer to cover the gas cost of deploying the contract
    await walletClient.sendTransaction({
      to: vanityDeployer.address,
      value: parseEther('0.0075'),
    })

    // @ts-ignore
    const vanityDeployment = await hre.viem.deployContract('Bread', [...args], {
      walletClient: hre.viem.getWalletClient(vanityDeployer.address, {
        account: vanityDeployer,
      }),
      nonce: 0,
    })

    if (vanityDeployment.address.toLowerCase().startsWith('0xb5ead')) {
      console.log(
        `Deployed to ${vanityDeployment.address} from private key ${privateKey} which has the public address ${vanityDeployer.address}`
      )

      break
    }

    tries += 1
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
