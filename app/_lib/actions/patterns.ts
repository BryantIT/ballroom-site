"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { getAuthUser } from "@/app/_lib/dal/auth";
import { db } from "@/app/_lib/db";
import { sql } from "drizzle-orm";
import { userPatterns, patterns, xpLog, users } from "@/app/_lib/db/schema";

const uuidSchema = z.string().uuid();

const XP_MASTERED = 10;

export async function updatePatternStatusAction(
  patternId: string,
  status: "learning" | "working" | "mastered"
) {
  const authUser = await getAuthUser();
  if (!authUser) return { error: "Not authenticated" };

  if (!uuidSchema.safeParse(patternId).success) return { error: "Invalid pattern" };

  const validStatus = z.enum(["learning", "working", "mastered"]).safeParse(status);
  if (!validStatus.success) return { error: "Invalid status" };

  try {
    const existing = await db
      .select({ id: userPatterns.id, status: userPatterns.status })
      .from(userPatterns)
      .where(
        and(
          eq(userPatterns.patternId, patternId),
          eq(userPatterns.userId, authUser.userId)
        )
      );

    const wasMastered = existing[0]?.status === "mastered";
    const nowMastered = status === "mastered";

    if (existing.length > 0) {
      await db
        .update(userPatterns)
        .set({ status, updatedAt: new Date() })
        .where(eq(userPatterns.id, existing[0].id));
    } else {
      await db.insert(userPatterns).values({
        userId: authUser.userId,
        patternId,
        status,
      });
    }

    // Award XP when first mastered
    if (nowMastered && !wasMastered) {
      const patternRow = await db
        .select({ name: patterns.name })
        .from(patterns)
        .where(eq(patterns.id, patternId));

      await db.insert(xpLog).values({
        userId: authUser.userId,
        amount: XP_MASTERED,
        reason: `Mastered pattern: ${patternRow[0]?.name ?? patternId}`,
      });

      await db
        .update(users)
        .set({ totalXp: sql`${users.totalXp} + ${XP_MASTERED}` })
        .where(eq(users.id, authUser.userId));
    }

    revalidatePath("/dances");
    return { success: true };
  } catch {
    return { error: "Failed to update pattern" };
  }
}

export async function updatePatternConfidenceAction(
  patternId: string,
  confidence: number
) {
  const authUser = await getAuthUser();
  if (!authUser) return { error: "Not authenticated" };

  if (!uuidSchema.safeParse(patternId).success) return { error: "Invalid pattern" };

  const validConfidence = z.number().int().min(1).max(5).safeParse(confidence);
  if (!validConfidence.success) return { error: "Confidence must be 1–5" };

  try {
    const existing = await db
      .select({ id: userPatterns.id })
      .from(userPatterns)
      .where(
        and(
          eq(userPatterns.patternId, patternId),
          eq(userPatterns.userId, authUser.userId)
        )
      );

    if (existing.length > 0) {
      await db
        .update(userPatterns)
        .set({ confidence, updatedAt: new Date() })
        .where(eq(userPatterns.id, existing[0].id));
    } else {
      await db.insert(userPatterns).values({
        userId: authUser.userId,
        patternId,
        confidence,
        status: "learning",
      });
    }

    revalidatePath("/dances");
    return { success: true };
  } catch {
    return { error: "Failed to update confidence" };
  }
}

export async function updatePatternNotesAction(
  patternId: string,
  notes: string
) {
  const authUser = await getAuthUser();
  if (!authUser) return { error: "Not authenticated" };

  if (!uuidSchema.safeParse(patternId).success) return { error: "Invalid pattern" };

  const validNotes = z.string().max(2000).safeParse(notes);
  if (!validNotes.success) return { error: "Notes too long" };

  try {
    const existing = await db
      .select({ id: userPatterns.id })
      .from(userPatterns)
      .where(
        and(
          eq(userPatterns.patternId, patternId),
          eq(userPatterns.userId, authUser.userId)
        )
      );

    if (existing.length > 0) {
      await db
        .update(userPatterns)
        .set({ notes, updatedAt: new Date() })
        .where(eq(userPatterns.id, existing[0].id));
    } else {
      await db.insert(userPatterns).values({
        userId: authUser.userId,
        patternId,
        notes,
        status: "learning",
      });
    }

    revalidatePath("/dances");
    return { success: true };
  } catch {
    return { error: "Failed to save notes" };
  }
}

export async function togglePatternPinAction(
  patternId: string,
  isPinned: boolean
) {
  const authUser = await getAuthUser();
  if (!authUser) return { error: "Not authenticated" };

  if (!uuidSchema.safeParse(patternId).success) return { error: "Invalid pattern" };

  try {
    const existing = await db
      .select({ id: userPatterns.id })
      .from(userPatterns)
      .where(
        and(
          eq(userPatterns.patternId, patternId),
          eq(userPatterns.userId, authUser.userId)
        )
      );

    if (existing.length > 0) {
      await db
        .update(userPatterns)
        .set({ isPinned })
        .where(eq(userPatterns.id, existing[0].id));
    } else {
      await db.insert(userPatterns).values({
        userId: authUser.userId,
        patternId,
        isPinned,
        status: "learning",
      });
    }

    revalidatePath("/dances");
    return { success: true };
  } catch {
    return { error: "Failed to update focus" };
  }
}
