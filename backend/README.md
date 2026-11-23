# Backend

Service to send Warpcast direct messages when new orders are placed.

It runs TypeScript directly with Node's built-in type stripping, so there is no build step. Relative imports use the `.ts` extension and only erasable TypeScript syntax is allowed (no enums or namespaces).

```bash
cp .env.example .env
pnpm start       # watch for new orders
pnpm notify      # send a one-off message to past customers
pnpm typecheck
```
