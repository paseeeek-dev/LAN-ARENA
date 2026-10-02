import { NextRequest, NextResponse } from 'next/server'
import { authFromRequest } from '@/lib/server/auth'
import { writeDb } from '@/lib/server/db'

function allowed(user:any){return user && (user.role==='ADMIN'||user.role==='ORGANIZER')}

export async function GET(request:NextRequest){
  const {db,user}=authFromRequest(request)
  if(!allowed(user)) return NextResponse.json({error:'Нет доступа.'},{status:403})
  const registrations=db.tournamentRegistrations.map((r)=>({
    ...r,
    team:db.teams.find((t)=>t.id===r.teamId)||null,
    tournament:db.tournaments.find((t)=>t.id===r.tournamentId)||null,
  }))
  return NextResponse.json({tournaments:db.tournaments,registrations})
}

export async function PATCH(request:NextRequest){
  const {db,user}=authFromRequest(request)
  if(!allowed(user)) return NextResponse.json({error:'Нет доступа.'},{status:403})
  const body=await request.json().catch(()=>({}))
  const action=String(body.action||'')
  if(action==='registrationStatus'){
    const reg=db.tournamentRegistrations.find((r)=>r.id===String(body.registrationId))
    if(!reg) return NextResponse.json({error:'Заявка не найдена.'},{status:404})
    const status=String(body.status)
    if(!['PENDING','APPROVED','REJECTED'].includes(status)) return NextResponse.json({error:'Некорректный статус.'},{status:400})
    reg.status=status as any
    if(status!=='APPROVED') reg.checkIn='NOT_CHECKED_IN'
  } else if(action==='tournamentStatus'){
    const tournament=db.tournaments.find((t)=>t.id===String(body.tournamentId))
    if(!tournament) return NextResponse.json({error:'Турнир не найден.'},{status:404})
    const status=String(body.status)
    if(!['REGISTRATION','UPCOMING','LIVE','FINISHED'].includes(status)) return NextResponse.json({error:'Некорректный статус.'},{status:400})
    tournament.status=status as any
  } else return NextResponse.json({error:'Неизвестное действие.'},{status:400})
  writeDb(db)
  return NextResponse.json({ok:true})
}
