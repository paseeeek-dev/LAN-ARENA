import { NextRequest, NextResponse } from 'next/server'
import { authFromRequest } from '@/lib/server/auth'
import { randomUUID } from 'crypto'
import { writeDb } from '@/lib/server/db'

export async function GET(request: NextRequest) {
  const { db, user } = await authFromRequest(request)
  if (!user) return NextResponse.json({ predictions: [] })
  return NextResponse.json({ predictions: db.predictions.filter((item) => item.userId === user.id) })
}

export async function POST(request: NextRequest) {
  const { db, user } = await authFromRequest(request)
  if (!user) return NextResponse.json({ error: 'Сначала войди в аккаунт.' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const matchId = Number(body.matchId)
  const team = String(body.team || '')
  const match = db.matches.find((item) => item.id === matchId)
  if (!match) return NextResponse.json({ error: 'Матч не найден.' }, { status: 404 })
  if (Date.now() >= match.startAt) return NextResponse.json({ error: 'Матч уже начался — прогноз закрыт.' }, { status: 400 })
  if (team !== match.teamA && team !== match.teamB) return NextResponse.json({ error: 'Некорректная команда.' }, { status: 400 })

  const existing = db.predictions.find((item) => item.userId === user.id && item.matchId === matchId)
  if (existing) {
    existing.team = team
    existing.placedAt = Date.now()
    existing.status = 'PENDING'
    existing.settledAt = undefined
  } else {
    db.predictions.push({ id: randomUUID(), userId: user.id, matchId, team, placedAt: Date.now(), status: 'PENDING', reward: 100 })
  }
  await writeDb(db)
  return NextResponse.json({ ok: true })
}
