import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_EMAIL, createUserId, hashPassword, publicUser, readDb, writeDb } from '@/lib/server/db'
import { createSessionToken, SESSION_COOKIE } from '@/lib/server/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const username = String(body.username || '').trim()
    const email = String(body.email || '').trim().toLowerCase()
    const password = String(body.password || '')
    const role = body.role === 'PLAYER' ? 'PLAYER' : 'VIEWER'

    if (!username || !email || !password) return NextResponse.json({ error: 'Заполни обязательные поля.' }, { status: 400 })
    if (username.length < 3) return NextResponse.json({ error: 'Username должен быть минимум 3 символа.' }, { status: 400 })
    if (password.length < 6) return NextResponse.json({ error: 'Пароль должен быть минимум 6 символов.' }, { status: 400 })
    if (email === ADMIN_EMAIL) return NextResponse.json({ error: 'Этот email зарезервирован.' }, { status: 409 })

    // Fail early with a clear message if sessions are not configured.
    createSessionToken('__config_check__')

    const db = await readDb()
    const exists = db.users.some((user) => user.email.toLowerCase() === email || user.username.toLowerCase() === username.toLowerCase())
    if (exists) return NextResponse.json({ error: 'Аккаунт с таким email или username уже существует.' }, { status: 409 })

    const user = {
      id: createUserId(),
      username,
      email,
      passwordHash: hashPassword(password),
      role,
      points: 1000,
      createdAt: Date.now(),
    } as const

    db.users.push(user)
    await writeDb(db)

    const session = createSessionToken(user.id)
    const response = NextResponse.json({ user: publicUser(user) }, { status: 201 })
    response.cookies.set(SESSION_COOKIE, session.token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      expires: new Date(session.expiresAt),
    })
    return response
  } catch (error) {
    console.error('REGISTER_ERROR', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Ошибка сервера при регистрации.' }, { status: 500 })
  }
}
