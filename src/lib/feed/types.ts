// Normalised fixture as produced by any feed source, before it hits the DB.
export interface ParsedFixture {
  feedKey: string // stable identity for upsert
  round: RoundSlug
  roundOrder: number
  matchday: number | null // group stage only
  group: string | null // group stage only, e.g. "Group A"
  teamA: string // canonical team name OR placeholder label (e.g. "2A")
  teamB: string
  teamAIsTeam: boolean // true when teamA maps to a known team
  teamBIsTeam: boolean
  kickoffUtc: Date
  ground: string | null
  status: 'scheduled' | 'completed'
  scoreA: number | null
  scoreB: number | null
}

export type RoundSlug =
  | 'group'
  | 'round_of_32'
  | 'round_of_16'
  | 'quarter_final'
  | 'semi_final'
  | 'third_place'
  | 'final'

export const ROUND_ORDER: Record<RoundSlug, number> = {
  group: 0,
  round_of_32: 1,
  round_of_16: 2,
  quarter_final: 3,
  semi_final: 4,
  third_place: 5,
  final: 6,
}

export interface FeedSource {
  readonly name: string
  fetchFixtures(): Promise<ParsedFixture[]>
}
