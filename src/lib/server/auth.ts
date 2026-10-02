import 'server-only'
import { NextRequest } from 'next/server'
import { findUserBySession, publicUser, readDb, UserRecord } from './db'

export const SESSION_COOKIE = 'lan_arena_session'

export function authFromRequest(request: NextRequest): { db: ReturnType<typeof readDb>; user: UserRecord | null } {
  const db = readDb()
  const token = request.cookies.get(SESSION_COOKIE)?.value
  const user = findUserBySession(db, token)
  return { db, user }
}

export function isOrganizer(user: UserRecord | null) {
  return user?.role === 'ADMIN' || user?.role === 'ORGANIZER'
}

export { publicUser }
