import type { SessionSummary } from "@/app/_lib/dal/practice";

const TYPE_LABELS = {
  solo: "Solo",
  class: "Group Class",
  lesson: "Private Lesson",
};

const TYPE_STYLES = {
  solo:   "border-slate-600/50 text-slate-400 bg-slate-800/50",
  class:  "border-blue-500/40 text-blue-400 bg-blue-500/10",
  lesson: "border-gold-500/40 text-gold-400 bg-gold-500/10",
};

type Props = { session: SessionSummary };

export default function SessionCard({ session }: Props) {
  const date = new Date(session.date);
  const dateLabel = date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const h = Math.floor(session.durationMinutes / 60);
  const m = session.durationMinutes % 60;
  const duration = h > 0 ? `${h}h ${m > 0 ? `${m}m` : ""}`.trim() : `${m}m`;

  return (
    <div className="rounded-xl border border-white/5 bg-navy-800/50 px-4 py-3 space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-medium text-white">{dateLabel}</span>
          <span className="text-xs text-slate-500">·</span>
          <span className="text-xs text-slate-400">{duration}</span>
        </div>
        <span
          className={`shrink-0 rounded-md border px-2 py-0.5 text-[11px] font-medium ${TYPE_STYLES[session.type]}`}
        >
          {TYPE_LABELS[session.type]}
        </span>
      </div>

      {session.patternCount > 0 && (
        <p className="text-xs text-slate-500">
          {session.patternCount} pattern{session.patternCount !== 1 ? "s" : ""} practiced
        </p>
      )}

      {session.notes && (
        <p className="text-xs text-slate-400 line-clamp-2">{session.notes}</p>
      )}
    </div>
  );
}
