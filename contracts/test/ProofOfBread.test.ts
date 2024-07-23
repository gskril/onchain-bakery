import { loadFixture } from '@nomicfoundation/hardhat-toolbox-viem/network-helpers'
import { expect } from 'chai'
import hre from 'hardhat'
import { Address, encodeAbiParameters, toHex } from 'viem'

// These are not the real constructor arguments, just placeholders
// Hardhat throws an `Unknown account` error if we use the real addresses
// So these are all default addresses from `npx hardhat node`
const owner = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const signer = '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC'
const minter = '0x90F79bf6EB2c4f870365E785982E1f101E93b906'

const deploy = async () => {
  const proofOfBread = await hre.viem.deployContract('ProofOfBread', [
    owner, // _owner
    signer, // _signer
    '0x0000000000000000000000000000000000000000', // _bread
    'https://goodbread.nyc/api/metadata/proof-of-bread/{id}', // _uri
  ])

  return { proofOfBread }
}

const signOrder = async ({
  relativeTimestamp = 0,
  minter,
  claimId,
}: {
  relativeTimestamp: number
  minter?: Address
  claimId?: string
}) => {
  const messageToSign = encodeAbiParameters(
    [
      { name: 'minter', type: 'address' },
      { name: 'claimId', type: 'bytes32' },
      { name: 'expiration', type: 'uint256' },
    ],
    [
      minter || signer,
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

describe('ProofOfBread.sol tests', function () {
  it('should return true for canMint() when signature is valid', async function () {
    const { proofOfBread } = await loadFixture(deploy)
    const { encodedMessageAndData } = await signOrder({
      relativeTimestamp: 10,
      minter,
    })

    const canOrder = await proofOfBread.read.canMint([
      minter,
      encodedMessageAndData,
    ])

    expect(canOrder).to.be.true
  })

  it('should return false for canMint() when signature is invalid/expired', async function () {
    const { proofOfBread } = await loadFixture(deploy)
    const { encodedMessageAndData } = await signOrder({
      relativeTimestamp: -10,
      minter,
    })

    const canOrder = await proofOfBread.read.canMint([
      minter,
      encodedMessageAndData,
    ])

    expect(canOrder).to.be.false
  })

  it('should let the owner revoke a token', async function () {
    const { proofOfBread } = await loadFixture(deploy)

    const { encodedMessageAndData } = await signOrder({
      relativeTimestamp: 10,
      minter,
    })

    await proofOfBread.write.collectBread([minter, 1n, encodedMessageAndData], {
      account: minter,
    })

    const balanceOfBefore = await proofOfBread.read.balanceOf([minter, 1n])
    expect(balanceOfBefore).to.equal(1n)

    await proofOfBread.write.revokeBread([[minter], [1n], [1n]], {
      account: owner,
    })

    const balanceOfAfter = await proofOfBread.read.balanceOf([minter, 1n])
    expect(balanceOfAfter).to.equal(0n)
  })

  it('should let the signer revoke a token but not a random account', async function () {
    const { proofOfBread } = await loadFixture(deploy)

    const { encodedMessageAndData } = await signOrder({
      relativeTimestamp: 10,
      minter,
    })

    await proofOfBread.write.collectBread([minter, 1n, encodedMessageAndData], {
      account: minter,
    })

    const balanceOfBefore = await proofOfBread.read.balanceOf([minter, 1n])
    expect(balanceOfBefore).to.equal(1n)

    const badRevokeCall = proofOfBread.write.revokeBread(
      [[minter], [1n], [1n]],
      {
        account: minter,
      }
    )

    expect(badRevokeCall).to.be.rejectedWith(`Unauthorized()`)

    await proofOfBread.write.revokeBread([[minter], [1n], [1n]], {
      account: signer,
    })

    const balanceOfAfter = await proofOfBread.read.balanceOf([minter, 1n])
    expect(balanceOfAfter).to.equal(0n)
  })

  it('should let the owner withdraw ETH and block non-owners', async function () {
    const { proofOfBread } = await loadFixture(deploy)
    const price = 100000000000000n

    const { encodedMessageAndData } = await signOrder({
      relativeTimestamp: 10,
      minter,
    })

    // Mints NFT with a tip
    await proofOfBread.write.collectBread([minter, 1n, encodedMessageAndData], {
      value: price,
      account: minter,
    })

    const beforeBalance = await (
      await hre.viem.getPublicClient()
    ).getBalance({ address: owner })

    // Check the balance of the contract
    const contractBalance = await (
      await hre.viem.getPublicClient()
    ).getBalance({ address: proofOfBread.address })

    // The contract should have collected the tip amount
    expect(contractBalance).to.equal(price)

    // Have the minter attempt to withdraw the funds
    const withdrawCall = proofOfBread.write.withdraw([minter, price], {
      account: minter,
    })

    // The minter should not be able to withdraw the funds
    await expect(withdrawCall).to.be.rejectedWith(
      `OwnableUnauthorizedAccount("${minter}")`
    )

    // Withdraw the funds to the owner
    await proofOfBread.write.withdraw([owner, price], { account: owner })

    // Check the balance of the owner after the withdrawal
    const afterBalance = await (
      await hre.viem.getPublicClient()
    ).getBalance({ address: owner })

    // The owner should have more funds after the withdrawal
    // It's not exactly the price of the bread because of gas fees
    expect(Number(afterBalance)).to.be.gt(Number(beforeBalance))
  })

  it('should revert when trying to use the same claimId twice', async function () {
    const { proofOfBread } = await loadFixture(deploy)

    const { encodedMessageAndData } = await signOrder({
      relativeTimestamp: 10,
      minter,
    })

    const collectBreadCall = proofOfBread.write.collectBread(
      [minter, 1n, encodedMessageAndData],
      {
        account: minter,
      }
    )

    await expect(collectBreadCall).to.be.fulfilled

    const collectBreadCall2 = proofOfBread.write.collectBread(
      [minter, 1n, encodedMessageAndData],
      {
        account: minter,
      }
    )

    await expect(collectBreadCall2).to.be.rejectedWith('Unauthorized()')

    const balanceOf = await proofOfBread.read.balanceOf([minter, 1n])
    expect(balanceOf).to.be.equal(1n)
  })
})
