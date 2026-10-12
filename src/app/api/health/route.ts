import { NextResponse } from 'next/server'
import { readDb } from '@/lib/server/db'
export async function GET(){try{const db=await readDb();return NextResponse.json({ok:true,users:db.users.length})}catch(error){console.error(error);return NextResponse.json({ok:false},{status:500})}}
