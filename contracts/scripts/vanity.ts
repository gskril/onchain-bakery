import hre from 'hardhat'
import { Hex, getContractAddress, toHex } from 'viem'
import { generatePrivateKey } from 'viem/accounts'
import { privateKeyToAccount } from 'viem/accounts'

// generateDeployerPrivateKey('0x000')
// generateCreate2Salt('0x000')

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
 * @param vanity The first few characters of the address you want to generate, case insensitive.
 */
async function generateCreate2Salt(vanity: Hex) {
  let tries = 0

  const deployerPrivateKey = process.env.DEPLOYER_KEY as Hex
  const deployerPublicAddress = privateKeyToAccount(deployerPrivateKey).address
  const artifacts = await hre.artifacts.readArtifact('Bread')

  while (true) {
    const salt = toHex(tries)

    const deployedContractAddress = getContractAddress({
      bytecode: artifacts.bytecode,
      from: deployerPublicAddress,
      opcode: 'CREATE2',
      salt,
    })

    if (deployedContractAddress.toLowerCase().startsWith(vanity)) {
      console.log({
        deployedContractAddress,
        salt,
      })

      break
    }

    if (tries % 1000 === 0) {
      console.log(`Tries: ${tries}`)
    }

    tries++
  }
}
