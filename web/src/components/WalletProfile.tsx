import { useAccountModal } from '@rainbow-me/rainbowkit'
import { useIsMounted } from 'usehooks-ts'
import { Hex } from 'viem'
import { useEnsAvatar, useEnsName } from 'wagmi'

import { truncateAddress } from '@/lib/utils'

export function WalletProfile({ address }: { address?: Hex }) {
  const { openAccountModal } = useAccountModal()
  const { data: ensName } = useEnsName({ address, chainId: 1 })

  const { data: ensAvatar } = useEnsAvatar({
    name: ensName || undefined,
    chainId: 1,
  })

  const isMounted = useIsMounted()

  if (!isMounted() || !address) return null

  return (
    <button
      className="bg-brand-background-secondary border-brand-primary flex w-fit items-center gap-2 rounded-full border p-1 pr-4 shadow transition-all hover:-translate-y-[1px]"
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
