import "server-only";
import { eq, and, asc, sql, desc } from "drizzle-orm";
import { db } from "@/app/_lib/db";
import {
  users,
  userDances,
  danceStyles,
  danceLevels,
  patterns,
  userPatterns,
  practiceSessions,
  sessionPatterns,
} from "@/app/_lib/db/schema";

export type DanceProgressItem = {
  id: string;
  styleSlug: string;
  styleName: string;
  styleCategory: "standard" | "latin" | "smooth" | "rhythm";
  levelName: "bronze" | "silver" | "gold" | "open" | null;
  totalPatterns: number;
  masteredPatterns: number;
};

export type RecentSession = {
  id: string;
  date: Date;
  durationMinutes: number;
  type: "solo" | "class" | "lesson";
  patternCount: number;
};

export type DashboardData = {
  user: typeof users.$inferSelect | null;
  danceProgress: DanceProgressItem[];
  recentSessions: RecentSession[];
};

export async function getDashboardData(userId: string): Promise<DashboardData> {
  const [user, danceProgress, recentSessions] = await Promise.all([
    db.query.users.findFirst({ where: eq(users.id, userId) }).then((r) => r ?? null),
    getDanceProgress(userId),
    getRecentSessionsForDashboard(userId),
  ]);

  return { user, danceProgress, recentSessions };
}

async function getDanceProgress(userId: string): Promise<DanceProgressItem[]> {
  const rows = await db
    .select({
      id: userDances.id,
      styleSlug: danceStyles.slug,
      styleName: danceStyles.name,
      styleCategory: danceStyles.category,
      levelName: danceLevels.name,
      totalPatterns: sql<number>`cast(count(distinct ${patterns.id}) as integer)`,
      masteredPatterns: sql<number>`cast(count(distinct ${userPatterns.id}) filter (where ${userPatterns.status} = 'mastered') as integer)`,
    })
    .from(userDances)
    .innerJoin(danceStyles, eq(userDances.styleId, danceStyles.id))
    .leftJoin(danceLevels, eq(userDances.currentLevelId, danceLevels.id))
    .leftJoin(
      patterns,
      and(
        eq(patterns.styleId, danceStyles.id),
        eq(patterns.levelId, danceLevels.id)
      )
    )
    .leftJoin(
      userPatterns,
      and(
        eq(userPatterns.patternId, patterns.id),
        eq(userPatterns.userId, userId)
      )
    )
    .where(eq(userDances.userId, userId))
    .groupBy(
      userDances.id,
      danceStyles.slug,
      danceStyles.name,
      danceStyles.category,
      danceLevels.name
    )
    .orderBy(asc(danceStyles.category), asc(danceStyles.name));

  return rows;
}

async function getRecentSessionsForDashboard(userId: string): Promise<RecentSession[]> {
  return db
    .select({
      id: practiceSessions.id,
      date: practiceSessions.date,
      durationMinutes: practiceSessions.durationMinutes,
      type: practiceSessions.type,
      patternCount: sql<number>`cast(count(${sessionPatterns.id}) as integer)`,
    })
    .from(practiceSessions)
    .leftJoin(sessionPatterns, eq(sessionPatterns.sessionId, practiceSessions.id))
    .where(eq(practiceSessions.userId, userId))
    .groupBy(practiceSessions.id)
    .orderBy(desc(practiceSessions.date))
    .limit(3);
}
