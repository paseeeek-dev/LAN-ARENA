import { NextRequest, NextResponse } from 'next/server'
import { authFromRequest } from '@/lib/server/auth'
import { readDb, teamView, tournamentView } from '@/lib/server/db'

export async function GET(request: NextRequest, context:{params:Promise<{id:string}>}) {
  const { id } = await context.params
  const { user } = await authFromRequest(request)
  const db = await readDb()
  const tournament = db.tournaments.find((t)=>t.id===id)
  if (!tournament) return NextResponse.json({error:'Турнир не найден.'},{status:404})
  const membership = user ? db.teamMembers.find((m)=>m.userId===user.id) || null : null
  const myTeam = membership ? db.teams.find((t)=>t.id===membership.teamId) || null : null
  const myRegistration = myTeam ? db.tournamentRegistrations.find((r)=>r.tournamentId===id && r.teamId===myTeam.id) || null : null
  const registrations = db.tournamentRegistrations
    .filter((r)=>r.tournamentId===id && r.status==='APPROVED')
    .map((r)=>({ ...r, team: db.teams.find((t)=>t.id===r.teamId) ? teamView(db, db.teams.find((t)=>t.id===r.teamId)!) : null }))
  return NextResponse.json({ tournament:tournamentView(db,tournament), myTeam:myTeam?teamView(db,myTeam):null, myRegistration, registrations })
}
