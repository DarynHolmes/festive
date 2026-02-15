# Local Development

## Prerequisites

- Node.js 20+ with pnpm
- PocketBase binary (included at `pocketbase_0.36.3/`)

## Start PocketBase

```bash
cd pocketbase_0.36.3
./pocketbase serve
```

PocketBase starts on `http://127.0.0.1:8090`. Admin UI: `http://127.0.0.1:8090/_/`.

On first run, create an admin account when prompted. Migrations in `pb_migrations/` run automatically, creating the `lodges` and `dining_records` collections.

## Seed Data

With PocketBase running, seed 4 test lodges with members and dining records:

```bash
cd clients/secretary-app
node scripts/seed.js
```

Requires temporarily opening Create rules on `lodges`, `members`, and `dining_records` in the PocketBase admin UI.

## Start the Secretary App

```bash
cd clients/secretary-app
pnpm install
pnpm dev
```

The app reads `VITE_POCKETBASE_URL` from `.env.development` (defaults to `http://127.0.0.1:8090`).
