'use client'

import { useConnectModal } from '@rainbow-me/rainbowkit'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { useEffect } from 'react'
import { breadContract } from 'shared/contracts'
import { formatEther } from 'viem'
import {
  BaseError,
  useAccount,
  useChainId,
  useReadContract,
  useReadContracts,
  useSimulateContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'

import { Button } from '@/components/Button'
import { WalletProfile } from '@/components/WalletProfile'
import { useCart } from '@/hooks/useCart'
import { useEthPrice } from '@/hooks/useEthPrice'
import { useInventory } from '@/hooks/useInventory'
import { useRequestOrder } from '@/hooks/useRequestOrder'
import { primaryChain } from '@/lib/constants'
import { cn } from '@/lib/utils'

export default function Cart() {
  const { address } = useAccount()
  const chainId = useChainId()
  const { cart, removeFromCart } = useCart()
  const { data: ethPrice } = useEthPrice()
  const { openConnectModal } = useConnectModal()
  const { switchChain } = useSwitchChain()
  const contract = useWriteContract()
  const inventory = useInventory({ tokenIds: cart })

  const cartItemIdsInStock =
    inventory.data
      ?.filter((product) => product.quantity.formatted > 0)
      .map((product) => product.id) || []

  const price = useReadContract({
    ...breadContract,
    chainId: primaryChain.id,
    functionName: 'price',
    args: [
      address!,
      cartItemIdsInStock,
      cartItemIdsInStock.map(() => BigInt(1)),
    ],
    query: { enabled: !!address },
  })

  const orderRequest = useRequestOrder({
    account: address,
    ids: cartItemIdsInStock.map((id) => Number(id)),
    quantities: cartItemIdsInStock.map(() => 1),
  })

  const { claimId, encodedMessageAndData } = orderRequest.data || {}

  const { data: multicall } = useReadContracts({
    query: { enabled: !!orderRequest.data },
    contracts: [
      {
        ...breadContract,
        chainId: primaryChain.id,
        functionName: 'canOrder',
        args: [address!, encodedMessageAndData!],
      },
      {
        ...breadContract,
        chainId: primaryChain.id,
        functionName: 'usedClaims',
        args: [claimId!],
      },
    ],
  })

  const canOrder = multicall?.[0].result
  const usedClaim = multicall?.[1].result
  const totalPriceRaw = price.data?.[0]
  const discountRaw = price.data?.[1]
  const totalPriceFormatted = formatEther(totalPriceRaw || BigInt(0))
  const discountFormatted = formatEther(discountRaw || BigInt(0))

  // Refetch the inventory and price when the cart changes
  useEffect(() => {
    inventory.refetch()
    price.refetch()
  }, [cart])

  const simulation = useSimulateContract({
    ...breadContract,
    chainId: primaryChain.id,
    functionName: 'buyBread',
    args: [
      address!,
      cartItemIdsInStock,
      cartItemIdsInStock.map(() => BigInt(1)),
      encodedMessageAndData!,
    ],
    value: totalPriceRaw,
    query: { enabled: !!canOrder },
  })

  const receipt = useWaitForTransactionReceipt({
    hash: contract.data,
    chainId: primaryChain.id,
  })

  return (
    <main className="mx-auto flex max-w-7xl flex-col px-6 py-12">
      <div className="mb-8 flex flex-col justify-between gap-2 sm:mb-14 sm:flex-row sm:items-center sm:gap-6">
        <h1>
          <Link href="/" className="section-title flex items-center gap-3">
            <img src="/misc/greg.svg" className="w-8" />
            <span>Checkout</span>
          </Link>
        </h1>

        <WalletProfile address={address} />
      </div>

      {(() => {
        if (!cart.length) return <p>Your cart is empty</p>

        if (inventory.isLoading) {
          return <p>Loading...</p>
        }

        if (!inventory.data) return <p>No inventory</p>

        return (
          <>
            <div className="flex flex-col gap-4">
              {inventory.data?.map((item) => (
                <div
                  key={item.id}
                  className="border-brand-primary grid w-full gap-4 border-b py-6 first:border-t md:grid-cols-[2fr,3fr,8fr]"
                >
                  <div>
                    <button
                      className="m-0 h-fit w-fit"
                      onClick={() => removeFromCart(item.id)}
                    >
                      ✖︎ Remove
                    </button>

                    {item.quantity.formatted === 0 && (
                      <p className="font-pangram text-brand-accent-orange font-semibold">
                        SOLD OUT
                      </p>
                    )}
                  </div>
                  <div>
                    <p>{item.name}</p>
                    <p>{item.price.formatted} ETH</p>
                  </div>
                  <img
                    src={item.image}
                    alt={item.name}
                    className={cn(
                      'border-brand-primary h-32 w-32 rounded-lg border',
                      item.quantity.formatted === 0 && 'saturate-0'
                    )}
                  />
                </div>
              ))}
            </div>
            <div className="mt-2 self-end text-right">
              {discountRaw && <p>Discount: {discountFormatted} ETH</p>}

              {totalPriceRaw !== undefined && (
                <p className="font-semibold">
                  Total: {totalPriceFormatted} ETH{' '}
                  {ethPrice &&
                    `($${(Number(totalPriceFormatted) * ethPrice).toFixed(0)} USD)`}
                </p>
              )}
            </div>

            <div className="mt-12 flex flex-col items-end gap-2">
              {(() => {
                if (!address) {
                  return (
                    <Button onClick={openConnectModal}>Connect Wallet</Button>
                  )
                }

                if (receipt.isSuccess) {
                  redirect('/cart/success')
                }

                if (receipt.isLoading) {
                  return (
                    <Button disabled loading>
                      Processing transaction
                    </Button>
                  )
                }

                if (contract.isPending) {
                  return (
                    <Button disabled loading>
                      Confirm in wallet
                    </Button>
                  )
                }

                if (chainId !== primaryChain.id) {
                  return (
                    <Button
                      onClick={() => switchChain({ chainId: primaryChain.id })}
                    >
                      Switch network
                    </Button>
                  )
                }

                return (
                  <>
                    <Button
                      disabled={!simulation.data}
                      loading={orderRequest.isLoading || simulation.isLoading}
                      onClick={() => {
                        if (!simulation.data) {
                          return alert("Transaction hasn't been simulated yet.")
                        }

                        contract.writeContract(simulation.data.request)
                      }}
                    >
                      Buy Bread
                    </Button>

                    <span className="text-right">
                      {orderRequest.error && orderRequest.error.message}

                      {usedClaim
                        ? 'Orders are limited to 1 per person per week.'
                        : canOrder === false && 'You cannot place this order.'}

                      {simulation.error &&
                        ((simulation.error as BaseError).shortMessage ||
                          'Simulated transaction failed.')}
                    </span>
                  </>
                )
              })()}
            </div>
          </>
        )
      })()}
    </main>
  )
}
