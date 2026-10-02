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
  if (team.captainUserId !== user.id) return NextResponse.json({ error:'Только капитан может приглашать игроков.' }, { status:403 })

  const body = await request.json().catch(()=>({}))
  const query = String(body.player || '').trim().toLowerCase()
  const position = String(body.position || 'SUB') as DotaPosition
  if (!query) return NextResponse.json({ error:'Укажи username или email игрока.' }, { status:400 })
  if (!validPositions.has(position)) return NextResponse.json({ error:'Некорректная позиция.' }, { status:400 })
  const target = db.users.find((candidate)=>candidate.username.toLowerCase()===query || candidate.email.toLowerCase()===query)
  if (!target) return NextResponse.json({ error:'Игрок не найден.' }, { status:404 })
  if (target.id === user.id) return NextResponse.json({ error:'Нельзя пригласить самого себя.' }, { status:400 })
  if (db.teamMembers.some((member)=>member.userId===target.id)) return NextResponse.json({ error:'Этот игрок уже состоит в команде.' }, { status:400 })
  if (db.teamInvites.some((invite)=>invite.teamId===id && invite.toUserId===target.id && invite.status==='PENDING')) return NextResponse.json({ error:'Приглашение уже отправлено.' }, { status:409 })
  db.teamInvites.push({ id:createId(), teamId:id, fromUserId:user.id, toUserId:target.id, position, status:'PENDING', createdAt:Date.now() })
  writeDb(db)
  return NextResponse.json({ ok:true, player:{ id:target.id, username:target.username } })
}
