import { NextRequest, NextResponse } from 'next/server'
import { authFromRequest } from '@/lib/server/auth'
import { createId, DotaPosition, writeDb } from '@/lib/server/db'

const validPositions = new Set<DotaPosition>(['1','2','3','4','5','SUB'])

export async function POST(request: NextRequest, context: { params: Promise<{ id:string }> }) {
  const { id } = await context.params
  const { db, user } = await authFromRequest(request)
  if (!user) return NextResponse.json({ error:'Сначала войди.' }, { status:401 })
  const team = db.teams.find((item)=>item.id===id)
  if (!team) return NextResponse.json({ error:'Команда не найдена.' }, { status:404 })
  const body = await request.json().catch(()=>({}))
  const action = String(body.action || '')

  if (action === 'respondInvite') {
    const invite = db.teamInvites.find((item)=>item.id===String(body.inviteId) && item.toUserId===user.id && item.status==='PENDING')
    if (!invite) return NextResponse.json({ error:'Приглашение не найдено.' }, { status:404 })
    const accept = Boolean(body.accept)
    if (accept) {
      if (db.teamMembers.some((member)=>member.userId===user.id)) return NextResponse.json({ error:'Ты уже состоишь в другой команде.' }, { status:400 })
      invite.status='ACCEPTED'
      db.teamMembers.push({ id:createId(), teamId:invite.teamId, userId:user.id, position:invite.position, joinedAt:Date.now() })
      db.teamInvites.filter((item)=>item.toUserId===user.id && item.status==='PENDING' && item.id!==invite.id).forEach((item)=>item.status='REJECTED')
      db.teamJoinRequests.filter((item)=>item.userId===user.id && item.status==='PENDING').forEach((item)=>item.status='REJECTED')
      if (user.role==='VIEWER') user.role='PLAYER'
    } else invite.status='REJECTED'
    await writeDb(db)
    return NextResponse.json({ ok:true })
  }

  if (team.captainUserId !== user.id) return NextResponse.json({ error:'Это действие доступно только капитану.' }, { status:403 })

  if (action === 'respondRequest') {
    const requestItem = db.teamJoinRequests.find((item)=>item.id===String(body.requestId) && item.teamId===id && item.status==='PENDING')
    if (!requestItem) return NextResponse.json({ error:'Заявка не найдена.' }, { status:404 })
    const accept = Boolean(body.accept)
    if (accept) {
      if (db.teamMembers.some((member)=>member.userId===requestItem.userId)) return NextResponse.json({ error:'Игрок уже состоит в другой команде.' }, { status:400 })
      requestItem.status='ACCEPTED'
      db.teamMembers.push({ id:createId(), teamId:id, userId:requestItem.userId, position:requestItem.position, joinedAt:Date.now() })
      db.teamInvites.filter((item)=>item.toUserId===requestItem.userId && item.status==='PENDING').forEach((item)=>item.status='REJECTED')
      db.teamJoinRequests.filter((item)=>item.userId===requestItem.userId && item.status==='PENDING' && item.id!==requestItem.id).forEach((item)=>item.status='REJECTED')
      const target = db.users.find((candidate)=>candidate.id===requestItem.userId)
      if (target?.role==='VIEWER') target.role='PLAYER'
    } else requestItem.status='REJECTED'
    await writeDb(db)
    return NextResponse.json({ ok:true })
  }

  if (action === 'removeMember') {
    const userId = String(body.userId || '')
    if (userId === user.id) return NextResponse.json({ error:'Капитан не может удалить себя. Передача капитана будет отдельным этапом.' }, { status:400 })
    db.teamMembers = db.teamMembers.filter((member)=>!(member.teamId===id && member.userId===userId))
    await writeDb(db)
    return NextResponse.json({ ok:true })
  }

  if (action === 'changePosition') {
    const userId = String(body.userId || '')
    const position = String(body.position || '') as DotaPosition
    if (!validPositions.has(position)) return NextResponse.json({ error:'Некорректная позиция.' }, { status:400 })
    const member = db.teamMembers.find((item)=>item.teamId===id && item.userId===userId)
    if (!member) return NextResponse.json({ error:'Игрок не найден в составе.' }, { status:404 })
    if (position !== 'SUB' && db.teamMembers.some((item)=>item.teamId===id && item.userId!==userId && item.position===position)) return NextResponse.json({ error:`Позиция ${position} уже занята.` }, { status:400 })
    member.position=position
    await writeDb(db)
    return NextResponse.json({ ok:true })
  }

  return NextResponse.json({ error:'Неизвестное действие.' }, { status:400 })
}
