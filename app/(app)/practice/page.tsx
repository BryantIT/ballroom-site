import { redirect } from "next/navigation";
import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { getAuthUser } from "@/app/_lib/dal/auth";
import { getRecentSessions, getWeeklySummaries } from "@/app/_lib/dal/practice";
import SessionCard from "@/app/_components/practice/SessionCard";
import WeeklySummary from "@/app/_components/practice/WeeklySummary";

export default async function PracticePage() {
  const authUser = await getAuthUser();
  if (!authUser) redirect("/login");

  const [sessions, weeklySummaries] = await Promise.all([
    getRecentSessions(authUser.userId),
    getWeeklySummaries(authUser.userId),
  ]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-white">Practice</h2>
        <Link
          href="/practice/new"
          className="flex items-center gap-1.5 rounded-xl bg-gold-500/10 border border-gold-500/30 px-3 py-2 text-sm font-medium text-gold-400 hover:bg-gold-500/20 transition-colors"
        >
          <PlusIcon size={15} />
          Log Session
        </Link>
      </div>

      {/* Weekly summary — only show when there are sessions */}
      {sessions.length > 0 && <WeeklySummary data={weeklySummaries} />}

      {/* Session history */}
      {sessions.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-navy-800 p-10 text-center space-y-4">
          <p className="text-3xl">💃</p>
          <div className="space-y-1">
            <p className="font-semibold text-white">No sessions logged yet</p>
            <p className="text-sm text-slate-400">
              Track your first practice to start building your streak.
            </p>
          </div>
          <Link
            href="/practice/new"
            className="inline-flex items-center gap-1.5 rounded-xl bg-gold-500/10 border border-gold-500/30 px-4 py-2.5 text-sm font-medium text-gold-400 hover:bg-gold-500/20 transition-colors"
          >
            <PlusIcon size={15} />
            Log your first session
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Recent sessions
          </p>
          {sessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      )}
    </div>
  );
}
