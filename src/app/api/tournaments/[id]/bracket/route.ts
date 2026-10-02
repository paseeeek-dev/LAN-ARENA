import { NextResponse } from 'next/server'
import { readDb } from '@/lib/server/db'
import { bracketView } from '@/lib/server/bracket'

export async function GET(_:Request,context:{params:Promise<{id:string}>}){
  const {id}=await context.params
  const db=await readDb()
  if(!db.tournaments.some(t=>t.id===id))return NextResponse.json({error:'Турнир не найден.'},{status:404})
  return NextResponse.json(bracketView(db,id))
}
