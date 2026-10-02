# LAN ARENA v0.1

Frontend/backend prototype of a LAN esports tournament platform built with Next.js.

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000

On Windows you can also run `run-site.bat`.

## Admin account

For local development, if no environment variables are set, the project uses these **demo-only** credentials:

- email: `admin@lanarena.local`
- password: `lan-arena-demo`

For any public/production deployment, create `.env.local` (or configure environment variables in your hosting service):

```env
ADMIN_EMAIL=your-admin-email@example.com
ADMIN_PASSWORD=use-a-strong-unique-password
```

`ADMIN_PASSWORD` is required in production and is never stored in the repository. `.env*` files are ignored by Git, except `.env.example`.

## Local data

Runtime accounts, password hashes and session tokens are stored locally in `data/lan-arena.json`. This file and temporary database files are ignored by Git and are not included in the shareable project archive.

## What is implemented

- responsive home page and navigation
- tournaments, matches, teams and players pages
- registration and login
- server-side sessions via HttpOnly cookies
- account roles
- team/tournament flows
- LAN Points and predictions
- dark esports UI

## Security notes

- user passwords are stored as salted `scrypt` hashes, not plaintext
- session tokens are generated with cryptographically secure random bytes
- session cookie is `HttpOnly` and `SameSite=Lax`
- local database/session files and environment secrets are excluded from Git
- production startup requires an explicit admin password
