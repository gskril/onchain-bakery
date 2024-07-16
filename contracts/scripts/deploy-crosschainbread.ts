import hre from 'hardhat'

import { create2Factory } from './create2'
import { getCrossChainBreadDeploymentInfo } from './crosschainbread'
import { generateCreate2Salt } from './vanity'

async function main() {
  const publicClient = await hre.viem.getPublicClient()
  const walletClients = await hre.viem.getWalletClients()
  const walletClient = walletClients[0]

  const { args, initCode } = await getCrossChainBreadDeploymentInfo()

  const { salt, expectedAddress } = await generateCreate2Salt({
    vanity: '0xB2EAD',
    initCode,
    caseSensitive: true,
    startingIteration: 16594000,
  })

  console.log({ salt, expectedAddress })

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
