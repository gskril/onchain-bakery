import hre from 'hardhat'
import { encodeAbiParameters, encodePacked, keccak256 } from 'viem/utils'

export async function getCrossChainBreadDeploymentInfo() {
  const args = [
    '0x4200000000000000000000000000000000000006', // _weth
    '0xB2EAD1C95A41Dc617fFAe193d75386Bf65D31F7c', // _bread (from deploy-bread.ts)
    '0x09aea4b2242abC8bb4BB78D537A67a245A7bEC64', // _acrossSpokePool (https://docs.across.to/reference/contract-addresses/base-chain-id-8453)
  ] as const

  const abiEncodedArgs = encodeAbiParameters(
    [{ type: 'address' }, { type: 'address' }, { type: 'address' }],
    args
  )

  const { bytecode } = await hre.artifacts.readArtifact('CrossChainBread')

  const initCode = encodePacked(['bytes', 'bytes'], [bytecode, abiEncodedArgs])

  const initCodeHash = keccak256(initCode)

  return { args, initCode, initCodeHash }
}
