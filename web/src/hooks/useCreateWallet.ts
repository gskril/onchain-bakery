import { useCallback } from 'react'
import { useConnect } from 'wagmi'

export function useCreateWallet() {
  const { connectors, connect } = useConnect()

  const createWallet = useCallback(() => {
    const coinbaseWalletConnector = connectors.find(
      (connector) => connector.id === 'coinbaseWalletSDK'
    )

    if (coinbaseWalletConnector) {
      connect({ connector: coinbaseWalletConnector })
    }
  }, [connectors, connect])

  return { createWallet }
}
