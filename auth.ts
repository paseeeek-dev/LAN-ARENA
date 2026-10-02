import 'server-only'
import { createHmac, timingSafeEqual } from 'crypto'
import { NextRequest } from 'next/server'
import { publicUser, readDb, UserRecord, DbShape } from './db'

export const SESSION_COOKIE = 'lan_arena_session'

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 14

function sessionSecret() {
  const secret = process.env.SESSION_SECRET?.trim() || process.env.ADMIN_PASSWORD?.trim()
  if (secret) return secret
  if (process.env.NODE_ENV === 'production') {
    throw new Error('SESSION_SECRET or ADMIN_PASSWORD must be set in production.')
  }
  return 'lan-arena-local-demo-session-secret'
}

function sign(payload: string) {
  return createHmac('sha256', sessionSecret()).update(payload).digest('base64url')
}

export function createSessionToken(userId: string) {
  const expiresAt = Date.now() + SESSION_TTL_MS
  const payload = Buffer.from(JSON.stringify({ userId, expiresAt }), 'utf8').toString('base64url')
  return { token: `${payload}.${sign(payload)}`, expiresAt }
}

function verifySessionToken(token?: string | null): { userId: string; expiresAt: number } | null {
  if (!token) return null
  const [payload, signature] = token.split('.')
  if (!payload || !signature) return null

  const expected = sign(payload)
  const givenBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expected)
  if (givenBuffer.length !== expectedBuffer.length || !timingSafeEqual(givenBuffer, expectedBuffer)) return null

  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { userId?: string; expiresAt?: number }
    if (!parsed.userId || !parsed.expiresAt || parsed.expiresAt <= Date.now()) return null
    return { userId: parsed.userId, expiresAt: parsed.expiresAt }
  } catch {
    return null
  }
}

export async function authFromRequest(request: NextRequest): Promise<{ db: DbShape; user: UserRecord | null }> {
  const db = await readDb()
  const token = request.cookies.get(SESSION_COOKIE)?.value
  const session = verifySessionToken(token)
  const user = session ? db.users.find((item) => item.id === session.userId) || null : null
  return { db, user }
}

export function isOrganizer(user: UserRecord | null) {
  return user?.role === 'ADMIN' || user?.role === 'ORGANIZER'
}

export { publicUser }
