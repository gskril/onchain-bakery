'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { breadContract } from 'shared/contracts'
import {
  type Hex,
  formatEther,
  getAddress,
  isAddress,
  keccak256,
  parseEther,
  toHex,
} from 'viem'
import { usePublicClient, useWriteContract } from 'wagmi'

import { Form } from '@/components/Form'
import { useEvents } from '@/hooks/useEvents'
import { wagmiConfig } from '@/lib/web3'

export default function AdminPage() {
  const { data: hash, writeContract } = useWriteContract()
  const viemClient = usePublicClient({ config: wagmiConfig })
  const { data: events } = useEvents(hash)

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

                if (!account || isAddress(account)) {
                  return alert('Fill out all fields')
                }

                const data = await viemClient.readContract({
                  ...breadContract,
                  functionName: 'credit',
                  args: [getAddress(account)],
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

                if (!account || isAddress(account) || !role) {
                  return alert('Fill out all fields')
                }

                const data = await viemClient.readContract({
                  ...breadContract,
                  functionName: 'hasRole',
                  args: [keccak256(toHex(role)), getAddress(account)],
                })

                alert(data ? 'Yes' : 'No')
              }}
            >
              <Form.Input placeholder="Account" type="string" id="account" />
              <Form.Input placeholder="Role" type="string" id="role" />
            </Form>

            <Form
              title="Can Order"
              button="Read"
              handler={async (targets) => {
                const { account, data } = targets

                if (!account || !isAddress(account) || !data) {
                  return alert('Fill out all fields')
                }

                const res = await viemClient.readContract({
                  ...breadContract,
                  functionName: 'canOrder',
                  args: [account, data as Hex],
                })

                alert(res ? 'Yes' : 'No')
              }}
            >
              <Form.Input placeholder="Account" type="string" id="account" />
              <Form.Input placeholder="Data" type="string" id="data" />
            </Form>

            <Form
              title="URI"
              button="Read"
              handler={async (targets) => {
                const { tokenId } = targets

                if (!tokenId) {
                  return alert('Fill out all fields')
                }

                const res = await viemClient.readContract({
                  ...breadContract,
                  functionName: 'uri',
                  args: [BigInt(tokenId)],
                })

                alert(res)
              }}
            >
              <Form.Input placeholder="Token ID" type="number" id="tokenId" />
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
                step="0.000001"
                id="price"
              />
            </Form>

            <Form
              title="Order"
              handler={(targets) => {
                const { id, recipient } = targets

                if (!id || !recipient || !isAddress(recipient)) {
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

                if (!amount || !account || !isAddress(account)) {
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

                if (!amount || !account || !isAddress(account)) {
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

                if (!id || !quantity || !account || !isAddress(account)) {
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

                if (!address || isAddress(address)) {
                  return alert('Fill out all fields')
                }

                writeContract({
                  ...breadContract,
                  functionName: 'setProofOfBread',
                  args: [getAddress(address)],
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

                if (!account || isAddress(account) || !amount) {
                  return alert('Fill out all fields')
                }

                writeContract({
                  ...breadContract,
                  functionName: 'withdraw',
                  args: [getAddress(account), parseEther(amount)],
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

                if (
                  !account ||
                  !isAddress(account) ||
                  !token ||
                  !isAddress(token) ||
                  !amount
                ) {
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
              title="Grant Role"
              handler={(targets) => {
                const { account, role } = targets

                if (!account || !isAddress(account) || !role) {
                  return alert('Fill out all fields')
                }

                writeContract({
                  ...breadContract,
                  functionName: 'grantRole',
                  args: [account, keccak256(toHex(role))],
                })
              }}
            >
              <Form.Input placeholder="Account" type="string" id="account" />
              <Form.Input placeholder="Role" type="string" id="role" />
            </Form>

            <Form
              title="Revoke Role"
              handler={(targets) => {
                const { account, role } = targets

                if (!account || !isAddress(account) || !role) {
                  return alert('Fill out all fields')
                }

                writeContract({
                  ...breadContract,
                  functionName: 'revokeRole',
                  args: [account, keccak256(toHex(role))],
                })
              }}
            >
              <Form.Input placeholder="Account" type="string" id="account" />
              <Form.Input placeholder="Role" type="string" id="role" />
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

          <div className="relative grid gap-12 overflow-scroll md:col-span-2">
            {events?.map(({ eventName, args }) => (
              <div
                key={`${eventName}-${JSON.stringify(args)}`}
                className="relative max-w-full"
              >
                <p>{eventName}</p>
                <pre className="max-w-full">
                  {Object.entries(args).map(([key, value]) => (
                    <p key={key}>
                      {key}: {value}
                    </p>
                  ))}
                </pre>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}
