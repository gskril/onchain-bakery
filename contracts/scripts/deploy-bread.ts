import hre from 'hardhat'

async function main() {
  const contract = await hre.viem.deployContract('Bread', [
    '0x179A862703a4adfb29896552DF9e307980D19285', // _owner,
    '0x0000000000000000000000000000000000000000', // _proofOfBread,
    'https://website.com/api/{id}', // _uri
  ])

  console.log(`Deployed Bread to ${contract.address}`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
