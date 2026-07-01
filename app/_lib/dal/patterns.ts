import "server-only";
import { eq, and, asc, lt, ne } from "drizzle-orm";
import { db } from "@/app/_lib/db";
import {
  patterns,
  userPatterns,
  danceLevels,
  users,
} from "@/app/_lib/db/schema";

export type PatternRow = typeof patterns.$inferSelect;
export type UserPatternRow = typeof userPatterns.$inferSelect;

export type PatternWithProgress = {
  id: string;
  name: string;
  description: string | null;
  order: number;
  userPatternId: string | null;
  status: "learning" | "working" | "mastered" | null;
  confidence: number | null;
  notes: string | null;
  isPinned: boolean;
  updatedAt: Date | null;
};

export async function getPatternsForLevel(
  styleId: string,
  levelId: string,
  userId: string
): Promise<PatternWithProgress[]> {
  const rows = await db
    .select({
      id: patterns.id,
      name: patterns.name,
      description: patterns.description,
      order: patterns.order,
      userPatternId: userPatterns.id,
      status: userPatterns.status,
      confidence: userPatterns.confidence,
      notes: userPatterns.notes,
      isPinned: userPatterns.isPinned,
      updatedAt: userPatterns.updatedAt,
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
      and(eq(patterns.styleId, styleId), eq(patterns.levelId, levelId))
    )
    .orderBy(asc(patterns.order), asc(patterns.name));

  return rows.map((r) => ({
    ...r,
    isPinned: r.isPinned ?? false,
  }));
}

export async function getPatternProgress(
  styleId: string,
  levelId: string,
  userId: string
): Promise<{ total: number; mastered: number }> {
  const all = await getPatternsForLevel(styleId, levelId, userId);
  return {
    total: all.length,
    mastered: all.filter((p) => p.status === "mastered").length,
  };
}

// ─── History modal data ───────────────────────────────────────────────────────

export type PatternForHistory = {
  id: string;
  name: string;
  description: string | null;
  order: number;
  levelId: string;
  levelName: "bronze" | "silver" | "gold" | "open";
  levelOrder: number;
};

export async function getPatternsForStyleGrouped(
  styleId: string
): Promise<PatternForHistory[]> {
  return db
    .select({
      id: patterns.id,
      name: patterns.name,
      description: patterns.description,
      order: patterns.order,
      levelId: patterns.levelId,
      levelName: danceLevels.name,
      levelOrder: danceLevels.order,
    })
    .from(patterns)
    .innerJoin(danceLevels, eq(patterns.levelId, danceLevels.id))
    .where(eq(patterns.styleId, styleId))
    .orderBy(asc(danceLevels.order), asc(patterns.order));
}

// ─── Carry-forward (previous-level gaps) ─────────────────────────────────────

export type CarryForwardPattern = PatternWithProgress & {
  levelName: "bronze" | "silver" | "gold" | "open";
};

export async function getCarryForwardPatterns(
  styleId: string,
  currentLevelOrder: number,
  userId: string
): Promise<CarryForwardPattern[]> {
  if (currentLevelOrder <= 1) return [];

  const rows = await db
    .select({
      id: patterns.id,
      name: patterns.name,
      description: patterns.description,
      order: patterns.order,
      levelName: danceLevels.name,
      userPatternId: userPatterns.id,
      status: userPatterns.status,
      confidence: userPatterns.confidence,
      notes: userPatterns.notes,
      isPinned: userPatterns.isPinned,
      updatedAt: userPatterns.updatedAt,
    })
    .from(userPatterns)
    .innerJoin(patterns, eq(userPatterns.patternId, patterns.id))
    .innerJoin(danceLevels, eq(patterns.levelId, danceLevels.id))
    .where(
      and(
        eq(userPatterns.userId, userId),
        eq(patterns.styleId, styleId),
        lt(danceLevels.order, currentLevelOrder),
        ne(userPatterns.status, "mastered")
      )
    )
    .orderBy(asc(danceLevels.order), asc(patterns.order));

  return rows.map((r) => ({ ...r, isPinned: r.isPinned ?? false }));
}

export async function getUserPreferredGoverningBodyId(
  userId: string
): Promise<string | null> {
  const rows = await db
    .select({ preferredGoverningBodyId: users.preferredGoverningBodyId })
    .from(users)
    .where(eq(users.id, userId));
  return rows[0]?.preferredGoverningBodyId ?? null;
}
