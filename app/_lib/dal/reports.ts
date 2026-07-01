import "server-only";
import { eq, and, gte, lte, asc, sql, inArray } from "drizzle-orm";
import { db } from "@/app/_lib/db";
import {
  users,
  userDances,
  danceStyles,
  danceLevels,
  patterns,
  userPatterns,
  practiceSessions,
} from "@/app/_lib/db/schema";

export type ReportPatternRow = {
  id: string;
  name: string;
  status: "learning" | "working" | "mastered" | null;
  confidence: number | null;
};

export type ReportDance = {
  styleId: string;
  styleSlug: string;
  styleName: string;
  styleCategory: "standard" | "latin" | "smooth" | "rhythm";
  levelName: "bronze" | "silver" | "gold" | "open" | null;
  patterns: ReportPatternRow[];
  masteredCount: number;
  totalCount: number;
};

export type ReportData = {
  generatedAt: Date;
  dateFrom: Date;
  dateTo: Date;
  userName: string;
  dances: ReportDance[];
  periodStats: { totalMinutes: number; sessionCount: number };
};

export async function getUserDancesForReport(userId: string) {
  return db
    .select({
      styleId: danceStyles.id,
      styleSlug: danceStyles.slug,
      styleName: danceStyles.name,
      styleCategory: danceStyles.category,
      levelName: danceLevels.name,
    })
    .from(userDances)
    .innerJoin(danceStyles, eq(userDances.styleId, danceStyles.id))
    .leftJoin(danceLevels, eq(userDances.currentLevelId, danceLevels.id))
    .where(eq(userDances.userId, userId))
    .orderBy(asc(danceStyles.category), asc(danceStyles.name));
}

export async function getReportData(
  userId: string,
  styleIds: string[],
  dateFrom: Date,
  dateTo: Date
): Promise<ReportData> {
  const dateToEnd = new Date(dateTo);
  dateToEnd.setUTCHours(23, 59, 59, 999);

  const [userRow, danceRows, statsRows] = await Promise.all([
    db.query.users.findFirst({ where: eq(users.id, userId) }),
    db
      .select({
        styleId: danceStyles.id,
        styleSlug: danceStyles.slug,
        styleName: danceStyles.name,
        styleCategory: danceStyles.category,
        levelId: danceLevels.id,
        levelName: danceLevels.name,
      })
      .from(userDances)
      .innerJoin(danceStyles, eq(userDances.styleId, danceStyles.id))
      .leftJoin(danceLevels, eq(userDances.currentLevelId, danceLevels.id))
      .where(
        and(
          eq(userDances.userId, userId),
          styleIds.length > 0 ? inArray(danceStyles.id, styleIds) : undefined
        )
      )
      .orderBy(asc(danceStyles.category), asc(danceStyles.name)),
    db
      .select({
        totalMinutes: sql<number>`cast(coalesce(sum(${practiceSessions.durationMinutes}), 0) as integer)`,
        sessionCount: sql<number>`cast(count(*) as integer)`,
      })
      .from(practiceSessions)
      .where(
        and(
          eq(practiceSessions.userId, userId),
          gte(practiceSessions.date, dateFrom),
          lte(practiceSessions.date, dateToEnd)
        )
      ),
  ]);

  const userName =
    userRow?.name ?? userRow?.email?.split("@")[0] ?? "Dancer";

  // Fetch patterns for all dances that have a level set
  const dancesWithLevel = danceRows.filter((d) => d.levelId !== null);
  const levelIds = dancesWithLevel.map((d) => d.levelId!);
  const styleIdList = dancesWithLevel.map((d) => d.styleId);

  let patternRows: {
    styleId: string;
    patternId: string;
    patternName: string;
    levelId: string;
    order: number;
    status: "learning" | "working" | "mastered" | null;
    confidence: number | null;
  }[] = [];

  if (levelIds.length > 0) {
    patternRows = await db
      .select({
        styleId: patterns.styleId,
        patternId: patterns.id,
        patternName: patterns.name,
        levelId: patterns.levelId,
        order: patterns.order,
        status: userPatterns.status,
        confidence: userPatterns.confidence,
      })
      .from(patterns)
      .leftJoin(
        userPatterns,
        and(
          eq(userPatterns.patternId, patterns.id),
          eq(userPatterns.userId, userId)
        )
      )
      .where(
        and(
          inArray(patterns.styleId, styleIdList),
          inArray(patterns.levelId, levelIds)
        )
      )
      .orderBy(asc(patterns.styleId), asc(patterns.order));
  }

  // Group patterns by styleId
  const patternsByStyle = new Map<string, ReportPatternRow[]>();
  for (const p of patternRows) {
    if (!patternsByStyle.has(p.styleId)) patternsByStyle.set(p.styleId, []);
    patternsByStyle.get(p.styleId)!.push({
      id: p.patternId,
      name: p.patternName,
      status: p.status,
      confidence: p.confidence,
    });
  }

  const dances: ReportDance[] = danceRows.map((d) => {
    const pts = patternsByStyle.get(d.styleId) ?? [];
    return {
      styleId: d.styleId,
      styleSlug: d.styleSlug,
      styleName: d.styleName,
      styleCategory: d.styleCategory,
      levelName: d.levelName,
      patterns: pts,
      masteredCount: pts.filter((p) => p.status === "mastered").length,
      totalCount: pts.length,
    };
  });

  const stats = statsRows[0] ?? { totalMinutes: 0, sessionCount: 0 };

  return {
    generatedAt: new Date(),
    dateFrom,
    dateTo,
    userName,
    dances,
    periodStats: stats,
  };
}
