'use client'

import { useConnectModal } from '@rainbow-me/rainbowkit'
import Link from 'next/link'
import { useEffect } from 'react'
import { breadContract } from 'shared/contracts'
import { formatEther } from 'viem'
import { baseSepolia } from 'viem/chains'
import {
  BaseError,
  useAccount,
  useReadContract,
  useSimulateContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'

import { Button } from '@/components/Button'
import { WalletProfile } from '@/components/WalletProfile'
import { useCart } from '@/hooks/useCart'
import { useEthPrice } from '@/hooks/useEthPrice'
import { useInventory } from '@/hooks/useInventory'
import { useRequestOrder } from '@/hooks/useRequestOrder'

export default function Cart() {
  const { address } = useAccount()
  const { cart, removeFromCart } = useCart()
  const { data: ethPrice } = useEthPrice()
  const { openConnectModal } = useConnectModal()
  const contract = useWriteContract()
  const inventory = useInventory({ tokenIds: cart, filter: false })

  const price = useReadContract({
    ...breadContract,
    functionName: 'price',
    args: [address!, cart, cart.map(() => BigInt(1))],
    query: { enabled: !!address },
  })

  const orderRequest = useRequestOrder({
    account: address,
    ids: cart.map((id) => Number(id)),
    quantities: cart.map(() => 1),
  })

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
    chainId: baseSepolia.id,
    functionName: 'buyBread',
    args: [address!, cart, cart.map(() => BigInt(1)), orderRequest.data!],
    value: totalPriceRaw,
    query: { enabled: !!address && !!orderRequest.data },
  })

  const receipt = useWaitForTransactionReceipt({ hash: contract.data })

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
                    ✖︎ remove
                  </button>
                  <div>
                    <p>{item.name}</p>
                    <p>{item.price.formatted} ETH</p>
                  </div>
                  <img
                    src={item.image}
                    alt={item.name}
                    className="border-brand-primary h-32 w-32 rounded-lg border"
                  />
                </div>
              ))}
            </div>
            <div className="mt-2 self-end text-right">
              {discountRaw && <p>discount: {discountFormatted} ETH</p>}
              <p className="font-semibold">
                total: {totalPriceFormatted} ETH{' '}
                {ethPrice &&
                  `($${(Number(totalPriceFormatted) * ethPrice).toFixed(0)} USD)`}
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

                if (receipt.isSuccess) {
                  return (
                    <>
                      <Button disabled>Order placed!</Button>
                      <span className="text-right">
                        You should get a message on Warpcast shortly.
                      </span>
                    </>
                  )
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
