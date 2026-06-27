import { redirect } from "next/navigation";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { getAuthUser } from "@/app/_lib/dal/auth";
import { db } from "@/app/_lib/db";
import { users, userDances } from "@/app/_lib/db/schema";

export default async function DashboardPage() {
  const authUser = await getAuthUser();
  if (!authUser) redirect("/login");

  const queryResult = await Promise.all([
    db.query.users.findFirst({ where: eq(users.id, authUser.userId) }),
    db.select().from(userDances).where(eq(userDances.userId, authUser.userId)),
  ]).catch(() => null);

  const user = queryResult?.[0];
  const dances = queryResult?.[1] ?? [];

  const displayName = user?.name ?? user?.email?.split("@")[0] ?? "Dancer";

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 space-y-6">
      {/* Welcome */}
      <div>
        <p className="text-slate-400 text-sm">Welcome back</p>
        <h2 className="font-display text-2xl font-bold text-white">
          {displayName}
        </h2>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Total XP" value={user?.totalXp ?? 0} />
        <StatCard label="Day Streak" value={user?.currentStreak ?? 0} suffix="🔥" />
        <StatCard label="Dances" value={dances.length} />
      </div>

      {/* Empty state */}
      {dances.length === 0 && (
        <div className="rounded-2xl border border-white/5 bg-navy-800 p-8 text-center space-y-4">
          <div className="text-4xl">💃</div>
          <div>
            <h3 className="font-semibold text-white text-lg">
              Add your first dance
            </h3>
            <p className="text-slate-400 text-sm mt-1">
              Choose the styles you&apos;re learning to start tracking your
              progress.
            </p>
          </div>
          <Link
            href="/dances"
            className="inline-block rounded-full bg-gold-500 px-6 py-2.5 text-sm font-semibold text-navy-900 hover:bg-gold-400 transition-colors"
          >
            Browse dances
          </Link>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <QuickAction href="/practice/new" emoji="⏱️" label="Log practice" />
        <QuickAction href="/goals" emoji="🎯" label="Set a goal" />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  suffix,
}: {
  label: string;
  value: number;
  suffix?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-navy-800 p-4 text-center">
      <p className="font-display text-2xl font-bold text-white">
        {value}
        {suffix && <span className="ml-1 text-lg">{suffix}</span>}
      </p>
      <p className="text-xs text-slate-400 mt-1">{label}</p>
    </div>
  );
}

function QuickAction({
  href,
  emoji,
  label,
}: {
  href: string;
  emoji: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-2xl border border-white/5 bg-navy-800 px-4 py-4 hover:border-white/10 transition-colors"
    >
      <span className="text-2xl">{emoji}</span>
      <span className="text-sm font-medium text-slate-300">{label}</span>
    </Link>
  );
}
