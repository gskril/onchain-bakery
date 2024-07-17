'use client'

import { useConnectModal } from '@rainbow-me/rainbowkit'
import Link from 'next/link'
import { useEffect } from 'react'
import { breadContract } from 'shared/contracts'
import { formatEther } from 'viem'
import {
  BaseError,
  useAccount,
  useChainId,
  useReadContract,
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
import { primaryChain } from '@/lib/web3'

export default function Cart() {
  const { address } = useAccount()
  const chainId = useChainId()
  const { cart, removeFromCart } = useCart()
  const { data: ethPrice } = useEthPrice()
  const { openConnectModal } = useConnectModal()
  const { chains, switchChain } = useSwitchChain()
  const contract = useWriteContract()
  const inventory = useInventory({ tokenIds: cart, filter: false })

  const price = useReadContract({
    ...breadContract,
    chainId: primaryChain.id,
    functionName: 'price',
    args: [address!, cart, cart.map(() => BigInt(1))],
    query: { enabled: !!address },
  })

  const orderRequest = useRequestOrder({
    account: address,
    ids: cart.map((id) => Number(id)),
    quantities: cart.map(() => 1),
  })

  const { data: canOrder } = useReadContract({
    ...breadContract,
    chainId: primaryChain.id,
    functionName: 'canOrder',
    args: [address!, orderRequest.data!],
    query: { enabled: !!address && !!orderRequest.data },
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
    chainId: primaryChain.id,
    functionName: 'buyBread',
    args: [address!, cart, cart.map(() => BigInt(1)), orderRequest.data!],
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

              {!!totalPriceRaw && (
                <p className="font-semibold">
                  total: {totalPriceFormatted} ETH{' '}
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

                      {canOrder === false && 'You cannot place this order.'}

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
