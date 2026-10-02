import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_EMAIL, publicUser, readDb, verifyPassword } from '@/lib/server/db'
import { adminUser, createSessionToken, SESSION_COOKIE } from '@/lib/server/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const login = String(body.login || '').trim().toLowerCase()
    const password = String(body.password || '')
    if (!login || !password) return NextResponse.json({ error: 'Заполни логин и пароль.' }, { status: 400 })

    const configuredAdminPassword = process.env.ADMIN_PASSWORD?.trim()
    if (login === ADMIN_EMAIL) {
      if (!configuredAdminPassword) {
        return NextResponse.json({ error: 'Админ-пароль не настроен на сервере.' }, { status: 503 })
      }
      if (password !== configuredAdminPassword) {
        return NextResponse.json({ error: 'Неверный логин или пароль.' }, { status: 401 })
      }

      const user = adminUser()
      const session = createSessionToken(user.id)
      const response = NextResponse.json({ user: publicUser(user) })
      response.cookies.set(SESSION_COOKIE, session.token, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
        expires: new Date(session.expiresAt),
      })
      return response
    }

    const db = await readDb()
    const user = db.users.find((item) => item.email.toLowerCase() === login || item.username.toLowerCase() === login)
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ error: 'Неверный логин или пароль.' }, { status: 401 })
    }

    const session = createSessionToken(user.id)
    const response = NextResponse.json({ user: publicUser(user) })
    response.cookies.set(SESSION_COOKIE, session.token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      expires: new Date(session.expiresAt),
    })
    return response
  } catch (error) {
    console.error('LOGIN_ERROR', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Ошибка сервера при входе.' }, { status: 500 })
  }
}
