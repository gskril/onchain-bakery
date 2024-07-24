import hre from 'hardhat'
import { encodeAbiParameters, encodePacked } from 'viem'

import { create2Factory } from './create2'
import { generateCreate2Salt } from './vanity'

async function main() {
  const publicClient = await hre.viem.getPublicClient()
  const walletClients = await hre.viem.getWalletClients()
  const walletClient = walletClients[0]

  const args = [
    '0xb163A4e39f5CbeC87769D0FEb68169F7C0BA3b5b', // _owner (gskril.eth)
    '0x00009eB84512479aa44e9dcbB3E0b14e97D61E9c', // _signer (fresh account)
    '0xB2EAD1C95A41Dc617fFAe193d75386Bf65D31F7c', // _bread
    'https://goodbread.nyc/api/metadata/proof-of-bread/{id}', // _uri
  ] as const

  const abiEncodedArgs = encodeAbiParameters(
    [
      { type: 'address' },
      { type: 'address' },
      { type: 'address' },
      { type: 'string' },
    ],
    args
  )

  const { bytecode } = await hre.artifacts.readArtifact('ProofOfBread')
  const initCode = encodePacked(['bytes', 'bytes'], [bytecode, abiEncodedArgs])

  const { salt, expectedAddress } = await generateCreate2Salt({
    vanity: '0xB2EAD',
    initCode,
    caseSensitive: true,
    startingIteration: 22072000,
  })

  const deployTx = await walletClient.writeContract({
    ...create2Factory,
    functionName: 'deploy',
    args: [0n, salt, initCode],
  })

  await publicClient.waitForTransactionReceipt({ hash: deployTx })

  console.log(`Deployed ProofOfBread.sol to ${expectedAddress}`)

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
