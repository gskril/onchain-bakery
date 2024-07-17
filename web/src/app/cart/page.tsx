'use client'

import { useConnectModal } from '@rainbow-me/rainbowkit'
import Link from 'next/link'
import { useEffect } from 'react'
import { formatEther } from 'viem'
import { useAccount, useReadContract } from 'wagmi'

import { Button } from '@/components/Button'
import { WalletProfile } from '@/components/WalletProfile'
import { useCart } from '@/hooks/useCart'
import { useEthPrice } from '@/hooks/useEthPrice'
import { useInventory } from '@/hooks/useInventory'
import { useRequestOrder } from '@/hooks/useRequestOrder'
import { breadContract } from '@/lib/contracts'

export default function Cart() {
  const { address } = useAccount()
  const { cart, removeFromCart } = useCart()
  const { data: ethPrice } = useEthPrice()
  const { openConnectModal } = useConnectModal()
  const inventory = useInventory({ tokenIds: cart, filter: false })
  const quantities = cart.map(() => 1)

  const price = useReadContract({
    ...breadContract,
    functionName: 'price',
    args: [address!, cart, cart.map(() => BigInt(1))],
    query: { enabled: !!address },
  })

  const orderRequest = useRequestOrder({
    account: address,
    ids: cart.map((id) => Number(id)),
    quantities,
  })

  console.log(orderRequest)

  const totalPriceRaw = price.data?.[0]
  const discountRaw = price.data?.[1]
  const totalPriceFormatted = formatEther(totalPriceRaw || BigInt(0))
  const discountFormatted = formatEther(discountRaw || BigInt(0))

  // Refetch the inventory and price when the cart changes
  useEffect(() => {
    inventory.refetch()
    price.refetch()
  }, [cart])

  return (
    <main className="mx-auto flex max-w-7xl flex-col px-6 py-12">
      <div className="mb-8 flex flex-col justify-between gap-2 sm:mb-14 sm:flex-row sm:items-center sm:gap-6">
        <h1 className="section-title flex items-center gap-3">
          <Link href="/">
            <img src="/misc/greg.svg" className="w-8" />
          </Link>
          <span>Checkout</span>
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
                  <button
                    className="m-0 h-fit w-fit"
                    onClick={() => removeFromCart(item.id)}
                  >
                    ✖︎ Remove
                  </button>
                  <div>
                    <p>{item.name}</p>
                    <p>{item.price.formatted} ETH</p>
                  </div>
                  <div className="">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="border-brand-primary h-32 w-32 rounded-lg border"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 self-end text-right">
              {discountFormatted && <p>discount: {discountFormatted} ETH</p>}
              <p>
                total: {totalPriceFormatted} ETH{' '}
                {ethPrice &&
                  `${(Number(totalPriceFormatted) * ethPrice).toFixed(0)} USD`}
              </p>
              {ethPrice && <p></p>}
            </div>

            <div className="mt-12 flex flex-col items-end gap-2">
              {(() => {
                if (!address) {
                  return (
                    <Button onClick={openConnectModal}>Connect Wallet</Button>
                  )
                }

                return (
                  <>
                    <Button disabled={!orderRequest.data}>Buy Bread</Button>

                    <span className="text-right">
                      {orderRequest.error && (
                        <p>{orderRequest.error.message}</p>
                      )}
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
