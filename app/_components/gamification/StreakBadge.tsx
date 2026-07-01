type Props = { streak: number };

export default function StreakBadge({ streak }: Props) {
  if (streak === 0) {
    return (
      <div className="rounded-2xl border border-white/5 bg-navy-800/50 px-4 py-3 flex items-center gap-3">
        <span className="text-xl opacity-40">🔥</span>
        <div>
          <p className="text-sm font-medium text-slate-400">No active streak</p>
          <p className="text-xs text-slate-600">Practice today to start one</p>
        </div>
      </div>
    );
  }

  const message =
    streak >= 30 ? "Unstoppable! 🎉" :
    streak >= 14 ? "On fire!" :
    streak >= 7  ? "Great momentum!" :
    "Keep it going!";

  return (
    <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 px-4 py-3 flex items-center gap-3">
      <span className="text-2xl">🔥</span>
      <div className="flex-1">
        <p className="text-sm font-bold text-white">
          {streak} day streak
        </p>
        <p className="text-xs text-slate-400">{message}</p>
      </div>
      {streak >= 7 && (
        <div className="rounded-lg border border-orange-500/30 bg-orange-500/10 px-2 py-1">
          <p className="text-[11px] font-bold text-orange-400">{streak}🔥</p>
        </div>
      )}
    </div>
  );
}
