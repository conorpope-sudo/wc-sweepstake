import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core'

// Entries — one row per person who enters the sweepstake.
// Email is stored already trimmed + lowercased (see lib/validation.ts) and is unique.
export const entries = pgTable(
  'entries',
  {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    paid: boolean('paid').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [uniqueIndex('entries_email_unique').on(t.email)],
)

export type Entry = typeof entries.$inferSelect
export type NewEntry = typeof entries.$inferInsert

// Teams — the 48 World Cup teams. Editorial fields (manager/star/funFact) are
// seeded from world-cup-2026-teams.json; eliminated/eliminatedRound are managed
// by the daily refresh + admin override (Phase 6) and preserved across re-seeds.
export const teams = pgTable(
  'teams',
  {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    group: text('group').notNull(),
    manager: text('manager').notNull(),
    starPlayer: text('star_player').notNull(),
    funFact: text('fun_fact').notNull(),
    eliminated: boolean('eliminated').notNull().default(false),
    eliminatedRound: text('eliminated_round'),
  },
  (t) => [uniqueIndex('teams_name_unique').on(t.name)],
)

export type Team = typeof teams.$inferSelect
export type NewTeam = typeof teams.$inferInsert

// Fixtures — cached from the football feed (openfootball). One row per match.
// Group-stage rows have real team names + a group; knockout rows use feed
// placeholders (e.g. "2A", "W101") until results resolve them — teamAIsTeam /
// teamBIsTeam record whether each side currently maps to a known team.
export const fixtures = pgTable(
  'fixtures',
  {
    id: serial('id').primaryKey(),
    feedKey: text('feed_key').notNull(),
    round: text('round').notNull(), // group | round_of_32 | round_of_16 | quarter_final | semi_final | third_place | final
    roundOrder: integer('round_order').notNull(),
    matchday: integer('matchday'), // group stage only
    group: text('group'), // group stage only, e.g. "Group A"
    teamA: text('team_a').notNull(), // canonical team name OR placeholder label
    teamB: text('team_b').notNull(),
    teamAIsTeam: boolean('team_a_is_team').notNull().default(false),
    teamBIsTeam: boolean('team_b_is_team').notNull().default(false),
    kickoffUtc: timestamp('kickoff_utc', { withTimezone: true }).notNull(),
    ground: text('ground'),
    status: text('status').notNull().default('scheduled'), // scheduled | completed
    scoreA: integer('score_a'),
    scoreB: integer('score_b'),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [uniqueIndex('fixtures_feed_key_unique').on(t.feedKey)],
)

export type Fixture = typeof fixtures.$inferSelect
export type NewFixture = typeof fixtures.$inferInsert

// Assignments — the 1:1 result of the draw. Each entry maps to exactly one team
// and each team to at most one entry. emailedAt guards against double-sending.
export const assignments = pgTable('assignments', {
  id: serial('id').primaryKey(),
  entryId: integer('entry_id')
    .notNull()
    .unique()
    .references(() => entries.id),
  teamId: integer('team_id')
    .notNull()
    .unique()
    .references(() => teams.id),
  emailedAt: timestamp('emailed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export type Assignment = typeof assignments.$inferSelect
export type NewAssignment = typeof assignments.$inferInsert

// Draw state — a singleton row (id = 1) that locks the draw to one run.
export const drawState = pgTable('draw_state', {
  id: integer('id').primaryKey(), // always 1
  hasRun: boolean('has_run').notNull().default(false),
  runAt: timestamp('run_at', { withTimezone: true }),
})

export type DrawState = typeof drawState.$inferSelect

export const DRAW_STATE_ID = 1

// Matchday email notifications — prevents sending duplicate same-match emails
// to the same assignment if a cron job is retried or manually triggered.
export const matchdayEmailNotifications = pgTable(
  'matchday_email_notifications',
  {
    id: serial('id').primaryKey(),
    assignmentId: integer('assignment_id')
      .notNull()
      .references(() => assignments.id),
    fixtureId: integer('fixture_id')
      .notNull()
      .references(() => fixtures.id),
    sentAt: timestamp('sent_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex('matchday_email_notifications_unique').on(
      t.assignmentId,
      t.fixtureId,
    ),
  ],
)

export type MatchdayEmailNotification =
  typeof matchdayEmailNotifications.$inferSelect
