import { NextRequest, NextResponse } from 'next/server'
import { removeSession, readDb, writeDb } from '@/lib/server/db'
import { SESSION_COOKIE } from '@/lib/server/auth'

export async function POST(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value
  const db = readDb()
  removeSession(db, token)
  writeDb(db)
  const response = NextResponse.json({ ok: true })
  response.cookies.set(SESSION_COOKIE, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', expires: new Date(0) })
  return response
}
