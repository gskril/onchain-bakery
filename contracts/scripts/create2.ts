import { parseAbi } from 'viem'

// https://github.com/pcaversaccio/create2deployer
export const create2Factory = {
  address: '0x13b0D85CcB8bf860b6b79AF3029fCA081AE9beF2',
  abi: parseAbi([
    'event Deployed(address addr)',
    'function deploy(uint256 value, bytes32 salt, bytes memory code) public',
    'function computeAddress(bytes32 salt, bytes32 codeHash) public view returns (address)',
  ]),
} as const
