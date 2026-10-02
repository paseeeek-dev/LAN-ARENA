import { NextRequest, NextResponse } from 'next/server'
import { authFromRequest } from '@/lib/server/auth'
import { createId, DotaPosition, readDb, teamView, writeDb } from '@/lib/server/db'

const validPositions = new Set<DotaPosition>(['1','2','3','4','5','SUB'])

export async function GET(request: NextRequest) {
  const { user } = authFromRequest(request)
  const db = readDb()
  const teams = db.teams.map((team) => teamView(db, team))
  const myMembership = user ? db.teamMembers.find((member) => member.userId === user.id) || null : null
  const invites = user ? db.teamInvites.filter((invite) => invite.toUserId === user.id && invite.status === 'PENDING').map((invite) => ({ ...invite, team:db.teams.find((t)=>t.id===invite.teamId) })) : []
  return NextResponse.json({ teams, myMembership, invites })
}

export async function POST(request: NextRequest) {
  const { db, user } = authFromRequest(request)
  if (!user) return NextResponse.json({ error:'Сначала войди в аккаунт.' }, { status:401 })
  if (db.teamMembers.some((member) => member.userId === user.id)) return NextResponse.json({ error:'Ты уже состоишь в команде.' }, { status:400 })

  const body = await request.json().catch(()=>({}))
  const name = String(body.name || '').trim()
  const tag = String(body.tag || '').trim().toUpperCase()
  const country = String(body.country || 'Россия').trim()
  const description = String(body.description || '').trim()
  const position = String(body.position || '5') as DotaPosition
  if (name.length < 2 || name.length > 40) return NextResponse.json({ error:'Название команды: от 2 до 40 символов.' }, { status:400 })
  if (!tag || tag.length > 8) return NextResponse.json({ error:'Тег команды: от 1 до 8 символов.' }, { status:400 })
  if (!validPositions.has(position)) return NextResponse.json({ error:'Некорректная позиция.' }, { status:400 })
  if (db.teams.some((team) => team.name.toLowerCase() === name.toLowerCase() || team.tag.toLowerCase() === tag.toLowerCase())) return NextResponse.json({ error:'Команда с таким названием или тегом уже существует.' }, { status:409 })

  const team = { id:createId(), name, tag, game:'Dota 2', country, description, captainUserId:user.id, createdAt:Date.now() }
  db.teams.push(team)
  db.teamMembers.push({ id:createId(), teamId:team.id, userId:user.id, position, joinedAt:Date.now() })
  if (user.role === 'VIEWER') user.role = 'PLAYER'
  writeDb(db)
  return NextResponse.json({ team:teamView(db, team) }, { status:201 })
}
