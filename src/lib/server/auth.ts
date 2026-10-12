import 'server-only'
import { NextRequest } from 'next/server'
import { findUserBySession, publicUser, readDb, UserRecord } from './db'
export const SESSION_COOKIE='lan_arena_session'
export async function authFromRequest(request:NextRequest):Promise<{db:Awaited<ReturnType<typeof readDb>>;user:UserRecord|null}>{const db=await readDb();const token=request.cookies.get(SESSION_COOKIE)?.value;return{db,user:findUserBySession(db,token)}}
export function isOrganizer(user:UserRecord|null){return user?.role==='ADMIN'||user?.role==='ORGANIZER'}
export{publicUser}
