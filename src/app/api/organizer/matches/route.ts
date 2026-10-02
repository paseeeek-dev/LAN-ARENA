import { NextRequest, NextResponse } from 'next/server'
import { authFromRequest, isOrganizer } from '@/lib/server/auth'
import { settleMatch, writeDb } from '@/lib/server/db'

export async function PATCH(request: NextRequest) {
  const { db, user } = authFromRequest(request)
  if (!isOrganizer(user)) return NextResponse.json({ error: 'Нет доступа.' }, { status: 403 })
  const body = await request.json().catch(() => ({}))
  const matchId = Number(body.matchId)
  const winner = body.winner === null ? null : String(body.winner || '')
  const match = db.matches.find((item) => item.id === matchId)
  if (!match) return NextResponse.json({ error: 'Матч не найден.' }, { status: 404 })
  if (winner !== null && winner !== match.teamA && winner !== match.teamB) return NextResponse.json({ error: 'Некорректный победитель.' }, { status: 400 })
  settleMatch(db, matchId, winner)
  writeDb(db)
  return NextResponse.json({ ok: true })
}
