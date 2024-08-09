'use client'

import { useConnectModal } from '@rainbow-me/rainbowkit'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import {
  useAccount,
  useChainId,
  useSignMessage,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'

import { Button } from '@/components/Button'
import { Spinner } from '@/components/Spinner'
import { WalletProfile } from '@/components/WalletProfile'
import { useCart } from '@/hooks/useCart'
import { useCheckout, useInitialCheckoutData } from '@/hooks/useCheckout'
import { useCreateWallet } from '@/hooks/useCreateWallet'
import { useInventory } from '@/hooks/useInventory'
import { primaryChain } from '@/lib/constants'
import { cn } from '@/lib/utils'

import { createCheckoutSession, savePhoneNumber } from './actions'

export default function Cart() {
  const { address } = useAccount()
  const chainId = useChainId()
  const { cart, removeFromCart } = useCart()
  const { openConnectModal } = useConnectModal()
  const { switchChain } = useSwitchChain()
  const contract = useWriteContract()
  const inventory = useInventory({ tokenIds: cart })
  const { createWallet } = useCreateWallet()

  const checkout = useCheckout()
  const initialCheckoutData = useInitialCheckoutData(cart, address)
  const {
    usdValue,
    orderPriceFormatted,
    discountFormatted,
    cartItemIdsInStock,
  } = initialCheckoutData.data ?? {}

  // Refetch the inventory and price when the cart changes
  useEffect(() => {
    initialCheckoutData.refetch()
    checkout.refetch()
    inventory.refetch()
  }, [address, cart])

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
        Pickup in Manhattan this Sunday from 2:30pm - 5pm.
      </p>

      {(() => {
        if (!cart.length) return <p>Your cart is empty &#9785;</p>

        if (inventory.isLoading) {
          return <p>Loading...</p>
        }

        return (
          <>
            {/* CART ITEMS */}
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

            {/* CART TOTAL */}
            <div className="mt-2 self-end text-right">
              <p>Discount: {discountFormatted || '0'} ETH</p>

              <p className="font-semibold">
                Total: {orderPriceFormatted || '0.000'} ETH (${usdValue || '0'}{' '}
                USD)
              </p>
            </div>

            <div className="mt-12 flex flex-col items-end gap-2">
              {(() => {
                if (checkout.isLoading) {
                  return <Spinner />
                }

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

                if (checkout.error) {
                  // TODO: Find a better way to detect each error
                  switch (checkout.error.message) {
                    case 'You must provide a phone number': {
                      return (
                        <PhoneCollection
                          refetchOrderRequest={checkout.refetch}
                        />
                      )
                    }
                    default: {
                      return <p>{checkout.error.message}</p>
                    }
                  }
                }

                // I think this should be unreachable but somehow it is
                if (!checkout.data) {
                  console.error(
                    "Not loading, no error, but somehow there's still no data"
                  )

                  return <Spinner />
                }

                const {
                  hasSufficientBalance,
                  orderRequest,
                  canOrder,
                  usedClaim,
                  simulation,
                } = checkout.data ?? {}

                return (
                  <>
                    {/* Buttons */}
                    <div className="flex flex-col items-end gap-2 sm:flex-row">
                      <StripeForm
                        usdPrice={usdValue}
                        inStockCartItems={cartItemIdsInStock}
                        text={
                          hasSufficientBalance ? 'Pay with Card' : 'Buy Bread'
                        }
                      />

                      {hasSufficientBalance && (
                        <Button
                          variant="filled"
                          disabled={!simulation?.request}
                          onClick={() => {
                            if (!simulation?.request) return

                            contract.writeContract(simulation.request)
                          }}
                        >
                          Pay with ETH
                        </Button>
                      )}
                    </div>

                    {/* Messages */}
                    <span className="text-right">
                      {(() => {
                        if (usedClaim) {
                          return 'Orders are limited to 1 per person per week.'
                        }

                        if (canOrder === false) {
                          return 'You cannot place this order.'
                        }

                        if (orderRequest) {
                          if (orderRequest.accountType === 'farcaster') {
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
  inStockCartItems,
  text,
}: {
  usdPrice?: string
  inStockCartItems?: bigint[]
  text: string
}) {
  const { address } = useAccount()

  if (!usdPrice || !inStockCartItems) {
    console.error('Unable to show Stripe form')
    return null
  }

  return (
    <form action={createCheckoutSession} className="flex flex-col gap-2">
      <input name="usdPrice" type="hidden" value={usdPrice} />
      <input name="address" type="hidden" value={address} />
      <input name="tokenIds" type="hidden" value={inStockCartItems.join(',')} />

      <StripeButton text={text} />
    </form>
  )
}

function StripeButton({ text }: { text: string }) {
  const { pending } = useFormStatus()

  return (
    <Button disabled={pending} loading={pending} type="submit">
      {text}
    </Button>
  )
}
