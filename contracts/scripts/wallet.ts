import hre from 'hardhat'

export async function getDeployerWalletClient() {
  const [walletClient] = await hre.viem.getWalletClients()

  if (!walletClient) {
    throw new Error(
      `No deployer account for network "${hre.network.name}". Set DEPLOYER_KEY in contracts/.env`
    )
  }

  return walletClient
}
