import { NextRequest, NextResponse } from 'next/server'
import { authFromRequest } from '@/lib/server/auth'
import { createId, writeDb } from '@/lib/server/db'

export async function POST(request:NextRequest, context:{params:Promise<{id:string}>}) {
  const { id } = await context.params
  const { db, user } = await authFromRequest(request)
  if (!user) return NextResponse.json({error:'Сначала войди в аккаунт.'},{status:401})
  const tournament = db.tournaments.find((t)=>t.id===id)
  if (!tournament) return NextResponse.json({error:'Турнир не найден.'},{status:404})
  if (tournament.status!=='REGISTRATION') return NextResponse.json({error:'Регистрация на этот турнир закрыта.'},{status:400})
  if (Date.now()>tournament.registrationDeadline) return NextResponse.json({error:'Дедлайн регистрации уже прошёл.'},{status:400})
  const membership = db.teamMembers.find((m)=>m.userId===user.id)
  if (!membership) return NextResponse.json({error:'Сначала создай команду или вступи в неё.'},{status:400})
  const team = db.teams.find((t)=>t.id===membership.teamId)
  if (!team) return NextResponse.json({error:'Команда не найдена.'},{status:404})
  if (team.captainUserId!==user.id) return NextResponse.json({error:'Заявку на турнир может отправить только капитан.'},{status:403})
  if (db.tournamentRegistrations.some((r)=>r.tournamentId===id && r.teamId===team.id)) return NextResponse.json({error:'Команда уже подала заявку на этот турнир.'},{status:409})
  const members = db.teamMembers.filter((m)=>m.teamId===team.id)
  const filled = new Set(members.filter((m)=>m.position!=='SUB').map((m)=>m.position))
  const missing = ['1','2','3','4','5'].filter((p)=>!filled.has(p as any))
  if (missing.length) return NextResponse.json({error:`Для регистрации нужен полный состав. Не заняты позиции: ${missing.join(', ')}.`},{status:400})
  db.tournamentRegistrations.push({id:createId(),tournamentId:id,teamId:team.id,submittedBy:user.id,status:'PENDING',checkIn:'NOT_CHECKED_IN',createdAt:Date.now()})
  await writeDb(db)
  return NextResponse.json({ok:true})
}
