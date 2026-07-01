import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuthUser } from "@/app/_lib/dal/auth";
import { getDashboardData } from "@/app/_lib/dal/dashboard";
import XpBar from "@/app/_components/gamification/XpBar";
import StreakBadge from "@/app/_components/gamification/StreakBadge";
import type { DanceProgressItem, RecentSession } from "@/app/_lib/dal/dashboard";

const CATEGORY_LABELS: Record<string, string> = {
  standard: "Intl. Standard",
  latin:    "Intl. Latin",
  smooth:   "Am. Smooth",
  rhythm:   "Am. Rhythm",
};

const SESSION_TYPE_LABELS = {
  solo:   "Solo",
  class:  "Class",
  lesson: "Lesson",
};

export default async function DashboardPage() {
  const authUser = await getAuthUser();
  if (!authUser) redirect("/login");

  let data: Awaited<ReturnType<typeof getDashboardData>> = {
    user: null,
    danceProgress: [],
    recentSessions: [],
  };

  try {
    data = await getDashboardData(authUser.userId);
  } catch {
    // db unavailable — render with empty state
  }

  const { user, danceProgress, recentSessions } = data;
  const displayName = user?.name ?? user?.email?.split("@")[0] ?? "Dancer";
  const totalXp = user?.totalXp ?? 0;
  const streak = user?.currentStreak ?? 0;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 space-y-5">
      {/* Welcome */}
      <div>
        <p className="text-sm text-slate-500">Welcome back</p>
        <h2 className="font-display text-2xl font-bold text-white">{displayName}</h2>
      </div>

      {/* XP bar */}
      <XpBar totalXp={totalXp} />

      {/* Streak */}
      <StreakBadge streak={streak} />

      {/* Active dances */}
      {danceProgress.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Active Dances
            </p>
            <Link href="/dances" className="text-xs text-gold-400 hover:text-gold-300 transition-colors">
              Manage →
            </Link>
          </div>
          <div className="space-y-2">
            {danceProgress.map((dance) => (
              <DanceProgressCard key={dance.id} dance={dance} />
            ))}
          </div>
        </section>
      )}

      {/* Recent sessions */}
      {recentSessions.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Recent Practice
            </p>
            <Link href="/practice" className="text-xs text-gold-400 hover:text-gold-300 transition-colors">
              All sessions →
            </Link>
          </div>
          <div className="space-y-2">
            {recentSessions.map((s) => (
              <RecentSessionRow key={s.id} session={s} />
            ))}
          </div>
        </section>
      )}

      {/* Empty state / quick actions */}
      {danceProgress.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-navy-800 p-8 text-center space-y-4">
          <p className="text-3xl">💃</p>
          <div>
            <p className="font-semibold text-white">Add your first dance</p>
            <p className="text-sm text-slate-400 mt-1">
              Choose the styles you&apos;re learning to start tracking progress.
            </p>
          </div>
          <Link
            href="/dances"
            className="inline-block rounded-full bg-gold-500 px-6 py-2.5 text-sm font-semibold text-navy-900 hover:bg-gold-400 transition-colors"
          >
            Browse dances
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <QuickAction href="/practice/new" emoji="⏱️" label="Log practice" />
          <QuickAction href="/goals" emoji="🎯" label="Set a goal" />
        </div>
      )}
    </div>
  );
}

function DanceProgressCard({ dance }: { dance: DanceProgressItem }) {
  const hasLevel = dance.levelName !== null;
  const hasPatterns = dance.totalPatterns > 0;
  const pct = hasPatterns
    ? Math.round((dance.masteredPatterns / dance.totalPatterns) * 100)
    : 0;

  return (
    <Link
      href={`/dances/${dance.styleSlug}${hasLevel ? "/patterns" : ""}`}
      className="flex items-center gap-4 rounded-xl border border-white/5 bg-navy-800/50 px-4 py-3 hover:border-white/10 transition-colors"
    >
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white truncate">{dance.styleName}</span>
          <span className="text-[10px] text-slate-600 shrink-0">
            {CATEGORY_LABELS[dance.styleCategory] ?? dance.styleCategory}
          </span>
        </div>
        {hasLevel && hasPatterns ? (
          <>
            <div className="h-1 w-full rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-gold-500 to-gold-300 transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500">
              {dance.masteredPatterns}/{dance.totalPatterns} patterns ·{" "}
              <span className="capitalize">{dance.levelName}</span>
            </p>
          </>
        ) : (
          <p className="text-[11px] text-slate-600">
            {hasLevel ? "No patterns seeded" : "No level set"}
          </p>
        )}
      </div>
      <span className="text-slate-600 text-sm shrink-0">→</span>
    </Link>
  );
}

function RecentSessionRow({ session }: { session: RecentSession }) {
  const date = new Date(session.date);
  const label = date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  const h = Math.floor(session.durationMinutes / 60);
  const m = session.durationMinutes % 60;
  const dur = h > 0 ? `${h}h${m > 0 ? ` ${m}m` : ""}` : `${m}m`;

  return (
    <div className="flex items-center justify-between rounded-xl border border-white/5 bg-navy-800/50 px-4 py-3">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        {session.patternCount > 0 && (
          <p className="text-xs text-slate-500">{session.patternCount} patterns</p>
        )}
      </div>
      <div className="text-right">
        <p className="text-sm text-slate-300">{dur}</p>
        <p className="text-xs text-slate-500 capitalize">
          {SESSION_TYPE_LABELS[session.type]}
        </p>
      </div>
    </div>
  );
}

function QuickAction({ href, emoji, label }: { href: string; emoji: string; label: string }) {
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
