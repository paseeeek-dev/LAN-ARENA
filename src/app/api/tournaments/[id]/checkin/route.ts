import { NextRequest, NextResponse } from 'next/server'
import { authFromRequest } from '@/lib/server/auth'
import { writeDb } from '@/lib/server/db'

export async function POST(request:NextRequest, context:{params:Promise<{id:string}>}) {
  const { id } = await context.params
  const { db, user } = authFromRequest(request)
  if (!user) return NextResponse.json({error:'Сначала войди.'},{status:401})
  const membership = db.teamMembers.find((m)=>m.userId===user.id)
  if (!membership) return NextResponse.json({error:'Ты не состоишь в команде.'},{status:400})
  const team = db.teams.find((t)=>t.id===membership.teamId)
  if (!team || team.captainUserId!==user.id) return NextResponse.json({error:'Check-in доступен только капитану.'},{status:403})
  const registration = db.tournamentRegistrations.find((r)=>r.tournamentId===id && r.teamId===team.id)
  if (!registration) return NextResponse.json({error:'Команда не зарегистрирована.'},{status:404})
  if (registration.status!=='APPROVED') return NextResponse.json({error:'Сначала организатор должен одобрить заявку.'},{status:400})
  registration.checkIn='CHECKED_IN'
  writeDb(db)
  return NextResponse.json({ok:true})
}
