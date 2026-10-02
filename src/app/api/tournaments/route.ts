import { NextRequest, NextResponse } from 'next/server'
import { authFromRequest } from '@/lib/server/auth'
import { readDb, tournamentView } from '@/lib/server/db'

export async function GET(request: NextRequest) {
  const { user } = authFromRequest(request)
  const db = readDb()
  const myMembership = user ? db.teamMembers.find((m)=>m.userId===user.id) || null : null
  const tournaments = db.tournaments.map((t)=>{
    const view = tournamentView(db,t)
    const myRegistration = myMembership ? db.tournamentRegistrations.find((r)=>r.tournamentId===t.id && r.teamId===myMembership.teamId) || null : null
    return { ...view, myRegistration }
  })
  return NextResponse.json({ tournaments })
}
