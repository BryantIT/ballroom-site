import type { ReportData } from "@/app/_lib/dal/reports";

const STATUS_LABELS = {
  mastered: "Mastered",
  working:  "Working",
  learning: "Learning",
};

const STATUS_STYLES = {
  mastered: "text-gold-400",
  working:  "text-blue-400",
  learning: "text-slate-500",
};

const CATEGORY_LABELS: Record<string, string> = {
  standard: "International Standard",
  latin:    "International Latin",
  smooth:   "American Smooth",
  rhythm:   "American Rhythm",
};

export default function ReportPreview({ data }: { data: ReportData }) {
  const { userName, dateFrom, dateTo, generatedAt, dances, periodStats } = data;

  const h = Math.floor(periodStats.totalMinutes / 60);
  const m = periodStats.totalMinutes % 60;
  const practiceTime = h > 0 ? `${h}h ${m > 0 ? `${m}m` : ""}`.trim() : `${m}m`;

  const totalMastered = dances.reduce((s, d) => s + d.masteredCount, 0);
  const totalPatterns = dances.reduce((s, d) => s + d.totalCount, 0);

  return (
    <div
      id="report-preview"
      className="rounded-2xl border border-white/5 bg-navy-800/30 overflow-hidden print:border-0 print:bg-white print:rounded-none"
    >
      {/* Report header */}
      <div className="px-6 pt-6 pb-4 border-b border-white/5 print:border-slate-200">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 print:text-slate-400">
              Dance Progress Report
            </p>
            <h3 className="font-display text-xl font-bold text-white mt-1 print:text-slate-900">
              {userName}
            </h3>
            <p className="text-sm text-slate-400 mt-1 print:text-slate-600">
              {fmtDate(dateFrom)} — {fmtDate(dateTo)}
            </p>
          </div>
          <p className="text-xs text-slate-600 shrink-0 print:text-slate-400">
            Generated {fmtDate(generatedAt)}
          </p>
        </div>
      </div>

      {/* Period summary */}
      <div className="px-6 py-4 border-b border-white/5 print:border-slate-200">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3 print:text-slate-400">
          Period Summary
        </p>
        <div className="grid grid-cols-3 gap-4">
          <Stat label="Practice Time" value={practiceTime} />
          <Stat label="Sessions" value={String(periodStats.sessionCount)} />
          <Stat label="Patterns Mastered" value={`${totalMastered}/${totalPatterns}`} />
        </div>
      </div>

      {/* Per-dance sections */}
      <div className="divide-y divide-white/5 print:divide-slate-200">
        {dances.map((dance) => (
          <div key={dance.styleId} className="px-6 py-5">
            {/* Dance header */}
            <div className="flex items-baseline justify-between gap-2 mb-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 print:text-slate-400">
                  {CATEGORY_LABELS[dance.styleCategory] ?? dance.styleCategory}
                </p>
                <h4 className="font-display text-lg font-bold text-white print:text-slate-900">
                  {dance.styleName}
                  {dance.levelName && (
                    <span className="ml-2 text-sm font-normal capitalize text-slate-400 print:text-slate-500">
                      — {dance.levelName}
                    </span>
                  )}
                </h4>
              </div>
              {dance.totalCount > 0 && (
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-gold-400">
                    {dance.masteredCount}/{dance.totalCount}
                  </p>
                  <p className="text-xs text-slate-500">mastered</p>
                </div>
              )}
            </div>

            {/* Progress bar */}
            {dance.totalCount > 0 && (
              <div className="h-1 w-full rounded-full bg-white/5 mb-4 overflow-hidden print:bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-gold-500 to-gold-300 print:bg-amber-400"
                  style={{
                    width: `${Math.round((dance.masteredCount / dance.totalCount) * 100)}%`,
                  }}
                />
              </div>
            )}

            {/* Patterns list */}
            {dance.patterns.length === 0 ? (
              <p className="text-xs text-slate-600 italic">
                {dance.levelName ? "No patterns seeded for this level." : "No level set."}
              </p>
            ) : (
              <div className="space-y-1">
                {dance.patterns.map((p) => {
                  const status = p.status ?? "learning";
                  return (
                    <div
                      key={p.id}
                      className="flex items-center justify-between gap-3 py-1.5 border-b border-white/5 last:border-0 print:border-slate-100"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`shrink-0 text-xs font-bold w-4 text-center ${STATUS_STYLES[status]}`}
                        >
                          {status === "mastered" ? "✓" : "○"}
                        </span>
                        <span className="text-sm text-slate-300 truncate print:text-slate-800">
                          {p.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {p.confidence !== null && (
                          <span className="text-xs text-gold-500/70">
                            {"★".repeat(p.confidence)}{"☆".repeat(5 - p.confidence)}
                          </span>
                        )}
                        <span className={`text-xs ${STATUS_STYLES[status]} print:text-slate-500`}>
                          {STATUS_LABELS[status]}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-lg font-bold text-white print:text-slate-900">{value}</p>
      <p className="text-xs text-slate-500 print:text-slate-400">{label}</p>
    </div>
  );
}

function fmtDate(d: Date) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
