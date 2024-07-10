import { Hex, getContractAddress, toHex } from 'viem'
import { generatePrivateKey } from 'viem/accounts'
import { privateKeyToAccount } from 'viem/accounts'

import { create2Factory } from './create2'

// generateDeployerPrivateKey('0x000')

/**
 * Generate a private key that will deploy a smart contract with a vanity address.
 *
 * @param vanity The first few characters of the address you want to generate, case insensitive.
 */
function generateDeployerPrivateKey(vanity: Hex) {
  let tries = 0

  while (true) {
    const deployerPrivateKey = generatePrivateKey()
    const deployerPublicAddress =
      privateKeyToAccount(deployerPrivateKey).address

    const deployedContractAddress = getContractAddress({
      from: deployerPublicAddress,
      nonce: 0n,
    })

    if (deployedContractAddress.toLowerCase().startsWith(vanity)) {
      console.log({
        deployerPrivateKey,
        deployerPublicAddress,
        deployedContractAddress,
      })

      break
    }

    if (tries % 1000 === 0) {
      console.log(`Tries: ${tries}`)
    }

    tries++
  }
}

/**
 * Generate a salt that will deploy a smart contract with a vanity address using CREATE2.
 *
 * @param vanity The first few characters of the address you want to generate.
 * @param initCode The bytecode of the smart contract you want to deploy, including the constructor arguments.
 * @param initCodeHash The keccak256 hash of the initCode.
 * @param caseSensitive Whether the vanity part of the address is case sensitive.
 * @param startingIteration The starting iteration to generate the salt from. Useful for resuming a previous search.
 */
export async function generateCreate2Salt({
  vanity,
  initCode,
  caseSensitive = false,
  startingIteration = 0,
}: {
  vanity: Hex
  initCode: Hex
  caseSensitive?: boolean
  startingIteration?: number
}) {
  let tries = startingIteration

  while (true) {
    const salt = toHex(tries, { size: 32 })

    const expectedAddress = getContractAddress({
      bytecode: initCode,
      from: create2Factory.address,
      opcode: 'CREATE2',
      salt,
    })

    if (caseSensitive) {
      if (expectedAddress.startsWith(vanity)) {
        return { salt, expectedAddress }
      }
    } else {
      if (expectedAddress.toLowerCase().startsWith(vanity)) {
        return { salt, expectedAddress }
      }
    }

    if (tries % 1000 === 0) {
      console.log(`Tries: ${tries}`)
    }

    tries++
  }
}
