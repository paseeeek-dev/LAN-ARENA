import { NextRequest, NextResponse } from 'next/server'
import { authFromRequest } from '@/lib/server/auth'
import { readDb, teamView } from '@/lib/server/db'

export async function GET(request: NextRequest, context: { params: Promise<{ id:string }> }) {
  const { id } = await context.params
  const { user } = await authFromRequest(request)
  const db = await readDb()
  const team = db.teams.find((item) => item.id === id)
  if (!team) return NextResponse.json({ error:'Команда не найдена.' }, { status:404 })
  const isCaptain = user?.id === team.captainUserId
  const myMembership = user ? db.teamMembers.find((member)=>member.userId===user.id) || null : null
  const myRequest = user ? db.teamJoinRequests.find((item)=>item.teamId===id && item.userId===user.id && item.status==='PENDING') || null : null
  const requests = isCaptain ? db.teamJoinRequests.filter((item)=>item.teamId===id && item.status==='PENDING').map((item)=>({ ...item, user:db.users.find((u)=>u.id===item.userId) ? { id:db.users.find((u)=>u.id===item.userId)!.id, username:db.users.find((u)=>u.id===item.userId)!.username } : null })) : []
  return NextResponse.json({ team:teamView(db, team), isCaptain, myMembership, myRequest, requests })
}
