# Build Prompt: 411 World Cup Sweepstake Website

> Paste this into Claude Code. Build it in the phases listed at the end — do not try to do everything in one pass. Ask me before making any irreversible choice (sending real emails, running the live draw, writing to the production Google Sheet).

---

## 1. What we're building

A web app for a private office World Cup sweepstake run by 411 (a digital agency). People enter their name and email, pay £2 via a Monzo link, and once 48 people have entered they are each randomly assigned one of the 48 teams at the 2026 FIFA World Cup. The site then becomes a live tracker showing who has which team, today's matches, a wall chart, and which teams/people have been knocked out.

The 2026 World Cup runs **11 June – 19 July 2026**, hosted by Canada, Mexico and the USA. It is the first 48-team tournament: **12 groups of 4**, and the **top two from each group plus the eight best third-placed teams advance to a Round of 32**, then Round of 16, quarters, semis, final. (This format matters — see eliminations in section 9.)

This is a full-stack app, not a static site: it needs a database, scheduled jobs, and outbound email.

---

## 2. Recommended tech stack

Use this unless you have a strong reason not to, and tell me if you deviate:

- **Framework:** Next.js (App Router) + TypeScript.
- **Database:** Postgres via a free tier (Neon or Supabase). This is the **source of truth** for entries and draw results.
- **Scheduled jobs:** Vercel Cron (or the platform's scheduler) for the daily 8am refresh.
- **Email:** Resend (free tier easily covers 48 emails). This is a standalone site on its own domain (e.g. `411sweepstake.com`), so verify **that** domain for deliverability and send from something like `noreply@411sweepstake.com` — until it's verified, send to a test inbox only.
- **Football data:** free source — `openfootball/worldcup.json` (public-domain JSON, no key) as the primary fixtures/results feed, with football-data.org's free tier as a fallback. We only refresh once a day, so no paid/live API is needed.
- **Hosting:** Vercel (or Render). Free tier is expected to be sufficient.
- **Google Sheets:** mirror entries to a Google Sheet via the Sheets API using a service account (see section 7).

Keep all secrets in environment variables. Never hard-code keys. Provide a `.env.example`.

---

## 3. Brand & visual design

Two influences, blended:

**(a) Retro World Cup USA '94 energy** — bright, sunny, early-'90s. Big bold patterned shapes, billowing goal nets, stylised footballs, sharp "shooting" lines, strong primary blocks of colour. Reference moodboard: the Pentagram USA '94 identity and 1994 World Cup kits. This is the *fun* layer.

**(b) 411's brand system** (from the attached brand guidelines v2.0) — the *structural* layer:

- **Colours (hex):** Black `#000000`, Green `#22B573`, Red `#D6634F`, Lilac `#9490B4`, Ink `#1C1C1C`, Paper/sand `#EFE2CC`, White `#FFFFFF`. Use **one hero gradient colour per page**; separate multiple colours with white, sand or black. Backgrounds for body text should be white, sand or a light neutral for contrast.
- **Gradients:** 411's signature is soft freeform gradients with a subtle film-grain texture. Use as accents (hero areas, section dividers), not behind dense text.
- **Typography:** GT Ultra Median for headlines/quotes (licensed — I'll provide the files; fall back to a similar high-contrast serif if absent). **Outfit** (Google Fonts) for subheads and body. **Space Mono** (Google Fonts) for dates, stats, links, pull quotes.
- **Lines:** thin 1–2px line work to structure layouts and underline headings.
- **Contrast:** maintain WCAG AA. The brief's audience includes mobile, so it must be fully responsive.

Where the '90s retro and 411 systems conflict, keep 411's typography, colour hexes and contrast rules; express the retro feel through layout, shapes, footballs, nets and the hero treatment.

**Logo usage:** Use the supplied **World Cup Sweepstake logo** (`WC_sweepstake.png`) top-left on every page, as a hyperlink back to the landing page. Use 411's own logo (`411_logo_icon_black.png`) only where 411 the agency is referenced. Don't recolour, stretch, add effects to, or rearrange either logo. Don't place the black logo on busy backgrounds (use a white-out version on dark/busy areas). Maintain clear space around logos.

---

## 4. Assets I'm providing

- `WC_sweepstake.png` — the website's draft logo (use top-left, links home).
- `411_logo_icon_black.png` — 411's icon logo (use only when 411 is referenced).
- `411_brand-guidelines_2_0.pdf` — full brand system.
- A **teams data file** (I'll provide / you scaffold it) — 48 teams, each with `manager` and `starPlayer`. Fixtures, kick-off times and results come from the data feed, not this file.

If GT Ultra Median font files aren't supplied yet, scaffold with a close fallback and make the font swap a one-line change.

---

## 5. Global layout (all pages)

- Logo top-left, links to home.
- After the draw, a menu bar **top-right** with: **TODAY'S MATCHES**, **WALL CHART** (and home via the logo).
- A **live countdown** pinned to the bottom, counting down to **12:00 noon UK time, Thursday 11 June 2026**. It stays visible across phases until the draw happens; after the draw it can be removed or repurposed.
- Fully responsive; simplify gradients on mobile to avoid noise.

---

## 6. Phase 1 — Entry (before the draw)

**Landing page**, big retro headline:

```
WELCOME TO 411'S WORLD CUP SWEEPSTAKE
FIND A TEAM. FOLLOW THEM TO GLORY.
```

- Form fields: **NAME**, **EMAIL ADDRESS**. A **SUBMIT** button.
- Validate email format; enforce **email uniqueness** (one entry per email). Trim/normalise input.
- On submit, save the entry to the database, mirror it to the Google Sheet (section 7), and change the on-screen text (keep the countdown at the bottom) to:

```
YOU HAVE ALMOST ENTERED 411'S WORLD CUP SWEEPSTAKE
To make your entry official, please send your £2 entry fee to Conor
```

- A **PAY NOW** button linking to:
  `https://monzo.me/conorpope/2.00?h=DUL0kW&account_type=personal`
  (This is just an external link — no payment processing in the app.)

**Entry cap:** when **48 entries** exist, hide the form and show:

```
ENTRIES TO 411'S WORLD CUP SWEEPSTAKE HAVE NOW CLOSED
```

Enforce the cap server-side (don't rely on the client) so the 49th submission is rejected even under a race condition.

**Note on payment:** the £2 is tracked manually by Conor (a checkbox in the Google Sheet). Payment does **not** gate the draw — all entries are drawn regardless. Don't build payment verification.

---

## 7. Google Sheet mirror

- A Google Sheet owned by `conorpope@fouroneone.co.uk` with columns: **Name**, **Email**, **Entry paid** (checkbox, manually updated by Conor), and (after the draw) **Drawn team**.
- The app database is the source of truth; the sheet is a mirror Conor uses for manual payment ticking.
- Implement via the Google Sheets API with a **service account**; the sheet is shared (editor) with the service account email. Put the sheet ID and credentials in env vars. I'll provide the sheet ID.
- If Sheets auth isn't set up yet, write entries to the DB and a local CSV fallback, and clearly flag that the Sheets sync is pending.

---

## 8. The draw

- Trigger: a **protected admin action** (a button on an admin page behind a simple password / admin route), not an automatic timer. Conor clicks it once 48 entries are in and payments are reconciled. (Optionally also allow a scheduled noon-11-June trigger, but manual is the primary path.)
- Logic: take all entries (up to 48), shuffle, and pair each entry 1:1 with a team. With exactly 48 entries every team has one owner. **If fewer than 48 entered**, draw proceeds and unassigned teams are shown as **"Unclaimed"** everywhere.
- The draw must be **idempotent / one-time**: once run, lock it so it can't be re-run accidentally. Store assignments in the DB and mirror the "Drawn team" column to the sheet.
- After the draw, each entry receives an email (section 8a) and the homepage switches to Phase 2 (section 9).

### 8a. Draw result email

To each entry:

- **Subject:** `411 World Cup sweepstake – your team inside!`
- **Body:**
  ```
  [Name]

  Your team in the 411 World Cup sweepstake is [DRAWN TEAM, IN CAPITALS AND BOLD]

  Here's some information about your team!

  Star player: [from teams file]
  Manager: [from teams file]
  Fixtures: [Opponent], [kick-off in BST], [date as "26 June"]
            (list all three group fixtures)

  Did you know? [funFact from teams file]

  All the best for the tournament!
  ```
- Star player, manager and the fun fact come from the teams file (`world-cup-2026-teams.json`); fixtures, opponents and kick-off times come from the data feed, converted to **UK time (Europe/London)**.
- **Send a test run to a single inbox first and show me the output before sending to all 48.**

---

## 9. Phase 2 — Tracker (after the draw)

### New homepage
An **alphabetical list of all 48 teams**, each with the person who drew it beside it (or "Unclaimed"). Clean, on-brand, responsive.

### Daily 8am refresh + eliminations
- A scheduled job runs every morning at **08:00 UK time**, pulling the latest results from the feed and updating the site.
- From **28 June onward**, the homepage shows a **big red X** through every team (and its person) that has been knocked out.

**Elimination rule (important — driven by the feed, not computed by hand):**
- A team is **eliminated** if it lost a knockout match, **or** once the next round's fixtures are populated, it does not appear in them.
- Because 2026 has a Round of 32 (top 2 per group **plus 8 best third-placed teams** advance), do **not** assume "bottom two of each group are out." Determine group-stage survivors from whether the team appears in the Round of 32 fixtures. Only ~16 teams go out at the group stage.
- **Build a manual admin override** to mark/unmark a team as eliminated, in case the feed is wrong or late. This is a required safety net.

### TODAY'S MATCHES page
- Lists every World Cup match kicking off in the **next 24 hours**, with kick-off time (UK time) and the person who drew each team. Repopulates at the 8am refresh.
- Define the daily window explicitly as **08:00 today → 08:00 tomorrow (UK time)** so late-night/early-morning kick-offs (1am, 4am) are grouped on the correct day.
- Format like:
  ```
  Monday, 22 June
  Argentina (Hattie) vs Austria (Jen), 6pm
  France (Anaelle) vs Iraq (Assaf), 10pm
  Norway (Finn) vs Senegal (Frances), 1am
  Jordan (Nik) vs Algeria (Matilda), 4am
  ```

### WALL CHART page
- An automatically updated wall chart of the whole tournament bracket, with each team also showing the person who drew it. Refreshes at 8am, adding the previous 24 hours' results. Reference layout: a printable World Cup wall chart (group tables + knockout bracket). Make it readable on screen and degrade gracefully on mobile.

---

## 10. Data model (suggested)

- `entries` — id, name, email (unique), paid (bool, default false), created_at.
- `teams` — id, name, group, manager, star_player, eliminated (bool), eliminated_round.
- `assignments` — entry_id, team_id (1:1), created_at.
- `fixtures` — id, team_a, team_b, kickoff_utc, round, status, score (cached from feed).
- `draw_state` — has_run (bool), run_at.
- `config` / `settings` — for admin overrides.

Cache feed data in the DB on each refresh rather than calling the feed on every page load.

---

## 11. Admin

A simple password-protected admin area (env-var password is fine for this scale) that can:
- See the entry count and list.
- Trigger the draw (one-time, locked after).
- Manually mark/unmark a team's elimination (override).
- Re-run the daily refresh on demand.
- Trigger a test email to a single address.

---

## 12. Edge cases & rules to honour

- Server-side enforcement of the 48 cap and email uniqueness.
- Fewer than 48 entries → unclaimed teams shown as "Unclaimed."
- Draw is one-time and idempotent.
- All displayed times in **UK time (Europe/London)**, handling BST. Feed times are usually UTC — convert.
- Dates written as e.g. "26 June".
- Don't send live emails or run the real draw without my confirmation.
- Add a one-line privacy note: names/emails are used only for this sweepstake.

---

## 13. Build order (do it in phases, confirm between each)

1. **Scaffold + design system:** Next.js + TS, brand tokens (colours, fonts, gradients, line work), global layout (logo links home, countdown to noon 11 June, responsive shell), and the retro hero treatment.
2. **Entry flow:** landing page, form, validation, DB save, 48-cap close, post-submit "pay" screen + Monzo button. (Google Sheet sync can be stubbed, then wired up.)
3. **Data layer:** integrate the free fixtures/results feed; cache to DB; build the teams file (managers + star players) and merge with feed fixtures.
4. **Draw + email:** admin-triggered draw, assignments, locking; result emails (test inbox first).
5. **Tracker pages:** new homepage (alphabetical list + owners), Today's Matches, Wall Chart.
6. **Daily refresh + eliminations:** 8am scheduled job, red-X elimination logic (feed-driven, Round-of-32-aware), manual override.
7. **Polish:** accessibility/contrast pass, mobile, error states, empty states, admin tools.

Provide a README covering setup, env vars, how to run the draw, how to trigger a refresh, and where to put the font files and Google credentials.

---

## 14. Placeholders I (Conor) need to supply

- GT Ultra Median font files (or accept the fallback).
- The teams file values: manager + star player for each of the 48 teams.
- The Google Sheet ID + service-account credentials.
- Resend API key + verified email domain (your standalone site domain, e.g. `411sweepstake.com`) — or confirm test-only sending for now.
- The Monzo link is already in the spec.
