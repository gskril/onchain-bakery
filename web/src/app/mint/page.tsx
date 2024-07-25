'use client'

import { useConnectModal } from '@rainbow-me/rainbowkit'
import JSConfetti from 'js-confetti'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import React from 'react'
import { openMinterContract } from 'shared/contracts'
import { parseEther } from 'viem'
import {
  useAccount,
  useChainId,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'

import { ButtonFilled, buttonFilledStyles } from '@/components/Button'
import { WalletProfile } from '@/components/WalletProfile'
import { primaryChain } from '@/lib/constants'
import { cn } from '@/lib/utils'

// TODO: Break this file into smaller components since it's basically the same as /proof-of-bread
export default function LaunchNFT() {
  const chainId = useChainId()
  const { address } = useAccount()
  const jsConfettiRef = useRef<JSConfetti>()

  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => setIsMounted(true), [])

  const { switchChain, isPending: switchChainIsPending } = useSwitchChain()
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
    <div className="bg-brand-background-primary mx-auto flex min-h-svh flex-col items-center justify-between overflow-hidden px-6 py-11">
      {address && (
        <WalletProfile address={address} className="absolute right-6 top-6" />
      )}

      <header className={cn(address && 'extra-short:mb-20')} />

      <main className="flex flex-col items-center">
        <div className="relative mb-12 h-52 w-52 transition-transform hover:-rotate-2 md:h-64 md:w-64">
          <img
            src="/mint-page/bottom-left.svg"
            className="absolute -bottom-8 -right-8 z-20"
          />

          <img
            src="/mint-page/top-right.svg"
            className="absolute -right-8 -top-8 z-20"
          />

          <div className="border-brand-primary bg-brand-primary relative z-10 h-full w-full overflow-hidden rounded-lg border-2">
            <img src="/nft/1.svg" alt="Good Bread by Greg" />
          </div>

          <img
            src="/mint-page/top-left.svg"
            className="absolute -left-[4.5rem] -top-8 z-0"
          />
        </div>

        <div className="flex max-w-96 flex-col items-center text-center">
          <span className="font-pangram mb-2 block text-3xl font-extrabold">
            Mint Greg's Bread
          </span>

          <p className="mb-4 text-lg">
            Celebrate and support the launch of Good Bread by Greg, an onchain
            bakery for onchain summer.
          </p>

          {(() => {
            if (!address) {
              return (
                <div className="grid w-full grid-cols-[2fr,3fr] gap-2">
                  <Link
                    href="/"
                    className={buttonFilledStyles({
                      variant: 'secondary',
                      className: '',
                    })}
                  >
                    Go Home
                  </Link>

                  <ButtonFilled onClick={openConnectModal}>
                    Connect Wallet
                  </ButtonFilled>
                </div>
              )
            }

            if (chainId !== primaryChain.id) {
              return (
                <ButtonFilled
                  onClick={() => switchChain({ chainId: primaryChain.id })}
                  loading={switchChainIsPending}
                >
                  Switch network
                </ButtonFilled>
              )
            }

            if (receipt.isError) {
              return <ButtonFilled>Error minting &#9785;</ButtonFilled>
            }

            if (!receipt.isSuccess) {
              return (
                <div className="grid w-full grid-cols-[2fr,3fr] gap-2">
                  <Link
                    href="/"
                    className={buttonFilledStyles({
                      variant: 'secondary',
                      className: '',
                    })}
                  >
                    Go Home
                  </Link>

                  <a
                    href="https://x.com/intent/post?text=i like (good) bread (by @gregskril) 🍞&url=https://goodbread.nyc?ref=twitter"
                    target="_blank"
                    className={buttonFilledStyles()}
                  >
                    Share on Twitter
                  </a>
                </div>
              )
            }

            if (receipt.isLoading) {
              return <ButtonFilled loading>Pending...</ButtonFilled>
            }

            if (tx.isPending) {
              return <ButtonFilled loading>Confirm in wallet...</ButtonFilled>
            }

            return (
              <div className="grid w-full grid-cols-[2fr,3fr] gap-2">
                <Link
                  href="/"
                  className={buttonFilledStyles({
                    variant: 'secondary',
                  })}
                >
                  Go Home
                </Link>

                <ButtonFilled
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
                </ButtonFilled>
              </div>
            )
          })()}
        </div>
      </main>

      <footer />
    </div>
  )
}
