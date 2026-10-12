import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_EMAIL, adminConfigured, createSession, publicUser, readDb, upsertAdmin, verifyAdminPassword, verifyPassword, writeDb } from '@/lib/server/db'
import { SESSION_COOKIE } from '@/lib/server/auth'

export async function POST(request:NextRequest){
  try{
    const body=await request.json().catch(()=>({}))
    const login=String(body.login||'').trim().toLowerCase()
    const password=String(body.password||'')
    if(!login||!password)return NextResponse.json({error:'Заполни логин и пароль.'},{status:400})
    const db=await readDb()
    let user
    if(login===ADMIN_EMAIL){
      if(!adminConfigured())return NextResponse.json({error:'Администратор не настроен на сервере.'},{status:503})
      if(!verifyAdminPassword(password))return NextResponse.json({error:'Неверный логин или пароль.'},{status:401})
      user=upsertAdmin(db,password)
    }else{
      user=db.users.find(u=>u.email.toLowerCase()===login||u.username.toLowerCase()===login)
      if(!user||!verifyPassword(password,user.passwordHash))return NextResponse.json({error:'Неверный логин или пароль.'},{status:401})
    }
    const session=createSession(db,user.id)
    await writeDb(db)
    const response=NextResponse.json({user:publicUser(user)})
    response.cookies.set(SESSION_COOKIE,session.token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',expires:new Date(session.expiresAt)})
    return response
  }catch(error){console.error('login error',error);return NextResponse.json({error:'Сервер не смог выполнить вход. Проверь DATABASE_URL и переменные Render.'},{status:500})}
}
