'use client'

import JSConfetti from 'js-confetti'
import Error from 'next/error'
import { useEffect, useRef, useState } from 'react'
import React from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { useAccount, useEnsName } from 'wagmi'

import { ButtonFilled } from '@/components/Button'
import { Logo } from '@/components/Logo'

import { claimProofOfBread } from './actions'

export default function ProofOfBread() {
  const jsConfettiRef = useRef<JSConfetti>()
  const [isSuccess, setIsSuccess] = useState(false)
  const tokenId = '4'

  useEffect(() => {
    if (isSuccess) {
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
  }, [isSuccess])

  if (!tokenId) {
    return <Error statusCode={400} />
  }

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

        <img
          src={`/proof-of-bread/${tokenId}.svg`}
          className={`relative z-10 h-full w-full`}
        />

        <img
          src="/mint-page/top-left.svg"
          className="absolute -left-[4.5rem] -top-8 z-0"
        />
      </div>

      <div className="max-w-96 text-center">
        <span className="font-pangram mb-1 block text-3xl font-extrabold">
          Proof of Bread {tokenId && `#${tokenId}`}
        </span>

        <p className="text-lg">
          Collect this NFT as proof that you ate bread today.
        </p>

        <MintForm setIsSuccess={setIsSuccess} tokenId={tokenId} />
      </div>
    </div>
  )
}

function MintForm({
  setIsSuccess,
  tokenId,
}: {
  setIsSuccess: (isSuccess: boolean) => void
  tokenId: string
}) {
  const [state, formAction] = useFormState(claimProofOfBread, { ok: false })

  useEffect(() => {
    if (state.ok) {
      setIsSuccess(true)
    }
  }, [state.ok])

  return (
    <>
      <form className="mt-4" action={formAction}>
        <MintFormInputs ok={state.ok} tokenId={tokenId} />
      </form>

      {state.ok === false && !!state.message && (
        <p className="mt-4 text-red-500">{state.message}</p>
      )}
    </>
  )
}

function MintFormInputs({ ok, tokenId }: { ok: boolean; tokenId: string }) {
  const { address } = useAccount()
  const ensName = useEnsName({ address, chainId: 1 })

  const { pending } = useFormStatus()
  const disabled = pending || ok

  return (
    <>
      <input
        id="addressOrName"
        name="addressOrName"
        disabled={disabled}
        defaultValue={
          ensName.isLoading ? undefined : ensName.data ? ensName.data : address
        }
        placeholder="ENS name or address"
        className="bg-brand-background-primary border-brand-primary focus:outline-brand-primary w-full rounded-lg border px-3 py-1"
      />

      <input type="hidden" id="tokenId" name="tokenId" value={tokenId} />

      <ButtonFilled type="submit" disabled={disabled}>
        {pending ? 'Minting...' : ok ? 'Minted!' : 'Collect'}
      </ButtonFilled>
    </>
  )
}
