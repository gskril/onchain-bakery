'use client'

import { useConnectModal } from '@rainbow-me/rainbowkit'
import { UseQueryResult } from '@tanstack/react-query'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { breadContract } from 'shared/contracts'
import { formatEther } from 'viem'
import {
  BaseError,
  useAccount,
  useBalance,
  useChainId,
  useReadContract,
  useReadContracts,
  useSignMessage,
  useSimulateContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'

import { Button } from '@/components/Button'
import { WalletProfile } from '@/components/WalletProfile'
import { useCart } from '@/hooks/useCart'
import { useCreateWallet } from '@/hooks/useCreateWallet'
import { useEthPrice } from '@/hooks/useEthPrice'
import { useInventory } from '@/hooks/useInventory'
import { useRequestOrder } from '@/hooks/useRequestOrder'
import { primaryChain } from '@/lib/constants'
import { cn } from '@/lib/utils'

import { createCheckoutSession, savePhoneNumber } from './actions'

export default function Cart() {
  const { address } = useAccount()
  const chainId = useChainId()
  const { cart, removeFromCart } = useCart()
  const { data: ethPrice } = useEthPrice()
  const { openConnectModal } = useConnectModal()
  const { switchChain } = useSwitchChain()
  const contract = useWriteContract()
  const inventory = useInventory({ tokenIds: cart })
  const { createWallet } = useCreateWallet()

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

  const { data: balance } = useBalance({
    address,
    chainId: primaryChain.id,
  })

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

  const totalPriceRaw = price.data?.[0]
  const hasSufficientBalance =
    (balance?.value || BigInt(0)) > (totalPriceRaw || BigInt(0))

  const canOrder = multicall?.[0].result && hasSufficientBalance
  const usedClaim = multicall?.[1].result
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

  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => setIsMounted(true), [])

  if (!isMounted) return null

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

      <p className="mb-4 text-lg font-semibold sm:-mt-10 sm:mb-10 sm:text-xl">
        Pickup in Manhattan this Saturday from 2:30pm - 5pm.
      </p>

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
                    <div className="flex flex-col items-end gap-2 sm:flex-row">
                      <Button onClick={openConnectModal}>Connect</Button>
                      <Button variant="filled" onClick={createWallet}>
                        Create Account
                      </Button>
                    </div>
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

                if (
                  orderRequest.error?.message ===
                  'You must provide a phone number'
                ) {
                  return (
                    <PhoneCollection
                      refetchOrderRequest={orderRequest.refetch}
                    />
                  )
                }

                if (!hasSufficientBalance) {
                  // Let the user pay with credit card
                  return (
                    <StripeForm
                      usdPrice={(
                        Number(totalPriceFormatted) * ethPrice!
                      ).toFixed(0)}
                      orderRequest={orderRequest}
                    />
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
                      {(() => {
                        if (simulation.error) {
                          return (
                            (simulation.error as BaseError).shortMessage ||
                            'Simulated transaction failed.'
                          )
                        }

                        if (usedClaim) {
                          return 'Orders are limited to 1 per person per week.'
                        }

                        if (canOrder === false) {
                          return 'You cannot place this order.'
                        }

                        if (orderRequest.error) {
                          return orderRequest.error.message
                        }

                        if (orderRequest.data) {
                          if (orderRequest.data.accountType === 'farcaster') {
                            return "We'll send you order-related messages via Warpcast DCs."
                          } else {
                            return "We'll send you order-related messages via SMS."
                          }
                        }
                      })()}
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

function PhoneCollection({
  refetchOrderRequest,
}: {
  refetchOrderRequest: () => void
}) {
  const { signMessage, isPending, data, reset } = useSignMessage()
  const [state, formAction] = useFormState(savePhoneNumber, { ok: false })
  const formRef = useRef<HTMLFormElement>(null)

  // Refetch the order request once we have a saved account
  useEffect(() => {
    if (state.ok) {
      refetchOrderRequest()
    } else {
      reset()
    }
  }, [state.ok])

  // Submit the form once we have a signature
  useEffect(() => {
    if (data) {
      formRef.current?.requestSubmit()
    }
  }, [data])

  return (
    <form
      ref={formRef}
      className="flex w-full flex-col gap-2 sm:max-w-64"
      action={async (e: FormData) => {
        if (data) {
          return formAction(e)
        }

        signMessage({
          message: e.get('phone') as string,
        })
      }}
    >
      <p>We need a phone number to text you order-related updates.</p>

      {!state.ok && state.message && (
        <p className="text-brand-accent-orange">{state.message}</p>
      )}

      <FormInputs signature={data} signatureIsPending={isPending} />
    </form>
  )
}

function FormInputs({
  signature,
  signatureIsPending,
}: {
  signature?: string
  signatureIsPending: boolean
}) {
  const { address } = useAccount()
  const { pending } = useFormStatus()

  return (
    <>
      <input name="account" type="hidden" value={address} />
      <input name="signature" type="hidden" value={signature} />

      <input
        id="phone"
        name="phone"
        placeholder="Phone number"
        type="tel"
        disabled={pending}
        required
        className="bg-brand-background-primary border-brand-primary focus:outline-brand-primary w-full rounded-lg border px-3 py-1"
      />

      <Button className="w-full" loading={pending || signatureIsPending}>
        Save number
      </Button>
    </>
  )
}

function StripeForm({
  usdPrice,
  orderRequest,
}: {
  usdPrice: string
  orderRequest: UseQueryResult
}) {
  const { cart } = useCart()
  const { address } = useAccount()
  const [state, formAction] = useFormState(createCheckoutSession, { ok: false })
  const inventory = useInventory({ tokenIds: cart })

  const areCartItemsInStock = inventory.data?.every(
    (item) => item.quantity.formatted > 0
  )

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input name="usdPrice" type="hidden" value={usdPrice} />
      <input name="address" type="hidden" value={address} />
      <input name="tokenIds" type="hidden" value={cart.join(',')} />

      <StripeButton
        orderRequest={orderRequest}
        areCartItemsInStock={areCartItemsInStock}
      />

      <span className="text-right">
        {(() => {
          if (state.message) {
            return state.message
          }

          if (orderRequest.error) {
            return orderRequest.error.message
          }

          if (!areCartItemsInStock) {
            return 'Some items are out of stock.'
          }
        })()}
      </span>
    </form>
  )
}

function StripeButton({
  orderRequest,
  areCartItemsInStock,
}: {
  orderRequest: UseQueryResult
  areCartItemsInStock: boolean | undefined
}) {
  const { pending } = useFormStatus()

  return (
    <Button
      disabled={!orderRequest.data || !areCartItemsInStock || pending}
      loading={
        orderRequest.isLoading || areCartItemsInStock === undefined || pending
      }
      type="submit"
    >
      Buy Bread
    </Button>
  )
}
