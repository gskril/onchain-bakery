'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { formatEther, isAddress, keccak256, parseEther, toHex } from 'viem'
import { usePublicClient, useReadContract, useWriteContract } from 'wagmi'

import { Form } from '@/components/Form'
import { breadContract } from '@/lib/contracts'
import { wagmiConfig } from '@/lib/web3'

export default function AdminPage() {
  const { writeContract } = useWriteContract()
  const viemClient = usePublicClient({ config: wagmiConfig })

  return (
    <>
      <main className="max-w-4xl p-6">
        <div className="mb-12">
          <h2 className="font-pangram mb-2 text-xl font-extrabold">
            Admin panel
          </h2>
          <ConnectButton showBalance={false} />
        </div>

        <div className="grid items-start gap-12 md:grid-cols-2">
          <div className="grid gap-12">
            <Form
              title="Credit"
              button="Read"
              handler={async (targets) => {
                const { account } = targets

                if (!isAddress(account)) {
                  return alert('Fill out all fields')
                }

                const data = await viemClient.readContract({
                  ...breadContract,
                  functionName: 'credit',
                  args: [account],
                })

                alert(formatEther(data))
              }}
            >
              <Form.Input placeholder="Account" type="string" id="account" />
            </Form>

            <Form
              title="Has Role"
              button="Read"
              handler={async (targets) => {
                const { account, role } = targets

                if (!isAddress(account) || !role) {
                  return alert('Fill out all fields')
                }

                const data = await viemClient.readContract({
                  ...breadContract,
                  functionName: 'hasRole',
                  args: [keccak256(toHex(role)), account],
                })

                alert(data ? 'Yes' : 'No')
              }}
            >
              <Form.Input placeholder="Account" type="string" id="account" />
              <Form.Input placeholder="Role" type="string" id="role" />
            </Form>
          </div>

          <div className="grid gap-12">
            <Form
              title="Update Inventory"
              handler={(targets) => {
                const { id, quantity, price } = targets

                if (!id || !quantity || !price) {
                  return alert('Fill out all fields')
                }

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

            <Form
              title="Order"
              handler={(targets) => {
                const { id, recipient } = targets

                if (!id || !isAddress(recipient)) {
                  return alert('Fill out all fields')
                }

                writeContract({
                  ...breadContract,
                  functionName: 'adminOrder',
                  args: [recipient, [BigInt(id)], [BigInt(1)]],
                })
              }}
            >
              <Form.Input placeholder="Token ID" type="number" id="id" />
              <Form.Input
                placeholder="Recipient"
                type="string"
                id="recipient"
              />
            </Form>

            <Form
              title="Add Credit"
              handler={(targets) => {
                const { amount, account } = targets

                if (!amount || !isAddress(account)) {
                  return alert('Fill out all fields')
                }

                writeContract({
                  ...breadContract,
                  functionName: 'addCredit',
                  args: [account, parseEther(amount)],
                })
              }}
            >
              <Form.Input placeholder="Account" type="string" id="account" />
              <Form.Input
                placeholder="Amount (ETH)"
                type="number"
                step="0.001"
                id="amount"
              />
            </Form>

            <Form
              title="Remove Credit"
              handler={(targets) => {
                const { amount, account } = targets

                if (!amount || !isAddress(account)) {
                  return alert('Fill out all fields')
                }

                writeContract({
                  ...breadContract,
                  functionName: 'removeCredit',
                  args: [account, parseEther(amount)],
                })
              }}
            >
              <Form.Input placeholder="Account" type="string" id="account" />
              <Form.Input
                placeholder="Amount (ETH)"
                type="number"
                step="0.001"
                id="amount"
              />
            </Form>

            <Form
              title="Revoke Order"
              handler={(targets) => {
                const { account, id, quantity } = targets

                if (!id || !quantity || !isAddress(account)) {
                  return alert('Fill out all fields')
                }

                writeContract({
                  ...breadContract,
                  functionName: 'revokeOrder',
                  args: [account, BigInt(id), BigInt(quantity)],
                })
              }}
            >
              <Form.Input placeholder="Account" type="string" id="account" />
              <Form.Input placeholder="Token ID" type="string" id="id" />
              <Form.Input placeholder="Quantity" type="number" id="quantity" />
            </Form>

            <Form
              title="Set NFT Collection"
              handler={(targets) => {
                const { address } = targets

                if (!isAddress(address)) {
                  return alert('Fill out all fields')
                }

                writeContract({
                  ...breadContract,
                  functionName: 'setProofOfBread',
                  args: [address],
                })
              }}
            >
              <Form.Input placeholder="Address" type="string" id="address" />
            </Form>

            <Form
              title="Set URI"
              handler={(targets) => {
                const { uri } = targets

                if (!uri) {
                  return alert('Fill out all fields')
                }

                writeContract({
                  ...breadContract,
                  functionName: 'setURI',
                  args: [uri],
                })
              }}
            >
              <Form.Input placeholder="URI" type="string" id="uri" />
            </Form>

            <Form
              title="Withdraw ETH"
              handler={(targets) => {
                const { account, amount } = targets

                if (!isAddress(account) || !amount) {
                  return alert('Fill out all fields')
                }

                writeContract({
                  ...breadContract,
                  functionName: 'withdraw',
                  args: [account, parseEther(amount)],
                })
              }}
            >
              <Form.Input placeholder="Account" type="string" id="account" />
              <Form.Input
                placeholder="Amount (ETH)"
                type="number"
                step="0.001"
                id="amount"
              />
            </Form>

            <Form
              title="Recover ERC20"
              handler={(targets) => {
                const { account, token, amount } = targets

                if (!isAddress(account) || !isAddress(token) || !amount) {
                  return alert('Fill out all fields')
                }

                writeContract({
                  ...breadContract,
                  functionName: 'recoverERC20',
                  args: [account, token, parseEther(amount)],
                })
              }}
            >
              <Form.Input placeholder="Account" type="string" id="account" />
              <Form.Input placeholder="Token" type="string" id="token" />
              <Form.Input
                placeholder="Amount (ETH)"
                type="number"
                step="0.001"
                id="amount"
              />
            </Form>

            <Form
              title="Pause"
              handler={() => {
                writeContract({
                  ...breadContract,
                  functionName: 'pause',
                })
              }}
            />

            <Form
              title="Unpause"
              handler={() => {
                writeContract({
                  ...breadContract,
                  functionName: 'pause',
                })
              }}
            />
          </div>
        </div>
      </main>
    </>
  )
}
