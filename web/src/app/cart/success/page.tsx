'use client'

import JSConfetti from 'js-confetti'
import { useEffect, useRef, useState } from 'react'
import React from 'react'
import { breadContract } from 'shared/src/contracts'
import { useAccount } from 'wagmi'

import { buttonStyles } from '@/components/Button'
import { useCart } from '@/hooks/useCart'

export default function Success() {
  const { address } = useAccount()
  const { cart, removeFromCart } = useCart()
  const jsConfettiRef = useRef<JSConfetti>()
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => setIsMounted(true), [])

  useEffect(() => {
    // Empty the cart after a successful purchase
    cart.map((item) => removeFromCart(item))

    jsConfettiRef.current = new JSConfetti()

    const timeoutId = setTimeout(() => {
      if (jsConfettiRef.current) {
        jsConfettiRef.current.addConfetti({
          emojis: ['🍞'],
          confettiNumber: 35,
        })
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [])

  return (
    <>
      <main className="flex min-h-svh flex-col justify-between gap-12">
        <div className="max-w-xl self-end px-6 py-12">
          <h1 className="font-pangram text-6xl font-semibold">
            Thanks for buying Greg&apos;s bread!
          </h1>

          <p className="mb-3 mt-6 text-lg">
            You should get a message from Greg shortly with next steps.
          </p>

          {/* {isMounted && address && (
            <a
              className={buttonStyles()}
              href={`https://rainbow.me/profile/${address}?family=base/${breadContract.address.toLowerCase()}`}
            >
              View NFTs
            </a>
          )} */}
        </div>

        <img
          src="/misc/holding-bread.svg"
          className="pointer-events-none w-[93%] sm:w-[60%] lg:w-[50%] xl:w-[40%]"
        />
      </main>
    </>
  )
}
