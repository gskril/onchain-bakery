'use client'

import JSConfetti from 'js-confetti'
import { useEffect, useRef } from 'react'
import React from 'react'

import { useCart } from '@/hooks/useCart'

function generateRandomNumber(
  min: number,
  max: number,
  fractionDigits = 0
): number {
  const randomNumber = Math.random() * (max - min) + min

  return Math.floor(randomNumber * 10 ** fractionDigits) / 10 ** fractionDigits
}

function generateRandomArrayElement<T>(arr: T[]): T {
  return arr[generateRandomNumber(0, arr.length)]
}

export default function Success() {
  const { cart, removeFromCart } = useCart()
  const jsConfettiRef = useRef<JSConfetti>()

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
    }, 1000)

    return () => clearTimeout(timeoutId)
  }, [])

  return (
    <>
      <main className="flex min-h-svh flex-col justify-between gap-12">
        <div className="max-w-xl self-end px-6 py-12">
          <h1 className="font-pangram mb-6 text-6xl font-semibold">
            thanks for buying greg&apos;s bread!
          </h1>

          <p className="text-lg">
            you should get a message from{' '}
            <a
              className="underline"
              href="https://warpcast.com/greg"
              target="_blank"
            >
              @greg
            </a>{' '}
            on warpcast shortly.
          </p>
        </div>

        <img
          src="/misc/holding-bread.svg"
          className="pointer-events-none w-[93%] sm:w-[60%] lg:w-[50%] xl:w-[40%]"
        />
      </main>
    </>
  )
}
