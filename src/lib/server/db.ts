import 'server-only'
import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'crypto'
import { mkdirSync, existsSync, readFileSync, writeFileSync } from 'fs'
import path from 'path'
import { getStore } from '@netlify/blobs'

export type Role = 'VIEWER' | 'PLAYER' | 'ADMIN' | 'ORGANIZER'
export type DotaPosition = '1' | '2' | '3' | '4' | '5' | 'SUB'
export type TournamentStatus = 'REGISTRATION' | 'UPCOMING' | 'LIVE' | 'FINISHED'
export type RegistrationStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type CheckInStatus = 'NOT_CHECKED_IN' | 'CHECKED_IN'
export type BracketMatchStatus = 'WAITING' | 'READY' | 'FINISHED'

export type UserRecord = {
  id: string
  username: string
  email: string
  passwordHash: string
  role: Role
  points: number
  createdAt: number
}

export type MatchRecord = {
  id: number
  teamA: string
  teamB: string
  event: string
  startAt: number
  endAt: number
  communityA: number
  communityB: number
  winner: string | null
}

export type PredictionRecord = {
  id: string
  userId: string
  matchId: number
  team: string
  placedAt: number
  status: 'PENDING' | 'WON' | 'LOST'
  reward: number
  settledAt?: number
}

export type ApplicationRecord = {
  id: number
  team: string
  event: string
  status: RegistrationStatus
}

export type TeamRecord = {
  id: string
  name: string
  tag: string
  game: string
  country: string
  description: string
  captainUserId: string
  createdAt: number
}

export type TeamMemberRecord = {
  id: string
  teamId: string
  userId: string
  position: DotaPosition
  joinedAt: number
}

export type TeamInviteRecord = {
  id: string
  teamId: string
  fromUserId: string
  toUserId: string
  position: DotaPosition
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
  createdAt: number
}

export type TeamJoinRequestRecord = {
  id: string
  teamId: string
  userId: string
  position: DotaPosition
  message: string
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
  createdAt: number
}

export type TournamentRecord = {
  id: string
  name: string
  game: string
  city: string
  venue: string
  startAt: number
  registrationDeadline: number
  teamLimit: number
  format: string
  prizePool: string
  status: TournamentStatus
  description: string
}

export type TournamentRegistrationRecord = {
  id: string
  tournamentId: string
  teamId: string
  submittedBy: string
  status: RegistrationStatus
  checkIn: CheckInStatus
  createdAt: number
}


export type TournamentBracketMatchRecord = {
  id: string
  tournamentId: string
  round: number
  roundLabel: string
  slot: number
  teamAId: string | null
  teamBId: string | null
  scoreA: number
  scoreB: number
  winnerTeamId: string | null
  sourceAId: string | null
  sourceBId: string | null
  nextMatchId: string | null
  nextSlot: 'A' | 'B' | null
  status: BracketMatchStatus
  createdAt: number
}

type SessionRecord = {
  token: string
  userId: string
  expiresAt: number
}

export type DbShape = {
  users: UserRecord[]
  matches: MatchRecord[]
  predictions: PredictionRecord[]
  applications: ApplicationRecord[]
  sessions: SessionRecord[]
  teams: TeamRecord[]
  teamMembers: TeamMemberRecord[]
  teamInvites: TeamInviteRecord[]
  teamJoinRequests: TeamJoinRequestRecord[]
  tournaments: TournamentRecord[]
  tournamentRegistrations: TournamentRegistrationRecord[]
  tournamentBracketMatches: TournamentBracketMatchRecord[]
}

const DATA_DIR = path.join(process.cwd(), 'data')
const DATA_FILE = path.join(DATA_DIR, 'lan-arena.json')
const IS_NETLIFY = Boolean(process.env.NETLIFY || process.env.SITE_ID || process.env.NETLIFY_BLOBS_CONTEXT)
const BLOB_STORE = 'lan-arena-db'
const BLOB_KEY = 'state'

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.trim().toLowerCase() || 'admin@lanarena.ru'

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, stored: string) {
  const [salt, originalHex] = stored.split(':')
  if (!salt || !originalHex) return false
  const original = Buffer.from(originalHex, 'hex')
  const candidate = scryptSync(password, salt, 64)
  return original.length === candidate.length && timingSafeEqual(original, candidate)
}

function seedDb(): DbShape {
  const now = Date.now()
  const minute = 60_000
  const day = 24 * 60 * minute
  return {
    users: [],
    matches: [
      { id: 1, teamA: 'Team Phoenix', teamB: 'Void Five', event: 'Moscow Dota LAN Cup', startAt: now + 8 * minute, endAt: now + 78 * minute, communityA: 62, communityB: 38, winner: null },
      { id: 2, teamA: 'Northern Wolves', teamB: 'Cyber Bears', event: 'Northern Clash', startAt: now + 105 * minute, endAt: now + 175 * minute, communityA: 47, communityB: 53, winner: null },
      { id: 3, teamA: 'Red Dragons', teamB: 'Team Aurora', event: 'Weekend Championship', startAt: now + 26 * 60 * minute, endAt: now + 27 * 60 * minute + 10 * minute, communityA: 55, communityB: 45, winner: null },
    ],
    predictions: [],
    applications: [],
    sessions: [],
    teams: [],
    teamMembers: [],
    teamInvites: [],
    teamJoinRequests: [],
    tournaments: [
      { id:'moscow-dota-lan-cup', name:'Moscow Dota LAN Cup', game:'Dota 2', city:'Москва', venue:'Cyber Arena Moscow', startAt:now + 5*day, registrationDeadline:now + 3*day, teamLimit:16, format:'Double Elimination · BO3', prizePool:'150 000 ₽', status:'REGISTRATION', description:'Основной Dota 2 LAN-турнир платформы с офлайн-финалом и double elimination сеткой.' },
      { id:'northern-clash', name:'Northern Clash', game:'Dota 2', city:'Санкт-Петербург', venue:'North Esports Hall', startAt:now + 12*day, registrationDeadline:now + 9*day, teamLimit:8, format:'Groups + Playoffs', prizePool:'80 000 ₽', status:'REGISTRATION', description:'Камерный LAN на 8 команд с групповой стадией и плей-офф.' },
      { id:'valorant-arena-weekend', name:'Valorant Arena Weekend', game:'Valorant', city:'Казань', venue:'Arena Hall', startAt:now + 18*day, registrationDeadline:now + 14*day, teamLimit:16, format:'Single Elimination', prizePool:'100 000 ₽', status:'UPCOMING', description:'Отдельная дисциплина платформы для демонстрации мультигейминговой архитектуры.' },
    ],
    tournamentRegistrations: [],
    tournamentBracketMatches: [],
  }
}

function ensureDb() {
  mkdirSync(DATA_DIR, { recursive: true })
  if (!existsSync(DATA_FILE)) writeFileSync(DATA_FILE, JSON.stringify(seedDb(), null, 2), 'utf8')
}

function migrateDb(parsed: DbShape) {
  parsed.users ||= []
  parsed.matches ||= []
  parsed.predictions ||= []
  parsed.applications ||= []
  parsed.sessions ||= []
  parsed.teams ||= []
  parsed.teamMembers ||= []
  parsed.teamInvites ||= []
  parsed.teamJoinRequests ||= []
  parsed.tournaments ||= []
  parsed.tournamentRegistrations ||= []
  parsed.tournamentBracketMatches ||= []

  for (const team of parsed.teams) {
    if (typeof team.description !== 'string') team.description = ''
    const hasCaptainMember = parsed.teamMembers.some((m) => m.teamId === team.id && m.userId === team.captainUserId)
    const captainExists = parsed.users.some((u) => u.id === team.captainUserId)
    if (!hasCaptainMember && captainExists) {
      parsed.teamMembers.push({ id:randomUUID(), teamId:team.id, userId:team.captainUserId, position:'5', joinedAt:team.createdAt || Date.now() })
    }
  }

  if (parsed.tournaments.length === 0) {
    const seeded = seedDb()
    parsed.tournaments = seeded.tournaments
  }

  return parsed
}

export async function readDb(): Promise<DbShape> {
  if (IS_NETLIFY) {
    const store = getStore({ name: BLOB_STORE, consistency: 'strong' })
    const existing = await store.get(BLOB_KEY, { type: 'json', consistency: 'strong' }) as DbShape | null
    if (existing) return migrateDb(existing)

    const fresh = seedDb()
    await store.setJSON(BLOB_KEY, fresh)
    return fresh
  }

  ensureDb()
  try {
    return migrateDb(JSON.parse(readFileSync(DATA_FILE, 'utf8')) as DbShape)
  } catch {
    const fresh = seedDb()
    await writeDb(fresh)
    return fresh
  }
}

export async function writeDb(db: DbShape): Promise<void> {
  if (IS_NETLIFY) {
    const store = getStore({ name: BLOB_STORE, consistency: 'strong' })
    await store.setJSON(BLOB_KEY, db)
    return
  }

  mkdirSync(DATA_DIR, { recursive: true })
  const tmp = `${DATA_FILE}.tmp`
  writeFileSync(tmp, JSON.stringify(db, null, 2), 'utf8')
  writeFileSync(DATA_FILE, readFileSync(tmp))
}

export function publicUser(user: UserRecord) {
  return { id:user.id, username:user.username, email:user.email, role:user.role, points:user.points, createdAt:user.createdAt }
}

export function createSession(db: DbShape, userId: string) {
  const token = randomBytes(32).toString('hex')
  const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 14
  db.sessions = db.sessions.filter((session) => session.expiresAt > Date.now())
  db.sessions.push({ token, userId, expiresAt })
  return { token, expiresAt }
}

export function findUserBySession(db: DbShape, token?: string | null) {
  if (!token) return null
  const session = db.sessions.find((item) => item.token === token && item.expiresAt > Date.now())
  if (!session) return null
  return db.users.find((user) => user.id === session.userId) || null
}

export function removeSession(db: DbShape, token?: string | null) {
  if (!token) return
  db.sessions = db.sessions.filter((session) => session.token !== token)
}

export function createUserId() { return randomUUID() }
export function createId() { return randomUUID() }

export function settleMatch(db: DbShape, matchId: number, winner: string | null) {
  const match = db.matches.find((item) => item.id === matchId)
  if (!match) return false
  match.winner = winner
  if (!winner) {
    db.predictions = db.predictions.map((prediction) => {
      if (prediction.matchId !== matchId || prediction.status === 'PENDING') return prediction
      const user = db.users.find((item) => item.id === prediction.userId)
      if (user && prediction.status === 'WON') user.points = Math.max(0, user.points - prediction.reward)
      return { ...prediction, status:'PENDING', settledAt:undefined }
    })
    return true
  }
  for (const prediction of db.predictions) {
    if (prediction.matchId !== matchId || prediction.status !== 'PENDING') continue
    prediction.status = prediction.team === winner ? 'WON' : 'LOST'
    prediction.settledAt = Date.now()
    if (prediction.status === 'WON') {
      const user = db.users.find((item) => item.id === prediction.userId)
      if (user) user.points += prediction.reward
    }
  }
  return true
}

export function teamView(db: DbShape, team: TeamRecord) {
  const members = db.teamMembers
    .filter((member) => member.teamId === team.id)
    .map((member) => {
      const found = db.users.find((user) => user.id === member.userId)
      return {
        ...member,
        user: found ? publicUser(found) : { id:member.userId, username:'Unknown player', email:'', role:'PLAYER', points:0, createdAt:0 },
        isCaptain: member.userId === team.captainUserId,
      }
    })
  return { ...team, members }
}

export function tournamentView(db: DbShape, tournament: TournamentRecord) {
  const registrations = db.tournamentRegistrations.filter((r) => r.tournamentId === tournament.id)
  const approved = registrations.filter((r) => r.status === 'APPROVED')
  return {
    ...tournament,
    registrationCount: registrations.length,
    approvedCount: approved.length,
    spotsLeft: Math.max(0, tournament.teamLimit - approved.length),
  }
}
