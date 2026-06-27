import "server-only";
import { eq, notInArray, asc } from "drizzle-orm";
import { db } from "@/app/_lib/db";
import { danceStyles, danceLevels, userDances, governingBodies } from "@/app/_lib/db/schema";

export type UserDanceRow = {
  id: string;
  styleId: string;
  styleSlug: string;
  styleName: string;
  styleCategory: "standard" | "latin" | "smooth" | "rhythm";
  currentLevelId: string | null;
  currentLevelName: "bronze" | "silver" | "gold" | "open" | null;
  currentLevelOrder: number | null;
};

export type DanceStyleRow = typeof danceStyles.$inferSelect;
export type DanceLevelRow = typeof danceLevels.$inferSelect;
export type GoverningBodyRow = typeof governingBodies.$inferSelect;

export async function getUserDances(userId: string): Promise<UserDanceRow[]> {
  return db
    .select({
      id: userDances.id,
      styleId: danceStyles.id,
      styleSlug: danceStyles.slug,
      styleName: danceStyles.name,
      styleCategory: danceStyles.category,
      currentLevelId: userDances.currentLevelId,
      currentLevelName: danceLevels.name,
      currentLevelOrder: danceLevels.order,
    })
    .from(userDances)
    .innerJoin(danceStyles, eq(userDances.styleId, danceStyles.id))
    .leftJoin(danceLevels, eq(userDances.currentLevelId, danceLevels.id))
    .where(eq(userDances.userId, userId))
    .orderBy(asc(danceStyles.category), asc(danceStyles.name));
}

export async function getAvailableStyles(userId: string): Promise<DanceStyleRow[]> {
  const added = await db
    .select({ styleId: userDances.styleId })
    .from(userDances)
    .where(eq(userDances.userId, userId));

  const addedIds = added.map((r) => r.styleId);

  const query = db
    .select()
    .from(danceStyles)
    .orderBy(asc(danceStyles.category), asc(danceStyles.name));

  return addedIds.length > 0
    ? query.where(notInArray(danceStyles.id, addedIds))
    : query;
}

export async function getDanceStyleBySlug(slug: string): Promise<DanceStyleRow | undefined> {
  const rows = await db
    .select()
    .from(danceStyles)
    .where(eq(danceStyles.slug, slug));
  return rows[0];
}

export async function getLevelsForStyle(styleId: string): Promise<DanceLevelRow[]> {
  return db
    .select()
    .from(danceLevels)
    .where(eq(danceLevels.styleId, styleId))
    .orderBy(asc(danceLevels.order));
}

export async function getUserDanceForStyle(userId: string, styleId: string) {
  const rows = await db
    .select({
      id: userDances.id,
      currentLevelId: userDances.currentLevelId,
    })
    .from(userDances)
    .where(eq(userDances.userId, userId))
    .innerJoin(danceStyles, eq(userDances.styleId, danceStyles.id));

  // filter in-memory to avoid complex join condition
  const allForUser = await db
    .select({ id: userDances.id, currentLevelId: userDances.currentLevelId, styleId: userDances.styleId })
    .from(userDances)
    .where(eq(userDances.userId, userId));

  return allForUser.find((r) => r.styleId === styleId) ?? null;
}

export async function getGoverningBodies(): Promise<GoverningBodyRow[]> {
  return db.select().from(governingBodies).orderBy(asc(governingBodies.name));
}
