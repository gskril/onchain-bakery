import { useAccountModal } from '@rainbow-me/rainbowkit'
import { useEffect, useState } from 'react'
import type { Hex } from 'viem'
import { useEnsAvatar, useEnsName } from 'wagmi'

import { cn, truncateAddress } from '@/lib/utils'

export function WalletProfile({
  address,
  className,
}: { address?: Hex } & React.HTMLAttributes<HTMLButtonElement>) {
  const { openAccountModal } = useAccountModal()
  const { data: ensName } = useEnsName({ address, chainId: 1 })

  const { data: ensAvatar } = useEnsAvatar({
    name: ensName || undefined,
    chainId: 1,
  })

  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => setIsMounted(true), [])

  if (!isMounted || !address) return null

  return (
    <button
      className={cn([
        'bg-brand-background-secondary border-brand-primary flex w-fit items-center gap-2 rounded-full border p-1 pr-4 shadow transition-all hover:-translate-y-[1px]',
        className,
      ])}
      onClick={openAccountModal}
    >
      <img
        src={ensAvatar || '/misc/default-avatar.svg'}
        className="border-brand-primary h-8 w-8 rounded-full border object-cover"
      />
      <span className="font-pangram font-semibold">
        {ensName || truncateAddress(address)}
      </span>
    </button>
  )
}
