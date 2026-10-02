import { NextRequest, NextResponse } from 'next/server'
import { authFromRequest, isOrganizer } from '@/lib/server/auth'
import { writeDb } from '@/lib/server/db'

export async function GET(request: NextRequest) {
  const { db, user } = authFromRequest(request)
  if (!isOrganizer(user)) return NextResponse.json({ error: 'Нет доступа.' }, { status: 403 })
  return NextResponse.json({ applications: db.applications })
}

export async function PATCH(request: NextRequest) {
  const { db, user } = authFromRequest(request)
  if (!isOrganizer(user)) return NextResponse.json({ error: 'Нет доступа.' }, { status: 403 })
  const body = await request.json().catch(() => ({}))
  const id = Number(body.id)
  const status = body.status
  if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status)) return NextResponse.json({ error: 'Некорректный статус.' }, { status: 400 })
  const application = db.applications.find((item) => item.id === id)
  if (!application) return NextResponse.json({ error: 'Заявка не найдена.' }, { status: 404 })
  application.status = status
  writeDb(db)
  return NextResponse.json({ application })
}
