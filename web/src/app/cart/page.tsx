'use client'

import { useEffect } from 'react'
import { formatEther } from 'viem'

import { Button } from '@/components/Button'
import { useCart } from '@/hooks/useCart'
import { useEthPrice } from '@/hooks/useEthPrice'
import { useInventory } from '@/hooks/useInventory'

export default function Cart() {
  const { cart, removeFromCart } = useCart()
  const inventory = useInventory({ tokenIds: cart, filter: false })
  const { data: ethPrice } = useEthPrice()

  const totalPriceRaw = inventory.data?.reduce(
    (acc, item) => acc + item.price.raw,
    BigInt(0)
  )

  const totalPriceFormatted = formatEther(totalPriceRaw || BigInt(0))

  // Refetch the inventory and price when the cart changes
  useEffect(() => {
    inventory.refetch()
  }, [cart])

  return (
    <main className="mx-auto flex max-w-7xl flex-col px-6 py-12">
      <h1 className="section-title mb-12">Checkout</h1>
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
              <p>total: {totalPriceFormatted} ETH</p>
              {ethPrice && (
                <p>{(Number(totalPriceFormatted) * ethPrice).toFixed(0)} USD</p>
              )}
            </div>
            <div className="mt-12 self-end">
              <Button>Check Out</Button>
            </div>
          </>
        )
      })()}
    </main>
  )
}
