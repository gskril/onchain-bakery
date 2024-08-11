'use server'

import { proofOfBreadContract } from 'shared/contracts'
import {
  Hex,
  createClient,
  http,
  isAddress,
  publicActions,
  walletActions,
} from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet } from 'viem/chains'
import { z } from 'zod'

import { primaryChain } from '@/lib/constants'

const schema = z.object({
  addressOrName: z.string(),
  tokenId: z.coerce.number(),
})

export async function claimProofOfBread(
  prevState: any,
  formData: FormData
): Promise<{
  ok: boolean
  message?: string
}> {
  const safeParse = schema.safeParse({
    addressOrName: formData.get('addressOrName'),
    tokenId: formData.get('tokenId'),
  })

  if (!safeParse.success) {
    return {
      ok: false,
      message: 'Invalid inputs',
    }
  }

  const { addressOrName, tokenId } = safeParse.data

  // TODO: create client from the wagmi config
  const primaryChainClient = createClient({
    account: privateKeyToAccount(process.env.SIGNER_PRIVATE_KEY as Hex),
    chain: primaryChain,
    transport: http(),
  })
    .extend(publicActions)
    .extend(walletActions)

  const mainnetClient = createClient({
    chain: mainnet,
    transport: http(),
  }).extend(publicActions)

  let address: Hex

  if (isAddress(addressOrName)) {
    address = addressOrName
  } else {
    try {
      // Try to resolve ENS name
      const ensAddress = await mainnetClient.getEnsAddress({
        name: addressOrName as Hex,
      })

      if (!ensAddress) {
        return { ok: false, message: 'No address for that ENS name' }
      }

      address = ensAddress
    } catch (error) {
      return { ok: false, message: 'Invalid ENS name' }
    }
  }

  const balance = await primaryChainClient.readContract({
    ...proofOfBreadContract,
    functionName: 'balanceOf',
    args: [address, BigInt(tokenId)],
  })

  if (balance > BigInt(0)) {
    return { ok: false, message: 'You already own this NFT' }
  }

  try {
    await primaryChainClient.writeContract({
      ...proofOfBreadContract,
      functionName: 'distributeBread',
      args: [[address], [BigInt(tokenId)]],
    })
  } catch (error) {
    return { ok: false, message: 'Transaction failed on the backend' }
  }

  return { ok: true, message: 'The NFT has been minted to your account!' }
}
