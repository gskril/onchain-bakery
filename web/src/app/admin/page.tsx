'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { parseEther } from 'viem'
import { useWriteContract } from 'wagmi'

import { Form } from '@/components/Form'
import { breadContract } from '@/lib/contracts'

export default function AdminPage() {
  const { writeContract } = useWriteContract()

  return (
    <>
      <main className="grid w-96 gap-12 p-6">
        <div className="grid gap-2">
          <h2 className="font-pangram text-xl font-extrabold">Admin panel</h2>
          <ConnectButton showBalance={false} />
        </div>

        <Form
          title="Admin Inventory"
          handler={(targets) => {
            const { id, quantity, price } = targets

            if (!id || !quantity || !price) return

            writeContract({
              ...breadContract,
              functionName: 'updateInventory',
              args: [[BigInt(id)], [BigInt(quantity)], [parseEther(price)]],
            })
          }}
        >
          <Form.Input placeholder="Token ID" type="number" id="id" />
          <Form.Input placeholder="Quantity" type="number" id="quantity" />
          <Form.Input
            placeholder="Price (ETH)"
            type="number"
            step="0.001"
            id="price"
          />
        </Form>
      </main>
    </>
  )
}
