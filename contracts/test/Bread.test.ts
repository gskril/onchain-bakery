import { loadFixture } from '@nomicfoundation/hardhat-toolbox-viem/network-helpers'
import { expect } from 'chai'
import hre from 'hardhat'
import { Address, encodeAbiParameters, keccak256, toHex } from 'viem'

// These are not the real constructor arguments, just placeholders
// Hardhat throws an `Unknown account` error if we use the real addresses
// So these are all default addresses from `npx hardhat node`
const owner = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266' // contract owner
const manager = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' // account with manager role
const signer = '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC' // account with signer role
const customer = '0x90F79bf6EB2c4f870365E785982E1f101E93b906' // bakery customer

const MANAGER_ROLE = keccak256(toHex('MANAGER_ROLE'))
const SIGNER_ROLE = keccak256(toHex('SIGNER_ROLE'))

const deploy = async () => {
  const breadContract = await hre.viem.deployContract('Bread', [
    owner, // _owner
    manager, // _manager
    signer, // _signer
    '0x0000000000000000000000000000000000000000', // _proofOfBread
    'https://goodbread.nyc/api/metadata/bread/{id}', // _uri
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
      customer || signer,
      toHex(claimId || 'hi', { size: 32 }),
      BigInt(Math.floor(Date.now() / 1000) + relativeTimestamp),
    ]
  )

  const viemClient = await hre.viem.getWalletClient(signer)

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
      account: signer,
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
      `AccessControlUnauthorizedAccount("${customer}", "${SIGNER_ROLE}")`
    )

    const [quantityAfter] = await breadContract.read.inventory([1n])
    expect(quantityAfter).to.equal(1n)
  })

  it('should revert when minting with no inventory', async function () {
    const { breadContract } = await loadFixture(deploy)

    const adminOrderCall = breadContract.write.adminOrder(
      [signer, [1n], [1n]],
      { account: signer }
    )

    await expect(adminOrderCall).to.be.rejected
  })

  it('should mint with sufficient funds', async function () {
    const { breadContract } = await loadFixture(deploy)
    await breadContract.write.updateInventory([[1n], [1n], [1000n]], {
      account: signer,
    })

    const { encodedMessageAndData } = await signOrder({
      relativeTimestamp: 10,
      customer,
    })

    const buyBreadCall = breadContract.write.buyBread(
      [customer, [1n], [1n], encodedMessageAndData],
      {
        account: customer,
        value: 1000n,
      }
    )

    await expect(buyBreadCall).to.be.fulfilled

    const balanceOf = await breadContract.read.balanceOf([customer, 1n])
    expect(balanceOf).to.be.equal(1n)
  })

  it('should revert when mint with insufficient funds', async function () {
    const { breadContract } = await loadFixture(deploy)
    await breadContract.write.updateInventory([[1n], [1n], [1000n]], {
      account: signer,
    })

    const { encodedMessageAndData } = await signOrder({
      relativeTimestamp: 10,
      customer,
    })

    const buyBreadCall = breadContract.write.buyBread(
      [customer, [1n], [1n], encodedMessageAndData],
      {
        account: customer,
        value: 999n,
      }
    )

    await expect(buyBreadCall).to.rejectedWith('InsufficientValue()')
  })

  it('should return true for canOrder() when signature is valid', async function () {
    const { breadContract } = await loadFixture(deploy)
    const { encodedMessageAndData } = await signOrder({
      relativeTimestamp: 10,
      customer,
    })

    const canOrder = await breadContract.read.canOrder([
      customer,
      encodedMessageAndData,
    ])

    expect(canOrder).to.be.true
  })

  it('should return false for canOrder() when signature is invalid/expired', async function () {
    const { breadContract } = await loadFixture(deploy)
    const { encodedMessageAndData } = await signOrder({
      relativeTimestamp: -10,
      customer,
    })

    const canOrder = await breadContract.read.canOrder([
      customer,
      encodedMessageAndData,
    ])

    expect(canOrder).to.be.false
  })

  it('should get discount from credit', async function () {
    const { breadContract } = await loadFixture(deploy)
    await breadContract.write.updateInventory([[1n], [1n], [1000n]], {
      account: signer,
    })

    const [beforePrice] = await breadContract.read.price([customer, [1n], [1n]])
    expect(beforePrice).to.equal(1000n)

    await breadContract.write.addCredit([customer, 10000000n], {
      account: signer,
    })

    const [afterPrice] = await breadContract.read.price([customer, [1n], [1n]])
    expect(afterPrice).to.equal(0n)
  })

  it('should get credit from overpaying', async function () {
    const { breadContract } = await loadFixture(deploy)
    await breadContract.write.updateInventory([[1n], [1n], [1000n]], {
      account: signer,
    })

    const { encodedMessageAndData } = await signOrder({ relativeTimestamp: 10 })

    await breadContract.write.buyBread(
      [signer, [1n], [1n], encodedMessageAndData],
      {
        value: 2000n,
      }
    )

    const credit = await breadContract.read.credit([signer])
    expect(credit).to.equal(1000n)
  })

  it('should reduce credit after using it, and avoid an infinite bread glitch', async function () {
    const { breadContract } = await loadFixture(deploy)
    const { encodedMessageAndData } = await signOrder({
      relativeTimestamp: 10,
      customer,
    })

    // List token ID 1 with a quantity of 5 and a price of 1000 wei
    await breadContract.write.updateInventory([[1n], [5n], [1000n]], {
      account: signer,
    })

    // Add 2000 wei credit
    await breadContract.write.addCredit([customer, 2000n], { account: signer })

    const creditBefore = await breadContract.read.credit([customer])
    expect(creditBefore).to.equal(2000n)

    // Get the price of an order to buy all 5 breads
    const [price, discount] = await breadContract.read.price([
      customer,
      [1n],
      [5n],
    ])

    // Expect the price to be 3000 wei and the discount to be 2000 wei
    expect(price).to.equal(3000n)
    expect(discount).to.equal(2000n)

    // Place an order for the quoted price after discount
    await breadContract.write.buyBread(
      [customer, [1n], [5n], encodedMessageAndData],
      { account: customer, value: price }
    )

    // Credit should be reduced to 0 since it was all used
    const creditAfter = await breadContract.read.credit([customer])
    expect(creditAfter).to.equal(0n)
  })

  it('should revoke a token', async function () {
    const { breadContract } = await loadFixture(deploy)

    const { encodedMessageAndData } = await signOrder({
      relativeTimestamp: 10,
      customer,
    })

    await breadContract.write.updateInventory([[1n], [1n], [0n]], {
      account: signer,
    })

    await breadContract.write.buyBread(
      [customer, [1n], [1n], encodedMessageAndData],
      { account: customer }
    )

    const balanceOfBefore = await breadContract.read.balanceOf([customer, 1n])
    expect(balanceOfBefore).to.equal(1n)

    await breadContract.write.revokeOrder([customer, 1n, 1n], {
      account: signer,
    })

    const balanceOfAfter = await breadContract.read.balanceOf([customer, 1n])
    expect(balanceOfAfter).to.equal(0n)
  })

  it('should let owner withdraw ETH and block non-owners', async function () {
    const { breadContract } = await loadFixture(deploy)
    const price = 100000000000000n
    await breadContract.write.updateInventory([[1n], [1n], [price]], {
      account: signer,
    })

    const { encodedMessageAndData } = await signOrder({
      relativeTimestamp: 10,
      customer,
    })

    // customer orders a bread
    await breadContract.write.buyBread(
      [customer, [1n], [1n], encodedMessageAndData],
      {
        value: price,
        account: customer,
      }
    )

    // Check the balance of the owner
    const beforeBalance = await (
      await hre.viem.getPublicClient()
    ).getBalance({ address: manager })

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
      `AccessControlUnauthorizedAccount("${customer}", "${MANAGER_ROLE}")`
    )

    // Withdraw the funds to the owner
    await breadContract.write.withdraw([manager, price], { account: manager })

    // Check the balance of the owner after the withdrawal
    const afterBalance = await (
      await hre.viem.getPublicClient()
    ).getBalance({ address: manager })

    // The owner should have more funds after the withdrawal
    // It's not exactly the price of the bread because of gas fees
    expect(Number(afterBalance)).to.be.gt(Number(beforeBalance))
  })

  it('should return the inventory in a batch', async function () {
    const { breadContract } = await loadFixture(deploy)
    await breadContract.write.updateInventory(
      [
        [1n, 2n, 3n],
        [1n, 1n, 1n],
        [1000n, 1000n, 1000n],
      ],
      { account: signer }
    )

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
        account: signer,
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
        account: signer,
      }
    )

    const { encodedMessageAndData } = await signOrder({
      relativeTimestamp: 10,
      customer,
    })

    const buyBreadsCall = breadContract.write.buyBread(
      [customer, [1n, 2n], [1n, 1n], encodedMessageAndData],
      {
        value: 2000n,
        account: customer,
      }
    )

    await expect(buyBreadsCall).to.be.fulfilled

    const balanceOf = await breadContract.read.balanceOfBatch([
      [customer, customer],
      [1n, 2n],
    ])

    expect(balanceOf).to.be.deep.equal([1n, 1n])
  })

  it('should revert when trying to use the same claimId twice', async function () {
    const { breadContract } = await loadFixture(deploy)
    await breadContract.write.updateInventory([[1n], [2n], [1000n]], {
      account: signer,
    })

    const { encodedMessageAndData } = await signOrder({
      relativeTimestamp: 10,
      customer,
    })

    const breadBuyCall = breadContract.write.buyBread(
      [customer, [1n], [1n], encodedMessageAndData],
      {
        value: 1000n,
        account: customer,
      }
    )

    expect(breadBuyCall).to.be.fulfilled

    const buyBreadCall2 = breadContract.write.buyBread(
      [customer, [1n], [1n], encodedMessageAndData],
      {
        value: 1000n,
        account: customer,
      }
    )

    await expect(buyBreadCall2).to.be.rejectedWith('Unauthorized()')

    const balanceOf = await breadContract.read.balanceOf([customer, 1n])
    expect(balanceOf).to.be.equal(1n)
  })

  it('should let the DEFAULT_ADMIN_ROLE update other roles', async function () {
    const { breadContract } = await loadFixture(deploy)
    const DEFAULT_ADMIN_ROLE = await breadContract.read.DEFAULT_ADMIN_ROLE()

    const roleAdmin = await breadContract.read.getRoleAdmin([MANAGER_ROLE])
    expect(roleAdmin).to.be.equal(DEFAULT_ADMIN_ROLE)

    const isOwnerDefaultAdmin = await breadContract.read.hasRole([
      DEFAULT_ADMIN_ROLE,
      owner,
    ])

    expect(isOwnerDefaultAdmin).to.be.true

    // Have a random customer try to update the manager role
    const invalidUpdateRoleCall = breadContract.write.grantRole(
      [MANAGER_ROLE, customer],
      { account: customer }
    )

    await expect(invalidUpdateRoleCall).to.be.rejectedWith(
      `AccessControlUnauthorizedAccount("${customer}", "${DEFAULT_ADMIN_ROLE}")`
    )

    // Have the owner update the manager role
    const updateRoleCall = breadContract.write.grantRole(
      [MANAGER_ROLE, customer],
      {
        account: owner,
      }
    )

    await expect(updateRoleCall).to.be.fulfilled

    const isNewAddressManager = await breadContract.read.hasRole([
      MANAGER_ROLE,
      customer,
    ])
    expect(isNewAddressManager).to.be.true
  })
})
