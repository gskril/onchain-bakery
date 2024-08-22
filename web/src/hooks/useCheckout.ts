// Aggregate as much logic as possible here instead of having a ton of hooks on the checkout page
import { useQuery } from '@tanstack/react-query'
import { breadContract } from 'shared/src/contracts'
import { Hex, publicActions } from 'viem'
import { formatEther } from 'viem/utils'
import { useAccount, usePublicClient } from 'wagmi'

import { primaryChain } from '@/lib/constants'
import { wagmiConfig } from '@/lib/web3'

import { useCart } from './useCart'
import { getEthPrice } from './useEthPrice'
import { getInventory } from './useInventory'
import { getOrderRequest } from './useRequestOrder'

export function useCheckout() {
  const { address } = useAccount()
  const { cart } = useCart()

  const viemClient = usePublicClient({
    config: wagmiConfig,
    chainId: primaryChain.id,
  })

  return useQuery({
    retry: 0,
    queryKey: ['checkout'],
    queryFn: async () => {
      if (!address) return null

      const { cartItemIdsInStock, orderPriceRaw } =
        await getInitialCheckoutData(cart, address)

      const [balance, orderRequest] = await Promise.all([
        viemClient.getBalance({ address }),
        getOrderRequest({
          account: address,
          ids: cartItemIdsInStock.map((id) => Number(id)),
          quantities: cartItemIdsInStock.map(() => 1),
        }),
      ])

      const [canOrder, usedClaim] = await Promise.all([
        viemClient.readContract({
          ...breadContract,
          functionName: 'canOrder',
          args: [address, orderRequest.encodedMessageAndData],
        }),
        viemClient.readContract({
          ...breadContract,
          functionName: 'usedClaims',
          args: [orderRequest.claimId],
        }),
      ])

      const simulation = await viemClient.simulateContract({
        ...breadContract,
        functionName: 'buyBread',
        args: [
          address,
          cartItemIdsInStock,
          cartItemIdsInStock.map(() => BigInt(1)),
          orderRequest.encodedMessageAndData,
        ],
        value: orderPriceRaw,
      })

      return {
        balance,
        hasSufficientBalance: balance > orderPriceRaw,
        orderRequest,
        canOrder,
        usedClaim,
        simulation,
      }
    },
  })
}

export function useInitialCheckoutData(cart: bigint[], address?: Hex) {
  return useQuery({
    queryKey: ['initialCheckoutData'],
    queryFn: async () => {
      return await getInitialCheckoutData(
        cart,
        address || '0x0000000000000000000000000000000000000000'
      )
    },
  })
}

async function getInitialCheckoutData(cart: bigint[], address: Hex) {
  const ethPrice = await getEthPrice()
  const inventory = await getInventory({ tokenIds: cart })

  const areAllCartItemsInStock = inventory.every(
    (item) => item.quantity.formatted > 0
  )

  const cartItemIdsInStock =
    inventory
      ?.filter((product) => product.quantity.formatted > 0)
      .map((product) => product.id) || []

  const viemClient = wagmiConfig
    .getClient({ chainId: primaryChain.id })
    .extend(publicActions)

  const [orderPriceRaw, discountRaw] = await viemClient.readContract({
    ...breadContract,
    functionName: 'price',
    args: [
      address,
      cartItemIdsInStock,
      cartItemIdsInStock.map(() => BigInt(1)),
    ],
  })

  const orderPriceFormatted = formatEther(orderPriceRaw)
  const discountFormatted = formatEther(discountRaw)
  const usdValue = (Number(orderPriceFormatted) * ethPrice).toFixed(0)

  return {
    ethPrice,
    usdValue,
    cartItemIdsInStock,
    areAllCartItemsInStock,
    orderPriceRaw,
    orderPriceFormatted,
    discountRaw,
    discountFormatted,
  }
}
