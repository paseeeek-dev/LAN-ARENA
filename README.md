# LAN ARENA v0.1

LAN esports tournament platform prototype built with Next.js.

## Local start

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Netlify deployment

The production build stores app data in **Netlify Blobs**, so registration, login and project data persist across serverless requests and deploys.

Set these environment variables in Netlify before deploying:

```env
ADMIN_EMAIL=admin@lanarena.ru
ADMIN_PASSWORD=your-strong-password
```

`SESSION_SECRET` is optional; when omitted, `ADMIN_PASSWORD` is also used to sign sessions.

## Implemented

- registration and login with HttpOnly session cookies
- viewer/player/admin roles
- teams and tournament flows
- organizer panel
- matches, predictions and LAN Points
- responsive esports UI

## Security

Passwords are stored as salted `scrypt` hashes. Production data is stored in Netlify Blobs and secrets stay in Netlify environment variables, not in the repository.
