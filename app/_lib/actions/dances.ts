"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { getAuthUser } from "@/app/_lib/dal/auth";
import { db } from "@/app/_lib/db";
import { userDances, userPatterns, users } from "@/app/_lib/db/schema";

const uuidSchema = z.string().uuid();

export async function addDanceAction(styleId: string, levelId?: string) {
  const authUser = await getAuthUser();
  if (!authUser) return { error: "Not authenticated" };

  const styleIdParsed = uuidSchema.safeParse(styleId);
  if (!styleIdParsed.success) return { error: "Invalid style" };

  const levelIdParsed = levelId ? uuidSchema.safeParse(levelId) : { success: true, data: undefined };
  if (!levelIdParsed.success) return { error: "Invalid level" };

  try {
    await db
      .insert(userDances)
      .values({
        userId: authUser.userId,
        styleId,
        currentLevelId: levelId ?? null,
      })
      .onConflictDoNothing();

    revalidatePath("/dances");
    return { success: true };
  } catch {
    return { error: "Failed to add dance" };
  }
}

export async function removeDanceAction(userDanceId: string) {
  const authUser = await getAuthUser();
  if (!authUser) return { error: "Not authenticated" };

  if (!uuidSchema.safeParse(userDanceId).success) return { error: "Invalid id" };

  try {
    await db
      .delete(userDances)
      .where(
        and(
          eq(userDances.id, userDanceId),
          eq(userDances.userId, authUser.userId) // ownership check
        )
      );

    revalidatePath("/dances");
    return { success: true };
  } catch {
    return { error: "Failed to remove dance" };
  }
}

export async function updateLevelAction(userDanceId: string, levelId: string | null) {
  const authUser = await getAuthUser();
  if (!authUser) return { error: "Not authenticated" };

  if (!uuidSchema.safeParse(userDanceId).success) return { error: "Invalid id" };
  if (levelId !== null && !uuidSchema.safeParse(levelId).success) return { error: "Invalid level" };

  try {
    await db
      .update(userDances)
      .set({ currentLevelId: levelId })
      .where(
        and(
          eq(userDances.id, userDanceId),
          eq(userDances.userId, authUser.userId) // ownership check
        )
      );

    revalidatePath("/dances");
    return { success: true };
  } catch {
    return { error: "Failed to update level" };
  }
}

export async function addDanceWithHistoryAction({
  styleId,
  styleSlug,
  levelId,
  knownPatternIds,
  unknownPatternIds,
}: {
  styleId: string;
  styleSlug: string;
  levelId: string;
  knownPatternIds: string[];
  unknownPatternIds: string[];
}) {
  const authUser = await getAuthUser();
  if (!authUser) return { error: "Not authenticated" };

  if (!uuidSchema.safeParse(styleId).success) return { error: "Invalid style" };
  if (!uuidSchema.safeParse(levelId).success) return { error: "Invalid level" };

  try {
    await db
      .insert(userDances)
      .values({ userId: authUser.userId, styleId, currentLevelId: levelId })
      .onConflictDoNothing();

    const records = [
      ...knownPatternIds.map((id) => ({
        userId: authUser.userId,
        patternId: id,
        status: "mastered" as const,
      })),
      ...unknownPatternIds.map((id) => ({
        userId: authUser.userId,
        patternId: id,
        status: "learning" as const,
      })),
    ];

    if (records.length > 0) {
      await db.insert(userPatterns).values(records).onConflictDoNothing();
    }

    revalidatePath("/dances");
  } catch {
    return { error: "Failed to add dance" };
  }

  redirect(`/dances/${styleSlug}/patterns`);
}

export async function setPreferredGoverningBodyAction(governingBodyId: string | null) {
  const authUser = await getAuthUser();
  if (!authUser) return { error: "Not authenticated" };

  if (governingBodyId !== null && !uuidSchema.safeParse(governingBodyId).success) {
    return { error: "Invalid governing body" };
  }

  try {
    await db
      .update(users)
      .set({ preferredGoverningBodyId: governingBodyId })
      .where(eq(users.id, authUser.userId));

    revalidatePath("/dances");
    return { success: true };
  } catch {
    return { error: "Failed to update preference" };
  }
}
