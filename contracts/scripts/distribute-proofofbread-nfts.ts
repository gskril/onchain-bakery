import hre from 'hardhat'

async function main() {
  const walletClients = await hre.viem.getWalletClients()
  const walletClient = walletClients[0]

  const contract = hre.artifacts.readArtifactSync('ProofOfBread')

  const tokenId = 3n
  const recipients = ['0x179A862703a4adfb29896552DF9e307980D19285'] as const

  const tx = await walletClient.writeContract({
    address: '0xB2EAD4736e6CBf4B13891299224C3cFBE23caee4',
    abi: contract.abi,
    functionName: 'distributeBread',
    args: [recipients, recipients.map(() => tokenId)],
  })

  console.log(`https://basescan.org/tx/${tx}`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
