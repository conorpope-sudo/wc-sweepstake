import { type FeedSource } from './types'

// football-data.org fallback — DOCUMENTED STUB (not yet implemented).
//
// openfootball provides the full 2026 schedule and is the primary source, so
// this is a redundancy hook to wire up only if openfootball proves unreliable
// closer to the tournament.
//
// To implement:
//   1. Get a free API key at https://www.football-data.org and set
//      FOOTBALL_DATA_API_KEY in the environment.
//   2. Fetch competition WC matches (X-Auth-Token header).
//   3. Map their team names to ours via canonicalTeamName (extend the alias map
//      in teamsData.ts as needed), convert UTC kickoff strings, and return
//      ParsedFixture[] in the same shape as openFootballSource.
export const footballDataSource: FeedSource = {
  name: 'football-data.org',
  async fetchFixtures() {
    throw new Error(
      'football-data.org fallback is not implemented yet (documented stub). ' +
        'Set up the adapter and FOOTBALL_DATA_API_KEY to enable it.',
    )
  },
}
