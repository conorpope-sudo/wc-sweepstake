import teamsJson from '../../world-cup-2026-teams.json'

export interface TeamMeta {
  name: string
  group: string
  manager: string
  starPlayer: string
  funFact: string
  politicalLeaning: string
  democracyStatus: string
}

// Editorial team data, sourced from world-cup-2026-teams.json.
export const TEAMS: TeamMeta[] = teamsJson.teams.map((t) => ({
  name: t.name,
  group: t.group,
  manager: t.manager,
  starPlayer: t.starPlayer,
  funFact: t.funFact,
  politicalLeaning: t.politicalLeaning,
  democracyStatus: t.democracyStatus,
}))

export const TEAM_NAMES: ReadonlySet<string> = new Set(TEAMS.map((t) => t.name))

// Feed team name → our canonical name.
//
// Verified empirically against the openfootball 2026 feed: only the first three
// actually differ today. The rest are included defensively in case the feed
// changes its naming convention (the teams.json comment predicted some of these).
const FEED_NAME_ALIASES: Record<string, string> = {
  'Bosnia & Herzegovina': 'Bosnia and Herzegovina',
  'Czech Republic': 'Czechia',
  Turkey: 'Türkiye',
  // Defensive extras (not currently emitted by the feed):
  'Korea Republic': 'South Korea',
  'IR Iran': 'Iran',
  'United States': 'USA',
  "Côte d'Ivoire": 'Ivory Coast',
}

export function canonicalTeamName(feedName: string): string {
  const trimmed = feedName.trim()
  return FEED_NAME_ALIASES[trimmed] ?? trimmed
}

export function isKnownTeam(name: string): boolean {
  return TEAM_NAMES.has(name)
}

export function getTeamMeta(name: string): TeamMeta | undefined {
  return TEAMS.find((t) => t.name === name)
}
