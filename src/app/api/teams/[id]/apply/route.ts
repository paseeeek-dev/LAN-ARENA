import { NextRequest, NextResponse } from 'next/server'
import { authFromRequest } from '@/lib/server/auth'
import { createId, DotaPosition, writeDb } from '@/lib/server/db'

const validPositions = new Set<DotaPosition>(['1','2','3','4','5','SUB'])

export async function POST(request: NextRequest, context: { params: Promise<{ id:string }> }) {
  const { id } = await context.params
  const { db, user } = authFromRequest(request)
  if (!user) return NextResponse.json({ error:'Сначала войди.' }, { status:401 })
  const team = db.teams.find((item)=>item.id===id)
  if (!team) return NextResponse.json({ error:'Команда не найдена.' }, { status:404 })
  if (db.teamMembers.some((member)=>member.userId===user.id)) return NextResponse.json({ error:'Ты уже состоишь в команде.' }, { status:400 })
  if (db.teamJoinRequests.some((item)=>item.teamId===id && item.userId===user.id && item.status==='PENDING')) return NextResponse.json({ error:'Заявка уже отправлена.' }, { status:409 })
  const body = await request.json().catch(()=>({}))
  const position = String(body.position || 'SUB') as DotaPosition
  const message = String(body.message || '').trim().slice(0,240)
  if (!validPositions.has(position)) return NextResponse.json({ error:'Некорректная позиция.' }, { status:400 })
  db.teamJoinRequests.push({ id:createId(), teamId:id, userId:user.id, position, message, status:'PENDING', createdAt:Date.now() })
  writeDb(db)
  return NextResponse.json({ ok:true })
}
