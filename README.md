# 411 World Cup Sweepstake 2026

A private office sweepstake for the 2026 FIFA World Cup, built for 411.

---

## Prerequisites: Node.js

Node.js isn't installed on this machine yet. Install it first:

**Option A — download the installer (simplest):**
Go to <https://nodejs.org> and download the LTS version (v22 or later). Run the pkg installer.

**Option B — via Homebrew (if you install Homebrew first):**
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew install node
```

Verify: `node --version` should print `v22.x.x` or later.

---

## Getting started

```bash
cd /Users/conorpope/Documents/WC-sweepstake
npm install
npm run dev
```

Open <http://localhost:3000>.

---

## Database setup (Phase 2)

The entry flow needs a Postgres database. We use [Neon](https://neon.tech) (free serverless Postgres).

1. Create a free project at <https://neon.tech>.
2. Copy the **pooled** connection string.
3. Put it in `.env.local`:
   ```bash
   cp .env.example .env.local
   # then set DATABASE_URL=postgresql://...-pooler...neon.tech/...?sslmode=require
   ```
4. Create the `entries` table by syncing the schema:
   ```bash
   npm run db:push
   ```
   (`db:push` reads `src/db/schema.ts` and syncs the DB directly — simplest for this project.
   Alternatively use `npm run db:generate` + `npm run db:migrate` for versioned migrations,
   or `npm run db:studio` to browse data.)

Until `DATABASE_URL` is set, the landing page still renders and the form shows a clear
"database isn't configured yet" message on submit.

### Teams + fixtures data (Phase 3)

After `db:push`, load the team data and fixtures:

```bash
npm run db:seed-teams        # 48 teams from world-cup-2026-teams.json (idempotent)
npm run db:refresh-fixtures  # caches all 104 matches from the openfootball feed
```

- **Source:** `openfootball/worldcup.json` (2026) — public domain, no key. Override with
  `WORLDCUP_FEED_URL`. `football-data.org` is a documented fallback stub (set
  `FOOTBALL_DATA_API_KEY` to enable once implemented).
- **Idempotent:** both commands can be re-run safely. `refresh-fixtures` upserts by a stable
  key; `seed-teams` refreshes editorial fields but preserves `eliminated` overrides.
- **Times:** kick-offs are stored as true UTC (per-venue offsets parsed from the feed) and
  formatted in UK time (Europe/London, BST-aware) by `src/lib/datetime.ts`.
- **Name mapping:** feed names are mapped to ours in `src/lib/teamsData.ts` (only 3 differ
  today: Bosnia & Herzegovina, Czech Republic, Turkey).
- **Knockouts:** the 32 knockout fixtures use feed placeholders (`2A`, `W101`) until results
  resolve them — that's expected and feeds the Phase 6 elimination logic.

The daily 8am auto-refresh and admin "refresh now" button come in Phase 6; `refreshFixtures()`
in `src/lib/feed/refresh.ts` is the shared function they'll call.

### Entry mirror (Google Sheet)

The Google Sheet sync is **stubbed** in Phase 2. Each entry is written to a local CSV at
`data/entries-mirror.csv` (git-ignored — it holds names/emails), and a "Sheets sync pending"
warning is logged. The live Sheet is wired up in a later step. The database is always the
source of truth, so a mirror failure never blocks an entry.

---

## Assets to drop in

Place these files in `/public/` and they will be picked up automatically — no code changes needed:

| File | Usage |
|---|---|
| `WC_sweepstake.png` | Logo, top-left on every page |
| `411_logo_icon_black.png` | 411 icon, used when 411 the agency is referenced |

---

## GT Ultra Median font

Once you have the font files:

1. Drop `GTUltraMedian-Regular.woff2` and `GTUltraMedian-Bold.woff2` into `/public/fonts/`
2. Open `src/app/globals.css`
3. Uncomment the two `@font-face` blocks (clearly marked)
4. On the `--font-headline` line (marked **ONE-LINE SWAP**), change the value to:
   ```css
   --font-headline: 'GT Ultra Median', var(--font-playfair), Georgia, serif;
   ```

That's the only code change. The fallback (Playfair Display via Google Fonts) is active until then.

---

## Environment variables

Copy `.env.example` to `.env.local` and fill in values as each phase is built:

```bash
cp .env.example .env.local
```

| Variable | Phase | Description |
|---|---|---|
| `DATABASE_URL` | 2 | Postgres connection string (Neon or Supabase free tier) |
| `GOOGLE_SHEET_ID` | 2 | ID from the sheet URL |
| `GOOGLE_SERVICE_ACCOUNT_KEY` | 2 | Full service-account JSON, single-line escaped |
| `RESEND_API_KEY` | 4 | Resend API key for draw emails |
| `EMAIL_FROM` | 4 | Verified sending address, e.g. `noreply@411sweepstake.com` |
| `ADMIN_PASSWORD` | 4 | Simple password for the `/admin` route |

---

## Admin draw + emails (Phase 4)

Open `/admin` after setting `ADMIN_PASSWORD`.

- The admin page shows entry count, seeded team count, entrants, draw status, and assignments.
- The draw is manual and one-time. Type `RUN DRAW` before clicking the draw button. This creates assignments and locks the draw, but **does not send emails**.
- Result email sending is split in two:
  - Send a single test email first from the "Test Email" panel.
  - Only after the test is approved, type `SEND RESULTS` to send pending entrant emails.
- Email delivery uses Resend via `RESEND_API_KEY` and `EMAIL_FROM`.
- The Google Sheet drawn-team sync is still a CSV fallback until live Sheets writes are wired.

Safety reminders still apply: do not run the live draw or send real result emails without Conor's explicit confirmation.

---

## Build phases

| Phase | Status | What it covers |
|---|---|---|
| 1 | ✅ Done | Scaffold, design system, global layout, countdown, retro hero |
| 2 | ✅ Done | Entry form, DB save, email uniqueness, race-safe 48-cap, post-submit pay screen (Monzo), Sheets stub (CSV) |
| 3 | ✅ Done | Teams seed (48), openfootball feed cached to DB (104 fixtures), name mapping, UK-time merge layer |
| 4 | ✅ Done | Protected admin, one-time draw lock, assignments, test-first Resend result emails |
| 5 | Pending | Tracker pages: team list, Today's Matches, Wall Chart |
| 6 | Pending | Daily 8am refresh, elimination logic, manual override |
| 7 | Pending | Accessibility, mobile polish, error states |

---

## Important reminders

- **Do not run the live draw** without Conor's explicit confirmation.
- **Do not send real emails** without Conor's explicit confirmation. Always test to a single inbox first.
- **Do not write to the production Google Sheet** without Conor's explicit confirmation.
- The draw is one-time and idempotent — once run it locks.
- All times displayed in UK time (Europe/London, handling BST).
