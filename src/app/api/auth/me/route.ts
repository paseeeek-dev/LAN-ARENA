import { NextRequest, NextResponse } from 'next/server'
import { authFromRequest, publicUser } from '@/lib/server/auth'

export async function GET(request: NextRequest) {
  const { user } = authFromRequest(request)
  return NextResponse.json({ user: user ? publicUser(user) : null })
}
