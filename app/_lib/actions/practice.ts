"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import { getAuthUser } from "@/app/_lib/dal/auth";
import { db } from "@/app/_lib/db";
import { practiceSessions, sessionPatterns, xpLog, users } from "@/app/_lib/db/schema";
import { getAllSessionDates } from "@/app/_lib/dal/practice";

const XP_SESSION_BASE = 5;
const XP_PER_PATTERN = 2;

const LogSessionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
  durationMinutes: z.coerce
    .number()
    .int()
    .min(1, "Must be at least 1 minute")
    .max(480, "Max 8 hours"),
  type: z.enum(["solo", "class", "lesson"]),
  notes: z.string().max(2000).optional(),
  patternIds: z.array(z.string().uuid()).optional().default([]),
});

export type LogSessionState = {
  errors?: Partial<
    Record<keyof z.infer<typeof LogSessionSchema> | "_root", string>
  >;
} | null;

export async function logSessionAction(
  _prevState: LogSessionState,
  formData: FormData
): Promise<LogSessionState> {
  const authUser = await getAuthUser();
  if (!authUser) return { errors: { _root: "Not authenticated" } };

  const parsed = LogSessionSchema.safeParse({
    date: formData.get("date"),
    durationMinutes: formData.get("durationMinutes"),
    type: formData.get("type"),
    notes: formData.get("notes") || undefined,
    patternIds: formData.getAll("patternIds"),
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return {
      errors: Object.fromEntries(
        Object.entries(fieldErrors).map(([k, v]) => [k, v?.[0] ?? "Invalid"])
      ),
    };
  }

  const { date, durationMinutes, type, notes, patternIds } = parsed.data;
  // Noon UTC keeps the calendar date stable regardless of viewer's timezone
  const sessionDate = new Date(`${date}T12:00:00Z`);

  try {
    const [session] = await db
      .insert(practiceSessions)
      .values({
        userId: authUser.userId,
        date: sessionDate,
        durationMinutes,
        type,
        notes: notes ?? null,
      })
      .returning({ id: practiceSessions.id });

    if (patternIds.length > 0) {
      await db
        .insert(sessionPatterns)
        .values(patternIds.map((patternId) => ({ sessionId: session.id, patternId })));
    }

    const xpEarned = XP_SESSION_BASE + patternIds.length * XP_PER_PATTERN;
    await db.insert(xpLog).values({
      userId: authUser.userId,
      amount: xpEarned,
      reason: `Practice session (${type}, ${durationMinutes} min)`,
    });
    await db
      .update(users)
      .set({ totalXp: sql`${users.totalXp} + ${xpEarned}` })
      .where(eq(users.id, authUser.userId));

    const streak = await computeStreak(authUser.userId);
    await db
      .update(users)
      .set({ currentStreak: streak })
      .where(eq(users.id, authUser.userId));

    revalidatePath("/practice");
  } catch {
    return { errors: { _root: "Failed to save session. Please try again." } };
  }

  redirect("/practice");
}

async function computeStreak(userId: string): Promise<number> {
  const dates = await getAllSessionDates(userId);
  if (dates.length === 0) return 0;

  const MS_DAY = 86_400_000;

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const uniqueDays = [
    ...new Set(
      dates.map((d) => {
        const utc = new Date(d);
        utc.setUTCHours(0, 0, 0, 0);
        return utc.getTime();
      })
    ),
  ].sort((a, b) => b - a);

  const diffToday = (today.getTime() - uniqueDays[0]) / MS_DAY;
  if (diffToday > 1) return 0;

  let streak = 1;
  for (let i = 1; i < uniqueDays.length; i++) {
    if ((uniqueDays[i - 1] - uniqueDays[i]) / MS_DAY === 1) streak++;
    else break;
  }

  return streak;
}
