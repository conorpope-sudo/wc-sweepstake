import { redirect } from 'next/navigation'
import { isAdminAuthenticated, isAdminConfigured } from '@/lib/adminAuth'
import { getAdminDashboardData } from '@/lib/adminData'
import { ENTRY_CAP } from '@/lib/entries'
import {
  DrawForm,
  PopulateSheetForm,
  RefreshFixturesForm,
  SendPendingEmailsForm,
  SyncPaidForm,
  TestEmailForm,
} from './AdminForms'
import { loginAdmin, logoutAdmin } from './actions'

export const dynamic = 'force-dynamic'

function Login() {
  return (
    <section className="mx-auto max-w-md px-5 py-16">
      <div className="border-[3px] border-brand-black bg-brand-white p-6 shadow-[10px_10px_0_#000000]">
        <h1 className="font-headline text-6xl font-black uppercase leading-none">Admin</h1>
        <form action={loginAdmin} className="mt-6">
          <label className="block">
            <span className="font-mono text-xs font-bold uppercase">Password</span>
            <input
              name="password"
              type="password"
              className="mt-2 w-full border-[3px] border-brand-black bg-brand-white px-3 py-2"
              autoComplete="current-password"
            />
          </label>
          <button className="mt-4 skew-x-[-12deg] border-[3px] border-brand-black bg-brand-blue px-6 py-3 font-headline text-3xl font-black uppercase leading-none text-brand-white shadow-[6px_6px_0_#000000]">
            <span className="inline-block skew-x-[12deg]">Enter Admin</span>
          </button>
        </form>
      </div>
    </section>
  )
}

export default async function AdminPage() {
  if (!isAdminConfigured()) {
    return (
      <section className="mx-auto max-w-2xl px-5 py-16">
        <div className="border-[3px] border-brand-black bg-brand-white p-6 shadow-[10px_10px_0_#000000]">
          <h1 className="font-headline text-6xl font-black uppercase leading-none">Admin Setup Needed</h1>
          <p className="mt-3">
            Set ADMIN_PASSWORD in the environment before using the admin area.
          </p>
        </div>
      </section>
    )
  }

  if (!(await isAdminAuthenticated())) {
    return <Login />
  }

  if (!process.env.DATABASE_URL) {
    redirect('/')
  }

  const data = await getAdminDashboardData()
  const drawLocked = data.draw.hasRun || data.draw.assignmentCount > 0
  const emailConfigured = Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM)
  const sheetsConfigured = Boolean(
    process.env.GOOGLE_SHEET_ID && process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
  )
  const pendingEmails = data.assignments.filter((item) => !item.emailedAt).length

  return (
    <section className="px-5 py-10 md:px-8">
      <div className="mx-auto max-w-[1200px]">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b-[5px] border-brand-black pb-6">
          <div>
            <p className="mb-2 inline-block bg-brand-red px-3 py-1 font-mono text-xs font-bold uppercase text-brand-white">
              ★ Protected admin
            </p>
            <h1 className="font-headline text-6xl font-black uppercase leading-none md:text-8xl">Sweepstake Control</h1>
          </div>
          <form action={logoutAdmin}>
            <button className="border-[3px] border-brand-black bg-brand-white px-4 py-2 font-mono text-xs font-bold uppercase shadow-[4px_4px_0_#000000]">
              Sign Out
            </button>
          </form>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="border-[3px] border-brand-black bg-brand-red p-4 text-brand-white shadow-[6px_6px_0_#000000]">
            <p className="font-mono text-xs font-bold uppercase">Entries</p>
            <p className="mt-2 font-headline text-6xl font-black leading-none">
              {data.entryCount}/{ENTRY_CAP}
            </p>
          </div>
          <div className="border-[3px] border-brand-black bg-brand-blue p-4 text-brand-white shadow-[6px_6px_0_#000000]">
            <p className="font-mono text-xs font-bold uppercase">Teams</p>
            <p className="mt-2 font-headline text-6xl font-black leading-none">{data.teamCount}</p>
          </div>
          <div className="border-[3px] border-brand-black bg-brand-white p-4 shadow-[6px_6px_0_#000000]">
            <p className="font-mono text-xs font-bold uppercase">Draw</p>
            <p className="mt-2 font-headline text-5xl font-black uppercase leading-none">
              {drawLocked ? 'Locked' : 'Ready'}
            </p>
          </div>
          <div className="border-[3px] border-brand-black bg-brand-white p-4 shadow-[6px_6px_0_#000000]">
            <p className="font-mono text-xs font-bold uppercase">Email</p>
            <p className="mt-2 font-headline text-5xl font-black uppercase leading-none">
              {emailConfigured ? 'Ready' : 'Setup'}
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          <DrawForm disabled={drawLocked} />
          <RefreshFixturesForm />
          <PopulateSheetForm disabled={!sheetsConfigured} />
          <SyncPaidForm disabled={!sheetsConfigured} />
          <TestEmailForm disabled={!drawLocked || !emailConfigured} />
          <SendPendingEmailsForm
            disabled={!drawLocked || !emailConfigured || pendingEmails === 0}
            pendingCount={pendingEmails}
          />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="border-[3px] border-brand-black bg-brand-white p-5 shadow-[8px_8px_0_#000000]">
            <h2 className="font-headline text-5xl font-black uppercase leading-none">Entries</h2>
            <div className="mt-4 max-h-[460px] overflow-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="sticky top-0 bg-brand-white font-mono text-xs uppercase">
                  <tr>
                    <th className="border-b-[3px] border-brand-black py-2 pr-3">Name</th>
                    <th className="border-b-[3px] border-brand-black py-2 pr-3">Email</th>
                    <th className="border-b-[3px] border-brand-black py-2">Paid</th>
                  </tr>
                </thead>
                <tbody>
                  {data.entries.map((entry) => (
                    <tr key={entry.id} className="border-b border-brand-black/20">
                      <td className="py-2 pr-3">{entry.name}</td>
                      <td className="py-2 pr-3 font-mono text-xs">{entry.email}</td>
                      <td className="py-2 font-mono text-xs">
                        {entry.paid ? 'Yes' : 'No'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="border-[3px] border-brand-black bg-brand-white p-5 shadow-[8px_8px_0_#000000]">
            <h2 className="font-headline text-5xl font-black uppercase leading-none">Assignments</h2>
            <div className="mt-4 max-h-[460px] overflow-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="sticky top-0 bg-brand-white font-mono text-xs uppercase">
                  <tr>
                    <th className="border-b-[3px] border-brand-black py-2 pr-3">Team</th>
                    <th className="border-b-[3px] border-brand-black py-2 pr-3">Person</th>
                    <th className="border-b-[3px] border-brand-black py-2">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {data.assignments.map((assignment) => (
                    <tr
                      key={assignment.assignmentId}
                      className="border-b border-brand-black/20"
                    >
                      <td className="py-2 pr-3">{assignment.team.name}</td>
                      <td className="py-2 pr-3">{assignment.entry.name}</td>
                      <td className="py-2 font-mono text-xs">
                        {assignment.emailedAt ? 'Sent' : 'Pending'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.assignments.length === 0 && (
                <p className="mt-4 text-sm">No assignments yet.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </section>
  )
}
