import { NextRequest,NextResponse } from 'next/server'
import { authFromRequest } from '@/lib/server/auth'
import { bracketView,generateBracket,resetBracket,setBracketResult } from '@/lib/server/bracket'
import { writeDb } from '@/lib/server/db'

function allowed(user:any){return user&&(user.role==='ADMIN'||user.role==='ORGANIZER')}

export async function GET(request:NextRequest){
  const {db,user}=await authFromRequest(request)
  if(!allowed(user))return NextResponse.json({error:'Нет доступа.'},{status:403})
  const tournamentId=request.nextUrl.searchParams.get('tournamentId')||''
  return NextResponse.json(bracketView(db,tournamentId))
}

export async function POST(request:NextRequest){
  const {db,user}=await authFromRequest(request)
  if(!allowed(user))return NextResponse.json({error:'Нет доступа.'},{status:403})
  const body=await request.json().catch(()=>({}))
  const tournamentId=String(body.tournamentId||'')
  try{
    generateBracket(db,tournamentId)
    const tournament=db.tournaments.find(t=>t.id===tournamentId)
    if(tournament&&tournament.status==='REGISTRATION')tournament.status='UPCOMING'
    await writeDb(db)
    return NextResponse.json({ok:true,...bracketView(db,tournamentId)})
  }catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Не удалось создать сетку.'},{status:400})}
}

export async function PATCH(request:NextRequest){
  const {db,user}=await authFromRequest(request)
  if(!allowed(user))return NextResponse.json({error:'Нет доступа.'},{status:403})
  const body=await request.json().catch(()=>({}))
  const tournamentId=String(body.tournamentId||''),matchId=String(body.matchId||'')
  try{
    setBracketResult(db,tournamentId,matchId,Number(body.scoreA),Number(body.scoreB))
    const final=db.tournamentBracketMatches.find(m=>m.tournamentId===tournamentId&&!m.nextMatchId)
    const tournament=db.tournaments.find(t=>t.id===tournamentId)
    if(tournament&&tournament.status==='UPCOMING')tournament.status='LIVE'
    if(tournament&&final?.status==='FINISHED'&&final.winnerTeamId)tournament.status='FINISHED'
    await writeDb(db)
    return NextResponse.json({ok:true,...bracketView(db,tournamentId)})
  }catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Не удалось сохранить результат.'},{status:400})}
}

export async function DELETE(request:NextRequest){
  const {db,user}=await authFromRequest(request)
  if(!allowed(user))return NextResponse.json({error:'Нет доступа.'},{status:403})
  const tournamentId=request.nextUrl.searchParams.get('tournamentId')||''
  resetBracket(db,tournamentId);await writeDb(db)
  return NextResponse.json({ok:true})
}
