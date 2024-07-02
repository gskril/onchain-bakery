import { Hex, getContractAddress } from 'viem'
import { generatePrivateKey } from 'viem/accounts'
import { privateKeyToAccount } from 'viem/accounts'

const baseNonce = 69n
// generateDeployerPrivateKey('0x0000', baseNonce)
// generateNonce('0x0000', baseNonce)

/**
 * Generate a private key that will deploy a smart contract with a vanity address at a given nonce.
 *
 * @param vanity The first few characters of the address you want to generate, case insensitive.
 * @param nonce Generally good to set this higher than 0 to prevent accidentally using the nonce on a different transaction.
 */
function generateDeployerPrivateKey(vanity: Hex, nonce: bigint) {
  let tries = 0

  while (true) {
    const deployerPrivateKey = generatePrivateKey()
    const deployerPublicAddress =
      privateKeyToAccount(deployerPrivateKey).address

    const deployedContractAddress = getContractAddress({
      from: deployerPublicAddress,
      nonce,
    })

    if (deployedContractAddress.toLowerCase().startsWith(vanity)) {
      console.log({
        deployerPrivateKey,
        deployerPublicAddress,
        deployedContractAddress,
        nonce,
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
 * Generate a nonce that will deploy a smart contract with a vanity address from the `process.env.DEPLOYER_KEY`.
 *
 * @param vanity The first few characters of the address you want to generate, case insensitive.
 * @param baseNonce The nonce to start from.
 */
function generateNonce(vanity: Hex, baseNonce: bigint) {
  let tries = 0
  let nonce = baseNonce + 1n

  const deployerPrivateKey = process.env.DEPLOYER_KEY as Hex
  const deployerPublicAddress = privateKeyToAccount(deployerPrivateKey).address

  while (true) {
    const deployedContractAddress = getContractAddress({
      from: deployerPublicAddress,
      nonce,
    })

    if (deployedContractAddress.toLowerCase().startsWith(vanity)) {
      console.log({
        deployedContractAddress,
        nonce,
      })

      break
    }

    if (tries % 1000 === 0) {
      console.log(`Tries: ${tries}`)
    }

    tries++
    nonce++
  }
}
