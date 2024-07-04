import hre from 'hardhat'
import { encodeAbiParameters, encodePacked, keccak256 } from 'viem/utils'

export async function getBreadDeploymentInfo() {
  const args = [
    '0xb163A4e39f5CbeC87769D0FEb68169F7C0BA3b5b', // _owner (gskril.eth)
    '0x179A862703a4adfb29896552DF9e307980D19285', // _manager (gregskril.eth)
    '0x00009eB84512479aa44e9dcbB3E0b14e97D61E9c', // _signer (fresh account)
    '0x0000000000000000000000000000000000000000', // _proofOfBread
    'https://goodbread.nyc/api/metadata/bread/{id}', // _uri
  ] as const

  const abiEncodedArgs = encodeAbiParameters(
    [
      { type: 'address' },
      { type: 'address' },
      { type: 'address' },
      { type: 'address' },
      { type: 'string' },
    ],
    args
  )

  const { bytecode } = await hre.artifacts.readArtifact('Bread')

  const initCode = encodePacked(['bytes', 'bytes'], [bytecode, abiEncodedArgs])

  const initCodeHash = keccak256(initCode)

  return { args, initCode, initCodeHash }
}
