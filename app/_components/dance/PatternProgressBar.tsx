"use client";

type Props = {
  total: number;
  mastered: number;
};

export default function PatternProgressBar({ total, mastered }: Props) {
  const pct = total === 0 ? 0 : Math.round((mastered / total) * 100);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>{mastered} of {total} mastered</span>
        <span className="font-medium text-gold-400">{pct}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-gold-500 to-gold-300 transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
