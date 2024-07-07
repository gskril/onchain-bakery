import hre from 'hardhat'

import { getBreadDeploymentInfo } from './bread'
import { create2Factory } from './create2'
import { generateCreate2Salt } from './vanity'

/* 
  Tries: 62590000

  Promise {
    {
      salt: '0x0000000000000000000000000000000000000000000000000000000003bb0e3a',
      expectedAddress: '0xB2EAD59f83CEA21630b35E2B6f6E6495F89478Fc'
    }
  }

  Done in 124209.05s.
*/

async function main() {
  const publicClient = await hre.viem.getPublicClient()
  const walletClients = await hre.viem.getWalletClients()
  const walletClient = walletClients[0]

  const { args, initCode } = await getBreadDeploymentInfo()
  const { salt, expectedAddress } = await generateCreate2Salt({
    vanity: '0xb2ead',
    initCode,
  })

  const deployTx = await walletClient.writeContract({
    ...create2Factory,
    functionName: 'deploy',
    args: [0n, salt, initCode],
  })

  await publicClient.waitForTransactionReceipt({ hash: deployTx })

  console.log(`Deployed Bread.sol to ${expectedAddress}`)

  try {
    // Wait 10 seconds for block explorers to index the deployment
    await new Promise((resolve) => setTimeout(resolve, 10_000))

    await hre.run('verify:verify', {
      address: expectedAddress,
      constructorArguments: args,
    })
  } catch (error) {
    console.error(error)
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
