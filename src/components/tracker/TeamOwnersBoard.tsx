import type { TeamOwnerView } from '@/lib/tracker'

export default function TeamOwnersBoard({
  teams,
}: {
  teams: TeamOwnerView[]
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {teams.map((item) => (
        <div
          key={item.team.id}
          className="relative border-[3px] border-brand-black bg-brand-white p-4 shadow-[7px_7px_0_#000000]"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-brand-blue">
                Group {item.team.group}
              </p>
              <h2 className="mt-1 font-headline text-4xl font-black uppercase leading-none text-brand-black">
                {item.team.name}
              </h2>
            </div>
            <span className="font-headline text-4xl font-black text-brand-red">
              ★
            </span>
          </div>

          <div className="mt-5 border-t-[3px] border-brand-black pt-3">
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest">
              Drawn by
            </p>
            <p className="mt-1 font-headline text-3xl font-black uppercase leading-none text-brand-blue">
              {item.ownerName ?? 'Unclaimed'}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
