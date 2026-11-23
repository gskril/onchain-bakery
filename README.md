# Good Bread by Greg

![Cover image](https://github.com/user-attachments/assets/37f69b20-3b4e-426c-a13a-1946e76b07bb)

An onchain bakery where orders are placed on [Base](https://www.base.org/), receipts are issued as [NFTs](https://opensea.io/collection/good-bread-by-greg), and bread is eaten in New York City.

See [/contracts](/contracts/README.md), [/web](/web/README.md), and [/backend](/backend/README.md) for more details.

## Development

The repo is a pnpm workspace. It needs Node 24 (see `.nvmrc`) and pnpm 12, which [corepack](https://nodejs.org/api/corepack.html) installs from the `packageManager` field.

```bash
corepack enable
pnpm install
```

| Package     | What it is                                                   |
| ----------- | ------------------------------------------------------------ |
| `web`       | Next.js frontend and API                                     |
| `backend`   | Node service that messages customers about their orders      |
| `contracts` | Solidity contracts, Hardhat tests, and deploy scripts        |
| `shared`    | TypeScript source used by `web` and `backend`, with no build |

Common commands from the repo root:

```bash
pnpm web:dev        # start the web app
pnpm backend:start  # start the backend
pnpm lint           # check formatting and lint with Biome
pnpm lint:fix       # apply Biome's safe fixes and formatting
pnpm typecheck      # typecheck every package
pnpm test           # run the contract tests
```

Shared dependency versions (`viem`, `typescript`, `@types/node`) live in the `catalog` in `pnpm-workspace.yaml`, so packages reference them as `catalog:`.
