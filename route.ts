import { NextRequest, NextResponse } from 'next/server'
import { publicUser, readDb, verifyPassword } from '@/lib/server/db'
import { createSessionToken, SESSION_COOKIE } from '@/lib/server/auth'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  const login = String(body.login || '').trim().toLowerCase()
  const password = String(body.password || '')
  if (!login || !password) return NextResponse.json({ error: 'Заполни логин и пароль.' }, { status: 400 })

  const db = readDb()
  const user = db.users.find((item) => item.email.toLowerCase() === login || item.username.toLowerCase() === login)
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json({ error: 'Неверный логин или пароль.' }, { status: 401 })
  }

  const session = createSessionToken(user.id)
  const response = NextResponse.json({ user: publicUser(user) })
  response.cookies.set(SESSION_COOKIE, session.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(session.expiresAt),
  })
  return response
}
