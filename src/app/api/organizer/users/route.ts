import { NextRequest, NextResponse } from 'next/server'
import { authFromRequest, isOrganizer, publicUser } from '@/lib/server/auth'
import { writeDb } from '@/lib/server/db'

export async function GET(request: NextRequest) {
  const { db, user } = authFromRequest(request)
  if (!isOrganizer(user)) return NextResponse.json({ error: 'Нет доступа.' }, { status: 403 })
  return NextResponse.json({ users: db.users.map(publicUser) })
}

export async function PATCH(request: NextRequest) {
  const { db, user } = authFromRequest(request)
  if (!isOrganizer(user)) return NextResponse.json({ error: 'Нет доступа.' }, { status: 403 })
  const body = await request.json().catch(() => ({}))
  const target = db.users.find((item) => item.id === String(body.userId || ''))
  const amount = Number(body.amount)
  if (!target || !Number.isFinite(amount)) return NextResponse.json({ error: 'Некорректные данные.' }, { status: 400 })
  target.points = Math.max(0, target.points + amount)
  writeDb(db)
  return NextResponse.json({ user: publicUser(target) })
}
