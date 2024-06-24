import { loadFixture } from '@nomicfoundation/hardhat-toolbox-viem/network-helpers'
import { assert, expect } from 'chai'
import hre from 'hardhat'

const account = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'

const deploy = async () => {
  const breadContract = await hre.viem.deployContract('Bread', [
    account, // _owner,
    '0x0000000000000000000000000000000000000000', // _proofOfBread,
    'https://website.com/api/{id}', // _uri
  ])

  return { breadContract }
}

describe('Bread.sol tests', function () {
  it('should increase inventory', async function () {
    const { breadContract } = await loadFixture(deploy)
    const [quantityBefore] = await breadContract.read.inventory([1n])
    expect(quantityBefore).to.equal(0n)

    await breadContract.write.updateInventory([1n, 1n, 1000n], { account })
    const [quantityAfter] = await breadContract.read.inventory([1n])
    expect(quantityAfter).to.equal(1n)
  })

  it('should revert when minting with no inventory', async function () {
    const { breadContract } = await loadFixture(deploy)

    await expect(breadContract.write.adminOrder([account, 1n, 1n], { account }))
      .to.be.rejected
  })

  it('should mint with sufficient funds', async function () {
    const { breadContract } = await loadFixture(deploy)
    await breadContract.write.updateInventory([1n, 1n, 1000n], { account })

    const orderBreadCall = breadContract.write.orderBread(
      [account, 1n, 1n, []],
      { value: 1000n }
    )

    await expect(orderBreadCall).to.be.fulfilled

    const balanceOf = await breadContract.read.balanceOf([account, 1n])
    expect(balanceOf).to.be.equal(1n)
  })

  it('should revert when mint with insufficient funds', async function () {
    const { breadContract } = await loadFixture(deploy)
    await breadContract.write.updateInventory([1n, 1n, 1000n], { account })

    const orderBreadCall = breadContract.write.orderBread(
      [account, 1n, 1n, []],
      { value: 999n }
    )

    await expect(orderBreadCall).to.rejectedWith('InsufficientValue()')
  })

  it('should not be able to mint when allowlist is enabled', async function () {
    const { breadContract } = await loadFixture(deploy)
    const canOrderBefore = await breadContract.read.canOrder([account, []])

    await breadContract.write.setAllowlist(
      ['0xb24fd730ae60843faadf8ba26bc794e2928ce3fe4612c940d9fb9e1e7cc072c1'],
      { account }
    )

    const canOrderAfter = await breadContract.read.canOrder([account, []])

    expect(canOrderBefore).to.be.true
    expect(canOrderAfter).to.be.false
  })

  it('should be able to mint from allowlist', async function () {
    const { breadContract } = await loadFixture(deploy)
    await breadContract.write.setAllowlist(
      ['0xb24fd730ae60843faadf8ba26bc794e2928ce3fe4612c940d9fb9e1e7cc072c1'],
      { account }
    )

    // Proof from https://lanyard.org/api/v1/proof?root=0xb24fd730ae60843faadf8ba26bc794e2928ce3fe4612c940d9fb9e1e7cc072c1&unhashedLeaf=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
    const canOrder = await breadContract.read.canOrder([
      account,
      ['0x06e120c2c3547c60ee47f712d32e5acf38b35d1cc62e23b055a69bb88284c281'],
    ])

    expect(canOrder).to.be.true
  })

  it('should get discount from credit', async function () {
    const { breadContract } = await loadFixture(deploy)
    await breadContract.write.updateInventory([1n, 1n, 1000n], { account })

    const beforePrice = await breadContract.read.price([account, 1n])
    expect(beforePrice).to.equal(1000n)

    await breadContract.write.addCredit([account, 10000000n], { account })

    const afterPrice = await breadContract.read.price([account, 1n])
    expect(afterPrice).to.equal(0n)
  })
})
