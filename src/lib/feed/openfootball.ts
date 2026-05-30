import { canonicalTeamName, isKnownTeam } from '@/lib/teamsData'
import {
  ROUND_ORDER,
  type FeedSource,
  type ParsedFixture,
  type RoundSlug,
} from './types'

const DEFAULT_FEED_URL =
  'https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json'

// Shape of openfootball's worldcup.json matches (only the fields we use).
interface RawMatch {
  round: string // "Matchday 1" | "Round of 32" | "Final" | ...
  num?: number
  date: string // "2026-06-11"
  time: string // "13:00 UTC-6" (offset varies by venue) or bare "19:00"
  team1: string
  team2: string
  group?: string // "Group A" (group stage only)
  ground?: string
  score?: { ft?: [number, number] }
}

interface RawFeed {
  name: string
  matches: RawMatch[]
}

// "Match for third place" etc. → our round slugs.
function normaliseRound(round: string): RoundSlug {
  if (round.startsWith('Matchday')) return 'group'
  switch (round) {
    case 'Round of 32':
      return 'round_of_32'
    case 'Round of 16':
      return 'round_of_16'
    case 'Quarter-final':
      return 'quarter_final'
    case 'Semi-final':
      return 'semi_final'
    case 'Match for third place':
      return 'third_place'
    case 'Final':
      return 'final'
    default:
      // Unknown round label — treat as final-stage so it still surfaces.
      throw new Error(`Unrecognised round label from feed: "${round}"`)
  }
}

function matchdayFromRound(round: string): number | null {
  const m = round.match(/^Matchday\s+(\d+)$/)
  return m ? Number(m[1]) : null
}

// Combine "2026-06-11" + "13:00 UTC-6" into a true UTC Date.
// Host cities span UTC-4..UTC-7, so the offset must be read per match.
export function parseKickoffUtc(date: string, time: string): Date {
  const [datePart, offsetPart] = time.trim().split(/\s+/)
  const [hh, mm] = datePart.split(':').map(Number)
  const [Y, M, D] = date.split('-').map(Number)

  let offsetMinutes = 0
  if (offsetPart) {
    const off = offsetPart.match(/UTC([+-]\d{1,2})(?::?(\d{2}))?/i)
    if (off) {
      const sign = off[1].startsWith('-') ? -1 : 1
      const oh = Math.abs(Number(off[1]))
      const om = off[2] ? Number(off[2]) : 0
      offsetMinutes = sign * (oh * 60 + om)
    }
  }

  // Date.UTC treats the wall-clock as UTC; subtract the zone offset to get real UTC.
  const utcMs = Date.UTC(Y, M - 1, D, hh, mm) - offsetMinutes * 60_000
  return new Date(utcMs)
}

function stableFeedKey(raw: RawMatch, round: RoundSlug): string {
  // Group matches have fixed real teams (stable composite key).
  // Knockout matches keep a stable `num` even while team1/team2 are placeholders.
  if (round === 'group') {
    return `g|${raw.date}|${raw.team1}|${raw.team2}`
  }
  if (typeof raw.num === 'number') return `m${raw.num}`
  return `k|${round}|${raw.date}|${raw.team1}|${raw.team2}`
}

function toParsedFixture(raw: RawMatch): ParsedFixture {
  const round = normaliseRound(raw.round)
  const teamA = canonicalTeamName(raw.team1)
  const teamB = canonicalTeamName(raw.team2)
  const ft = raw.score?.ft
  const completed =
    Array.isArray(ft) && typeof ft[0] === 'number' && typeof ft[1] === 'number'

  return {
    feedKey: stableFeedKey(raw, round),
    round,
    roundOrder: ROUND_ORDER[round],
    matchday: matchdayFromRound(raw.round),
    group: raw.group ?? null,
    teamA,
    teamB,
    teamAIsTeam: isKnownTeam(teamA),
    teamBIsTeam: isKnownTeam(teamB),
    kickoffUtc: parseKickoffUtc(raw.date, raw.time),
    ground: raw.ground ?? null,
    status: completed ? 'completed' : 'scheduled',
    scoreA: completed ? ft![0] : null,
    scoreB: completed ? ft![1] : null,
  }
}

export const openFootballSource: FeedSource = {
  name: 'openfootball',
  async fetchFixtures(): Promise<ParsedFixture[]> {
    const url = process.env.WORLDCUP_FEED_URL || DEFAULT_FEED_URL
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    })
    if (!res.ok) {
      throw new Error(`Feed fetch failed: ${res.status} ${res.statusText}`)
    }
    const data = (await res.json()) as RawFeed
    if (!data?.matches?.length) {
      throw new Error('Feed returned no matches')
    }
    return data.matches.map(toParsedFixture)
  },
}
