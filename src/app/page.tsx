import HeroSection from '@/components/hero/HeroSection'
import EntryFlow from '@/components/entry/EntryFlow'
import TeamOwnersBoard from '@/components/tracker/TeamOwnersBoard'
import TrackerShell from '@/components/tracker/TrackerShell'
import { getEntryCount, ENTRY_CAP } from '@/lib/entries'
import { getTeamOwners, hasDrawRun } from '@/lib/tracker'

// Always read a fresh entry count so the cap state is current on every load.
export const dynamic = 'force-dynamic'

export default async function HomePage() {
  if (await hasDrawRun()) {
    const teamOwners = await getTeamOwners()

    return (
      <TrackerShell eyebrow="The draw is live" title="Teams">
        <TeamOwnersBoard teams={teamOwners} />
      </TrackerShell>
    )
  }

  let initiallyClosed = false
  try {
    initiallyClosed = (await getEntryCount()) >= ENTRY_CAP
  } catch {
    // DB not configured / unreachable yet — show the form; the submit action
    // surfaces a clear error if the database still isn't set up.
    initiallyClosed = false
  }

  return (
    <HeroSection>
      <EntryFlow initiallyClosed={initiallyClosed} />
    </HeroSection>
  )
}
