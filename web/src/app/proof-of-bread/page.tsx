'use client'

import JSConfetti from 'js-confetti'
import { useEffect, useRef, useState } from 'react'
import React from 'react'

import { Logo } from '@/components/Logo'

export default function ProofOfBread() {
  const jsConfettiRef = useRef<JSConfetti>()
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'fail'>(
    'idle'
  )

  useEffect(() => {
    if (status === 'success') {
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
  }, [status])

  return (
    <div className="bg-brand-background-secondary mx-auto flex min-h-svh flex-col items-center overflow-hidden px-6 py-11">
      <Logo className="mb-6 w-32" />

      <div className="relative mb-14 h-52 w-52">
        <img
          src="/mint-page/bottom-left.svg"
          className="absolute -bottom-8 -left-8 z-20"
        />

        <img
          src="/mint-page/top-right.svg"
          className="absolute -right-8 -top-8 z-20"
        />

        <div className="border-brand-primary relative z-10 h-full w-full rounded-lg border-2 bg-[#D9D9D9]" />

        <img
          src="/mint-page/top-left.svg"
          className="absolute -left-[4.5rem] -top-8 z-0"
        />
      </div>

      <div className="max-w-96 text-center">
        <span className="font-pangram mb-1 block text-3xl font-extrabold">
          Proof of Bread
        </span>

        <p className="text-lg">
          Collect this NFT as proof that you ate bread today. The image isn't
          ready yet, I'll send it out to you later.
        </p>

        <form
          className="mt-4"
          onSubmit={async (e) => {
            e.preventDefault()
            setStatus('pending')

            const addressOrName = (e.target as any).addressOrName.value

            const res = await fetch(
              `https://api.gregskril.com/tg-message?text=ProofOfBread:%20${addressOrName}`
            )

            if (!res.ok) {
              setStatus('fail')
              return
            }

            setStatus('success')
          }}
        >
          <input
            id="addressOrName"
            disabled={status !== 'idle'}
            placeholder="ENS name or address"
            className="bg-brand-background-primary border-brand-primary focus:outline-brand-primary w-full rounded-lg border px-3 py-1"
          />

          <button
            type="submit"
            disabled={status !== 'idle'}
            className="bg-brand-primary text-brand-background-primary mt-2 w-full rounded-lg px-4 py-2 font-semibold disabled:bg-[#7E97EF]"
          >
            {status === 'pending'
              ? 'Saving...'
              : status === 'success'
                ? 'Saved!'
                : 'Collect'}
          </button>
        </form>
      </div>

      <footer />
    </div>
  )
}
