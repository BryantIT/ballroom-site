import {
  pgTable,
  text,
  integer,
  smallint,
  timestamp,
  boolean,
  uuid,
  pgEnum,
  jsonb,
  index,
  unique,
} from "drizzle-orm/pg-core";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const danceCategoryEnum = pgEnum("dance_category", [
  "standard",
  "latin",
  "smooth",
  "rhythm",
]);

export const danceLevelNameEnum = pgEnum("dance_level_name", [
  "bronze",
  "silver",
  "gold",
  "open",
]);

export const patternStatusEnum = pgEnum("pattern_status", [
  "learning",
  "working",
  "mastered",
]);

export const practiceTypeEnum = pgEnum("practice_type", [
  "solo",
  "class",
  "lesson",
]);

// ─── Governing Bodies ─────────────────────────────────────────────────────────

export const governingBodies = pgTable("governing_bodies", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  abbreviation: text("abbreviation").notNull(),
});

// ─── Users ────────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: text("id").primaryKey(), // Cognito sub
  email: text("email").notNull().unique(),
  name: text("name"),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  studio: text("studio"),
  currentStreak: integer("current_streak").notNull().default(0),
  totalXp: integer("total_xp").notNull().default(0),
  notificationPreferences: jsonb("notification_preferences"),
  preferredGoverningBodyId: uuid("preferred_governing_body_id").references(
    () => governingBodies.id,
    { onDelete: "set null" }
  ),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ─── Dance Styles & Levels ────────────────────────────────────────────────────

export const danceStyles = pgTable("dance_styles", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  category: danceCategoryEnum("category").notNull(),
  description: text("description"),
});

export const danceLevels = pgTable(
  "dance_levels",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    styleId: uuid("style_id")
      .notNull()
      .references(() => danceStyles.id, { onDelete: "cascade" }),
    name: danceLevelNameEnum("name").notNull(),
    order: smallint("order").notNull(),
  },
  (t) => [unique().on(t.styleId, t.name)]
);

export const userDances = pgTable(
  "user_dances",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    styleId: uuid("style_id")
      .notNull()
      .references(() => danceStyles.id, { onDelete: "cascade" }),
    currentLevelId: uuid("current_level_id").references(() => danceLevels.id),
    addedAt: timestamp("added_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique().on(t.userId, t.styleId),
    index("user_dances_user_idx").on(t.userId),
  ]
);

// ─── Patterns ─────────────────────────────────────────────────────────────────

export const patterns = pgTable(
  "patterns",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    styleId: uuid("style_id")
      .notNull()
      .references(() => danceStyles.id, { onDelete: "cascade" }),
    levelId: uuid("level_id")
      .notNull()
      .references(() => danceLevels.id, { onDelete: "cascade" }),
    // null = applies to all governing bodies (generic/universal pattern)
    governingBodyId: uuid("governing_body_id").references(
      () => governingBodies.id,
      { onDelete: "set null" }
    ),
    name: text("name").notNull(),
    description: text("description"),
    order: smallint("order").notNull().default(0),
  },
  (t) => [index("patterns_style_level_idx").on(t.styleId, t.levelId)]
);

export const userPatterns = pgTable(
  "user_patterns",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    patternId: uuid("pattern_id")
      .notNull()
      .references(() => patterns.id, { onDelete: "cascade" }),
    status: patternStatusEnum("status").notNull().default("learning"),
    confidence: smallint("confidence"),
    notes: text("notes"),
    instructorName: text("instructor_name"),
    instructorNotes: text("instructor_notes"),
    isPinned: boolean("is_pinned").notNull().default(false),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique().on(t.userId, t.patternId),
    index("user_patterns_user_idx").on(t.userId),
  ]
);

// ─── Practice Sessions ────────────────────────────────────────────────────────

export const practiceSessions = pgTable(
  "practice_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    date: timestamp("date", { withTimezone: true }).notNull(),
    durationMinutes: integer("duration_minutes").notNull(),
    type: practiceTypeEnum("type").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("practice_sessions_user_date_idx").on(t.userId, t.date)]
);

export const sessionPatterns = pgTable(
  "session_patterns",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => practiceSessions.id, { onDelete: "cascade" }),
    patternId: uuid("pattern_id")
      .notNull()
      .references(() => patterns.id, { onDelete: "cascade" }),
  },
  (t) => [unique().on(t.sessionId, t.patternId)]
);

// ─── Competitions ─────────────────────────────────────────────────────────────

export const competitions = pgTable(
  "competitions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    date: timestamp("date", { withTimezone: true }).notNull(),
    location: text("location"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("competitions_user_idx").on(t.userId)]
);

export const competitionEvents = pgTable("competition_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  competitionId: uuid("competition_id")
    .notNull()
    .references(() => competitions.id, { onDelete: "cascade" }),
  styleId: uuid("style_id")
    .notNull()
    .references(() => danceStyles.id),
  levelId: uuid("level_id")
    .notNull()
    .references(() => danceLevels.id),
  resultPlacement: integer("result_placement"),
  resultNotes: text("result_notes"),
});

// ─── Achievements ─────────────────────────────────────────────────────────────

export const achievements = pgTable("achievements", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  xpReward: integer("xp_reward").notNull().default(0),
  category: text("category").notNull(),
});

export const userAchievements = pgTable(
  "user_achievements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    achievementId: uuid("achievement_id")
      .notNull()
      .references(() => achievements.id, { onDelete: "cascade" }),
    unlockedAt: timestamp("unlocked_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    isPublic: boolean("is_public").notNull().default(true),
  },
  (t) => [
    unique().on(t.userId, t.achievementId),
    index("user_achievements_user_idx").on(t.userId),
  ]
);

// ─── Goals ────────────────────────────────────────────────────────────────────

export const goals = pgTable(
  "goals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    styleId: uuid("style_id")
      .notNull()
      .references(() => danceStyles.id),
    targetLevelId: uuid("target_level_id")
      .notNull()
      .references(() => danceLevels.id),
    targetDate: timestamp("target_date", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("goals_user_idx").on(t.userId)]
);

// ─── XP Log ───────────────────────────────────────────────────────────────────

export const xpLog = pgTable(
  "xp_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    amount: integer("amount").notNull(),
    reason: text("reason").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("xp_log_user_idx").on(t.userId)]
);

// ─── Push Subscriptions ───────────────────────────────────────────────────────

export const pushSubscriptions = pgTable(
  "push_subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    endpoint: text("endpoint").notNull().unique(),
    keys: jsonb("keys").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("push_subscriptions_user_idx").on(t.userId)]
);
