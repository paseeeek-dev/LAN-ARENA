export type LanUser = {
  username: string
  email?: string
  role?: 'VIEWER' | 'PLAYER' | 'ADMIN' | 'ORGANIZER'
  points?: number
}

export type LanAccount = LanUser & {
  password?: string
}

export type DemoMatch = {
  id: number
  teamA: string
  teamB: string
  event: string
  startAt: number
  endAt: number
  communityA: number
  communityB: number
  winner?: string | null
}

export type Prediction = {
  matchId: number
  team: string
  placedAt: number
  status: 'PENDING' | 'WON' | 'LOST'
  reward: number
  settledAt?: number
}

export const USER_KEY = 'lanArenaUser'
export const ACCOUNTS_KEY = 'lanArenaAccounts'
export const MATCHES_KEY = 'lanArenaMatchesV04'

export function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function writeJson(key: string, value: unknown) {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(value))
}

export function userPredictionKey(user: LanUser) {
  return `lanArenaPredictions:${(user.email || user.username).toLowerCase()}`
}

export function ensureDemoMatches(): DemoMatch[] {
  if (typeof window === 'undefined') return []
  const existing = readJson<DemoMatch[]>(MATCHES_KEY, [])
  if (existing.length) return existing

  const now = Date.now()
  const minute = 60_000
  const matches: DemoMatch[] = [
    {
      id: 1,
      teamA: 'Team Phoenix',
      teamB: 'Void Five',
      event: 'Moscow Dota LAN Cup',
      startAt: now + 8 * minute,
      endAt: now + 78 * minute,
      communityA: 62,
      communityB: 38,
      winner: null,
    },
    {
      id: 2,
      teamA: 'Northern Wolves',
      teamB: 'Cyber Bears',
      event: 'Northern Clash',
      startAt: now + 105 * minute,
      endAt: now + 175 * minute,
      communityA: 47,
      communityB: 53,
      winner: null,
    },
    {
      id: 3,
      teamA: 'Red Dragons',
      teamB: 'Team Aurora',
      event: 'Weekend Championship',
      startAt: now + 26 * 60 * minute,
      endAt: now + 27 * 60 * minute + 10 * minute,
      communityA: 55,
      communityB: 45,
      winner: null,
    },
  ]

  writeJson(MATCHES_KEY, matches)
  return matches
}

export function formatClock(ts: number) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(ts))
}

export function matchPhase(match: DemoMatch, now = Date.now()) {
  if (match.winner) return 'FINISHED' as const
  if (now < match.startAt) return 'UPCOMING' as const
  if (now <= match.endAt) return 'LIVE' as const
  return 'AWAITING_RESULT' as const
}

export function syncPredictionSettlement(user: LanUser, matches: DemoMatch[]) {
  const key = userPredictionKey(user)
  const predictions = readJson<Prediction[]>(key, [])
  let changed = false
  let points = user.points ?? 1000

  const next = predictions.map((prediction) => {
    if (prediction.status !== 'PENDING') return prediction
    const match = matches.find((m) => m.id === prediction.matchId)
    if (!match?.winner) return prediction

    changed = true
    const won = match.winner === prediction.team
    if (won) points += prediction.reward
    return {
      ...prediction,
      status: won ? ('WON' as const) : ('LOST' as const),
      settledAt: Date.now(),
    }
  })

  if (changed) {
    writeJson(key, next)
    const updated = { ...user, points }
    writeJson(USER_KEY, updated)
    window.dispatchEvent(new Event('lan-user-changed'))
    window.dispatchEvent(new Event('lan-predictions-changed'))
    return updated
  }

  return user
}
