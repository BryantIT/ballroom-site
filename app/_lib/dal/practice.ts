import "server-only";
import { eq, and, desc, gte, asc, sql } from "drizzle-orm";
import { db } from "@/app/_lib/db";
import {
  practiceSessions,
  sessionPatterns,
  patterns,
  danceStyles,
  danceLevels,
  userDances,
} from "@/app/_lib/db/schema";

export type SessionSummary = {
  id: string;
  date: Date;
  durationMinutes: number;
  type: "solo" | "class" | "lesson";
  notes: string | null;
  patternCount: number;
};

export type WeekData = {
  weekStart: Date;
  totalMinutes: number;
  sessionCount: number;
};

export type PatternChoice = {
  id: string;
  name: string;
  levelName: "bronze" | "silver" | "gold" | "open";
};

export type StyleGroup = {
  styleId: string;
  styleName: string;
  patterns: PatternChoice[];
};

export async function getRecentSessions(
  userId: string,
  limit = 30
): Promise<SessionSummary[]> {
  return db
    .select({
      id: practiceSessions.id,
      date: practiceSessions.date,
      durationMinutes: practiceSessions.durationMinutes,
      type: practiceSessions.type,
      notes: practiceSessions.notes,
      patternCount: sql<number>`cast(count(${sessionPatterns.id}) as integer)`,
    })
    .from(practiceSessions)
    .leftJoin(sessionPatterns, eq(sessionPatterns.sessionId, practiceSessions.id))
    .where(eq(practiceSessions.userId, userId))
    .groupBy(practiceSessions.id)
    .orderBy(desc(practiceSessions.date))
    .limit(limit);
}

export async function getWeeklySummaries(
  userId: string,
  weeksBack = 8
): Promise<WeekData[]> {
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - weeksBack * 7);

  return db
    .select({
      weekStart: sql<Date>`date_trunc('week', ${practiceSessions.date})`,
      totalMinutes: sql<number>`cast(sum(${practiceSessions.durationMinutes}) as integer)`,
      sessionCount: sql<number>`cast(count(*) as integer)`,
    })
    .from(practiceSessions)
    .where(
      and(
        eq(practiceSessions.userId, userId),
        gte(practiceSessions.date, since)
      )
    )
    .groupBy(sql`date_trunc('week', ${practiceSessions.date})`)
    .orderBy(asc(sql`date_trunc('week', ${practiceSessions.date})`));
}

export async function getPatternsForForm(userId: string): Promise<StyleGroup[]> {
  const rows = await db
    .select({
      styleId: danceStyles.id,
      styleName: danceStyles.name,
      patternId: patterns.id,
      patternName: patterns.name,
      levelName: danceLevels.name,
    })
    .from(userDances)
    .innerJoin(danceStyles, eq(userDances.styleId, danceStyles.id))
    .innerJoin(danceLevels, eq(userDances.currentLevelId, danceLevels.id))
    .innerJoin(
      patterns,
      and(
        eq(patterns.styleId, danceStyles.id),
        eq(patterns.levelId, danceLevels.id)
      )
    )
    .where(eq(userDances.userId, userId))
    .orderBy(asc(danceStyles.category), asc(danceStyles.name), asc(patterns.order));

  const map = new Map<string, StyleGroup>();
  for (const r of rows) {
    if (!map.has(r.styleId)) {
      map.set(r.styleId, { styleId: r.styleId, styleName: r.styleName, patterns: [] });
    }
    map.get(r.styleId)!.patterns.push({
      id: r.patternId,
      name: r.patternName,
      levelName: r.levelName,
    });
  }

  return [...map.values()];
}

export async function getAllSessionDates(userId: string): Promise<Date[]> {
  const rows = await db
    .select({ date: practiceSessions.date })
    .from(practiceSessions)
    .where(eq(practiceSessions.userId, userId))
    .orderBy(desc(practiceSessions.date));

  return rows.map((r) => r.date);
}
