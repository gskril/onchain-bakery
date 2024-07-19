'use client'

import { useConnectModal } from '@rainbow-me/rainbowkit'
import JSConfetti from 'js-confetti'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import React from 'react'
import { breadContract, openMinterContract } from 'shared/contracts'
import { parseEther } from 'viem'
import {
  useAccount,
  useChainId,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'

import { Button, buttonStyles } from '@/components/Button'
import { WalletProfile } from '@/components/WalletProfile'
import { primaryChain } from '@/lib/constants'
import { cn } from '@/lib/utils'

export default function LaunchNFT() {
  const chainId = useChainId()
  const { address } = useAccount()
  const jsConfettiRef = useRef<JSConfetti>()

  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => setIsMounted(true), [])

  const { switchChain } = useSwitchChain()
  const { openConnectModal } = useConnectModal()

  const tx = useWriteContract()
  const receipt = useWaitForTransactionReceipt({ hash: tx.data })

  useEffect(() => {
    if (receipt.isSuccess) {
      jsConfettiRef.current = new JSConfetti()

      const timeoutId = setTimeout(() => {
        if (jsConfettiRef.current) {
          jsConfettiRef.current.addConfetti({
            emojis: ['🍞'],
            confettiNumber: 35,
          })
        }
      }, 0)

      return () => clearTimeout(timeoutId)
    }
  }, [receipt.isSuccess])

  if (!isMounted) return null

  return (
    <div className="mx-auto flex min-h-svh max-w-7xl flex-col justify-between gap-2 px-6 py-12">
      <header className="flex items-center justify-between gap-4">
        <h1>
          <Link href="/">
            <img src="/misc/greg.svg" className="w-8" />
          </Link>
        </h1>

        <WalletProfile address={address} />
      </header>

      <main className="mt-6 grid items-center gap-10 lg:mt-0 lg:grid-cols-[7fr,4fr]">
        <img
          src="/nft/1.svg"
          className="border-brand-primary mx-auto w-[32rem] max-w-[90%] -rotate-3 rounded-lg border-2 transition-transform hover:-rotate-3 lg:-rotate-6"
        />

        <div className="py-8 pr-0 lg:py-0 lg:pb-1 lg:pr-6 lg:pt-8">
          <span className="font-pangram mb-1 block text-2xl font-extrabold lg:mb-2 lg:text-4xl">
            Celebrate &amp; Support Greg's Bread
          </span>

          <p className="max-w-96 text-lg">
            Celebrate the launch of Good Bread by Greg, an onchain bakery for
            onchain summer.
          </p>

          {(() => {
            const btnClasses = 'mt-4 px-8 py-2'

            if (!address) {
              return (
                <Button className={btnClasses} onClick={openConnectModal}>
                  Connect Wallet
                </Button>
              )
            }

            if (chainId !== primaryChain.id) {
              return (
                <Button
                  className={btnClasses}
                  onClick={() => switchChain({ chainId: primaryChain.id })}
                >
                  Switch network
                </Button>
              )
            }

            if (receipt.isError) {
              return (
                <Button className={btnClasses} disabled>
                  Error minting
                </Button>
              )
            }

            if (receipt.isSuccess) {
              return (
                <div className="w-fit">
                  <a
                    className={buttonStyles({ className: btnClasses })}
                    href={`https://rainbow.me/profile/${address}?family=base/${breadContract.address.toLowerCase()}`}
                  >
                    View on Rainbow
                  </a>

                  <Link
                    className={buttonStyles({
                      className: 'mt-2 w-full justify-center',
                    })}
                    href="/"
                  >
                    Go home
                  </Link>
                </div>
              )
            }

            if (receipt.isLoading) {
              return (
                <Button className={btnClasses} disabled loading>
                  Processing transaction
                </Button>
              )
            }

            if (tx.isPending) {
              return (
                <Button className={btnClasses} disabled loading>
                  Confirm in wallet
                </Button>
              )
            }

            return (
              <Button
                className={btnClasses}
                onClick={() => {
                  tx.writeContract({
                    ...openMinterContract,
                    functionName: 'mint',
                    args: [address, BigInt(1), BigInt(1)],
                    value: parseEther('0.000777'),
                  })
                }}
              >
                Mint NFT
              </Button>
            )
          })()}
        </div>
      </main>

      <footer />
    </div>
  )
}
