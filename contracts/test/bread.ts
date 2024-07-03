import { loadFixture } from '@nomicfoundation/hardhat-toolbox-viem/network-helpers'
import { expect } from 'chai'
import hre from 'hardhat'
import { Address, encodeAbiParameters, toHex } from 'viem'

const account = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266' // contract owner
const customer = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' // bakery customer

const deploy = async () => {
  const breadContract = await hre.viem.deployContract('Bread', [
    account, // _owner
    account, // _signer
    '0x0000000000000000000000000000000000000000', // _proofOfBread
    'https://website.com/api/{id}', // _uri
  ])

  return { breadContract }
}

const signOrder = async ({
  relativeTimestamp = 0,
  customer,
  claimId,
}: {
  relativeTimestamp: number
  customer?: Address
  claimId?: string
}) => {
  const messageToSign = encodeAbiParameters(
    [
      { name: 'buyer', type: 'address' },
      { name: 'claimId', type: 'bytes32' },
      { name: 'expiration', type: 'uint256' },
    ],
    [
      customer || account,
      toHex(claimId || 'hi', { size: 32 }),
      BigInt(Math.floor(Date.now() / 1000) + relativeTimestamp),
    ]
  )

  const viemClient = await hre.viem.getWalletClient(account)

  const signedMessage = await viemClient.signMessage({
    message: { raw: messageToSign },
  })

  const encodedMessageAndData = encodeAbiParameters(
    [
      { name: 'message', type: 'bytes' },
      { name: 'signature', type: 'bytes' },
    ],
    [messageToSign, signedMessage]
  )

  return { messageToSign, signedMessage, encodedMessageAndData }
}

describe('Bread.sol tests', function () {
  it('should let owner increase inventory, and disallow non-owners', async function () {
    const { breadContract } = await loadFixture(deploy)
    const [quantityBefore] = await breadContract.read.inventory([1n])
    expect(quantityBefore).to.equal(0n)

    // Owner increases inventory
    await breadContract.write.updateInventory([[1n], [1n], [1000n]], {
      account,
    })

    // Non-owner tries to increase inventory
    const strangerUpdateInventoryCall = breadContract.write.updateInventory(
      [[1n], [1n], [1000n]],
      {
        account: customer,
      }
    )

    // Non-owner should not be able to increase inventory
    await expect(strangerUpdateInventoryCall).to.be.rejectedWith(
      `OwnableUnauthorizedAccount("${customer}")`
    )

    const [quantityAfter] = await breadContract.read.inventory([1n])
    expect(quantityAfter).to.equal(1n)
  })

  it('should revert when minting with no inventory', async function () {
    const { breadContract } = await loadFixture(deploy)

    await expect(breadContract.write.adminOrder([account, 1n, 1n])).to.be
      .rejected
  })

  it('should mint with sufficient funds', async function () {
    const { breadContract } = await loadFixture(deploy)
    await breadContract.write.updateInventory([[1n], [1n], [1000n]], {
      account,
    })

    const { encodedMessageAndData } = await signOrder({ relativeTimestamp: 10 })

    const buyBreadCall = breadContract.write.buyBread(
      [account, 1n, 1n, encodedMessageAndData],
      {
        value: 1000n,
      }
    )

    await expect(buyBreadCall).to.be.fulfilled

    const balanceOf = await breadContract.read.balanceOf([account, 1n])
    expect(balanceOf).to.be.equal(1n)
  })

  it('should revert when mint with insufficient funds', async function () {
    const { breadContract } = await loadFixture(deploy)
    await breadContract.write.updateInventory([[1n], [1n], [1000n]], {
      account,
    })

    const { encodedMessageAndData } = await signOrder({ relativeTimestamp: 10 })

    const buyBreadCall = breadContract.write.buyBread(
      [account, 1n, 1n, encodedMessageAndData],
      {
        value: 999n,
      }
    )

    await expect(buyBreadCall).to.rejectedWith('InsufficientValue()')
  })

  it('should return true for canOrder() when signature is valid', async function () {
    const { breadContract } = await loadFixture(deploy)
    const { encodedMessageAndData } = await signOrder({ relativeTimestamp: 10 })

    const canOrder = await breadContract.read.canOrder([
      account,
      encodedMessageAndData,
    ])

    expect(canOrder).to.be.true
  })

  it('should return false for canOrder() when signature is invalid', async function () {
    const { breadContract } = await loadFixture(deploy)
    const { encodedMessageAndData } = await signOrder({
      relativeTimestamp: -10,
    })

    const canOrder = await breadContract.read.canOrder([
      account,
      encodedMessageAndData,
    ])

    expect(canOrder).to.be.false
  })

  it('should get discount from credit', async function () {
    const { breadContract } = await loadFixture(deploy)
    await breadContract.write.updateInventory([[1n], [1n], [1000n]], {
      account,
    })

    const [beforePrice] = await breadContract.read.price([account, 1n, 1n])
    expect(beforePrice).to.equal(1000n)

    await breadContract.write.addCredit([account, 10000000n])

    const [afterPrice] = await breadContract.read.price([account, 1n, 1n])
    expect(afterPrice).to.equal(0n)
  })

  it('should get credit from overpaying', async function () {
    const { breadContract } = await loadFixture(deploy)
    await breadContract.write.updateInventory([[1n], [1n], [1000n]], {
      account,
    })

    const { encodedMessageAndData } = await signOrder({ relativeTimestamp: 10 })

    await breadContract.write.buyBread(
      [account, 1n, 1n, encodedMessageAndData],
      {
        value: 2000n,
      }
    )

    const credit = await breadContract.read.credit([account])
    expect(credit).to.equal(1000n)
  })

  it('should reduce credit after using it', async function () {
    const { breadContract } = await loadFixture(deploy)

    // Set price to 1000 wei
    await breadContract.write.updateInventory([[1n], [1n], [1000n]])

    // Add 2000 wei credit
    await breadContract.write.addCredit([account, 2000n])

    const { encodedMessageAndData } = await signOrder({ relativeTimestamp: 10 })

    const creditBefore = await breadContract.read.credit([account])
    expect(creditBefore).to.equal(2000n)

    // Place an order for 0 wei becuase we already have credit
    await breadContract.write.buyBread(
      [account, 1n, 1n, encodedMessageAndData],
      {
        value: 0n,
      }
    )

    const creditAfter = await breadContract.read.credit([account])
    expect(creditAfter).to.equal(1000n)
  })

  it('should revoke a token', async function () {
    const { breadContract } = await loadFixture(deploy)

    const { encodedMessageAndData } = await signOrder({
      relativeTimestamp: 10,
      customer,
    })

    await breadContract.write.updateInventory([[1n], [1n], [0n]])

    await breadContract.write.buyBread([
      customer,
      1n,
      1n,
      encodedMessageAndData,
    ])

    const balanceOfBefore = await breadContract.read.balanceOf([customer, 1n])
    expect(balanceOfBefore).to.equal(1n)

    await breadContract.write.revokeOrder([customer, 1n, 1n])

    const balanceOfAfter = await breadContract.read.balanceOf([account, 1n])
    expect(balanceOfAfter).to.equal(0n)
  })

  it('should let owner withdraw ETH and block non-owners', async function () {
    const { breadContract } = await loadFixture(deploy)
    const price = 100000000000000n
    await breadContract.write.updateInventory([[1n], [1n], [price]], {
      account,
    })

    const { encodedMessageAndData } = await signOrder({ relativeTimestamp: 10 })

    // customer orders a bread
    await breadContract.write.buyBread(
      [account, 1n, 1n, encodedMessageAndData],
      {
        value: price,
        account: customer,
      }
    )

    // Check the balance of the owner
    const beforeBalance = await (
      await hre.viem.getPublicClient()
    ).getBalance({ address: account })

    // Check the balance of the contract
    const contractBalance = await (
      await hre.viem.getPublicClient()
    ).getBalance({ address: breadContract.address })

    // The contract should have collected the price of the bread
    expect(contractBalance).to.equal(price)

    // Have the customer attempt to withdraw the funds
    const withdrawCall = breadContract.write.withdraw([customer, price], {
      account: customer,
    })

    // The customer should not be able to withdraw the funds
    await expect(withdrawCall).to.be.rejectedWith(
      `OwnableUnauthorizedAccount("${customer}")`
    )

    // Withdraw the funds to the owner
    await breadContract.write.withdraw([account, price])

    // Check the balance of the owner after the withdrawal
    const afterBalance = await (
      await hre.viem.getPublicClient()
    ).getBalance({ address: account })

    // The owner should have more funds after the withdrawal
    // It's not exactly the price of the bread because of gas fees
    expect(Number(afterBalance)).to.be.gt(Number(beforeBalance))
  })

  it('should return the inventory in a batch', async function () {
    const { breadContract } = await loadFixture(deploy)
    await breadContract.write.updateInventory([
      [1n, 2n, 3n],
      [1n, 1n, 1n],
      [1000n, 1000n, 1000n],
    ])

    const batchInventory = await breadContract.read.inventoryBatch([
      [1n, 2n, 3n],
    ])

    expect(batchInventory).to.deep.equal([
      { quantity: 1n, price: 1000n },
      { quantity: 1n, price: 1000n },
      { quantity: 1n, price: 1000n },
    ])
  })

  it('should revert when inventory update has mismatched lengths', async function () {
    const { breadContract } = await loadFixture(deploy)

    const updateInventoryCall = breadContract.write.updateInventory(
      [[1n], [1n, 2n], [1000n]],
      {
        account,
      }
    )

    await expect(updateInventoryCall).to.be.rejectedWith('InvalidInput()')
  })

  it('should mint multiple NFTs', async function () {
    const { breadContract } = await loadFixture(deploy)

    await breadContract.write.updateInventory(
      [
        [1n, 2n],
        [1n, 1n],
        [1000n, 1000n],
      ],
      {
        account,
      }
    )

    const { encodedMessageAndData } = await signOrder({ relativeTimestamp: 10 })

    const buyBreadsCall = breadContract.write.buyBreads(
      [account, [1n, 2n], [1n, 1n], encodedMessageAndData],
      {
        value: 2000n,
      }
    )

    await expect(buyBreadsCall).to.be.fulfilled

    const balanceOf = await breadContract.read.balanceOfBatch([
      [account, account],
      [1n, 2n],
    ])

    expect(balanceOf).to.be.deep.equal([1n, 1n])
  })

  it('should revert when trying to use the same claimId twice', async function () {
    const { breadContract } = await loadFixture(deploy)
    await breadContract.write.updateInventory([[1n], [2n], [1000n]])

    const { encodedMessageAndData } = await signOrder({ relativeTimestamp: 10 })

    await breadContract.write.buyBread(
      [account, 1n, 1n, encodedMessageAndData],
      {
        value: 1000n,
      }
    )

    const buyBreadCall2 = breadContract.write.buyBread(
      [account, 1n, 1n, encodedMessageAndData],
      {
        value: 1000n,
      }
    )

    await expect(buyBreadCall2).to.be.rejectedWith('Unauthorized()')

    const balanceOf = await breadContract.read.balanceOf([account, 1n])
    expect(balanceOf).to.be.equal(1n)
  })
})
