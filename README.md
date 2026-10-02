# LAN ARENA v0.1

LAN esports tournament platform prototype built with Next.js.

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Production configuration

Set these environment variables in the hosting service:

```env
ADMIN_EMAIL=your-admin-email@example.com
ADMIN_PASSWORD=use-a-strong-unique-password
SESSION_SECRET=use-another-long-random-secret
```

`ADMIN_PASSWORD` is required in production. Secrets are not stored in the repository.

## Storage

- Local development: `data/lan-arena.json` (ignored by Git).
- Netlify: persistent site-wide Netlify Blobs storage.

This keeps registered users, sessions, teams, tournaments and other runtime data available across serverless invocations and new deploys.

## Implemented

- responsive home page and navigation
- tournaments, matches, teams and players
- registration and login
- HttpOnly server-side sessions
- account roles and organizer tools
- team/tournament flows
- LAN Points and predictions
